import { Context } from 'hono';
import { EventControllerFunctions } from '../types/controllers';
import { EventServiceFunctions } from '../types/services';

export function createEventController(
  eventService: EventServiceFunctions
): EventControllerFunctions {
  const getAllEvents = async (c: Context) => {
    try {
      const result = await eventService.getAllEvents({});
      return c.json(result.events);
    } catch (error) {
      return c.json(
        {
          error: 'Failed to fetch events',
          details: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  };


  return {
    getAllEvents,
  };
}
