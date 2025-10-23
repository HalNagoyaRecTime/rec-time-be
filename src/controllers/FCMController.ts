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
        console.log('[FCM] debugFCMConfig 호출됨 - env:', {
          hasProjectId: !!env.FCM_PROJECT_ID,
          hasClientEmail: !!env.FCM_CLIENT_EMAIL,
          hasPrivateKey: !!env.FCM_PRIVATE_KEY,
          nodeEnv: env.NODE_ENV,
        });

        if (!env.FCM_PROJECT_ID || !env.FCM_CLIENT_EMAIL || !env.FCM_PRIVATE_KEY) {
          console.error('[FCM] 환경 변수 누락 감지:', {
            FCM_PROJECT_ID: !!env.FCM_PROJECT_ID,
            FCM_CLIENT_EMAIL: !!env.FCM_CLIENT_EMAIL,
            FCM_PRIVATE_KEY: !!env.FCM_PRIVATE_KEY,
          });

          return c.json(
            {
              success: false,
              error: 'Internal Server Error',
              message:
                '⚠️ FCM 환경 변수가 누락되었습니다. FCM_PROJECT_ID, FCM_PRIVATE_KEY, FCM_CLIENT_EMAIL을 모두 설정해주세요.',
              timestamp: new Date().toISOString(),
            },
            500
          );
        }

        return c.json({
          success: true,
          message: '✅ FCM 환경변수 정상 감지됨',
          config: {
            FCM_PROJECT_ID: env.FCM_PROJECT_ID ? '설정됨' : '누락',
            FCM_CLIENT_EMAIL: env.FCM_CLIENT_EMAIL ? '설정됨' : '누락',
            FCM_PRIVATE_KEY: env.FCM_PRIVATE_KEY ? '설정됨' : '누락',
            FIREBASE_SERVICE_ACCOUNT_KEY: env.FIREBASE_SERVICE_ACCOUNT_KEY ? '설정됨' : '누락',
            NODE_ENV: env.NODE_ENV,
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
  };
}
