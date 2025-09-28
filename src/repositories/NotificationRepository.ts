import { D1Database } from '@cloudflare/workers-types';
import { NotificationEntity } from '../types/domains/Notification';

function transformToNotificationEntity(raw: any): NotificationEntity {
  return {
    f_notification_id: raw.f_notification_id as number,
    f_target_student_id: raw.f_target_student_id as number,
    f_message: raw.f_message as string,
    f_sent_at: raw.f_sent_at as string,
  };
}

export function createNotificationRepository(db: D1Database) {
  return {
    async findAll(): Promise<NotificationEntity[]> {
      const result = await db.prepare('SELECT * FROM t_notifications').all();
      return result.results.map(transformToNotificationEntity);
    },
  };
}
