import { Context } from 'hono';
import { NotificationServiceFunctions } from '../types/services';

export function createNotificationController(
  service: NotificationServiceFunctions
) {
  return {
    getAll: async (c: Context): Promise<Response> => {
      try {
        const data = await service.findAll();
        return c.json(data);
      } catch (error) {
        return c.json({ error: 'Failed to fetch notifications' }, 500);
      }
    },
  };
}
