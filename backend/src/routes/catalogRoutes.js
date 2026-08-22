import { Router } from "express";
import { catalogController as c } from "../controllers/catalogController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler as a } from "../utils/asyncHandler.js";
import {
  listSchema,
  idSchema,
  createServiceSchema,
  updateServiceSchema,
  linkServiceSchema,
} from "../validators/catalogSchemas.js";
export const serviceRoutes = Router(),
  professionalRoutes = Router();
serviceRoutes.get("/", validate(listSchema), a(c.listServices));
serviceRoutes.get("/:id", validate(idSchema), a(c.getService));
serviceRoutes.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createServiceSchema),
  a(c.createService),
);
serviceRoutes.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateServiceSchema),
  a(c.updateService),
);
professionalRoutes.get("/", validate(listSchema), a(c.listStaff));
professionalRoutes.get("/:id", validate(idSchema), a(c.getStaff));
professionalRoutes.put(
  "/:id/services",
  authenticate,
  authorize("ADMIN"),
  validate(linkServiceSchema),
  a(c.linkService),
);
