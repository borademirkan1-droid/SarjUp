const WA_API_URL = "https://graph.facebook.com/v19.0";

interface WaResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function sendWa(payload: Record<string, unknown>): Promise<WaResult> {
  const token = process.env.META_WA_TOKEN;
  const phoneId = process.env.META_WA_PHONE_ID;

  if (!token || !phoneId) {
    return { success: false, error: "META_WA_TOKEN veya META_WA_PHONE_ID eksik" };
  }

  const res = await fetch(`${WA_API_URL}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });

  const data = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    return { success: false, error: JSON.stringify(data) };
  }

  const messages = data.messages as Array<{ id: string }> | undefined;
  return { success: true, messageId: messages?.[0]?.id };
}

export async function sendWhatsAppText(
  phone: string,
  text: string
): Promise<WaResult> {
  return sendWa({
    to: phone,
    type: "text",
    text: { body: text },
  });
}

export async function sendWhatsAppTemplate(
  phone: string,
  templateName: string,
  languageCode = "tr",
  components: unknown[] = []
): Promise<WaResult> {
  return sendWa({
    to: phone,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  });
}

// SarjUp'a özel: lead'e hoş geldin mesajı
export async function sendLeadWelcome(
  phone: string,
  name: string
): Promise<WaResult> {
  return sendWhatsAppText(
    phone,
    `Merhaba ${name}! ŞarjUp ekibi olarak sizi aradık. Akıllı şarj istasyonu fırsatımız hakkında bilgi almak ister misiniz? 📱⚡`
  );
}
