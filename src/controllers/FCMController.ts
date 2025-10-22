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
        const result = await fcmService.registerToken(data);
        return c.json(result);
      } catch (error: any) {
        console.error('[FCM] registerToken error:', error);
        return c.json(
          { success: false, message: '토큰 등록에 실패했습니다.' },
          500
        );
      }
    },

    // 🔔 특정 학생에게 테스트 푸시 전송
    async sendTestPush(c: Context) {
      try {
        const studentNum = c.req.param('studentNum');
        const body = await c.req.json();
        const payload = {
          title: body.title || '🎯 테스트 알림',
          body: body.body || '테스트 알림이 도착했습니다.',
        };

        const ok = await fcmService.sendNotificationToStudent(
          studentNum,
          payload
        );
        if (!ok)
          return c.json(
            { success: false, message: '테스트 푸시 전송에 실패했습니다' },
            500
          );

        return c.json({ success: true, message: '테스트 푸시 전송 성공!' });
      } catch (e: any) {
        console.error('[FCM] sendTestPush error:', e);
        return c.json(
          {
            success: false,
            message: `테스트 푸시 전송 중 오류: ${e.message ?? 'unknown'}`,
          },
          500
        );
      }
    },

    // 📢 전체 사용자에게 알림 전송
    async sendNotificationToAll(c: Context) {
      try {
        const body = await c.req.json();
        const payload = {
          title: body.title || '📢 공지사항',
          body: body.body || '새로운 알림이 도착했습니다.',
        };

        const result = await fcmService.sendNotificationToAll(payload);
        return c.json({
          success: true,
          message: `전체 알림 전송 완료: 성공 ${result.success}, 실패 ${result.failed}`,
          result,
        });
      } catch (error: any) {
        console.error('[FCM] sendNotificationToAll error:', error);
        return c.json({ success: false, message: '전체 알림 전송 실패' }, 500);
      }
    },

    // 🧾 로그 조회
    async getNotificationLogs(c: Context) {
      try {
        const db = c.get('db');
        const logs = await db
          .prepare(
            'SELECT * FROM notification_logs ORDER BY sent_at DESC LIMIT 50'
          )
          .all();
        return c.json({ success: true, logs: logs.results });
      } catch (error: any) {
        console.error('[FCM] getNotificationLogs error:', error);
        return c.json({ success: false, message: '로그 조회 실패' }, 500);
      }
    },
  };
}
