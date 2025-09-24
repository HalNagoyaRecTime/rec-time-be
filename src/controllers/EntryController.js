export function createEntryController(entryService) {
    const getAllEntries = async (c) => {
        try {
            const entries = await entryService.getAllEntries({});
            return c.json(entries);
        }
        catch (error) {
            return c.json({ error: 'Failed to fetch entries' }, 500);
        }
    };
    const getEntryById = async (c) => {
        try {
            const id = parseInt(c.req.param('entryId'));
            const entry = await entryService.getEntryById(id);
            return c.json(entry);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Entry not found') {
                return c.json({ error: 'Entry not found' }, 404);
            }
            return c.json({ error: 'Failed to fetch entry' }, 500);
        }
    };
    return {
        getAllEntries,
        getEntryById,
    };
}
