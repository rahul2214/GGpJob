import { inngest } from "./client";
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { supabaseAdmin } from "../supabase-admin";
import { NotificationPayload } from "../../types";

// Create a new Expo SDK client
const expo = new Expo();

export const sendPushNotification = (inngest as any).createFunction(
  { id: "send-push-notification", event: "notification/send" },
  async ({ event, step }: { event: any; step: any }) => {
    const { userId, title, body, payload, type } = event.data as {
      userId: string;
      title: string;
      body: string;
      payload: NotificationPayload;
      type: string;
    };

    // 1. Check preferences
    const preferencesCheck = await step.run("check-preferences", async () => {
      const { data: prefs } = await supabaseAdmin
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!prefs) return true;

      if (type === 'job_alert' && !prefs.job_alerts) return false;
      if (type.startsWith('referral') && !prefs.referral_updates) return false;
      if (type.includes('reward') && !prefs.rewards) return false;

      return true;
    });

    if (!preferencesCheck) {
      return { skipped: true, reason: 'User opted out of this notification type' };
    }

    // 2. Fetch Active Tokens
    const tokens = await step.run("fetch-tokens", async () => {
      const { data } = await supabaseAdmin
        .from('push_tokens')
        .select('token')
        .eq('user_id', userId)
        .eq('is_active', true);
      return data?.map((t: any) => t.token) || [];
    });

    if (tokens.length === 0) {
      return { skipped: true, reason: 'No active push tokens' };
    }

    // 3. Create Notification Record in DB
    const dbRecord = await step.run("create-db-record", async () => {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: userId,
          type: type,
          title: title,
          body: body,
          data: payload,
          delivery_status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    });

    // 4. Send via Expo
    const sendResult = await step.run("send-expo-push", async () => {
      const messages: ExpoPushMessage[] = [];
      for (const pushToken of tokens) {
        if (!Expo.isExpoPushToken(pushToken)) continue;
        messages.push({
          to: pushToken,
          sound: 'default',
          title,
          body,
          data: payload,
          channelId: type.includes('referral') ? 'referrals' : type.includes('reward') ? 'rewards' : 'default'
        });
      }

      const chunks = expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];
      
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("Error sending push notification chunk", error);
        }
      }
      return tickets;
    });

    // 5. Update DB with Expo Ticket ID (for receipt polling later)
    await step.run("update-db-with-ticket", async () => {
      if (sendResult.length > 0 && sendResult[0].status === 'ok') {
        await supabaseAdmin
          .from('notifications')
          .update({ expo_ticket_id: (sendResult[0] as any).id })
          .eq('id', dbRecord.id);
      }
    });

    return { success: true, tickets: sendResult };
  }
);
