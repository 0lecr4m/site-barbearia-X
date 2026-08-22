import { db } from "../config/database.js";
export const scheduleRepository = {
  hours: async id => (await db.query("SELECT * FROM business_hours WHERE barbershop_id=$1 ORDER BY day_of_week",[id])).rows,
  setHours: async (id,v) => (await db.query(`INSERT INTO business_hours(barbershop_id,day_of_week,open_time,close_time,is_closed) VALUES($1,$2,$3,$4,$5) ON CONFLICT(barbershop_id,day_of_week) DO UPDATE SET open_time=EXCLUDED.open_time,close_time=EXCLUDED.close_time,is_closed=EXCLUDED.is_closed RETURNING *`,[id,v.dayOfWeek,v.openTime??null,v.closeTime??null,v.isClosed??false])).rows[0],
  availability: async id => (await db.query("SELECT * FROM staff_availability WHERE staff_id=$1 ORDER BY day_of_week,start_time",[id])).rows,
  addAvailability: async (id,v) => (await db.query("INSERT INTO staff_availability(staff_id,day_of_week,start_time,end_time,active) VALUES($1,$2,$3,$4,$5) RETURNING *",[id,v.dayOfWeek,v.startTime,v.endTime,v.active??true])).rows[0],
  timeOff: async (id,from,to) => (await db.query("SELECT * FROM staff_time_off WHERE staff_id=$1 AND start_at<$3 AND end_at>$2 ORDER BY start_at",[id,from,to])).rows,
  addTimeOff: async (id,v) => (await db.query("INSERT INTO staff_time_off(staff_id,start_at,end_at,reason) VALUES($1,$2,$3,$4) RETURNING *",[id,v.startAt,v.endAt,v.reason??null])).rows[0],
  removeTimeOff: async id => (await db.query("DELETE FROM staff_time_off WHERE id=$1 RETURNING *",[id])).rows[0]
};
