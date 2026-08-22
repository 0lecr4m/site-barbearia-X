import { AppError } from "../errors/AppError.js";
export function notFoundHandler(req, res) {
  res
    .status(404)
    .json({
      success: false,
      error: { code: "ROUTE_NOT_FOUND", message: "Rota não encontrada." },
    });
}
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.code === "23P01")
    return res
      .status(409)
      .json({
        success: false,
        error: {
          code: "TIME_SLOT_UNAVAILABLE",
          message: "Este horário não está mais disponível.",
        },
      });
  if (error.code === "23505")
    return res
      .status(409)
      .json({
        success: false,
        error: {
          code: "DUPLICATE_RESOURCE",
          message: "Este registro já existe.",
        },
      });
  const known = error instanceof AppError;
  if (!known) console.error(error);
  const payload = {
    code: known ? error.code : "INTERNAL_ERROR",
    message: known ? error.message : "Erro interno do servidor.",
  };
  if (known && error.details) payload.details = error.details;
  res
    .status(known ? error.status : 500)
    .json({ success: false, error: payload });
}
