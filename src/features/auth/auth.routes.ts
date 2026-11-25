import { Router } from "express";
import { authRateLimiter } from "../../core/middlewares/rateLimiters.js";
import { requireBlogAdmin } from "../../core/middlewares/requireBlogAdmin.js";
import { validateBody } from "../../core/middlewares/validateBody.js";
import { adminLoginSchema, adminRegistrationSchema, emailVerificationSchema } from "./auth.schemas.js";
import { authController } from "./auth.controller.js";

export const authRoutes = Router();

authRoutes.post(
  "/admin-registrations",
  authRateLimiter,
  validateBody(adminRegistrationSchema),
  authController.register,
);
authRoutes.post(
  "/email-verifications",
  authRateLimiter,
  validateBody(emailVerificationSchema),
  authController.verify,
);
authRoutes.post("/sessions", authRateLimiter, validateBody(adminLoginSchema), authController.login);
authRoutes.get("/session", requireBlogAdmin, authController.session);
authRoutes.delete("/session", authController.logout);
