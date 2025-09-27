import { Context } from 'hono';
import { EntryControllerFunctions } from '../types/controllers';
import { EntryServiceFunctions } from '../types/services';

export function createEntryController(
  entryService: EntryServiceFunctions
): EntryControllerFunctions {

  const getEntryById = async (c: Context) => {
    try {
      const id = parseInt(c.req.param('f_entry_id'));
      const entry = await entryService.getEntryById(id);
      return c.json(entry);
    } catch (error) {
      if (error instanceof Error && error.message === 'Entry not found') {
        return c.json({ error: 'Entry not found' }, 404);
      }
      return c.json({ error: 'Failed to fetch entry' }, 500);
    }
  };

  return {
    getEntryById,
  };
}