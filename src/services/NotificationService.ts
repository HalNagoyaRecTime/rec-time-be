// src/services/NotificationService.ts

import { NotificationRepositoryFunctions } from '../types/repositories';
import { NotificationEntity } from '../types/domains/Notification'; // ← 정확한 경로로 수정

export function createNotificationService(
  notificationRepository: NotificationRepositoryFunctions
) {
  return {
    async findAll(): Promise<NotificationEntity[]> {
      const result = await notificationRepository.findAll({});
      return result.notifications;
    },
  };
}
