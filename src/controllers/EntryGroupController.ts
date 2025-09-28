import { Context } from 'hono';
import { EntryGroupServiceFunctions } from '../types/services';

export function createEntryGroupController(
  service: EntryGroupServiceFunctions
) {
  return {
    getAll: async (c: Context) => {
      const data = await service.findAll();
      return c.json(data);
    },
  };
}
