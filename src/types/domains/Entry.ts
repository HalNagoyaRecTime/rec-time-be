// src/types/domains/Entry.ts

// 엔트리 기본 DB 타입
export interface EntryEntity {
  f_entry_id: number;
  f_student_id: number;
  f_event_id: number;
}

// 서비스 계층에서 컨트롤러로 전달하는 DTO
export interface EntryDTO {
  f_entry_id: number;
  f_student_id: number;
  f_event_id: number;
}

// 알람용 표시용 Row
export interface EntryAlarmRow {
  f_event_id: number;
  f_event_name: string;
  f_start_time: string;
  f_duration: string;
  f_place: string;
  f_gather_time: string;
  f_summary: string;
  f_is_my_entry: true;
}
