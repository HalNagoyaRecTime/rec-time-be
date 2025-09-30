// src/utils/transformers.ts
import { EntryEntity, EntryDTO } from '../types/domains/Entry';

export function toEntryDTO(entry: EntryEntity): EntryDTO {
  return {
    f_entry_id: entry.f_entry_id.toString(),
    f_student_id: entry.f_student_id.toString(),
    f_event_id: entry.f_event_id.toString(),
  };
}
