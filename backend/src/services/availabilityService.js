import { db } from "../config/database.js";
import { env } from "../config/env.js";
import { errors } from "../errors/AppError.js";

export async function getAvailability({
  barbershopId,
  staffId,
  serviceIds,
  date,
}) {
  const { rows: durations } = await db.query(
    `SELECT COUNT(*)::int count, SUM(COALESCE(ss.custom_duration_minutes,s.duration_minutes))::int duration FROM services s JOIN staff_services ss ON ss.service_id=s.id AND ss.staff_id=$1 AND ss.active JOIN staff st ON st.id=ss.staff_id AND st.barbershop_id=$2 AND st.active AND st.accepts_online_booking WHERE s.id=ANY($3::uuid[]) AND s.active`,
    [staffId, barbershopId, serviceIds],
  );
  if (durations[0].count !== serviceIds.length)
    throw errors.validation({
      serviceIds: [
        "Um ou mais serviços não são realizados por este profissional.",
      ],
    });
  const duration = durations[0].duration;
  const { rows } = await db.query(
    `
    WITH settings AS (SELECT $1::date AS service_date,$2::uuid AS staff_id,$3::uuid AS shop_id,$4::int AS duration_minutes,$5::int AS slot_step,$6::text AS timezone_name),
    windows AS (SELECT GREATEST(sa.start_time,bh.open_time) AS window_start,LEAST(sa.end_time,bh.close_time) AS window_end,s.* FROM settings s JOIN staff_availability sa ON sa.staff_id=s.staff_id AND sa.day_of_week=EXTRACT(DOW FROM s.service_date)::int AND sa.active JOIN business_hours bh ON bh.barbershop_id=s.shop_id AND bh.day_of_week=EXTRACT(DOW FROM s.service_date)::int AND NOT bh.is_closed),
    slots AS (SELECT t AT TIME ZONE timezone_name AS starts_at,(t+make_interval(mins=>duration_minutes)) AT TIME ZONE timezone_name AS ends_at FROM windows CROSS JOIN LATERAL generate_series(service_date+window_start,service_date+window_end-make_interval(mins=>duration_minutes),make_interval(mins=>slot_step)) t)
    SELECT starts_at,ends_at FROM slots s WHERE starts_at>NOW() AND NOT EXISTS(SELECT 1 FROM staff_time_off o,settings x WHERE o.staff_id=x.staff_id AND tstzrange(o.start_at,o.end_at,'[)')&&tstzrange(s.starts_at,s.ends_at,'[)')) AND NOT EXISTS(SELECT 1 FROM appointments a,settings x WHERE a.staff_id=x.staff_id AND a.status<>'CANCELLED' AND tstzrange(a.starts_at,a.ends_at,'[)')&&tstzrange(s.starts_at,s.ends_at,'[)')) ORDER BY starts_at`,
    [
      date,
      staffId,
      barbershopId,
      duration,
      env.SLOT_INTERVAL_MINUTES,
      env.APP_TIMEZONE,
    ],
  );
  return {
    date,
    durationMinutes: duration,
    timezone: env.APP_TIMEZONE,
    slots: rows,
  };
}
