import { createHash } from "node:crypto";
import type { Request, RequestHandler } from "express";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { findAdminSession } from "../../features/auth/auth.repository.js";
import { adminSessionCookieName } from "../../features/auth/auth.constants.js";

declare global {
  namespace Express {
    interface Request {
      blogAdmin?: { id: string; email: string; name: string };
    }
  }
}

function getSessionToken(cookieHeader: string | undefined): string | undefined {
  const cookie = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${adminSessionCookieName}=`));
  return cookie?.slice(adminSessionCookieName.length + 1);
}

export const requireBlogAdmin: RequestHandler = async (request, _response, next) => {
  const token = getSessionToken(request.headers.cookie);
  if (!token) {
    next(new UnauthorizedError());
    return;
  }

  try {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const session = await findAdminSession(tokenHash);
    if (!session || session.expiresAt <= new Date() || !session.admin.emailVerifiedAt) {
      next(new UnauthorizedError());
      return;
    }

    request.blogAdmin = {
      id: session.admin.id,
      email: session.admin.email,
      name: session.admin.name,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export function getSessionTokenFromRequest(request: Request): string | undefined {
  return getSessionToken(request.headers.cookie);
}
