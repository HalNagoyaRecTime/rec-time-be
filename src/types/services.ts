import {
  EventEntity,
  EntryEntity,
  StudentEntity,
  EntryGroupEntity,
  NotificationEntity,
  ChangeLogEntity,
} from './domains';

export interface StudentServiceFunctions {
  getStudentById: (id: number) => Promise<StudentEntity>;

  getStudentByStudentNum: (studentNum: string) => Promise<StudentEntity>;

  getStudentPayloadByStudentNum: (studentNum: string) => Promise<{
    m_students: StudentEntity;
    t_events: (EventEntity & { f_is_my_entry: boolean })[];
  }>;

  getStudentFullPayload: (studentNum: string) => Promise<{
    m_students: StudentEntity;
    t_entries: EntryEntity[];
    t_events: EventEntity[];
    t_entry_groups: EntryGroupEntity[];
    t_notifications: NotificationEntity[];
    t_change_logs: ChangeLogEntity[];
  }>;
}

export interface EventServiceFunctions {
  getAllEvents: (options: {
    f_event_code?: string;
    f_time?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ events: EventEntity[]; total: number }>;

  getEventById: (id: number) => Promise<EventEntity>;
}

export interface EntryServiceFunctions {
  getAllEntries: (options: {
    f_student_id?: number;
    f_event_id?: number;
    limit?: number;
    offset?: number;
  }) => Promise<{ entries: EntryEntity[]; total: number }>;

  getEntryById: (id: number) => Promise<EntryEntity>;
}

export interface EntryGroupServiceFunctions {
  findAll: () => Promise<EntryGroupEntity[]>;
}

export interface NotificationServiceFunctions {
  findAll: () => Promise<NotificationEntity[]>;
}

export interface ChangeLogServiceFunctions {
  findAll: () => Promise<ChangeLogEntity[]>;
}
