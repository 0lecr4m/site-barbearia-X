import { errors } from "../errors/AppError.js";
export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse({
    body: req.body ?? {},
    params: req.params ?? {},
    query: req.query ?? {},
  });
  if (!parsed.success) return next(errors.validation(parsed.error.flatten()));
  req.body = parsed.data.body;
  req.params = parsed.data.params;
  Object.defineProperty(req, "query", {
    value: parsed.data.query,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
};
