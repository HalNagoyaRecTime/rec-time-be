// src/services/FCMService.ts
// Firebase Cloud Messaging (FCM) 서비스 - Cloudflare Workers 호환 완전판

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

export function createFCMService(
  db: D1Database,
  env: {
    FCM_PROJECT_ID: string;
    FCM_PRIVATE_KEY: string;
    FCM_CLIENT_EMAIL: string;
  }
) {
  return {
    // ✅ FCM 토큰 등록
    async registerToken(data: FCMTokenData) {
      try {
        const now = new Date().toISOString();
        const info = data.deviceInfo ? JSON.stringify(data.deviceInfo) : null;

        await db
          .prepare(
            `UPDATE fcm_tokens SET is_active = 0, updated_at = ? WHERE student_num = ?`
          )
          .bind(now, data.studentNum)
          .run();

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
            info,
            data.timestamp,
            data.timestamp,
            now,
            now
          )
          .run();

        return {
          success: true,
          message: `FCM 토큰 등록 완료 (학번: ${data.studentNum})`,
        };
      } catch (err: any) {
        console.error('[FCM] registerToken error:', err);
        return { success: false, message: `토큰 등록 실패: ${err.message}` };
      }
    },

    // ✅ 개별 전송
    async sendNotificationToStudent(
      studentNum: string,
      payload: NotificationPayload
    ) {
      try {
        const tokenRow = await db
          .prepare(
            `SELECT token FROM fcm_tokens WHERE student_num = ? AND is_active = 1 LIMIT 1`
          )
          .bind(studentNum)
          .first<{ token: string }>();

        if (!tokenRow?.token) {
          console.error(`[FCM] 토큰 없음 (학번: ${studentNum})`);
          return false;
        }

        const ok = await sendNotification(tokenRow.token, payload, env);
        await this.logNotification(studentNum, tokenRow.token, payload, ok);
        return ok;
      } catch (err) {
        console.error('[FCM] sendNotificationToStudent error:', err);
        return false;
      }
    },

    // ✅ 전체 발송
    async sendNotificationToAll(payload: NotificationPayload) {
      try {
        const rows = await db
          .prepare(
            `SELECT token, student_num FROM fcm_tokens WHERE is_active = 1`
          )
          .all();
        const list = rows.results as { token: string; student_num: string }[];
        let success = 0,
          failed = 0;

        for (const r of list) {
          const ok = await sendNotification(r.token, payload, env);
          await this.logNotification(r.student_num, r.token, payload, ok);
          if (ok) success++;
          else failed++;
        }

        return { success, failed };
      } catch (err) {
        console.error('[FCM] sendNotificationToAll error:', err);
        return { success: 0, failed: 0 };
      }
    },

    // ✅ 로그 기록
    async logNotification(
      studentNum: string,
      token: string,
      payload: NotificationPayload,
      ok: boolean
    ) {
      try {
        const now = new Date().toISOString();
        await db
          .prepare(
            `
            INSERT INTO notification_logs (student_num, token, title, body, sent_at, success, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `
          )
          .bind(
            studentNum,
            token,
            payload.title,
            payload.body,
            now,
            ok ? 1 : 0,
            now
          )
          .run();
      } catch (err) {
        console.error('[FCM] logNotification error:', err);
      }
    },
  };
}

// =============================
// 🔥 공통 함수
// =============================

async function sendNotification(
  token: string,
  payload: NotificationPayload,
  env: any
) {
  try {
    const accessToken = await getFirebaseAccessToken(env);
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${env.FCM_PROJECT_ID}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title: payload.title, body: payload.body },
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('[FCM] Push Send Error:', errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[FCM] sendNotification() exception:', err);
    return false;
  }
}

// =============================
// 🔑 JWT & Access Token
// =============================

async function getFirebaseAccessToken(env: any): Promise<string> {
  const jwt = await createJWT(env);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function createJWT(env: any): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: env.FCM_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const keyData = decodePEM(env.FCM_PRIVATE_KEY);
  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyData as unknown as BufferSource, // ✅ 강제 캐스팅으로 타입 경고 제거
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );

  return `${encodedHeader}.${encodedPayload}.${base64UrlEncodeBinary(signature)}`;
}

// =============================
// 🔧 유틸
// =============================

function decodePEM(pem: string): Uint8Array {
  const base64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlEncode(str: string) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncodeBinary(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return base64UrlEncode(btoa(binary));
}
