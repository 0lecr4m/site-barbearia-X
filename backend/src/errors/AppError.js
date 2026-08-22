export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    Object.assign(this, { status, code, details });
  }
}
export const errors = {
  validation: (details) =>
    new AppError(400, "VALIDATION_ERROR", "Dados inválidos.", details),
  unauthorized: (message = "Autenticação necessária.") =>
    new AppError(401, "UNAUTHORIZED", message),
  forbidden: () =>
    new AppError(403, "FORBIDDEN", "Você não tem permissão para esta ação."),
  notFound: (resource = "Recurso") =>
    new AppError(404, "NOT_FOUND", `${resource} não encontrado.`),
  conflict: (message) => new AppError(409, "CONFLICT", message),
  slotUnavailable: () =>
    new AppError(
      409,
      "TIME_SLOT_UNAVAILABLE",
      "Este horário não está mais disponível.",
    ),
};
