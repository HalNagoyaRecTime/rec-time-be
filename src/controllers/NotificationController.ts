import { Context } from 'hono';
import { NotificationServiceFunctions } from '../types/services'; // ✅ 여기로 수정

export function createNotificationController(
  service: NotificationServiceFunctions
) {
  return {
    getAll: async (c: Context) => {
      const data = await service.findAll();
      return c.json(data);
    },
  };
}
