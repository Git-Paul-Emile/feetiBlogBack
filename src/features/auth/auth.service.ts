import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { env } from "../../config/env.js";
import { ConflictError } from "../../core/errors/ConflictError.js";
import { ServiceUnavailableError } from "../../core/errors/ServiceUnavailableError.js";
import { UnauthorizedError } from "../../core/errors/UnauthorizedError.js";
import {
  createAdminRegistration,
  createAdminSession,
  deleteAdminSession,
  findAdminByEmail,
  removeUnverifiedAdmin,
  verifyAdminEmail,
} from "./auth.repository.js";
import { sendAdminVerificationEmail } from "./auth.email.js";
import {
  adminSessionDurationMilliseconds,
  emailVerificationDurationMilliseconds,
  opaqueTokenBytes,
  passwordHashCost,
} from "./auth.constants.js";

export interface AuthenticatedAdmin {
  id: string;
  name: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createToken(): string {
  return randomBytes(opaqueTokenBytes).toString("hex");
}

function matchesSecret(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function registerAdmin(input: {
  email: string;
  name: string;
  password: string;
  registrationSecret: string;
}): Promise<void> {
  if (!env.ADMIN_REGISTRATION_SECRET) {
    throw new ServiceUnavailableError("L'inscription administrateur n'est pas activée sur le serveur.");
  }
  if (!matchesSecret(input.registrationSecret, env.ADMIN_REGISTRATION_SECRET)) {
    throw new UnauthorizedError("Le code d'invitation est invalide.");
  }
  if (!env.RESEND_API_KEY || env.EMAIL_FROM.includes("@example.com")) {
    throw new ServiceUnavailableError("L'envoi des e-mails n'est pas configuré sur le serveur.");
  }

  if (await findAdminByEmail(input.email)) throw new ConflictError("Cette adresse possède déjà un compte.");

  const verificationToken = createToken();
  const passwordHash = await hash(input.password, passwordHashCost);
  const admin = await createAdminRegistration({
    email: input.email,
    name: input.name,
    passwordHash,
    verificationTokenHash: hashToken(verificationToken),
    verificationExpiresAt: new Date(Date.now() + emailVerificationDurationMilliseconds),
  });

  try {
    await sendAdminVerificationEmail(admin.email, admin.name, verificationToken);
  } catch (error) {
    await removeUnverifiedAdmin(admin.id);
    throw error;
  }
}

async function createSession(
  admin: AuthenticatedAdmin,
): Promise<{ admin: AuthenticatedAdmin; token: string }> {
  const token = createToken();
  await createAdminSession(
    admin.id,
    hashToken(token),
    new Date(Date.now() + adminSessionDurationMilliseconds),
  );
  return { admin, token };
}

export async function verifyAdmin(token: string) {
  const admin = await verifyAdminEmail(hashToken(token), new Date());
  if (!admin) throw new UnauthorizedError("Le lien de confirmation est invalide ou a expiré.");
  return createSession({ id: admin.id, name: admin.name });
}

export async function loginAdmin(email: string, password: string) {
  const admin = await findAdminByEmail(email);
  const passwordMatches = admin ? await compare(password, admin.passwordHash) : false;
  if (!admin || !passwordMatches || !admin.emailVerifiedAt) {
    throw new UnauthorizedError("Adresse e-mail ou mot de passe invalide.");
  }

  return createSession({ id: admin.id, name: admin.name });
}

export async function logoutAdmin(token: string | undefined): Promise<void> {
  if (!token) return;
  await deleteAdminSession(hashToken(token));
}
