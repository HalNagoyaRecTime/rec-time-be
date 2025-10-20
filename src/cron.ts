// src/cron.ts
// Cloudflare Workers Cron Trigger 스케줄링 로직

import { getDIContainer } from './di/container';

export interface Env {
  DB: D1Database;
  FCM_PROJECT_ID: string;
  FCM_PRIVATE_KEY: string;
  FCM_CLIENT_EMAIL: string;
}

// Cron Trigger 핸들러 (5분마다 실행)
export async function scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
  console.log(`[Cron] スケジューリング実行開始: ${new Date().toISOString()}`);
  
  try {
    const container = getDIContainer(env);
    const notificationService = container.notificationController;
    const eventService = container.eventController;
    
    // 1. 오늘의 이벤트 조회
    const todayEvents = await getTodayEvents(eventService);
    console.log(`[Cron] 今日のイベント ${todayEvents.length}件発見`);
    
    // 2. 각 이벤트에 대해 알림 시간 체크
    for (const event of todayEvents) {
      await checkAndSendEventNotifications(event, notificationService);
    }
    
    console.log(`[Cron] スケジューリング実行完了: ${new Date().toISOString()}`);
  } catch (error) {
    console.error('[Cron] スケジューリング実行エラー:', error);
  }
}

// 오늘의 이벤트 조회
async function getTodayEvents(eventService: any): Promise<any[]> {
  try {
    // 모든 이벤트 조회 (시간 기반으로 필터링)
    const events = await eventService.getAllEvents({});
    
    return events.events || [];
  } catch (error) {
    console.error('[Cron] 今日のイベント取得エラー:', error);
    return [];
  }
}

// 이벤트 알림 시간 체크 및 전송
async function checkAndSendEventNotifications(event: any, notificationService: any): Promise<void> {
  try {
    const now = new Date();
    const eventTime = parseEventTime(event.f_time);
    
    if (!eventTime) {
      console.log(`[Cron] イベント時間パース失敗: ${event.f_event_name}`);
      return;
    }
    
    // 알림 시간 계산
    const notificationTimes = calculateNotificationTimes(eventTime);
    
    for (const { time, label } of notificationTimes) {
      if (isTimeMatch(now, time)) {
        console.log(`[Cron] 通知送信タイミング: ${event.f_event_name} (${label})`);
        // NotificationService의 sendEventNotification 메서드 호출
        // 실제로는 서비스 레벨에서 호출해야 하므로 임시로 로그만 출력
        console.log(`[Cron] イベント通知送信予定: ${event.f_event_name} (${label})`);
        // TODO: 실제 FCM 전송 로직 구현 필요
      }
    }
  } catch (error) {
    console.error(`[Cron] イベント通知チェックエラー (${event.f_event_name}):`, error);
  }
}

// 이벤트 시간 파싱 (HH:MM 형식)
function parseEventTime(timeStr: string): Date | null {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    return today;
  } catch (error) {
    console.error('[Cron] 時間パースエラー:', error);
    return null;
  }
}

// 알림 시간 계산 (30분전, 10분전, 5분전, 시작)
function calculateNotificationTimes(eventTime: Date): Array<{ time: Date; label: string }> {
  const notifications = [];
  
  // 30分前
  const time30min = new Date(eventTime.getTime() - 30 * 60 * 1000);
  notifications.push({ time: time30min, label: '30분전' });
  
  // 10分前
  const time10min = new Date(eventTime.getTime() - 10 * 60 * 1000);
  notifications.push({ time: time10min, label: '10분전' });
  
  // 5分前
  const time5min = new Date(eventTime.getTime() - 5 * 60 * 1000);
  notifications.push({ time: time5min, label: '5분전' });
  
  // 開始
  notifications.push({ time: eventTime, label: '시작' });
  
  return notifications;
}

// 현재 시간이 알림 시간과 일치하는지 체크 (5분 단위)
function isTimeMatch(now: Date, targetTime: Date): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = targetTime.getHours() * 60 + targetTime.getMinutes();
  
  // 5分単位で正確に一致するかチェック
  const diff = Math.abs(nowMinutes - targetMinutes);
  return diff <= 2; // 2分誤差許容
}
