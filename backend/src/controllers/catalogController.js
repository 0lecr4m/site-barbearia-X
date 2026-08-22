import { catalogRepository as repo } from "../repositories/catalogRepository.js";
import { errors } from "../errors/AppError.js";
export const catalogController = {
  listServices: async (req, res) =>
    res.json({
      success: true,
      data: await repo.listServices(
        req.query.barbershopId,
        req.query.includeInactive === "true",
      ),
    }),
  getService: async (req, res) => {
    const x = await repo.getService(req.params.id);
    if (!x) throw errors.notFound("Serviço");
    res.json({ success: true, data: x });
  },
  createService: async (req, res) =>
    res
      .status(201)
      .json({ success: true, data: await repo.createService(req.body) }),
  updateService: async (req, res) => {
    const x = await repo.updateService(req.params.id, req.body);
    if (!x) throw errors.notFound("Serviço");
    res.json({ success: true, data: x });
  },
  listStaff: async (req, res) =>
    res.json({
      success: true,
      data: await repo.listStaff(req.query.barbershopId),
    }),
  getStaff: async (req, res) => {
    const x = await repo.getStaff(req.params.id);
    if (!x) throw errors.notFound("Profissional");
    res.json({ success: true, data: x });
  },
  linkService: async (req, res) =>
    res.json({
      success: true,
      data: await repo.linkService(req.params.id, req.body.serviceId, req.body),
    }),
};
