import { Context } from 'hono';
import { EntryGroupControllerFunctions } from '../types/controllers';
import { EntryGroupServiceFunctions } from '../types/services';

export function createEntryGroupController(
  entryGroupService: EntryGroupServiceFunctions
): EntryGroupControllerFunctions {

  const getGroupsByEventId = async (c: Context) => {
    try {
      const id = parseInt(c.req.param('f_event_id'));
      const groups = await entryGroupService.getGroupsByEventId(id);
      return c.json(groups);
    } catch (error) {
      if (error instanceof Error && error.message === 'Groups not found') {
        return c.json({ error: 'Groups not found' }, 404);
      }
      return c.json({ error: 'Failed to fetch groups' }, 500);
    }
  };

  return {
    getGroupsByEventId,
  };
}