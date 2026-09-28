import "server-only";

/**
 * Staff notifications. Today this logs to the server console; plug in email (SMTP/SES),
 * WhatsApp Business API or Slack here without touching callers.
 */
export async function notify(event: "quote.requested" | "order.placed" | "contact.message", data: Record<string, unknown>) {
  console.info(`[notify] ${event}`, JSON.stringify(data));
}
