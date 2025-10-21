// src/services/FCMService.ts
// Firebase Cloud Messaging 서비스 구현 (학번 연동)

import { D1Database } from '@cloudflare/workers-types';

export interface FCMTokenData {
  token: string;
  studentNum: string;
  timestamp: string;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    language: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

export interface FCMTokenRecord {
  id: number;
  studentNum: string;
  token: string;
  deviceInfo?: string;
  registeredAt: string;
  lastUsed?: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface FCMServiceFunctions {
  // 토큰 관리
  registerToken(data: FCMTokenData): Promise<{ success: boolean; message: string }>;
  unregisterToken(studentNum: string): Promise<{ success: boolean; message: string }>;
  getTokenByStudentNum(studentNum: string): Promise<FCMTokenRecord | null>;
  getActiveTokens(): Promise<FCMTokenRecord[]>;
  
  // 알림 전송
  sendNotification(token: string, payload: NotificationPayload): Promise<boolean>;
  sendNotificationToStudent(studentNum: string, payload: NotificationPayload): Promise<boolean>;
  sendNotificationToAll(payload: NotificationPayload): Promise<{ success: number; failed: number }>;
  
  // 상태 확인
  getFCMStatus(studentNum: string): Promise<{ registered: boolean; lastUpdated?: string; deviceInfo?: any }>;
  
  // 로그 관리
  logNotification(studentNum: string, token: string, payload: NotificationPayload, success: boolean, errorMessage?: string): Promise<void>;
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
    // FCM 토큰 등록 (학번 연동)
    async registerToken(data: FCMTokenData): Promise<{ success: boolean; message: string }> {
      try {
        const now = new Date().toISOString();
        const deviceInfoJson = data.deviceInfo ? JSON.stringify(data.deviceInfo) : null;

        // 먼저 해당 학번의 기존 토큰들을 비활성화
        await db
          .prepare('UPDATE fcm_tokens SET is_active = 0, updated_at = ? WHERE student_num = ?')
          .bind(now, data.studentNum)
          .run();

        // INSERT OR REPLACE를 사용하여 중복 토큰 문제 해결
        await db
          .prepare(`
            INSERT OR REPLACE INTO fcm_tokens 
            (student_num, token, device_info, registered_at, last_used, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?)
          `)
          .bind(
            data.studentNum,
            data.token,
            deviceInfoJson,
            data.timestamp,
            data.timestamp,
            now,
            now
          )
          .run();

        return {
          success: true,
          message: `FCM 토큰이 성공적으로 등록되었습니다 (학번: ${data.studentNum})`
        };
      } catch (error) {
        console.error('[FCM] 토큰 등록 오류:', error);
        return {
          success: false,
          message: `토큰 등록에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
      }
    },

    // FCM 토큰 해제
    async unregisterToken(studentNum: string): Promise<{ success: boolean; message: string }> {
      try {
        const now = new Date().toISOString();
        
        await db
          .prepare('UPDATE fcm_tokens SET is_active = 0, updated_at = ? WHERE student_num = ?')
          .bind(now, studentNum)
          .run();

        return {
          success: true,
          message: `FCM 토큰이 성공적으로 해제되었습니다 (학번: ${studentNum})`
        };
      } catch (error) {
        console.error('[FCM] 토큰 해제 오류:', error);
        return {
          success: false,
          message: `토큰 해제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
      }
    },

    // 학번으로 토큰 조회
    async getTokenByStudentNum(studentNum: string): Promise<FCMTokenRecord | null> {
      try {
        const result = await db
          .prepare('SELECT * FROM fcm_tokens WHERE student_num = ? AND is_active = 1 ORDER BY updated_at DESC LIMIT 1')
          .bind(studentNum)
          .first();

        return result as unknown as FCMTokenRecord | null;
      } catch (error) {
        console.error('[FCM] 토큰 조회 오류:', error);
        return null;
      }
    },

    // 활성 토큰 목록 조회
    async getActiveTokens(): Promise<FCMTokenRecord[]> {
      try {
        const result = await db
          .prepare('SELECT * FROM fcm_tokens WHERE is_active = 1 ORDER BY updated_at DESC')
          .all();

        return result.results as unknown as FCMTokenRecord[];
      } catch (error) {
        console.error('[FCM] 활성 토큰 조회 오류:', error);
        return [];
      }
    },

    // 특정 토큰으로 알림 전송
    async sendNotification(token: string, payload: NotificationPayload): Promise<boolean> {
      try {
        const accessToken = await getFirebaseAccessToken(env);
        
        const message = {
          message: {
            token,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: payload.data || {},
            android: {
              notification: {
                icon: payload.icon || "/icons/pwa-192.png",
                sound: "default"
              }
            },
            apns: {
              payload: {
                aps: {
                  sound: "default",
                  badge: payload.badge ? parseInt(payload.badge) : undefined
                }
              }
            }
          }
        };

        const response = await fetch(`https://fcm.googleapis.com/v1/projects/${env.FCM_PROJECT_ID}/messages:send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[FCM] 알림 전송 실패:', errorData);
          return false;
        }

        return true;
      } catch (error) {
        console.error('[FCM] 알림 전송 오류:', error);
        return false;
      }
    },

    // 학번으로 알림 전송
    async sendNotificationToStudent(studentNum: string, payload: NotificationPayload): Promise<boolean> {
      try {
        const tokenRecord = await this.getTokenByStudentNum(studentNum);
        if (!tokenRecord) {
          console.error(`[FCM] 토큰을 찾을 수 없습니다 (학번: ${studentNum})`);
          return false;
        }

        const success = await this.sendNotification(tokenRecord.token, payload);
        
        // 전송 결과 로깅
        await this.logNotification(studentNum, tokenRecord.token, payload, success);
        
        return success;
      } catch (error) {
        console.error('[FCM] 학생 알림 전송 오류:', error);
        return false;
      }
    },

    // 모든 활성 토큰으로 알림 전송
    async sendNotificationToAll(payload: NotificationPayload): Promise<{ success: number; failed: number }> {
      try {
        const activeTokens = await this.getActiveTokens();
        let successCount = 0;
        let failedCount = 0;

        for (const tokenRecord of activeTokens) {
          const success = await this.sendNotification(tokenRecord.token, payload);
          
          // 전송 결과 로깅
          await this.logNotification(tokenRecord.studentNum, tokenRecord.token, payload, success);
          
          if (success) {
            successCount++;
          } else {
            failedCount++;
          }
        }

        return { success: successCount, failed: failedCount };
      } catch (error) {
        console.error('[FCM] 전체 알림 전송 오류:', error);
        return { success: 0, failed: 0 };
      }
    },

    // FCM 상태 확인
    async getFCMStatus(studentNum: string): Promise<{ registered: boolean; lastUpdated?: string; deviceInfo?: any }> {
      try {
        const tokenRecord = await this.getTokenByStudentNum(studentNum);
        
        if (!tokenRecord) {
          return { registered: false };
        }

        return {
          registered: true,
          lastUpdated: tokenRecord.updatedAt,
          deviceInfo: tokenRecord.deviceInfo ? JSON.parse(tokenRecord.deviceInfo) : undefined
        };
      } catch (error) {
        console.error('[FCM] 상태 확인 오류:', error);
        return { registered: false };
      }
    },

    // 알림 전송 로그 기록
    async logNotification(studentNum: string, token: string, payload: NotificationPayload, success: boolean, errorMessage?: string): Promise<void> {
      try {
        const now = new Date().toISOString();
        
        await db
          .prepare(`
            INSERT INTO notification_logs (student_num, token, title, body, sent_at, success, error_message, notification_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            studentNum,
            token,
            payload.title,
            payload.body,
            now,
            success ? 1 : 0,
            errorMessage || null,
            payload.data?.type || 'general',
            now
          )
          .run();
      } catch (error) {
        console.error('[FCM] 로그 기록 오류:', error);
      }
    }
  };
}

// Firebase Access Token 획득
async function getFirebaseAccessToken(env: { FCM_PROJECT_ID: string; FCM_PRIVATE_KEY: string; FCM_CLIENT_EMAIL: string }): Promise<string> {
  const jwt = await createJWT(env);
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

// JWT 토큰 생성
async function createJWT(env: { FCM_PROJECT_ID: string; FCM_PRIVATE_KEY: string; FCM_CLIENT_EMAIL: string }): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: env.FCM_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const unsignedToken = base64UrlEncode(JSON.stringify(header)) + '.' + base64UrlEncode(JSON.stringify(payload));
  const signature = await signWithRS256(unsignedToken, env.FCM_PRIVATE_KEY);
  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));

  return unsignedToken + '.' + encodedSignature;
}

// Base64 URL 인코딩
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// RSA-SHA256 서명
async function signWithRS256(data: string, privateKey: string): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(privateKey),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  return await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(data)
  );
}