// src/utils/transformers.ts
import { EntryAlarmRow } from '../types/domains/Entry';

export function toEntryAlarmRow(row: any): EntryAlarmRow {
  // ✅ 이 함수는 EntryRepository에서 사용 중
  return {
    f_event_id: row.f_event_id,
    f_event_name: row.f_event_name,
    f_start_time: row.f_start_time,
    f_duration: row.f_duration,
    f_place: row.f_place,
    f_gather_time: row.f_gather_time,
    f_summary: row.f_summary,
    f_is_my_entry: true,
  };
}
