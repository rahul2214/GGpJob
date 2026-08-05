import webpush from 'web-push';
import { Expo } from 'expo-server-sdk';
import { supabaseAdmin } from './supabase-admin';

// Initialize Web Push
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:support@jobsdart.in',
    vapidPublicKey,
    vapidPrivateKey
  );
}

// Initialize Expo Push
const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

/**
 * Sends a push notification to all registered devices for a given user.
 */
export async function sendPushNotification(userId: string, title: string, body: string, data: any = {}) {
  try {
    // 1. Fetch user tokens from the user_push_tokens table
    const { data: pushTokens, error } = await supabaseAdmin
      .from('user_push_tokens')
      .select('token, platform')
      .eq('user_id', userId);

    if (error || !pushTokens || pushTokens.length === 0) {
      console.log(`[Push] No tokens found for user ${userId}`);
      return;
    }

    const expoMessages = [];
    const webSubscribers = [];

    // Separate tokens by type
    for (const tokenData of pushTokens) {
      let parsedToken = tokenData.token;
      
      // Try parsing JSON for web push tokens
      if (tokenData.platform === 'web' && typeof parsedToken === 'string') {
        try {
          parsedToken = JSON.parse(parsedToken);
        } catch (e) {
          // not valid JSON, ignore
        }
      }

      if (tokenData.platform === 'web' && typeof parsedToken === 'object') {
        webSubscribers.push(parsedToken);
      } else if (Expo.isExpoPushToken(parsedToken)) {
        expoMessages.push({
          to: parsedToken,
          sound: 'default',
          title,
          body,
          data,
        });
      }
    }

    // 2. Send Expo Mobile Push Notifications
    if (expoMessages.length > 0) {
      const chunks = expo.chunkPushNotifications(expoMessages as any);
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log('[Push] Expo tickets:', ticketChunk);
        } catch (error) {
          console.error('[Push] Error sending Expo chunk:', error);
        }
      }
    }

    // 3. Send Web Push Notifications
    if (webSubscribers.length > 0 && vapidPublicKey && vapidPrivateKey) {
      const payload = JSON.stringify({
        title,
        body,
        data,
        icon: '/icon.png', // Ensure this exists in public folder
      });

      for (const subscription of webSubscribers) {
        try {
          await webpush.sendNotification(subscription, payload);
          console.log('[Push] Sent web push');
        } catch (error: any) {
          console.error('[Push] Error sending web push:', error?.statusCode, error?.body);
        }
      }
    }
  } catch (error) {
    console.error('[Push] Fatal error sending notification:', error);
  }
}
