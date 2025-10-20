// src/services/NotificationService.ts
// 기존 알림 서비스에 FCM 푸시 기능 통합

import { NotificationRepositoryFunctions } from '../types/repositories';
import { NotificationEntity } from '../types/domains/Notification';
import { FCMServiceFunctions, FCMMessage } from './FCMService';

export interface NotificationServiceFunctions {
  findAll(): Promise<NotificationEntity[]>;
  createAndSendPush(data: {
    student_id?: number;
    type: string;
    title: string;
    message: string;
    event_id?: number;
  }): Promise<{ notification: any; pushResult: { success: number; failed: number } }>;
  sendEventNotification(event: any, label: string): Promise<{ success: number; failed: number }>;
}

export function createNotificationService(
  notificationRepository: NotificationRepositoryFunctions,
  fcmService: FCMServiceFunctions
): NotificationServiceFunctions {
  return {
    async findAll(): Promise<NotificationEntity[]> {
      const result = await notificationRepository.findAll({});
      return result.notifications;
    },

    // 알림 생성 및 FCM 푸시 전송
    async createAndSendPush(data: {
      student_id?: number;
      type: string;
      title: string;
      message: string;
      event_id?: number;
    }): Promise<{ notification: any; pushResult: { success: number; failed: number } }> {
      try {
        // 1. 알림 이력 DB에 저장
        const notification = await notificationRepository.create({
          student_id: data.student_id || 0,
          type: data.type,
          title: data.title,
          message: data.message,
        });

        // 2. FCM 푸시 전송
        const fcmMessage: FCMMessage = {
          title: data.title,
          body: data.message,
          data: {
            type: data.type,
            event_id: data.event_id?.toString() || '',
            notification_id: notification.id?.toString() || '',
          },
        };

        const pushResult = await fcmService.sendNotificationToAll(fcmMessage);

        console.log(`[Notification] 通知作成及びプッシュ送信完了: ${data.title}`);
        return { notification, pushResult };
      } catch (error) {
        console.error('[Notification] 通知作成及びプッシュ送信エラー:', error);
        throw error;
      }
    },

    // 이벤트 알림 전송 (스케줄링용)
    async sendEventNotification(event: any, label: string): Promise<{ success: number; failed: number }> {
      try {
        const title = `【予定】${event.f_event_name}`;
        const body = formatNotificationBody(label, event.f_place);
        
        const fcmMessage: FCMMessage = {
          title,
          body,
          data: {
            type: 'event_reminder',
            event_id: event.f_event_id.toString(),
            event_name: event.f_event_name,
            place: event.f_place,
            notification_label: label,
          },
        };

        // 알림 이력 저장
        await notificationRepository.create({
          student_id: 0, // 전체 알림
          type: 'event_reminder',
          title,
          message: body,
        });

        // FCM 푸시 전송
        const result = await fcmService.sendNotificationToAll(fcmMessage);
        
        console.log(`[Notification] イベント通知送信: ${event.f_event_name} (${label})`);
        return result;
      } catch (error) {
        console.error('[Notification] イベント通知送信エラー:', error);
        return { success: 0, failed: 0 };
      }
    },
  };
}

// 알림 내용 포맷팅 함수
function formatNotificationBody(label: string, place: string): string {
  switch (label) {
    case '30분전':
      return `30分後に開始されます。場所: ${place}`;
    case '10분전':
      return `10分後に開始されます。場所: ${place}`;
    case '5분전':
      return `5分後に開始されます。場所: ${place}`;
    case '시작':
      return `今から開始します！場所: ${place}`;
    default:
      return `通知: ${place}`;
  }
}
