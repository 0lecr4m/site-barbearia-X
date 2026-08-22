import { customerRepository as repo } from "../repositories/customerRepository.js"; import { errors } from "../errors/AppError.js";
export const customerController={
 profile:async(req,res)=>{const x=await repo.findForUser(req.user.id,req.query.barbershopId);if(!x)throw errors.notFound("Perfil de cliente");res.json({success:true,data:x});},
 ensure:async(req,res)=>{const found=await repo.findForUser(req.user.id,req.body.barbershopId);res.status(found?200:201).json({success:true,data:found??await repo.createForUser(req.user,req.body.barbershopId)});},
 update:async(req,res)=>{const x=await repo.update(req.params.id,req.user.id,req.body);if(!x)throw errors.notFound("Cliente");res.json({success:true,data:x});},
 history:async(req,res)=>res.json({success:true,data:await repo.appointments(req.user.id,false)}), upcoming:async(req,res)=>res.json({success:true,data:await repo.appointments(req.user.id,true)})
};
