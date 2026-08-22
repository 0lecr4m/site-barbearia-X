import { z } from "zod";
const email = z.string().email().transform(v => v.toLowerCase());
export const registerSchema = z.object({ body: z.object({ name: z.string().trim().min(2).max(150), email: email.optional(), phone: z.string().trim().min(8).max(30).optional(), password: z.string().min(8).max(72) }).refine(v => v.email || v.phone, "Informe e-mail ou telefone"), params: z.object({}), query: z.object({}) });
export const loginSchema = z.object({ body: z.object({ login: z.string().trim().min(3), password: z.string().min(1) }), params: z.object({}), query: z.object({}) });
