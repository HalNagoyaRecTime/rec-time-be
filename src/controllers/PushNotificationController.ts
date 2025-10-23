// src/controllers/PushNotificationController.ts

import { Context } from 'hono';
import { PushSubscriptionServiceFunctions } from '../services/PushSubscriptionService';
import { NotificationScheduleServiceFunctions } from '../services/NotificationScheduleService';
import { FCMPushServiceFunctions } from '../services/FCMPushService';

export function createPushNotificationController(
  pushSubscriptionService: PushSubscriptionServiceFunctions,
  scheduleService: NotificationScheduleServiceFunctions,
  fcmService: FCMPushServiceFunctions
) {
  return {
    /**
     * プッシュ購読情報を登録
     * POST /api/push/subscribe
     */
    subscribe: async (c: Context) => {
      try {
        const body = await c.req.json();
        const { studentNum, subscription, userAgent, platform } = body;

        if (!studentNum || !subscription) {
          return c.json({ error: 'studentNum and subscription are required' }, 400);
        }

        await pushSubscriptionService.saveSubscription({
          studentNum,
          subscription,
          userAgent,
          platform,
        });

        return c.json({ success: true, message: 'Subscription saved' });
      } catch (error) {
        console.error('[Push Subscribe] エラー:', error);
        return c.json({ error: 'Failed to save subscription' }, 500);
      }
    },

    /**
     * プッシュ購読情報を削除
     * POST /api/push/unsubscribe
     */
    unsubscribe: async (c: Context) => {
      try {
        const body = await c.req.json();
        const { endpoint } = body;

        if (!endpoint) {
          return c.json({ error: 'endpoint is required' }, 400);
        }

        await pushSubscriptionService.deleteSubscription(endpoint);

        return c.json({ success: true, message: 'Subscription deleted' });
      } catch (error) {
        console.error('[Push Unsubscribe] エラー:', error);
        return c.json({ error: 'Failed to delete subscription' }, 500);
      }
    },

    /**
     * 通知スケジュールを登録
     * POST /api/push/schedule
     */
    saveSchedule: async (c: Context) => {
      try {
        const body = await c.req.json();
        const { studentNum, schedules } = body;

        if (!studentNum || !schedules || !Array.isArray(schedules)) {
          return c.json({ error: 'studentNum and schedules array are required' }, 400);
        }

        // 既存のスケジュールを削除
        await scheduleService.deleteSchedulesByStudentNum(studentNum);

        // 新しいスケジュールを保存
        await scheduleService.saveSchedules(schedules);

        return c.json({
          success: true,
          message: `${schedules.length} schedules saved`,
        });
      } catch (error) {
        console.error('[Push Schedule] エラー:', error);
        return c.json({ error: 'Failed to save schedules' }, 500);
      }
    },

    /**
     * テスト通知送信
     * POST /api/push/test
     */
    sendTest: async (c: Context) => {
      try {
        const body = await c.req.json();
        const { studentNum, title, message } = body;

        if (!studentNum) {
          return c.json({ error: 'studentNum is required' }, 400);
        }

        // 学生の購読情報を取得
        const subscriptions = await pushSubscriptionService.getSubscriptionsByStudentNum(
          studentNum
        );

        if (subscriptions.length === 0) {
          return c.json({ error: 'No subscriptions found for this student' }, 404);
        }

        // 全ての購読先に通知送信
        const results = await Promise.all(
          subscriptions.map(sub =>
            fcmService.sendPush(sub, {
              title: title || 'テスト通知',
              body: message || 'これはテスト通知です',
              icon: '/icons/pwa-192.png',
              tag: 'test-notification',
            })
          )
        );

        const successCount = results.filter(r => r).length;

        return c.json({
          success: true,
          message: `Sent to ${successCount}/${subscriptions.length} devices`,
        });
      } catch (error) {
        console.error('[Push Test] エラー:', error);
        return c.json({ error: 'Failed to send test notification' }, 500);
      }
    },
  };
}
