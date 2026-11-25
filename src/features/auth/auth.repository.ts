import { prisma } from "../../lib/prisma.js";

interface NewAdminRegistration {
  email: string;
  name: string;
  passwordHash: string;
  verificationTokenHash: string;
  verificationExpiresAt: Date;
}

export async function findAdminByEmail(email: string) {
  return prisma.blogAdmin.findUnique({ where: { email } });
}

export async function createAdminRegistration(input: NewAdminRegistration) {
  return prisma.blogAdmin.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      verificationTokens: {
        create: { tokenHash: input.verificationTokenHash, expiresAt: input.verificationExpiresAt },
      },
    },
  });
}

export async function removeUnverifiedAdmin(adminId: string) {
  await prisma.blogAdmin.deleteMany({ where: { id: adminId, emailVerifiedAt: null } });
}

export async function findAdminSession(tokenHash: string) {
  return prisma.blogAdminSession.findUnique({
    where: { tokenHash },
    include: { admin: { select: { id: true, email: true, name: true, emailVerifiedAt: true } } },
  });
}

export async function createAdminSession(adminId: string, tokenHash: string, expiresAt: Date) {
  await prisma.blogAdminSession.create({ data: { adminId, tokenHash, expiresAt } });
}

export async function deleteAdminSession(tokenHash: string) {
  await prisma.blogAdminSession.deleteMany({ where: { tokenHash } });
}

export async function verifyAdminEmail(tokenHash: string, now: Date) {
  return prisma.$transaction(async (transaction) => {
    const verification = await transaction.blogEmailVerificationToken.findUnique({
      where: { tokenHash },
      include: { admin: true },
    });
    if (!verification || verification.expiresAt <= now) return undefined;

    await transaction.blogAdmin.update({
      where: { id: verification.adminId },
      data: { emailVerifiedAt: now },
    });
    await transaction.blogEmailVerificationToken.delete({ where: { id: verification.id } });
    return { id: verification.admin.id, email: verification.admin.email, name: verification.admin.name };
  });
}
