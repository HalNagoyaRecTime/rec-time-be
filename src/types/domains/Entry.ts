// src/types/domains/Entry.ts

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

// Repository가 제공해야 하는 함수 시그니처
export interface EntryRepositoryFunctions {
  findAll(): Promise<EntryEntity[]>; // 모든 엔트리
  findById(id: number): Promise<EntryEntity | null>; // 특정 엔트리
  create(entry: EntryDTO): Promise<void>; // 엔트리 추가
  // 필요하면 업데이트·삭제 메서드도 추가
}

// Service가 제공해야 하는 함수 시그니처
export interface EntryServiceFunctions {
  getAllEntries(): Promise<EntryDTO[]>;
  getEntryById(id: number): Promise<EntryDTO | null>;
}
