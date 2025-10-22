// src/services/FCMService.ts
// ✅ Firebase Cloud Messaging 서비스 (Cloudflare D1 + FCM)

import { D1Database } from '@cloudflare/workers-types';

// ----------------------------
// 타입 정의
// ----------------------------
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
  registerToken(
    data: FCMTokenData
  ): Promise<{ success: boolean; message: string }>;
  unregisterToken(
    studentNum: string
  ): Promise<{ success: boolean; message: string }>;
  getTokenByStudentNum(studentNum: string): Promise<FCMTokenRecord | null>;
  getActiveTokens(): Promise<FCMTokenRecord[]>;
  sendNotification(
    token: string,
    payload: NotificationPayload
  ): Promise<boolean>;
  sendNotificationToStudent(
    studentNum: string,
    payload: NotificationPayload
  ): Promise<boolean>;
  sendNotificationToAll(
    payload: NotificationPayload
  ): Promise<{ success: number; failed: number }>;
  getFCMStatus(
    studentNum: string
  ): Promise<{ registered: boolean; lastUpdated?: string; deviceInfo?: any }>;
  logNotification(
    studentNum: string,
    token: string,
    payload: NotificationPayload,
    success: boolean,
    errorMessage?: string
  ): Promise<void>;
}

// ----------------------------
// 메인 서비스
// ----------------------------
export function createFCMService(
  db: D1Database,
  env: {
    FCM_PROJECT_ID: string;
    FCM_PRIVATE_KEY: string;
    FCM_CLIENT_EMAIL: string;
  }
): FCMServiceFunctions {
  return {
    // ✅ FCM 토큰 등록
    async registerToken(data: FCMTokenData) {
      try {
        const now = new Date().toISOString();
        const deviceInfoJson = data.deviceInfo
          ? JSON.stringify(data.deviceInfo)
          : null;

        // 기존 토큰 비활성화
        await db
          .prepare(
            'UPDATE fcm_tokens SET is_active = 0, updated_at = ? WHERE student_num = ?'
          )
          .bind(now, data.studentNum)
          .run();

        // 새 토큰 등록
        await db
          .prepare(
            `
            INSERT OR REPLACE INTO fcm_tokens 
            (student_num, token, device_info, registered_at, last_used, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?)
          `
          )
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
          message: `FCM 토큰이 성공적으로 등록되었습니다 (학번: ${data.studentNum})`,
        };
      } catch (error: any) {
        console.error('[FCM] 토큰 등록 오류:', error);
        return { success: false, message: `토큰 등록 실패: ${error.message}` };
      }
    },

    // ✅ 토큰 해제
    async unregisterToken(studentNum: string) {
      try {
        const now = new Date().toISOString();
        await db
          .prepare(
            'UPDATE fcm_tokens SET is_active = 0, updated_at = ? WHERE student_num = ?'
          )
          .bind(now, studentNum)
          .run();

        return {
          success: true,
          message: `FCM 토큰이 해제되었습니다 (학번: ${studentNum})`,
        };
      } catch (error: any) {
        console.error('[FCM] 토큰 해제 오류:', error);
        return { success: false, message: `토큰 해제 실패: ${error.message}` };
      }
    },

    // ✅ 학번으로 토큰 조회
    async getTokenByStudentNum(studentNum: string) {
      try {
        const result = await db
          .prepare(
            'SELECT * FROM fcm_tokens WHERE student_num = ? AND is_active = 1 ORDER BY updated_at DESC LIMIT 1'
          )
          .bind(studentNum)
          .first<FCMTokenRecord>();
        return result || null;
      } catch (error) {
        console.error('[FCM] 토큰 조회 오류:', error);
        return null;
      }
    },

    // ✅ 활성 토큰 전체 조회
    async getActiveTokens() {
      try {
        const result = await db
          .prepare(
            'SELECT * FROM fcm_tokens WHERE is_active = 1 ORDER BY updated_at DESC'
          )
          .all();
        const rows = (result?.results || []) as any[];

        return rows.map(r => ({
          id: Number(r.id),
          studentNum: String(r.student_num ?? r.studentNum),
          token: String(r.token),
          deviceInfo: r.device_info ?? r.deviceInfo,
          registeredAt: r.registered_at ?? r.registeredAt,
          lastUsed: r.last_used ?? r.lastUsed,
          isActive: Number(r.is_active),
          createdAt: r.created_at ?? r.createdAt,
          updatedAt: r.updated_at ?? r.updatedAt,
        })) as FCMTokenRecord[];
      } catch (error) {
        console.error('[FCM] 활성 토큰 조회 오류:', error);
        return [];
      }
    },

    // ✅ 개별 토큰으로 알림 전송
    async sendNotification(
      token: string,
      payload: NotificationPayload
    ): Promise<boolean> {
      try {
        const accessToken = await getFirebaseAccessToken(env);

        const message = {
          message: {
            token,
            notification: { title: payload.title, body: payload.body },
            data: payload.data || {},
            android: {
              notification: {
                icon: payload.icon || '/icons/pwa-192.png',
                sound: 'default',
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: payload.badge ? parseInt(payload.badge) : undefined,
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
            body: JSON.stringify(message),
          }
        );

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

    // ✅ 특정 학번으로 알림 전송
    async sendNotificationToStudent(
      studentNum: string,
      payload: NotificationPayload
    ): Promise<boolean> {
      try {
        const tokenRow = await db
          .prepare(
            'SELECT * FROM fcm_tokens WHERE student_num = ? AND is_active = 1 ORDER BY updated_at DESC LIMIT 1'
          )
          .bind(studentNum)
          .first<FCMTokenRecord>();

        if (!tokenRow) {
          console.error(`[FCM] 토큰 없음 (학번: ${studentNum})`);
          return false;
        }

        const success = await this.sendNotification(tokenRow.token, payload);
        await this.logNotification(
          studentNum,
          tokenRow.token,
          payload,
          success
        );
        return success;
      } catch (err) {
        console.error('[FCM] 학생 알림 전송 오류:', err);
        return false;
      }
    },

    // ✅ 전체 발송
    async sendNotificationToAll(payload: NotificationPayload) {
      try {
        const rows = await db
          .prepare(
            'SELECT token, student_num FROM fcm_tokens WHERE is_active = 1'
          )
          .all();
        const list = (rows.results || []) as {
          token: string;
          student_num: string;
        }[];

        let success = 0,
          failed = 0;
        for (const r of list) {
          const ok = await this.sendNotification(r.token, payload);
          await this.logNotification(r.student_num, r.token, payload, ok);
          if (ok) success++;
          else failed++;
        }

        return { success, failed };
      } catch (error) {
        console.error('[FCM] 전체 발송 오류:', error);
        return { success: 0, failed: 0 };
      }
    },

    // ✅ FCM 상태 확인
    async getFCMStatus(studentNum: string) {
      try {
        const record = await this.getTokenByStudentNum(studentNum);
        if (!record) return { registered: false };
        return {
          registered: true,
          lastUpdated: record.updatedAt,
          deviceInfo: record.deviceInfo
            ? JSON.parse(record.deviceInfo)
            : undefined,
        };
      } catch (error) {
        console.error('[FCM] 상태 확인 오류:', error);
        return { registered: false };
      }
    },

    // ✅ 로그 기록
    async logNotification(
      studentNum: string,
      token: string,
      payload: NotificationPayload,
      success: boolean,
      errorMessage?: string
    ) {
      try {
        const now = new Date().toISOString();
        await db
          .prepare(
            `
            INSERT INTO notification_logs 
            (student_num, token, title, body, sent_at, success, error_message, notification_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
          )
          .bind(
            studentNum,
            token,
            payload.title,
            payload.body,
            now,
            success ? 1 : 0,
            errorMessage || null,
            payload.data?.type ?? 'general',
            now
          )
          .run();
      } catch (error) {
        console.error('[FCM] 로그 기록 오류:', error);
      }
    },
  };
}

// ----------------------------
// 🔐 Firebase Access Token
// ----------------------------
async function getFirebaseAccessToken(env: {
  FCM_PROJECT_ID: string;
  FCM_PRIVATE_KEY: string;
  FCM_CLIENT_EMAIL: string;
}): Promise<string> {
  const jwt = await createJWT(env);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

// ----------------------------
// 🔑 JWT 생성 및 RSA 서명
// ----------------------------
async function createJWT(env: {
  FCM_PROJECT_ID: string;
  FCM_PRIVATE_KEY: string;
  FCM_CLIENT_EMAIL: string;
}): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: env.FCM_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signature = await signWithRS256(unsigned, env.FCM_PRIVATE_KEY);
  const encodedSig = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );
  return `${unsigned}.${encodedSig}`;
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function signWithRS256(
  data: string,
  privateKey: string
): Promise<ArrayBuffer> {
  const pem = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '')
    .trim();

  const binaryDer = Uint8Array.from(atob(pem), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  return await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(data)
  );
}
