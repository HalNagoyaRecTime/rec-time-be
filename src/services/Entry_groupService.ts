import {
  Entry_groupEntity,
  EntryGroupRepositoryFunctions,
  EntryGroupServiceFunctions,
} from '../types';

export function createEntryGroupService(
  entryGroupRepository: EntryGroupRepositoryFunctions
): EntryGroupServiceFunctions {
  return {
    async getGroupsByEventId(id: number): Promise<Entry_groupEntity> {
      const groups = await entryGroupRepository.findByEventId(id);
      if (!groups) {
        throw new Error('Groups not found');
      }
      return groups;
    },
  };
}