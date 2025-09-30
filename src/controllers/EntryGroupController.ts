import { Context } from 'hono';
import { EntryGroupServiceFunctions } from '../types/services';

export function createEntryGroupController(
  service: EntryGroupServiceFunctions
) {
  return {
    getAll: async (c: Context): Promise<Response> => {
      try {
        const data = await service.findAll();
        return c.json(data);
      } catch (error) {
        return c.json({ error: 'Failed to fetch entry groups' }, 500);
      }
    },
  };
}
