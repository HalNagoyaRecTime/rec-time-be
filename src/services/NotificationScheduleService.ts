// src/services/NotificationScheduleService.ts

import { D1Database } from '@cloudflare/workers-types';

export interface NotificationSchedule {
  id?: number;
  studentNum: string;
  eventId: number;
  notificationTime: string; // "HHmm" 形式
  notificationLabel: string;
  notified: number;
}

export function createNotificationScheduleService(db: D1Database) {
  return {
    /**
     * スケジュールを一括保存
     */
    async saveSchedules(schedules: NotificationSchedule[]): Promise<void> {
      for (const schedule of schedules) {
        await db
          .prepare(
            `INSERT OR REPLACE INTO notification_schedules 
             (student_num, event_id, notification_time, notification_label, notified, updated_at) 
             VALUES (?, ?, ?, ?, ?, datetime('now'))`
          )
          .bind(
            schedule.studentNum,
            schedule.eventId,
            schedule.notificationTime,
            schedule.notificationLabel,
            schedule.notified || 0
          )
          .run();
      }
    },

    /**
     * 現在時刻の通知対象スケジュールを取得
     */
    async getPendingSchedules(currentTime: string): Promise<NotificationSchedule[]> {
      const result = await db
        .prepare(
          `SELECT * FROM notification_schedules 
           WHERE notification_time = ? AND notified = 0`
        )
        .bind(currentTime)
        .all();

      return (result.results || []).map((row: any) => ({
        id: row.id,
        studentNum: row.student_num,
        eventId: row.event_id,
        notificationTime: row.notification_time,
        notificationLabel: row.notification_label,
        notified: row.notified,
      }));
    },

    /**
     * スケジュールを送信済みにマーク
     */
    async markAsNotified(scheduleId: number): Promise<void> {
      await db
        .prepare(
          `UPDATE notification_schedules 
           SET notified = 1, updated_at = datetime('now') 
           WHERE id = ?`
        )
        .bind(scheduleId)
        .run();
    },

    /**
     * 学生の全スケジュールを削除
     */
    async deleteSchedulesByStudentNum(studentNum: string): Promise<void> {
      await db
        .prepare('DELETE FROM notification_schedules WHERE student_num = ?')
        .bind(studentNum)
        .run();
    },

    /**
     * 古いスケジュールをクリーンアップ（日次実行推奨）
     */
    async cleanupOldSchedules(): Promise<void> {
      // 3日以上前の送信済みスケジュールを削除
      await db
        .prepare(
          `DELETE FROM notification_schedules 
           WHERE notified = 1 
           AND updated_at < datetime('now', '-3 days')`
        )
        .run();
    },
  };
}

export type NotificationScheduleServiceFunctions = ReturnType<
  typeof createNotificationScheduleService
>;
