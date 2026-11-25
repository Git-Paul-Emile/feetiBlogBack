import type { Response } from "express";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../core/http/asyncHandler.js";
import { apiSuccessResponse } from "../../core/http/apiResponse.js";
import { getSessionTokenFromRequest } from "../../core/middlewares/requireBlogAdmin.js";
import { getValidatedBody } from "../../core/middlewares/validateBody.js";
import { loginAdmin, logoutAdmin, registerAdmin, verifyAdmin } from "./auth.service.js";
import type { AdminLoginInput, AdminRegistrationInput, EmailVerificationInput } from "./auth.schemas.js";
import { adminSessionCookieName, adminSessionDurationSeconds } from "./auth.constants.js";

function setSessionCookie(response: Response, token: string): void {
  const secure = env.NODE_ENV === "production" ? "; Secure" : "";
  response.append(
    "Set-Cookie",
    `${adminSessionCookieName}=${token}; Max-Age=${adminSessionDurationSeconds}; Path=/api/v1; HttpOnly; SameSite=Lax${secure}`,
  );
}

function clearSessionCookie(response: Response): void {
  const secure = env.NODE_ENV === "production" ? "; Secure" : "";
  response.append(
    "Set-Cookie",
    `${adminSessionCookieName}=; Max-Age=0; Path=/api/v1; HttpOnly; SameSite=Lax${secure}`,
  );
}

export const authController = {
  register: asyncHandler(async (_request, response) => {
    const input = getValidatedBody<AdminRegistrationInput>(response);
    await registerAdmin(input);
    response
      .status(202)
      .json(
        apiSuccessResponse(
          { emailConfirmationRequired: true },
          "Consultez votre boîte e-mail pour confirmer l'adresse.",
          202,
        ),
      );
  }),

  verify: asyncHandler(async (_request, response) => {
    const { token } = getValidatedBody<EmailVerificationInput>(response);
    const session = await verifyAdmin(token);
    setSessionCookie(response, session.token);
    response
      .status(200)
      .json(apiSuccessResponse({ admin: session.admin }, "Le compte administrateur est activé."));
  }),

  login: asyncHandler(async (_request, response) => {
    const input = getValidatedBody<AdminLoginInput>(response);
    const session = await loginAdmin(input.email, input.password);
    setSessionCookie(response, session.token);
    response.status(200).json(apiSuccessResponse({ admin: session.admin }, "Connexion réussie."));
  }),

  session: asyncHandler(async (request, response) => {
    const admin = request.blogAdmin;
    response
      .status(200)
      .json(
        apiSuccessResponse({ admin: { id: admin?.id, name: admin?.name } }, "Session administrateur active."),
      );
  }),

  logout: asyncHandler(async (request, response) => {
    await logoutAdmin(getSessionTokenFromRequest(request));
    clearSessionCookie(response);
    response.status(200).json(apiSuccessResponse({ loggedOut: true }, "Déconnexion réussie."));
  }),
};
