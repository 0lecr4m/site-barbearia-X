import { db } from "../config/database.js";
export const customerRepository = {
  async findForUser(userId, barbershopId) {
    const { rows } = await db.query(
      "SELECT * FROM customers WHERE user_id=$1 AND barbershop_id=$2",
      [userId, barbershopId],
    );
    return rows[0];
  },
  async createForUser(user, barbershopId) {
    const { rows } = await db.query(
      "INSERT INTO customers(user_id,barbershop_id,name,email,phone) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [user.id, barbershopId, user.name, user.email, user.phone],
    );
    return rows[0];
  },
  async update(id, userId, v) {
    const { rows } = await db.query(
      "UPDATE customers SET name=COALESCE($3,name),email=COALESCE($4,email),phone=COALESCE($5,phone),marketing_consent=COALESCE($6,marketing_consent) WHERE id=$1 AND user_id=$2 RETURNING *",
      [id, userId, v.name, v.email, v.phone, v.marketingConsent],
    );
    return rows[0];
  },
  async appointments(userId, upcoming) {
    const { rows } = await db.query(
      `SELECT ad.*,COALESCE(json_agg(aps ORDER BY aps.created_at) FILTER(WHERE aps.id IS NOT NULL),'[]') services FROM appointment_details ad LEFT JOIN appointment_services aps ON aps.appointment_id=ad.appointment_id JOIN customers c ON c.id=ad.customer_id WHERE c.user_id=$1 ${upcoming ? "AND ad.starts_at>=NOW() AND ad.status NOT IN ('CANCELLED','COMPLETED','NO_SHOW')" : ""} GROUP BY ad.appointment_id,ad.barbershop_id,ad.barbershop_name,ad.customer_id,ad.customer_name,ad.customer_phone,ad.customer_email,ad.staff_id,ad.staff_name,ad.starts_at,ad.ends_at,ad.status,ad.total_price,ad.customer_notes,ad.created_at ORDER BY ad.starts_at ${upcoming ? "ASC" : "DESC"}`,
      [userId],
    );
    return rows;
  },
};
