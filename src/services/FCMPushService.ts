// src/services/FCMPushService.ts

import { Bindings } from '../types';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

export interface PushSubscriptionInfo {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function createFCMPushService(env: Bindings) {
  return {
    /**
     * FCM経由でプッシュ通知を送信
     */
    async sendNotification(
      subscription: PushSubscriptionInfo,
      payload: PushNotificationPayload
    ): Promise<boolean> {
      try {
        // FCM Legacy API使用
        const fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';

        // エンドポイントからFCMトークンを抽出
        // 例: https://fcm.googleapis.com/fcm/send/xxxxx → xxxxx
        const token = subscription.endpoint.split('/').pop();

        if (!token) {
          console.error('[FCM] トークン抽出失敗:', subscription.endpoint);
          return false;
        }

        const response = await fetch(fcmEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${env.FCM_SERVER_KEY}`,
          },
          body: JSON.stringify({
            to: token,
            priority: 'high',
            notification: {
              title: payload.title,
              body: payload.body,
              icon: payload.icon || '/icons/pwa-192.png',
              badge: payload.badge || '/icons/pwa-192.png',
              tag: payload.tag,
              requireInteraction: true,
            },
            data: payload.data || {},
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[FCM] 送信失敗:', response.status, errorText);
          return false;
        }

        const result = await response.json();
        console.log('[FCM] 送信成功:', result);
        return true;
      } catch (error) {
        console.error('[FCM] 送信エラー:', error);
        return false;
      }
    },

    /**
     * Web Push API標準形式でプッシュ通知を送信（VAPID使用）
     * iOS Safari用
     */
    async sendWebPush(
      subscription: PushSubscriptionInfo,
      payload: PushNotificationPayload
    ): Promise<boolean> {
      try {
        // Web Push標準プロトコル
        // VAPID認証を使用してAPNs/FCMに直接送信
        
        const vapidPublicKey = env.VAPID_PUBLIC_KEY;
        const vapidPrivateKey = env.VAPID_PRIVATE_KEY;

        if (!vapidPublicKey || !vapidPrivateKey) {
          console.error('[WebPush] VAPID鍵が設定されていません');
          return false;
        }

        // JWTトークン生成（簡易版）
        const vapidHeaders = await this.generateVAPIDHeaders(
          subscription.endpoint,
          vapidPublicKey,
          vapidPrivateKey
        );

        const response = await fetch(subscription.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Encoding': 'aes128gcm',
            TTL: '86400',
            ...vapidHeaders,
          },
          body: JSON.stringify({
            notification: {
              title: payload.title,
              body: payload.body,
              icon: payload.icon,
              badge: payload.badge,
              tag: payload.tag,
              data: payload.data,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[WebPush] 送信失敗:', response.status, errorText);
          return false;
        }

        console.log('[WebPush] 送信成功');
        return true;
      } catch (error) {
        console.error('[WebPush] 送信エラー:', error);
        return false;
      }
    },

    /**
     * VAPID認証ヘッダー生成
     */
    async generateVAPIDHeaders(
      endpoint: string,
      publicKey: string,
      privateKey: string
    ): Promise<Record<string, string>> {
      // 簡易実装：実際にはweb-pushライブラリの使用を推奨
      // Cloudflare Workers環境では crypto API を使用
      
      const url = new URL(endpoint);
      const audience = `${url.protocol}//${url.host}`;

      // JWTペイロード
      const jwtPayload = {
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12時間有効
        sub: 'mailto:your-email@example.com', // 連絡先メールアドレス
      };

      // 実際の実装ではJWT署名が必要
      // ここでは簡易版として返却
      return {
        Authorization: `vapid t=${publicKey}, k=${privateKey}`,
      };
    },

    /**
     * プラットフォームを自動判定して最適な方法で送信
     */
    async sendPush(
      subscription: PushSubscriptionInfo,
      payload: PushNotificationPayload,
      platform?: string
    ): Promise<boolean> {
      // エンドポイントからプラットフォームを判定
      const endpoint = subscription.endpoint;

      if (endpoint.includes('fcm.googleapis.com')) {
        // Android/Chrome: FCM
        return this.sendNotification(subscription, payload);
      } else if (endpoint.includes('web.push.apple.com')) {
        // iOS Safari: Web Push API
        return this.sendWebPush(subscription, payload);
      } else {
        // その他: Web Push API標準
        return this.sendWebPush(subscription, payload);
      }
    },
  };
}

export type FCMPushServiceFunctions = ReturnType<typeof createFCMPushService>;
