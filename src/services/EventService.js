export function createEventService(eventRepository) {
    return {
        async getAllEvents(options) {
            return await eventRepository.findAll(options);
        },
        async getEventById(id) {
            const event = await eventRepository.findById(id);
            if (!event) {
                throw new Error('Event not found');
            }
            return event;
        },
    };
}
