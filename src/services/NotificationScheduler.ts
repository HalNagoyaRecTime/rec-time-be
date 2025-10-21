// src/services/NotificationScheduler.ts
// 자동 알림 스케줄러 서비스

import { D1Database } from '@cloudflare/workers-types';
import { FCMServiceFunctions, NotificationPayload } from './FCMService';

export interface EventData {
  f_event_id: string;
  f_event_name: string;
  f_place: string;
  f_start_time: string;
  f_end_time: string;
  f_date: string;
}

export interface NotificationSchedulerFunctions {
  checkUpcomingEvents(): Promise<void>;
  sendEventReminders(): Promise<void>;
  sendEventStartNotifications(): Promise<void>;
  sendCustomNotification(studentNums: string[], payload: NotificationPayload): Promise<void>;
}

export function createNotificationScheduler(
  db: D1Database,
  fcmService: FCMServiceFunctions
): NotificationSchedulerFunctions {
  return {
    // 다가오는 이벤트 확인 및 알림 전송
    async checkUpcomingEvents(): Promise<void> {
      try {
        console.log('[NotificationScheduler] 이벤트 확인 시작');
        
        const today = new Date();
        const currentTime = formatTime(today);
        
        // 오늘의 이벤트 조회
        const events = await getTodayEvents(db);
        console.log(`[NotificationScheduler] 오늘 이벤트 ${events.length}개 발견`);
        
        for (const event of events) {
          await checkAndSendEventNotifications(event, fcmService);
        }
        
        console.log('[NotificationScheduler] 이벤트 확인 완료');
      } catch (error) {
        console.error('[NotificationScheduler] 이벤트 확인 오류:', error);
      }
    },

    // 이벤트 리마인더 알림 전송
    async sendEventReminders(): Promise<void> {
      try {
        console.log('[NotificationScheduler] 리마인더 알림 전송 시작');
        
        const today = new Date();
        const currentTime = formatTime(today);
        
        const events = await getTodayEvents(db);
        
        for (const event of events) {
          const notificationTimes = calculateNotificationTimes(event);
          
          for (const { time, label } of notificationTimes) {
            if (time === currentTime) {
              await sendEventNotification(event, label, fcmService);
            }
          }
        }
        
        console.log('[NotificationScheduler] 리마인더 알림 전송 완료');
      } catch (error) {
        console.error('[NotificationScheduler] 리마인더 알림 전송 오류:', error);
      }
    },

    // 이벤트 시작 알림 전송
    async sendEventStartNotifications(): Promise<void> {
      try {
        console.log('[NotificationScheduler] 시작 알림 전송 시작');
        
        const today = new Date();
        const currentTime = formatTime(today);
        
        const events = await getTodayEvents(db);
        
        for (const event of events) {
          const eventStartTime = parseEventTime(event.f_start_time);
          if (eventStartTime === currentTime) {
            await sendEventStartNotification(event, fcmService);
          }
        }
        
        console.log('[NotificationScheduler] 시작 알림 전송 완료');
      } catch (error) {
        console.error('[NotificationScheduler] 시작 알림 전송 오류:', error);
      }
    },

    // 커스텀 알림 전송
    async sendCustomNotification(studentNums: string[], payload: NotificationPayload): Promise<void> {
      try {
        console.log(`[NotificationScheduler] 커스텀 알림 전송 시작 (대상: ${studentNums.length}명)`);
        
        let successCount = 0;
        let failedCount = 0;
        
        for (const studentNum of studentNums) {
          const success = await fcmService.sendNotificationToStudent(studentNum, payload);
          if (success) {
            successCount++;
          } else {
            failedCount++;
          }
        }
        
        console.log(`[NotificationScheduler] 커스텀 알림 전송 완료 (성공: ${successCount}, 실패: ${failedCount})`);
      } catch (error) {
        console.error('[NotificationScheduler] 커스텀 알림 전송 오류:', error);
      }
    }
  };
}

// 오늘의 이벤트 조회
async function getTodayEvents(db: D1Database): Promise<EventData[]> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    const result = await db
      .prepare(`
        SELECT f_event_id, f_event_name, f_place, f_start_time, f_end_time, f_date
        FROM t_events 
        WHERE f_date = ? 
        ORDER BY f_start_time
      `)
      .bind(today)
      .all();

    return result.results as unknown as EventData[];
  } catch (error) {
    console.error('[NotificationScheduler] 이벤트 조회 오류:', error);
    return [];
  }
}

// 이벤트 알림 확인 및 전송
async function checkAndSendEventNotifications(event: EventData, fcmService: FCMServiceFunctions): Promise<void> {
  try {
    const notificationTimes = calculateNotificationTimes(event);
    const currentTime = formatTime(new Date());
    
    for (const { time, label } of notificationTimes) {
      if (time === currentTime) {
        await sendEventNotification(event, label, fcmService);
      }
    }
  } catch (error) {
    console.error('[NotificationScheduler] 이벤트 알림 확인 오류:', error);
  }
}

// 이벤트 알림 전송
async function sendEventNotification(event: EventData, label: string, fcmService: FCMServiceFunctions): Promise<void> {
  try {
    const title = `【予定】${event.f_event_name}`;
    const body = formatNotificationBody(label, event.f_place);
    
    const payload: NotificationPayload = {
      title,
      body,
      data: {
        type: 'event_reminder',
        eventId: event.f_event_id,
        eventName: event.f_event_name,
        place: event.f_place,
        notificationLabel: label
      }
    };

    // 해당 이벤트 참가 학생들의 토큰으로 알림 전송
    const result = await fcmService.sendNotificationToAll(payload);
    
    console.log(`[NotificationScheduler] 이벤트 알림 전송 완료: ${event.f_event_name} (${label}) - 성공: ${result.success}, 실패: ${result.failed}`);
  } catch (error) {
    console.error('[NotificationScheduler] 이벤트 알림 전송 오류:', error);
  }
}

// 이벤트 시작 알림 전송
async function sendEventStartNotification(event: EventData, fcmService: FCMServiceFunctions): Promise<void> {
  try {
    const title = `【開始】${event.f_event_name}`;
    const body = `イベントが開始されました！場所: ${event.f_place}`;
    
    const payload: NotificationPayload = {
      title,
      body,
      data: {
        type: 'event_start',
        eventId: event.f_event_id,
        eventName: event.f_event_name,
        place: event.f_place
      }
    };

    const result = await fcmService.sendNotificationToAll(payload);
    
    console.log(`[NotificationScheduler] 시작 알림 전송 완료: ${event.f_event_name} - 성공: ${result.success}, 실패: ${result.failed}`);
  } catch (error) {
    console.error('[NotificationScheduler] 시작 알림 전송 오류:', error);
  }
}

// 알림 시간 계산
function calculateNotificationTimes(event: EventData): Array<{ time: string; label: string }> {
  const eventStartTime = parseEventTime(event.f_start_time);
  const times: Array<{ time: string; label: string }> = [];
  
  // 30분 전
  const time30min = subtractMinutes(eventStartTime, 30);
  times.push({ time: time30min, label: '30분 전' });
  
  // 10분 전
  const time10min = subtractMinutes(eventStartTime, 10);
  times.push({ time: time10min, label: '10분 전' });
  
  // 5분 전
  const time5min = subtractMinutes(eventStartTime, 5);
  times.push({ time: time5min, label: '5분 전' });
  
  // 시작 시
  times.push({ time: eventStartTime, label: '시작' });
  
  return times;
}

// 이벤트 시간 파싱
function parseEventTime(timeStr: string): string {
  // HH:MM 형식을 HHMM으로 변환
  return timeStr.replace(':', '');
}

// 분 빼기
function subtractMinutes(timeStr: string, minutes: number): string {
  const hours = parseInt(timeStr.substring(0, 2));
  const mins = parseInt(timeStr.substring(2, 4));
  
  const totalMinutes = hours * 60 + mins - minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, '0')}${newMins.toString().padStart(2, '0')}`;
}

// 현재 시간 포맷팅
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}${minutes}`;
}

// 알림 내용 포맷팅
function formatNotificationBody(label: string, place: string): string {
  return `${label} - 場所: ${place}`;
}
