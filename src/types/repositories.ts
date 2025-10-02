// src/types/repositories.ts
import {
  EntryEntity,
  EntryAlarmRow,
  StudentEntity,
  EventEntity,
  EntryGroupEntity,
  NotificationEntity,
  ChangeLogEntity,
} from './domains';

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
