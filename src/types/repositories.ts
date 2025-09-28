import {
  EventEntity,
  EntryEntity,
  StudentEntity,
  EntryGroupEntity,
  NotificationEntity,
  ChangeLogEntity,
} from './domains';

// --- Student Repository ---
export interface StudentRepositoryFunctions {
  findById: (id: number) => Promise<StudentEntity | null>;
  findByStudentNum: (studentNum: string) => Promise<StudentEntity | null>;
}

// --- Event Repository ---
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

// --- Entry Repository ---
export interface EntryRepositoryFunctions {
  findAll: (options: {
    f_student_id?: number;
    f_event_id?: number;
    limit?: number;
    offset?: number;
  }) => Promise<{ entries: EntryEntity[]; total: number }>;

  findById: (id: number) => Promise<EntryEntity | null>;
  findByStudentId: (studentId: number) => Promise<EntryEntity[]>;
  findByEventId: (eventId: number) => Promise<EntryEntity[]>;
  findByStudentAndEvent: (
    studentId: number,
    eventId: number
  ) => Promise<EntryEntity | null>;
  create: (studentId: number, eventId: number) => Promise<EntryEntity>;
  delete: (id: number) => Promise<boolean>;
}

// --- Entry Group Repository ---
export interface EntryGroupRepositoryFunctions {
  findAll: () => Promise<EntryGroupEntity[]>;
}

// --- Notification Repository ---
export interface NotificationRepositoryFunctions {
  findAll: () => Promise<NotificationEntity[]>;
}

// --- Change Log Repository ---
export interface ChangeLogRepositoryFunctions {
  findAll: () => Promise<ChangeLogEntity[]>;
}
