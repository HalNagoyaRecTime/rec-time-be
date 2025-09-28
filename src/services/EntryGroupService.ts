import { EntryGroupRepositoryFunctions } from '../types/repositories';
import { EntryGroupEntity } from '../types/domains';

export function createEntryGroupService(
  entryGroupRepository: EntryGroupRepositoryFunctions
) {
  return {
    async findAll(): Promise<EntryGroupEntity[]> {
      return await entryGroupRepository.findAll();
    },
  };
}
