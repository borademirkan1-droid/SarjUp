import Expo, { ExpoPushMessage } from "expo-server-sdk";

const expo = new Expo();

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendPushNotification(
  tokens: string[],
  payload: PushPayload
) {
  const valid = tokens.filter(Expo.isExpoPushToken);
  if (!valid.length) return { sent: 0, errors: [] };

  const messages: ExpoPushMessage[] = valid.map((to) => ({
    to,
    sound: "default",
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const errors: string[] = [];
  let sent = 0;

  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      receipts.forEach((r) => {
        if (r.status === "ok") sent++;
        else errors.push(r.message ?? "unknown error");
      });
    } catch (e: unknown) {
      errors.push(String(e));
    }
  }
  return { sent, errors };
}
