import { EventEntity, EntryEntity, StudentEntity } from './domains';

// Student Service Types
export interface StudentServiceFunctions {
  getStudentById: (id: number) => Promise<StudentEntity>;

  // ✅ 학번으로 학생 조회
  getStudentByStudentNum: (studentNum: string) => Promise<StudentEntity>;

  // ✅ 학생 + 전체 이벤트 + 참가 여부 포함된 페이로드 반환
  getStudentPayloadByStudentNum: (studentNum: string) => Promise<{
    m_students: StudentEntity;
    t_events: (EventEntity & { f_is_my_entry: boolean })[];
  }>;
}

// Event Service Types
export interface EventServiceFunctions {
  getAllEvents: (options: {
    f_event_code?: string;
    f_time?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ events: EventEntity[]; total: number }>;
  getEventById: (id: number) => Promise<EventEntity>;
}

// Entry Service Types
export interface EntryServiceFunctions {
  getAllEntries: (options: {
    f_student_id?: number;
    f_event_id?: number;
    limit?: number;
    offset?: number;
  }) => Promise<{ entries: EntryEntity[]; total: number }>;
  getEntryById: (id: number) => Promise<EntryEntity>;
}

