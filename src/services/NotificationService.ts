import { NotificationRepositoryFunctions } from '../types/repositories';
import { NotificationEntity } from '../types/domains';

export function createNotificationService(
  notificationRepository: NotificationRepositoryFunctions
) {
  return {
    async findAll(): Promise<NotificationEntity[]> {
      return await notificationRepository.findAll();
    },
  };
}
