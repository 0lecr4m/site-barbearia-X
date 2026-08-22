import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { errors } from "../errors/AppError.js";
import { userRepository } from "../repositories/userRepository.js";
import { db } from "../config/database.js";

export async function authenticate(req, res, next) {
  try {
    const [type, token] = (req.headers.authorization ?? "").split(" ");
    if (type !== "Bearer" || !token) throw errors.unauthorized();
    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: "projetox-api",
    });
    const user = await userRepository.findById(payload.sub);
    if (!user?.is_active) throw errors.unauthorized();
    req.user = user;
    next();
  } catch (error) {
    next(
      error.code && error.status
        ? error
        : errors.unauthorized("Token inválido ou expirado."),
    );
  }
}
export const authorize =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role) ? next() : next(errors.forbidden());

export async function authorizeStaffOwner(req, res, next) {
  if (req.user.role === "ADMIN") return next();
  const { rows } = await db.query("SELECT 1 FROM staff WHERE id=$1 AND user_id=$2", [req.params.id, req.user.id]);
  return rows[0] ? next() : next(errors.forbidden());
}
export async function authorizeTimeOffOwner(req, res, next) {
  if (req.user.role === "ADMIN") return next();
  const { rows } = await db.query("SELECT 1 FROM staff_time_off o JOIN staff s ON s.id=o.staff_id WHERE o.id=$1 AND s.user_id=$2", [req.params.id, req.user.id]);
  return rows[0] ? next() : next(errors.forbidden());
}
