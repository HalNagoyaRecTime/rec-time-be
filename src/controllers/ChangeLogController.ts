import { Context } from 'hono';
import { ChangeLogServiceFunctions } from '../types/services';

export function createChangeLogController(service: ChangeLogServiceFunctions) {
  return {
    getAll: async (c: Context) => {
      try {
        const data = await service.findAll();
        return c.json(data);
      } catch {
        return c.json({ error: 'Failed to fetch changelogs' }, 500);
      }
    },
  };
}
