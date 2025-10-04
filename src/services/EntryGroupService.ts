// src/services/EntryGroupService.ts

import { EntryGroupRepositoryFunctions } from '../types/repositories';
import { EntryGroupEntity } from '../types/domains/EntryGroup';

export function createEntryGroupService(
  entryGroupRepository: EntryGroupRepositoryFunctions
) {
  return {
    async findAll(): Promise<EntryGroupEntity[]> {
      const result = await entryGroupRepository.findAll({});
      return result.entryGroups;
    },
  };
}
