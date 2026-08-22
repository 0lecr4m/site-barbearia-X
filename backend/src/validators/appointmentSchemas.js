import { z } from "zod"; import { uuid } from "./catalogSchemas.js";
const empty=z.object({}); const iso=z.iso.datetime({offset:true});
export const availabilitySchema=z.object({body:empty,params:empty,query:z.object({barbershopId:uuid,staffId:uuid,serviceIds:z.string().transform(v=>v.split(",").filter(Boolean)).pipe(z.array(uuid).min(1)),date:z.iso.date()})});
export const createAppointmentSchema=z.object({body:z.object({barbershopId:uuid,staffId:uuid,serviceIds:z.array(uuid).min(1),startsAt:iso,customerNotes:z.string().max(1000).optional()}),params:empty,query:empty});
export const appointmentIdSchema=z.object({body:empty,params:z.object({id:uuid}),query:empty});
export const rescheduleSchema=z.object({body:z.object({startsAt:iso}),params:z.object({id:uuid}),query:empty});
export const cancelSchema=z.object({body:z.object({reason:z.string().trim().min(2).max(500)}),params:z.object({id:uuid}),query:empty});
export const agendaSchema=z.object({body:empty,params:z.object({id:uuid}),query:z.object({from:iso,to:iso})});
