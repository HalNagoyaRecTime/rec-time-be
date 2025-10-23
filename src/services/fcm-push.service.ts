// src/services/fcm-push.service.ts
import { logger } from '../utils/logger';

/**
 * FCM HTTP v1 API対応プッシュ通知サービス
 * 
 * Firebase Cloud Messaging API (HTTP v1) を使用して通知を送信
 * OAuth 2.0 認証を使用（Legacy Server Keyは非推奨）
 * 
 * @see https://firebase.google.com/docs/cloud-messaging/migrate-v1
 */
export class FCMPushService {
  private projectId: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(
    private serviceAccountJson: string // Cloudflare Secrets経由で渡される
  ) {
    try {
      const account = JSON.parse(serviceAccountJson);
      this.projectId = account.project_id;
    } catch (e) {
      logger.error('❌ [FCM] サービスアカウントJSON解析エラー', { error: e });
      throw new Error('Invalid service account JSON');
    }
  }

  /**
   * OAuth 2.0アクセストークンを取得
   * Web Crypto APIを使用してJWT署名を生成
   */
  private async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    // トークンが有効な場合は再利用（5分前にリフレッシュ）
    if (this.accessToken && this.tokenExpiry > now + 300) {
      return this.accessToken;
    }

    try {
      const account = JSON.parse(this.serviceAccountJson);
      
      // JWT Header
      const header = {
        alg: 'RS256',
        typ: 'JWT',
      };

      // JWT Payload
      const payload = {
        iss: account.client_email,
        sub: account.client_email,
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600, // 1時間有効
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
      };

      // Base64URL encode
      const base64UrlEncode = (data: any) => {
        const json = JSON.stringify(data);
        const base64 = btoa(json);
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      };

      const encodedHeader = base64UrlEncode(header);
      const encodedPayload = base64UrlEncode(payload);
      const unsignedToken = `${encodedHeader}.${encodedPayload}`;

      // PEM形式の秘密鍵をインポート
      const privateKeyPem = account.private_key
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s/g, '');
      
      const binaryKey = Uint8Array.from(atob(privateKeyPem), c => c.charCodeAt(0));

      const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryKey,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        },
        false,
        ['sign']
      );

      // JWT署名
      const encoder = new TextEncoder();
      const data = encoder.encode(unsignedToken);
      const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, data);

      const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const signedToken = `${unsignedToken}.${base64Signature}`;

      // Googleのトークンエンドポイントに送信
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: signedToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('❌ [FCM] OAuth 2.0トークン取得エラー', { 
          status: response.status, 
          error: errorText 
        });
        throw new Error(`Failed to get access token: ${errorText}`);
      }

      const tokenData = await response.json() as { access_token: string; expires_in: number };
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = now + tokenData.expires_in;

      logger.info('✅ [FCM] OAuth 2.0アクセストークン取得成功');
      return this.accessToken;
    } catch (error) {
      logger.error('❌ [FCM] アクセストークン生成エラー', { error });
      throw error;
    }
  }

  /**
   * FCM HTTP v1 APIで通知を送信
   * 
   * @param fcmToken デバイスのFCMトークン
   * @param notification 通知内容
   */
  async sendNotification(
    fcmToken: string,
    notification: {
      title: string;
      body: string;
      data?: Record<string, string>;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const accessToken = await this.getAccessToken();

      const message = {
        message: {
          token: fcmToken,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data || {},
          webpush: {
            fcm_options: {
              link: 'https://develop.rec-time-fe.pages.dev/timetable', // 通知クリック時のURL
            },
          },
        },
      };

      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(message),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('❌ [FCM] 通知送信エラー', {
          status: response.status,
          error: errorData,
          fcmToken: fcmToken.substring(0, 20) + '...',
        });

        return {
          success: false,
          error: JSON.stringify(errorData),
        };
      }

      const result = await response.json() as { name: string };
      logger.info('✅ [FCM] 通知送信成功', {
        messageId: result.name,
        fcmToken: fcmToken.substring(0, 20) + '...',
      });

      return {
        success: true,
        messageId: result.name,
      };
    } catch (error) {
      logger.error('❌ [FCM] 通知送信例外', { error, fcmToken: fcmToken.substring(0, 20) + '...' });
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 複数デバイスに通知を一括送信
   */
  async sendBatchNotifications(
    tokens: string[],
    notification: {
      title: string;
      body: string;
      data?: Record<string, string>;
    }
  ): Promise<{ successCount: number; failureCount: number; results: any[] }> {
    const results = await Promise.all(
      tokens.map(token => this.sendNotification(token, notification))
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    logger.info('📊 [FCM] 一括送信完了', { successCount, failureCount, total: tokens.length });

    return {
      successCount,
      failureCount,
      results,
    };
  }
}
