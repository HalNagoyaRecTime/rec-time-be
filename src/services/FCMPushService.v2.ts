// src/services/FCMPushService.ts - FCM HTTP v1 API対応版

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
  /**
   * FCM HTTP v1 API用のOAuth 2.0アクセストークンを取得
   */
  async function getAccessToken(): Promise<string | null> {
    try {
      const serviceAccount = JSON.parse(env.FCM_SERVICE_ACCOUNT_JSON);
      
      // JWT生成
      const now = Math.floor(Date.now() / 1000);
      const jwtHeader = {
        alg: 'RS256',
        typ: 'JWT'
      };
      
      const jwtPayload = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
      };
      
      // Base64URL エンコード
      const base64UrlEncode = (obj: any) => {
        return btoa(JSON.stringify(obj))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
      };
      
      const headerEncoded = base64UrlEncode(jwtHeader);
      const payloadEncoded = base64UrlEncode(jwtPayload);
      const signatureInput = `${headerEncoded}.${payloadEncoded}`;
      
      // 秘密鍵で署名
      const privateKey = serviceAccount.private_key;
      const keyData = await crypto.subtle.importKey(
        'pkcs8',
        pemToArrayBuffer(privateKey),
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256'
        },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        keyData,
        new TextEncoder().encode(signatureInput)
      );
      
      const signatureEncoded = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      const jwt = `${signatureInput}.${signatureEncoded}`;
      
      // アクセストークン取得
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
      });
      
      if (!tokenResponse.ok) {
        console.error('[FCM] トークン取得失敗:', await tokenResponse.text());
        return null;
      }
      
      const tokenData = await tokenResponse.json() as { access_token: string };
      return tokenData.access_token;
    } catch (error) {
      console.error('[FCM] アクセストークン取得エラー:', error);
      return null;
    }
  }
  
  /**
   * PEM形式の秘密鍵をArrayBufferに変換
   */
  function pemToArrayBuffer(pem: string): ArrayBuffer {
    const b64 = pem
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  return {
    /**
     * FCM HTTP v1 API経由でプッシュ通知を送信 (Android/Chrome)
     */
    async sendNotification(
      subscription: PushSubscriptionInfo,
      payload: PushNotificationPayload
    ): Promise<boolean> {
      try {
        // エンドポイントからFCMトークンを抽出
        const token = subscription.endpoint.split('/').pop();

        if (!token) {
          console.error('[FCM] トークン抽出失敗:', subscription.endpoint);
          return false;
        }

        const accessToken = await getAccessToken();
        if (!accessToken) {
          console.error('[FCM] アクセストークン取得失敗');
          return false;
        }

        const projectId = env.FCM_PROJECT_ID || 'rec-time-593b0';
        const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

        const response = await fetch(fcmEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: {
              token: token,
              notification: {
                title: payload.title,
                body: payload.body,
              },
              webpush: {
                notification: {
                  icon: payload.icon || '/icons/pwa-192.png',
                  badge: payload.badge || '/icons/pwa-192.png',
                  tag: payload.tag,
                  requireInteraction: true,
                },
                fcm_options: {
                  link: '/'
                }
              },
              data: payload.data || {},
            },
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
     * Web Push API標準形式でプッシュ通知を送信（iOS Safari用）
     * ※ iOSではVAPID認証が必要
     */
    async sendWebPush(
      subscription: PushSubscriptionInfo,
      payload: PushNotificationPayload
    ): Promise<boolean> {
      try {
        // iOS Safari向けはWeb Push Protocol標準を使用
        // ただし、Cloudflare Workersではweb-pushライブラリが使えないため
        // 現時点では簡易実装またはFCM経由を推奨
        console.warn('[WebPush] iOS向けWeb Push実装は開発中です');
        return false;
      } catch (error) {
        console.error('[WebPush] 送信エラー:', error);
        return false;
      }
    },

    /**
     * プラットフォームを自動判定して最適な方法で送信
     */
    async sendPush(
      subscription: PushSubscriptionInfo,
      payload: PushNotificationPayload
    ): Promise<boolean> {
      const endpoint = subscription.endpoint;

      if (endpoint.includes('fcm.googleapis.com')) {
        // Android/Chrome: FCM HTTP v1 API
        return this.sendNotification(subscription, payload);
      } else if (endpoint.includes('web.push.apple.com')) {
        // iOS Safari: 現時点ではサポート外
        console.warn('[Push] iOS向けプッシュ通知は現在サポートされていません');
        console.warn('[Push] バックエンドでのスケジュール通知送信が必要です');
        return false;
      } else {
        // その他
        return this.sendNotification(subscription, payload);
      }
    },
  };
}

export type FCMPushServiceFunctions = ReturnType<typeof createFCMPushService>;
