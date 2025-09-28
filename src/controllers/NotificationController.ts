import { Context } from 'hono';
import { NotificationServiceFunctions } from '../types/services';

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
