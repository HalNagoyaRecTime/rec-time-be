import { D1Database } from '@cloudflare/workers-types';
import { NotificationEntity } from '../types/domains/Notification';

function transformToNotificationEntity(raw: any): NotificationEntity {
  return {
    f_notif_id: raw.f_notif_id as number,
    f_type: raw.f_type as string,
    f_target: raw.f_target as string,
    f_event_id: raw.f_event_id as number | null,
    f_title: raw.f_title as string,
    f_body: raw.f_body as string,
    f_sent_at: raw.f_sent_at as string,
  };
}

export function createNotificationRepository(db: D1Database) {
  return {
    async findAll(): Promise<NotificationEntity[]> {
      const result = await db.prepare('SELECT * FROM t_notifs').all();
      return result.results.map(transformToNotificationEntity);
    },
  };
}
