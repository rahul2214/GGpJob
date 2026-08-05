import { inngest } from "./inngest/client";
import { NotificationPayload, NotificationType } from "../types";

export async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  payload: Omit<NotificationPayload, 'type'>
) {
  await inngest.send({
    name: "notification/send",
    data: {
      userId,
      type,
      title,
      body,
      payload: { ...payload, type }
    }
  });
}

export async function sendBulkNotification(
  userIds: string[],
  type: NotificationType,
  title: string,
  body: string,
  payload: Omit<NotificationPayload, 'type'>
) {
  const events = userIds.map(userId => ({
    name: "notification/send",
    data: {
      userId,
      type,
      title,
      body,
      payload: { ...payload, type }
    }
  }));

  await inngest.send(events);
}
