import { db } from "../config/database.js";
const publicFields =
  "id, name, email, phone, role, avatar_url, is_active, last_login_at, created_at, updated_at";
export const userRepository = {
  async findByLogin(login, client = db) {
    const { rows } = await client.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR phone = $1 LIMIT 1",
      [login],
    );
    return rows[0];
  },
  async findById(id, client = db) {
    const { rows } = await client.query(
      `SELECT ${publicFields} FROM users WHERE id = $1`,
      [id],
    );
    return rows[0];
  },
  async create(data, client = db) {
    const { rows } = await client.query(
      `INSERT INTO users (name,email,phone,password_hash,role) VALUES ($1,$2,$3,$4,'CUSTOMER') RETURNING ${publicFields}`,
      [data.name, data.email ?? null, data.phone ?? null, data.passwordHash],
    );
    return rows[0];
  },
  async touchLogin(id) {
    await db.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [
      id,
    ]);
  },
};
