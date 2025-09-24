export function createEntryService(entryRepository) {
    return {
        async getAllEntries(options) {
            return await entryRepository.findAll(options);
        },
        async getEntryById(id) {
            const entry = await entryRepository.findById(id);
            if (!entry) {
                throw new Error('Entry not found');
            }
            return entry;
        },
    };
}
