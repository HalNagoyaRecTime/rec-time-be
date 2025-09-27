import { EventEntity, EntryEntity, StudentEntity,Entry_groupEntity } from './domains';

// Student Repository Types
export interface StudentRepositoryFunctions {
  findByStudentNum: (num: string) => Promise<StudentEntity | null>;
}

// Event Repository Types
export interface EventRepositoryFunctions {
  findAll: (options: {
    f_event_code?: string;
    f_time?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ events: EventEntity[]; total: number }>;
  findById: (id: number) => Promise<EventEntity | null>;
  findByEventCode: (eventCode: string) => Promise<EventEntity | null>;
}

// Entry Repository Types
export interface EntryRepositoryFunctions {
  findAll: (options: {
    f_student_id?: number;
    f_event_id?: number;
    limit?: number;
    offset?: number;
  }) => Promise<{ entries: EntryEntity[]; total: number }>;
  findById: (id: number) => Promise<EntryEntity | null>;
}

export interface EntryGroupRepositoryFunctions {
  findByEventId: (f_event_id: number) => Promise<Entry_groupEntity | null>;
  
}