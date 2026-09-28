type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

/**
 * Sends a transactional email through Resend. Without `RESEND_API_KEY` / `EMAIL_FROM`
 * the message is logged instead, so local development works without a provider.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.log(`[devport] Email to ${message.to} (Resend not configured): ${message.text}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, ...message }),
  });
  if (!res.ok) {
    throw new Error(`Resend request failed (${res.status}): ${await res.text()}`);
  }
}
