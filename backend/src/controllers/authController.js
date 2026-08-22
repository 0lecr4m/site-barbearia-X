import { authService } from "../services/authService.js";
export const authController = {
  register: async (req, res) =>
    res
      .status(201)
      .json({ success: true, data: await authService.register(req.body) }),
  login: async (req, res) =>
    res.json({ success: true, data: await authService.login(req.body) }),
  me: async (req, res) => res.json({ success: true, data: req.user }),
  logout: async (req, res) => res.status(204).end(),
};
