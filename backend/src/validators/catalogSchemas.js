import { z } from "zod";
export const uuid = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "UUID inválido",
  );
const empty = z.object({});
export const listSchema = z.object({ body: empty, params: empty, query: z.object({ barbershopId: uuid, includeInactive: z.enum(["true","false"]).optional() }) });
export const idSchema = z.object({ body: empty, params: z.object({ id: uuid }), query: empty });
const serviceBody = z.object({ barbershopId: uuid.optional(), name:z.string().trim().min(2).max(150).optional(),description:z.string().max(2000).nullable().optional(),price:z.coerce.number().nonnegative().optional(),durationMinutes:z.coerce.number().int().positive().optional(),imageUrl:z.string().url().nullable().optional(),active:z.boolean().optional(),sortOrder:z.coerce.number().int().optional() });
export const createServiceSchema = z.object({ body:serviceBody.extend({barbershopId:uuid,name:z.string().trim().min(2).max(150),price:z.coerce.number().nonnegative(),durationMinutes:z.coerce.number().int().positive()}),params:empty,query:empty });
export const updateServiceSchema = z.object({body:serviceBody.omit({barbershopId:true}),params:z.object({id:uuid}),query:empty});
export const linkServiceSchema = z.object({body:z.object({serviceId:uuid,customPrice:z.coerce.number().nonnegative().nullable().optional(),customDurationMinutes:z.coerce.number().int().positive().nullable().optional(),active:z.boolean().optional()}),params:z.object({id:uuid}),query:empty});
