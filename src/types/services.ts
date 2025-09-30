// src/types/services.ts
import {
  EventEntity,
  EntryEntity,
  EntryDTO,
  StudentEntity,
  EntryGroupEntity,
  NotificationEntity,
  ChangeLogEntity,
} from './domains';

// -------------------------
// StudentService
// -------------------------
export interface StudentServiceFunctions {
  getStudentById: (id: number) => Promise<StudentEntity>;

  getStudentByStudentNum: (studentNum: string) => Promise<StudentEntity>;

  getStudentPayloadByStudentNum: (studentNum: string) => Promise<{
    m_students: StudentEntity;
    t_events: (EventEntity & { f_is_my_entry: boolean })[];
  }>;

  getStudentFullPayload: (studentNum: string) => Promise<{
    m_students: StudentEntity;
    t_entries: EntryEntity[]; // DB에서 그대로 가져오는 타입
    t_events: EventEntity[];
    t_entry_groups: EntryGroupEntity[];
    t_notifications: NotificationEntity[];
    t_change_logs: ChangeLogEntity[];
  }>;
}

// -------------------------
// EventService
// -------------------------
export interface EventServiceFunctions {
  getAllEvents: (options: {
    f_event_code?: string;
    f_time?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ events: EventEntity[]; total: number }>;

  getEventById: (id: number) => Promise<EventEntity>;
}

// -------------------------
// EntryService
// -------------------------
export interface EntryServiceFunctions {
  getAllEntries: (options: {
    f_student_id?: number;
    f_event_id?: number;
    limit?: number;
    offset?: number;
  }) => Promise<{ entries: EntryDTO[]; total: number }>; // ✅ EntryDTO로 반환하도록 수정

  getEntryById: (id: number) => Promise<EntryDTO>; // ✅ EntryDTO로 반환하도록 수정
}

// -------------------------
// EntryGroupService
// -------------------------
export interface EntryGroupServiceFunctions {
  findAll: () => Promise<EntryGroupEntity[]>;
}

// -------------------------
// NotificationService
// -------------------------
export interface NotificationServiceFunctions {
  findAll: () => Promise<NotificationEntity[]>;
}

// -------------------------
// ChangeLogService
// -------------------------
export interface ChangeLogServiceFunctions {
  findAll: () => Promise<ChangeLogEntity[]>;
}
