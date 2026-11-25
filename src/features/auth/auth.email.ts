import { env } from "../../config/env.js";
import { ServiceUnavailableError } from "../../core/errors/ServiceUnavailableError.js";

export async function sendAdminVerificationEmail(email: string, name: string, token: string): Promise<void> {
  if (!env.RESEND_API_KEY || env.EMAIL_FROM.includes("@example.com")) {
    throw new ServiceUnavailableError("L'envoi des e-mails n'est pas configuré sur le serveur.");
  }

  const verificationUrl = new URL("/verifier-email", env.FRONTEND_BASE_URL);
  verificationUrl.searchParams.set("token", token);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [email],
      subject: "Confirmez votre compte administrateur Feeti Blog",
      html: `<p>Bonjour ${escapeHtml(name)},</p><p>Confirmez votre adresse pour activer votre compte administrateur :</p><p><a href="${verificationUrl.toString()}">Confirmer mon adresse</a></p><p>Ce lien expire dans 24 heures.</p>`,
    }),
  });

  if (!response.ok) {
    throw new ServiceUnavailableError("L'e-mail de confirmation n'a pas pu être envoyé.");
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}
