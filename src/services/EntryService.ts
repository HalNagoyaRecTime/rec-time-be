// src/services/EntryService.ts

import { EntryRepositoryFunctions } from '../types/repositories';
import { EntryDTO } from '../types/domains/Entry';
import { EntryServiceFunctions } from '../types/services';
import { toEntryDTO } from '../utils/transformers';

export function createEntryService(
  entryRepository: EntryRepositoryFunctions
): EntryServiceFunctions {
  return {
    async getAllEntries(options: {
      f_student_id?: number;
      f_event_id?: number;
      limit?: number;
      offset?: number;
    }): Promise<{ entries: EntryDTO[]; total: number }> {
      const { entries, total } = await entryRepository.findAll(options);
      return {
        entries: entries.map(toEntryDTO),
        total,
      };
    },

    async getEntryById(id: number): Promise<EntryDTO> {
      const entry = await entryRepository.findById(id);
      if (!entry) throw new Error('Entry not found');
      return toEntryDTO(entry);
    },
  };
}
