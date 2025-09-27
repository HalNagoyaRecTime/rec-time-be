import { EventEntity, EntryEntity, StudentEntity } from './domains';

// Student Repository Types
export interface StudentRepositoryFunctions {
  findById: (id: number) => Promise<StudentEntity | null>;
  findByStudentNum: (studentNum: string) => Promise<StudentEntity | null>;
}

// Event Repository Types
export interface EventRepositoryFunctions {
  findAll: (options: {
    f_event_code?: string;
    f_time?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ events: EventEntity[]; total: number }>;

  findByIdWithEntryCount: (id: number) => Promise<EventEntity | null>;
  findById: (id: number) => Promise<EventEntity | null>;
  findByEventCode: (eventCode: string) => Promise<EventEntity | null>;
}

// ✅ Entry Repository Types
export interface EntryRepositoryFunctions {
  findAll: (options: {
    f_student_id?: number;
    f_event_id?: number;
    limit?: number;
    offset?: number;
  }) => Promise<{ entries: EntryEntity[]; total: number }>;

  findById: (id: number) => Promise<EntryEntity | null>;

  // ✅ optional 제거 (에러 원인 제거)
  findByStudentId: (studentId: number) => Promise<EntryEntity[]>;
  findByEventId: (eventId: number) => Promise<EntryEntity[]>;
  findByStudentAndEvent: (
    studentId: number,
    eventId: number
  ) => Promise<EntryEntity | null>;
  create: (studentId: number, eventId: number) => Promise<EntryEntity>;
  delete: (id: number) => Promise<boolean>;
}
