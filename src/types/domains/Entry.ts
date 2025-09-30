// DB에서 가져온 엔티티 그대로
export interface EntryEntity {
  f_entry_id: number;
  f_student_id: number;
  f_event_id: number;
}

// DTO: API로 반환할 때 문자열 처리
export interface EntryDTO {
  f_entry_id: string;
  f_student_id: string;
  f_event_id: string;
}
