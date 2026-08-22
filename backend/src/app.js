import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/authRoutes.js";
import { serviceRoutes, professionalRoutes } from "./routes/catalogRoutes.js";
import {
  appointmentRoutes,
  availabilityRoutes,
  professionalAgendaRoutes,
} from "./routes/appointmentRoutes.js";
import { customerRoutes } from "./routes/customerRoutes.js";
import { scheduleRoutes } from "./routes/scheduleRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((v) => v.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
app.get("/", (req, res) =>
  res.json({
    success: true,
    data: {
      name: "Projeto X API",
      status: "online",
      health: "/health",
      frontend: env.CORS_ORIGIN.split(",")[0].trim(),
    },
  }),
);
app.get("/health", (req, res) =>
  res.json({ success: true, data: { status: "ok" } }),
);
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api/professionals", professionalAgendaRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api", scheduleRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
