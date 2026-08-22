import { appointmentRepository as repo } from "../repositories/appointmentRepository.js"; import { getAvailability } from "../services/availabilityService.js"; import { errors } from "../errors/AppError.js";
const allowed=(u,a)=>u.role==="ADMIN"||a.customer_user_id===u.id||a.staff_user_id===u.id;
export const appointmentController={
 availability:async(req,res)=>res.json({success:true,data:await getAvailability(req.query)}),
 create:async(req,res)=>res.status(201).json({success:true,data:await repo.create(req.user,req.body)}),
 get:async(req,res)=>{const x=await repo.get(req.params.id);if(!x)throw errors.notFound("Agendamento");if(!allowed(req.user,x))throw errors.forbidden();res.json({success:true,data:x});},
 reschedule:async(req,res)=>res.json({success:true,data:await repo.reschedule(req.params.id,req.user,req.body.startsAt)}),
 cancel:async(req,res)=>res.json({success:true,data:await repo.cancel(req.params.id,req.user,req.body.reason)}),
 agenda:async(req,res)=>res.json({success:true,data:await repo.staffAgenda(req.params.id,req.query.from,req.query.to)})
};
