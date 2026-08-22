import { db, transaction } from "../config/database.js";
import { errors } from "../errors/AppError.js";
const detailSql = `SELECT a.*,c.user_id customer_user_id,st.user_id staff_user_id,COALESCE(json_agg(aps ORDER BY aps.created_at) FILTER(WHERE aps.id IS NOT NULL),'[]') services FROM appointments a JOIN customers c ON c.id=a.customer_id JOIN staff st ON st.id=a.staff_id LEFT JOIN appointment_services aps ON aps.appointment_id=a.id WHERE a.id=$1 GROUP BY a.id,c.user_id,st.user_id`;
export const appointmentRepository = {
  async get(id, client = db) {
    const { rows } = await client.query(detailSql, [id]);
    return rows[0];
  },
  async create(user, input) {
    return transaction(async (client) => {
      let {
        rows: [customer],
      } = await client.query(
        "SELECT * FROM customers WHERE user_id=$1 AND barbershop_id=$2 FOR UPDATE",
        [user.id, input.barbershopId],
      );
      if (!customer) {
        ({
          rows: [customer],
        } = await client.query(
          "INSERT INTO customers(user_id,barbershop_id,name,email,phone) VALUES($1,$2,$3,$4,$5) RETURNING *",
          [user.id, input.barbershopId, user.name, user.email, user.phone],
        ));
      }
      const { rows: services } = await client.query(
        `SELECT s.id,s.name,COALESCE(ss.custom_price,s.price) price,COALESCE(ss.custom_duration_minutes,s.duration_minutes)::int duration FROM services s JOIN staff_services ss ON ss.service_id=s.id AND ss.staff_id=$1 AND ss.active JOIN staff st ON st.id=$1 AND st.barbershop_id=$2 AND st.active WHERE s.id=ANY($3::uuid[]) AND s.active FOR SHARE OF s,ss`,
        [input.staffId, input.barbershopId, input.serviceIds],
      );
      if (services.length !== input.serviceIds.length)
        throw errors.validation({
          serviceIds: ["Serviços inválidos para o profissional."],
        });
      const duration = services.reduce((n, s) => n + s.duration, 0),
        total = services.reduce((n, s) => n + Number(s.price), 0),
        start = new Date(input.startsAt),
        end = new Date(start.getTime() + duration * 60000);
      const {
        rows: [valid],
      } = await client.query(
        `SELECT EXISTS(SELECT 1 FROM staff_availability sa JOIN business_hours bh ON bh.barbershop_id=$2 AND bh.day_of_week=EXTRACT(DOW FROM ($3::timestamptz AT TIME ZONE $5))::int AND NOT bh.is_closed WHERE sa.staff_id=$1 AND sa.active AND sa.day_of_week=bh.day_of_week AND ($3::timestamptz AT TIME ZONE $5)::time>=GREATEST(sa.start_time,bh.open_time) AND ($4::timestamptz AT TIME ZONE $5)::time<=LEAST(sa.end_time,bh.close_time)) AND NOT EXISTS(SELECT 1 FROM staff_time_off WHERE staff_id=$1 AND tstzrange(start_at,end_at,'[)')&&tstzrange($3,$4,'[)')) ok`,
        [
          input.staffId,
          input.barbershopId,
          start,
          end,
          process.env.APP_TIMEZONE || "America/Sao_Paulo",
        ],
      );
      if (!valid.ok || start <= new Date()) throw errors.slotUnavailable();
      const {
        rows: [appointment],
      } = await client.query(
        "INSERT INTO appointments(barbershop_id,customer_id,staff_id,starts_at,ends_at,total_price,customer_notes) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
        [
          input.barbershopId,
          customer.id,
          input.staffId,
          start,
          end,
          total,
          input.customerNotes ?? null,
        ],
      );
      for (const s of services)
        await client.query(
          "INSERT INTO appointment_services(appointment_id,service_id,service_name_snapshot,price,duration_minutes) VALUES($1,$2,$3,$4,$5)",
          [appointment.id, s.id, s.name, s.price, s.duration],
        );
      return appointment;
    });
  },
  async reschedule(id, user, startAt) {
    return transaction(async (client) => {
      const current = await this.get(id, client);
      if (!current) throw errors.notFound("Agendamento");
      if (
        user.role !== "ADMIN" &&
        current.customer_user_id !== user.id &&
        current.staff_user_id !== user.id
      )
        throw errors.forbidden();
      if (["CANCELLED", "COMPLETED", "NO_SHOW"].includes(current.status))
        throw errors.conflict("Este agendamento não pode ser reagendado.");
      const duration = new Date(current.ends_at) - new Date(current.starts_at),
        start = new Date(startAt),
        end = new Date(start.getTime() + duration);
      if (start <= new Date()) throw errors.slotUnavailable();
      const {
        rows: [valid],
      } = await client.query(
        `SELECT EXISTS(
          SELECT 1 FROM staff_availability sa
          JOIN business_hours bh ON bh.barbershop_id=$2
            AND bh.day_of_week=EXTRACT(DOW FROM ($3::timestamptz AT TIME ZONE $5))::int
            AND NOT bh.is_closed
          WHERE sa.staff_id=$1 AND sa.active AND sa.day_of_week=bh.day_of_week
            AND ($3::timestamptz AT TIME ZONE $5)::time >= GREATEST(sa.start_time,bh.open_time)
            AND ($4::timestamptz AT TIME ZONE $5)::time <= LEAST(sa.end_time,bh.close_time)
        ) AND NOT EXISTS(
          SELECT 1 FROM staff_time_off WHERE staff_id=$1
            AND tstzrange(start_at,end_at,'[)') && tstzrange($3,$4,'[)')
        ) ok`,
        [current.staff_id,current.barbershop_id,start,end,process.env.APP_TIMEZONE||"America/Sao_Paulo"],
      );
      if (!valid.ok) throw errors.slotUnavailable();
      const {
        rows: [row],
      } = await client.query(
        "UPDATE appointments SET starts_at=$2,ends_at=$3,status='PENDING' WHERE id=$1 RETURNING *",
        [id, start, end],
      );
      return row;
    });
  },
  async cancel(id, user, reason) {
    const current = await this.get(id);
    if (!current) throw errors.notFound("Agendamento");
    if (
      user.role !== "ADMIN" &&
      current.customer_user_id !== user.id &&
      current.staff_user_id !== user.id
    )
      throw errors.forbidden();
    if (current.status === "CANCELLED") return current;
    const cutoff = Number(process.env.CANCELLATION_NOTICE_HOURS || 2) * 3600000;
    if (
      user.role === "CUSTOMER" &&
      new Date(current.starts_at) - Date.now() < cutoff
    )
      throw errors.conflict(
        "Prazo de cancelamento encerrado. Contate a barbearia.",
      );
    const {
      rows: [row],
    } = await db.query(
      "UPDATE appointments SET status='CANCELLED',cancellation_reason=$2,cancelled_at=NOW() WHERE id=$1 RETURNING *",
      [id, reason],
    );
    return row;
  },
  async staffAgenda(staffId, from, to) {
    const { rows } = await db.query(
      "SELECT * FROM appointment_details WHERE staff_id=$1 AND starts_at<$3 AND ends_at>$2 ORDER BY starts_at",
      [staffId, from, to],
    );
    return rows;
  },
};
