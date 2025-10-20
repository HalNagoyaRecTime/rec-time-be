// src/services/FCMService.ts
// Firebase Cloud Messaging 서비스 구현

import { D1Database } from '@cloudflare/workers-types';

export interface FCMToken {
  token: string;
  registeredAt: string;
  lastUsed: string;
}

export interface FCMMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface FCMServiceFunctions {
  registerToken(token: string): Promise<boolean>;
  sendNotification(token: string, message: FCMMessage): Promise<boolean>;
  sendNotificationToAll(message: FCMMessage): Promise<{ success: number; failed: number }>;
  getRegisteredTokens(): Promise<string[]>;
}

export function createFCMService(
  db: D1Database,
  env: {
    FCM_PROJECT_ID: string;
    FCM_PRIVATE_KEY: string;
    FCM_CLIENT_EMAIL: string;
  }
): FCMServiceFunctions {
  return {
    // FCM 토큰 등록
    async registerToken(token: string): Promise<boolean> {
      try {
        const now = new Date().toISOString();
        const fcmToken: FCMToken = {
          token,
          registeredAt: now,
          lastUsed: now,
        };

        // D1 데이터베이스에 FCM 토큰 저장
        await db
          .prepare(
            'INSERT OR REPLACE INTO fcm_tokens (token, registered_at, last_used) VALUES (?, ?, ?)'
          )
          .bind(token, fcmToken.registeredAt, fcmToken.lastUsed)
          .run();

        console.log(`[FCM] 토큰 등록 성공: ${token.substring(0, 20)}...`);
        return true;
      } catch (error) {
        console.error('[FCM] 토큰 등록 오류:', error);
        return false;
      }
    },

    // 특정 토큰에 알림 전송
    async sendNotification(token: string, message: FCMMessage): Promise<boolean> {
      try {
        const accessToken = await getFirebaseAccessToken(env);
        const fcmMessage = {
          message: {
            token,
            notification: {
              title: message.title,
              body: message.body,
            },
            data: message.data || {},
            android: {
              notification: {
                icon: '/icons/pwa-192.png',
                sound: 'default',
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                },
              },
            },
          },
        };

        const response = await fetch(
          `https://fcm.googleapis.com/v1/projects/${env.FCM_PROJECT_ID}/messages:send`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(fcmMessage),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error('[FCM] 푸시 전송 실패:', errorData);
          return false;
        }

        // 토큰 사용 시간 업데이트
        await db
          .prepare('UPDATE fcm_tokens SET last_used = ? WHERE token = ?')
          .bind(new Date().toISOString(), token)
          .run();

        console.log(`[FCM] 푸시 전송 성공: ${token.substring(0, 20)}...`);
        return true;
      } catch (error) {
        console.error('[FCM] 푸시 전송 오류:', error);
        return false;
      }
    },

    // 모든 등록된 토큰에 알림 전송
    async sendNotificationToAll(message: FCMMessage): Promise<{ success: number; failed: number }> {
      try {
        const tokens = await this.getRegisteredTokens();
        let success = 0;
        let failed = 0;

        for (const token of tokens) {
          const result = await this.sendNotification(token, message);
          if (result) {
            success++;
          } else {
            failed++;
          }
        }

        console.log(`[FCM] 전체 푸시 전송 완료: 성공 ${success}개, 실패 ${failed}개`);
        return { success, failed };
      } catch (error) {
        console.error('[FCM] 전체 푸시 전송 오류:', error);
        return { success: 0, failed: 0 };
      }
    },

    // 등록된 FCM 토큰 목록 조회
    async getRegisteredTokens(): Promise<string[]> {
      try {
        const result = await db
          .prepare('SELECT token FROM fcm_tokens ORDER BY last_used DESC')
          .all();

        return result.results?.map((row: any) => row.token) || [];
      } catch (error) {
        console.error('[FCM] 토큰 목록 조회 오류:', error);
        return [];
      }
    },
  };
}

// Firebase Access Token 획득
async function getFirebaseAccessToken(env: {
  FCM_PROJECT_ID: string;
  FCM_PRIVATE_KEY: string;
  FCM_CLIENT_EMAIL: string;
}): Promise<string> {
  try {
    const jwt = await createJWT(env);
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth2 토큰 요청 실패: ${response.status}`);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  } catch (error) {
    console.error('[FCM] Access Token 획득 오류:', error);
    throw error;
  }
}

// JWT 토큰 생성
async function createJWT(env: {
  FCM_PROJECT_ID: string;
  FCM_PRIVATE_KEY: string;
  FCM_CLIENT_EMAIL: string;
}): Promise<string> {
  try {
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: env.FCM_CLIENT_EMAIL,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600, // 1시간 후 만료
    };

    // JWT 헤더와 페이로드를 Base64URL 인코딩
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;

    // RSA-SHA256 서명 생성
    const signature = await signWithRS256(unsignedToken, env.FCM_PRIVATE_KEY);
    const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));

    return `${unsignedToken}.${encodedSignature}`;
  } catch (error) {
    console.error('[FCM] JWT 생성 오류:', error);
    throw error;
  }
}

// Base64URL 인코딩
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// RSA-SHA256 서명 생성
async function signWithRS256(data: string, privateKey: string): Promise<ArrayBuffer> {
  try {
    // PEM 형식의 개인키를 Web Crypto API 형식으로 변환
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = privateKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');

    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      new TextEncoder().encode(data)
    );

    return signature;
  } catch (error) {
    console.error('[FCM] RSA 서명 생성 오류:', error);
    throw error;
  }
}
