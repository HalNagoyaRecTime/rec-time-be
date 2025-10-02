// src/services/EntryService.ts

import { EntryRepositoryFunctions } from '../types/repositories';
import { EntryDTO, EntryEntity, EntryAlarmRow } from '../types/domains/Entry';
import { EntryServiceFunctions } from '../types/services';

function toEntryDTO(entry: EntryEntity): EntryDTO {
  return {
    f_entry_id: entry.f_entry_id,
    f_student_id: entry.f_student_id,
    f_event_id: entry.f_event_id,
  };
}

export function createEntryService(
  entryRepository: EntryRepositoryFunctions
): EntryServiceFunctions {
  return {
    async getAllEntries(
      options
    ): Promise<{ entries: EntryDTO[]; total: number }> {
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

    async findAlarmEntriesByStudentNum(
      studentNum: string
    ): Promise<EntryAlarmRow[]> {
      return await entryRepository.findAlarmEntriesByStudentNum(studentNum);
    },
  };
}
