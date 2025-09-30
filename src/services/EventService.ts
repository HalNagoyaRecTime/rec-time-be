// src/services/EventService.ts
import { EventEntity } from '../types/domains/Event';
import { EventServiceFunctions } from '../types/services';
import { EventRepositoryFunctions } from '../types/repositories';

interface GetAllEventsOptions {
  f_event_code?: string;
}

export function createEventService(
  eventRepository: EventRepositoryFunctions
): EventServiceFunctions {
  //타입을 import 해서 getAllEvents에 적용
  return {
    async getAllEvents(
      options
    ): Promise<{ events: EventEntity[]; total: number }> {
      return await eventRepository.findAll(options);
    },

    async getEventById(id: number): Promise<EventEntity> {
      const event = await eventRepository.findById(id);
      if (!event) throw new Error('Event not found');
      return event;
    },
  };
}
