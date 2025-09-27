import { EventEntity, Entry_groupEntity, EntryEntity,StudentEntity } from './domains';

// Student Service Types
export interface StudentServiceFunctions {
  getStudentByNum: (num: string) => Promise<StudentEntity>;
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
  getEntryById: (id: number) => Promise<EntryEntity>;
}

export interface EntryGroupServiceFunctions {
  getGroupsByEventId: (id: number) => Promise<Entry_groupEntity>;
}