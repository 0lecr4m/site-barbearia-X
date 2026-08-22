import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { userRepository } from "../repositories/userRepository.js";
import { errors } from "../errors/AppError.js";

const sign = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: "projetox-api",
  });
export const authService = {
  async register(input) {
    const login = input.email ?? input.phone;
    if (await userRepository.findByLogin(login))
      throw errors.conflict("E-mail ou telefone já cadastrado.");
    const user = await userRepository.create({
      ...input,
      passwordHash: await bcrypt.hash(input.password, 12),
    });
    return { user, token: sign(user) };
  },
  async login({ login, password }) {
    const stored = await userRepository.findByLogin(login);
    if (
      !stored?.is_active ||
      !stored.password_hash ||
      !(await bcrypt.compare(password, stored.password_hash))
    )
      throw errors.unauthorized("Credenciais inválidas.");
    await userRepository.touchLogin(stored.id);
    const { password_hash, ...user } = stored;
    return { user, token: sign(user) };
  },
};
