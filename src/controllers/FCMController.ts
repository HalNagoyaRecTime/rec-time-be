import { Context } from 'hono';
import { createFCMService } from '../services/FCMService';

export function createFCMController(
  fcmService: ReturnType<typeof createFCMService>
) {
  return {
    // 🎯 FCM 토큰 등록
    async registerToken(c: Context) {
      try {
        const data = await c.req.json();
        console.log('[FCM] registerToken 요청 데이터:', data);

        const result = await fcmService.registerToken(data);
        console.log('[FCM] registerToken 처리 결과:', result);

        return c.json(result);
      } catch (error: any) {
        console.error('[FCM] registerToken error:', error);
        return c.json(
          {
            success: false,
            message: `토큰 등록에 실패했습니다: ${
              error?.message || '알 수 없는 오류'
            }`,
          },
          500
        );
      }
    },

    // 🔔 특정 학생에게 테스트 푸시 전송
    async sendTestPush(c: Context) {
      try {
        const studentNum = c.req.param('studentNum');
        const body = await c.req.json();
        console.log(`[FCM] sendTestPush 요청 - 학번: ${studentNum}`, body);

        const payload = {
          title: body.title || '🎯 테스트 알림',
          body: body.body || '테스트 알림이 도착했습니다.',
        };

        const ok = await fcmService.sendNotificationToStudent(
          studentNum,
          payload
        );

        if (!ok) {
          console.error('[FCM] 테스트 푸시 실패 - 학번:', studentNum);
          return c.json(
            { success: false, message: '테스트 푸시 전송에 실패했습니다' },
            500
          );
        }

        console.log('[FCM] 테스트 푸시 전송 성공 - 학번:', studentNum);
        return c.json({ success: true, message: '테스트 푸시 전송 성공!' });
      } catch (e: any) {
        console.error('[FCM] sendTestPush error:', e);
        return c.json(
          {
            success: false,
            message: `테스트 푸시 전송 중 오류: ${
              e?.message || JSON.stringify(e)
            }`,
          },
          500
        );
      }
    },

    // 📢 전체 사용자에게 알림 전송
    async sendNotificationToAll(c: Context) {
      try {
        const body = await c.req.json();
        console.log('[FCM] 전체 발송 요청 수신:', body);

        const payload = {
          title: body.title || '📢 공지사항',
          body: body.body || '새로운 알림이 도착했습니다.',
        };

        const result = await fcmService.sendNotificationToAll(payload);
        console.log('[FCM] 전체 알림 전송 결과:', result);

        return c.json({
          success: true,
          message: `전체 알림 전송 완료: 성공 ${result.success}, 실패 ${result.failed}`,
          result,
        });
      } catch (error: any) {
        console.error('[FCM] sendNotificationToAll error:', error);
        return c.json(
          {
            success: false,
            message: `전체 알림 전송 실패: ${error?.message || '알 수 없는 오류'}`,
          },
          500
        );
      }
    },

    // 🧾 로그 조회
    async getNotificationLogs(c: Context) {
      try {
        const db = c.get('db');
        console.log('[FCM] 알림 로그 조회 요청 수신');

        const logs = await db
          .prepare(
            'SELECT * FROM notification_logs ORDER BY sent_at DESC LIMIT 50'
          )
          .all();

        console.log(`[FCM] 로그 ${logs.results?.length ?? 0}건 조회됨`);
        return c.json({ success: true, logs: logs.results });
      } catch (error: any) {
        console.error('[FCM] getNotificationLogs error:', error);
        return c.json(
          {
            success: false,
            message: `로그 조회 실패: ${error?.message || '알 수 없는 오류'}`,
          },
          500
        );
      }
    },

    // 🔍 FCM 환경 변수 디버그
async debugFCMConfig(c: Context) {
  try {
    const env = c.env;

    // 로그 출력 (Cloudflare Tail 로그에서 확인 가능)
    console.log('[FCM] debugFCMConfig 호출됨');
    console.log('[FCM] env 상태:', {
      hasServiceAccountKey: !!env.FIREBASE_SERVICE_ACCOUNT_KEY,
      nodeEnv: env.NODE_ENV,
    });

    // secret이 존재하는지 확인
    if (!env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.error('[FCM] FIREBASE_SERVICE_ACCOUNT_KEY 누락됨');

      return c.json(
        {
          success: false,
          error: 'Internal Server Error',
          message:
            '⚠️ FCM 환경 변수가 누락되었습니다. FIREBASE_SERVICE_ACCOUNT_KEY가 설정되지 않았습니다.',
          timestamp: new Date().toISOString(),
        },
        500
      );
    }

    // JSON 파싱 시도
    let parsedKey: any = null;
    try {
      parsedKey = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (err) {
      console.error('[FCM] FIREBASE_SERVICE_ACCOUNT_KEY 파싱 실패:', err);
      return c.json(
        {
          success: false,
          message:
            '⚠️ FIREBASE_SERVICE_ACCOUNT_KEY가 올바른 JSON 형식이 아닙니다. Cloudflare secret 등록 형식을 확인하세요.',
        },
        500
      );
    }

    // 파싱 결과 로깅
    console.log('[FCM] FIREBASE_SERVICE_ACCOUNT_KEY 파싱 성공:', {
      hasProjectId: !!parsedKey.project_id,
      hasClientEmail: !!parsedKey.client_email,
      hasPrivateKey: !!parsedKey.private_key,
    });

    return c.json({
      success: true,
      message: '✅ FCM 환경변수 정상 감지됨',
      summary: {
        NODE_ENV: env.NODE_ENV,
        FIREBASE_SERVICE_ACCOUNT_KEY: '✅ 등록됨',
        parsed: {
          project_id: parsedKey.project_id || '(없음)',
          client_email: parsedKey.client_email || '(없음)',
          has_private_key: !!parsedKey.private_key,
        },
      },
    });
  } catch (error: any) {
    console.error('[FCM] debugFCMConfig error:', error);
    return c.json(
      {
        success: false,
        message: `디버그 중 오류: ${error?.message || '알 수 없는 오류'}`,
      },
      500
    );
  }
},
} }
