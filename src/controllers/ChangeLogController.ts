import { Context } from 'hono';
import { ChangeLogServiceFunctions } from '../types/services';

export function createChangeLogController(service: ChangeLogServiceFunctions) {
  return {
    getAll: async (c: Context) => {
      const data = await service.findAll();
      return c.json(data);
    },
  };
}
