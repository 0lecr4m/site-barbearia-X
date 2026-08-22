import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loginSchema, registerSchema } from "../validators/authSchemas.js";
export const authRoutes = Router();
authRoutes.post(
  "/register",
  validate(registerSchema),
  asyncHandler(authController.register),
);
authRoutes.post(
  "/login",
  validate(loginSchema),
  asyncHandler(authController.login),
);
authRoutes.get("/me", authenticate, asyncHandler(authController.me));
authRoutes.post("/logout", authenticate, asyncHandler(authController.logout));
