// src/types/repositories.ts
import { EntryEntity, EntryAlarmRow } from './domains';

export interface EntryRepositoryFunctions {
  findAll(options: {
    f_student_id?: number;
    f_event_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ entries: EntryEntity[]; total: number }>;

  findById(id: number): Promise<EntryEntity | null>;
  findByStudentId(studentId: number): Promise<EntryEntity[]>;
  findByEventId(eventId: number): Promise<EntryEntity[]>;
  findByStudentAndEvent(
    studentId: number,
    eventId: number
  ): Promise<EntryEntity | null>;
  create(studentId: number, eventId: number): Promise<EntryEntity>;
  delete(id: number): Promise<boolean>;

  // ✅ 알람용 추가
  findAlarmEntriesByStudentNum(studentNum: string): Promise<EntryAlarmRow[]>;
}

export interface StudentRepositoryFunctions {
  findAll(options: {
    f_student_num?: string;
    f_name?: string;
    f_entry_group_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ students: any[]; total: number }>;

  findById(id: number): Promise<any | null>;
  findByStudentNum(studentNum: string): Promise<any | null>;
  findByStudentNumAndBirthday(studentNum: string, birthday: string): Promise<any | null>;
  findByEntryGroupId(entryGroupId: number): Promise<any[]>;
  create(data: {
    student_num: string;
    name: string;
    entry_group_id: number;
  }): Promise<any>;
  update(
    id: number,
    data: {
      student_num?: string;
      name?: string;
      entry_group_id?: number;
    }
  ): Promise<any>;
  delete(id: number): Promise<boolean>;
}

export interface EventRepositoryFunctions {
  findAll(options: {
    f_event_code?: string;
    f_time?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: any[]; total: number }>;

  findById(id: number): Promise<any | null>;
  findByIdWithEntryCount(id: number): Promise<any | null>;
  findByEventCode(eventCode: string): Promise<any | null>;
  create(data: {
    event_code: string;
    name: string;
    time: string;
    description?: string;
  }): Promise<any>;
  update(
    id: number,
    data: {
      event_code?: string;
      name?: string;
      time?: string;
      description?: string;
    }
  ): Promise<any>;
  delete(id: number): Promise<boolean>;
}

export interface EntryGroupRepositoryFunctions {
  findAll(options: {
    f_name?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ entryGroups: any[]; total: number }>;

  findById(id: number): Promise<any | null>;
  findByName(name: string): Promise<any | null>;
  create(data: { name: string; description?: string }): Promise<any>;
  update(
    id: number,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<any>;
  delete(id: number): Promise<boolean>;
}

export interface NotificationRepositoryFunctions {
  findAll(options: {
    f_student_id?: number;
    f_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ notifications: any[]; total: number }>;

  findById(id: number): Promise<any | null>;
  findByStudentId(studentId: number): Promise<any[]>;
  create(data: {
    student_id: number;
    type: string;
    title: string;
    message: string;
    is_read?: boolean;
  }): Promise<any>;
  update(
    id: number,
    data: {
      type?: string;
      title?: string;
      message?: string;
      is_read?: boolean;
    }
  ): Promise<any>;
  delete(id: number): Promise<boolean>;
}

export interface ChangeLogRepositoryFunctions {
  findAll(options: {
    f_student_id?: number;
    f_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ changeLogs: any[]; total: number }>;

  findById(id: number): Promise<any | null>;
  findByStudentId(studentId: number): Promise<any[]>;
  create(data: {
    student_id: number;
    type: string;
    description: string;
    old_value?: string;
    new_value?: string;
  }): Promise<any>;

  getUpdateStats(): Promise<{ recordCount: number }>;
}
