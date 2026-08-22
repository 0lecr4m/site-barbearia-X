import { db } from "../config/database.js";
export const catalogRepository = {
  async listServices(barbershopId, includeInactive = false) {
    const { rows } = await db.query(
      `SELECT * FROM services WHERE barbershop_id=$1 ${includeInactive ? "" : "AND active=TRUE"} ORDER BY sort_order,name`,
      [barbershopId],
    );
    return rows;
  },
  async getService(id) {
    const { rows } = await db.query("SELECT * FROM services WHERE id=$1", [id]);
    return rows[0];
  },
  async createService(v) {
    const { rows } = await db.query(
      "INSERT INTO services(barbershop_id,name,description,price,duration_minutes,image_url,active,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [
        v.barbershopId,
        v.name,
        v.description ?? null,
        v.price,
        v.durationMinutes,
        v.imageUrl ?? null,
        v.active ?? true,
        v.sortOrder ?? 0,
      ],
    );
    return rows[0];
  },
  async updateService(id, v) {
    const { rows } = await db.query(
      `UPDATE services SET name=COALESCE($2,name),description=COALESCE($3,description),price=COALESCE($4,price),duration_minutes=COALESCE($5,duration_minutes),image_url=COALESCE($6,image_url),active=COALESCE($7,active),sort_order=COALESCE($8,sort_order) WHERE id=$1 RETURNING *`,
      [
        id,
        v.name,
        v.description,
        v.price,
        v.durationMinutes,
        v.imageUrl,
        v.active,
        v.sortOrder,
      ],
    );
    return rows[0];
  },
  async listStaff(barbershopId) {
    const { rows } = await db.query(
      `SELECT st.*, COALESCE(json_agg(json_build_object('id',s.id,'name',s.name,'price',COALESCE(ss.custom_price,s.price),'durationMinutes',COALESCE(ss.custom_duration_minutes,s.duration_minutes))) FILTER(WHERE s.id IS NOT NULL),'[]') services FROM staff st LEFT JOIN staff_services ss ON ss.staff_id=st.id AND ss.active LEFT JOIN services s ON s.id=ss.service_id AND s.active WHERE st.barbershop_id=$1 AND st.active AND st.accepts_online_booking GROUP BY st.id ORDER BY st.sort_order,st.display_name`,
      [barbershopId],
    );
    return rows;
  },
  async getStaff(id) {
    const { rows } = await db.query(
      `SELECT st.*, COALESCE(json_agg(json_build_object('id',s.id,'name',s.name,'price',COALESCE(ss.custom_price,s.price),'durationMinutes',COALESCE(ss.custom_duration_minutes,s.duration_minutes))) FILTER(WHERE s.id IS NOT NULL),'[]') services FROM staff st LEFT JOIN staff_services ss ON ss.staff_id=st.id AND ss.active LEFT JOIN services s ON s.id=ss.service_id AND s.active WHERE st.id=$1 GROUP BY st.id`,
      [id],
    );
    return rows[0];
  },
  async linkService(staffId, serviceId, v) {
    const { rows } = await db.query(
      `INSERT INTO staff_services(staff_id,service_id,custom_price,custom_duration_minutes,active) VALUES($1,$2,$3,$4,$5) ON CONFLICT(staff_id,service_id) DO UPDATE SET custom_price=EXCLUDED.custom_price,custom_duration_minutes=EXCLUDED.custom_duration_minutes,active=EXCLUDED.active RETURNING *`,
      [
        staffId,
        serviceId,
        v.customPrice ?? null,
        v.customDurationMinutes ?? null,
        v.active ?? true,
      ],
    );
    return rows[0];
  },
};
