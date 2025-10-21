// src/cron.ts
// Cloudflare Cron Trigger 핸들러

import { D1Database } from '@cloudflare/workers-types';

type Env = {
  DB: D1Database;
  FCM_PROJECT_ID: string;
  FCM_PRIVATE_KEY: string;
  FCM_CLIENT_EMAIL: string;
};
import { createNotificationScheduler } from './services/NotificationScheduler';
import { createFCMService } from './services/FCMService';

export async function scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
  console.log('[Cron] 스케줄링 실행 시작:', new Date().toISOString());
  
  try {
    // FCM 서비스 초기화
    const fcmService = createFCMService(env.DB, {
      FCM_PROJECT_ID: env.FCM_PROJECT_ID,
      FCM_PRIVATE_KEY: env.FCM_PRIVATE_KEY,
      FCM_CLIENT_EMAIL: env.FCM_CLIENT_EMAIL
    });

    // 알림 스케줄러 초기화
    const notificationScheduler = createNotificationScheduler(env.DB, fcmService);

    // 다가오는 이벤트 확인 및 알림 전송
    await notificationScheduler.checkUpcomingEvents();

    console.log('[Cron] 스케줄링 실행 완료');
  } catch (error) {
    console.error('[Cron] 스케줄링 실행 오류:', error);
  }
}