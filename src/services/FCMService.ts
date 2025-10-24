// src/services/FCMService.ts
// Firebase Cloud Messaging (FCM) 서비스 - Cloudflare Workers 호환 완전판

import { D1Database } from '@cloudflare/workers-types';
import { SignJWT } from 'jose';

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
  data?: Record<string, unknown>;
}

export function createFCMService(
  db: D1Database,
  env: {
    FCM_PROJECT_ID?: string;
    FCM_PRIVATE_KEY?: string;
    FCM_CLIENT_EMAIL?: string;
    FIREBASE_SERVICE_ACCOUNT_KEY?: string;
  }
) {
  // ✅ 환경 변수 검증 - FIREBASE_SERVICE_ACCOUNT_KEY 우선 사용
  const hasServiceAccountKey = !!env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const hasIndividualKeys = !!(env.FCM_PROJECT_ID && env.FCM_PRIVATE_KEY && env.FCM_CLIENT_EMAIL);

  console.log('[FCM] 환경 변수 검증:', {
    hasServiceAccountKey,
    hasIndividualKeys,
    FIREBASE_SERVICE_ACCOUNT_KEY: env.FIREBASE_SERVICE_ACCOUNT_KEY ? '설정됨' : '누락',
    FCM_PROJECT_ID: env.FCM_PROJECT_ID ? '설정됨' : '누락',
    FCM_PRIVATE_KEY: env.FCM_PRIVATE_KEY ? '설정됨' : '누락',
    FCM_CLIENT_EMAIL: env.FCM_CLIENT_EMAIL ? '설정됨' : '누락'
  });

  if (!hasServiceAccountKey && !hasIndividualKeys) {
    throw new Error(
      'FCM 환경 변수가 누락되었습니다. FIREBASE_SERVICE_ACCOUNT_KEY 또는 FCM_PROJECT_ID, FCM_PRIVATE_KEY, FCM_CLIENT_EMAIL을 모두 설정해주세요.'
    );
  }

  // 🔥 FIREBASE_SERVICE_ACCOUNT_KEY가 있으면 우선적으로 사용
  let finalEnv = env;
  if (hasServiceAccountKey) {
    try {
      const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY!);
      finalEnv = {
        ...env,
        FCM_PROJECT_ID: serviceAccount.project_id,
        FCM_CLIENT_EMAIL: serviceAccount.client_email,
        FCM_PRIVATE_KEY: serviceAccount.private_key
      };
      console.log('[FCM] FIREBASE_SERVICE_ACCOUNT_KEY 사용으로 전환');
    } catch (err) {
      console.error('[FCM] FIREBASE_SERVICE_ACCOUNT_KEY 파싱 실패:', err);
    }
  }

  return {
    // ✅ FCM 토큰 등록
    async registerToken(data: FCMTokenData) {
      try {
        const now = new Date().toISOString();
        const info = data.deviceInfo ? JSON.stringify(data.deviceInfo) : null;

        await db
          .prepare(`UPDATE fcm_tokens SET is_active = 0, updated_at = ? WHERE student_num = ?`)
          .bind(now, data.studentNum)
          .run();

        await db
          .prepare(`
            INSERT OR REPLACE INTO fcm_tokens 
            (student_num, token, device_info, registered_at, last_used, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?)
          `)
          .bind(data.studentNum, data.token, info, data.timestamp, data.timestamp, now, now)
          .run();

        return { success: true, message: `FCM 토큰 등록 완료 (학번: ${data.studentNum})` };
      } catch (err) {
        console.error('[FCM] registerToken error:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        return { success: false, message: `토큰 등록 실패: ${errorMessage}` };
      }
    },

    // ✅ 개별 전송
    async sendNotificationToStudent(studentNum: string, payload: NotificationPayload) {
      try {
        const tokenRow = await db
          .prepare(`SELECT token FROM fcm_tokens WHERE student_num = ? AND is_active = 1 LIMIT 1`)
          .bind(studentNum)
          .first<{ token: string }>();

        if (!tokenRow?.token) {
          console.error(`[FCM] 토큰 없음 (학번: ${studentNum})`);
          return false;
        }

        const ok = await sendNotification(tokenRow.token, payload, finalEnv);
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
        const rows = await db.prepare(`SELECT token, student_num FROM fcm_tokens WHERE is_active = 1`).all();
        const list = rows.results as { token: string; student_num: string }[];
        let success = 0,
          failed = 0;

        for (const r of list) {
          const ok = await sendNotification(r.token, payload, finalEnv);
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
    async logNotification(studentNum: string, token: string, payload: NotificationPayload, ok: boolean) {
      try {
        const now = new Date().toISOString();
        await db
          .prepare(`
            INSERT INTO notification_logs (student_num, token, title, body, sent_at, success, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(studentNum, token, payload.title, payload.body, now, ok ? 1 : 0, now)
          .run();
      } catch (err) {
        console.error('[FCM] logNotification error:', err);
      }
    },

    // ✅ 학번으로 토큰 조회
    async getTokenByStudentNum(studentNum: string) {
      try {
        const tokenRow = await db
          .prepare(`SELECT * FROM fcm_tokens WHERE student_num = ? AND is_active = 1 LIMIT 1`)
          .bind(studentNum)
          .first<{ token: string; created_at: string }>();
        
        return tokenRow || null;
      } catch (err) {
        console.error('[FCM] getTokenByStudentNum error:', err);
        return null;
      }
    },

    // ✅ 학번으로 토큰 삭제
    async deleteTokenByStudentNum(studentNum: string) {
      try {
        const now = new Date().toISOString();
        await db
          .prepare(`UPDATE fcm_tokens SET is_active = 0, updated_at = ? WHERE student_num = ?`)
          .bind(now, studentNum)
          .run();
        
        console.log(`[FCM] 토큰 비활성화 완료 (학번: ${studentNum})`);
        return true;
      } catch (err) {
        console.error('[FCM] deleteTokenByStudentNum error:', err);
        return false;
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
  env: {
    FCM_PROJECT_ID?: string;
    FCM_PRIVATE_KEY?: string;
    FCM_CLIENT_EMAIL?: string;
    FIREBASE_SERVICE_ACCOUNT_KEY?: string;
  }
) {
  const accessToken = await getFirebaseAccessToken(env);

  let projectId: string;
  if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
    projectId = serviceAccount.project_id;
  } else {
    if (!env.FCM_PROJECT_ID) {
      throw new Error('FCM_PROJECT_ID가 설정되지 않았습니다.');
    }
    projectId = env.FCM_PROJECT_ID;
  }

  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  const messageBody = {
    message: {
      token,
      notification: { title: payload.title, body: payload.body },
      data: payload.data || { studentNum: 'unknown' },
    },
  };

  console.log('[FCM] Firebase 메시지 전송 시작:', { projectId, token: token.substring(0, 20) + '...' });
  console.log('[FCM] 요청 URL:', url);
  console.log('[FCM] 메시지 본문:', JSON.stringify(messageBody));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[FCM] Push Send Error (${res.status}):`, errText);
    console.error('[FCM] 실패한 토큰:', token.substring(0, 20) + '...');
    return false;
  }

  const response = await res.text();
  console.log('[FCM] 메시지 전송 성공 (상태:', res.status, ')');
  console.log('[FCM] 응답:', response);
  return true;
}

// =============================
// 🔑 JWT & Access Token 생성
// =============================

async function getFirebaseAccessToken(env: {
  FCM_PROJECT_ID?: string;
  FCM_PRIVATE_KEY?: string;
  FCM_CLIENT_EMAIL?: string;
  FIREBASE_SERVICE_ACCOUNT_KEY?: string;
}): Promise<string> {
  console.log('[JWT] Firebase Access Token 요청 시작');
  console.log('[JWT] 환경 변수 확인:', {
    FCM_PROJECT_ID: env.FCM_PROJECT_ID ? '설정됨' : '누락',
    FCM_CLIENT_EMAIL: env.FCM_CLIENT_EMAIL ? '설정됨' : '누락',
    FCM_PRIVATE_KEY: env.FCM_PRIVATE_KEY ? '설정됨' : '누락',
    FIREBASE_SERVICE_ACCOUNT_KEY: env.FIREBASE_SERVICE_ACCOUNT_KEY ? '설정됨' : '누락',
  });

  const jwt = await createJWT(env);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const text = await res.text();
  console.log('[JWT] Access Token 응답 상태:', res.status);
  console.log('[JWT] Access Token 응답:', text);

  if (!res.ok) {
    throw new Error(`Firebase Access Token 요청 실패: ${res.status} - ${text}`);
  }

  const data = JSON.parse(text) as { access_token: string };
  if (!data.access_token) throw new Error('Access Token 발급 실패');
  return data.access_token;
}

async function createJWT(env: {
  FCM_PROJECT_ID?: string;
  FCM_PRIVATE_KEY?: string;
  FCM_CLIENT_EMAIL?: string;
  FIREBASE_SERVICE_ACCOUNT_KEY?: string;
}): Promise<string> {
  console.log('[JWT] JWT 생성 시작 (jose 사용)');

  let clientEmail: string;
  let privateKey: string;

  if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.log('[JWT] FIREBASE_SERVICE_ACCOUNT_KEY 사용');
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
    clientEmail = serviceAccount.client_email;
    privateKey = serviceAccount.private_key;
  } else {
    console.log('[JWT] 개별 FCM 키들 사용');
    if (!env.FCM_CLIENT_EMAIL || !env.FCM_PRIVATE_KEY) {
      throw new Error('FCM_CLIENT_EMAIL 또는 FCM_PRIVATE_KEY가 설정되지 않았습니다.');
    }
    clientEmail = env.FCM_CLIENT_EMAIL;
    privateKey = env.FCM_PRIVATE_KEY;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    
    const jwt = await new SignJWT({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .sign(await importPrivateKey(privateKey));

    console.log('[JWT] JWT 생성 성공');
    return jwt;
  } catch (err) {
    console.error('[JWT] JWT 생성 실패:', err);
    throw new Error(`JWT 생성 실패: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Jose에서 사용할 수 있는 형식으로 Private Key를 변환
async function importPrivateKey(pem: string) {
  const keyString = pem
    .replace(/\\n/g, '\n')
    .replace(/\n/g, '')
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '');

  const binaryString = atob(keyString);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    'pkcs8',
    bytes.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );
}
