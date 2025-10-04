// src/services/StudentService.ts
import {
  StudentEntity,
  EventEntity,
  EntryEntity,
  EntryGroupEntity,
  NotificationEntity,
  ChangeLogEntity,
} from '../types/domains';

import {
  StudentRepositoryFunctions,
  EventRepositoryFunctions,
  EntryRepositoryFunctions,
  EntryGroupRepositoryFunctions,
  NotificationRepositoryFunctions,
  ChangeLogRepositoryFunctions,
} from '../types/repositories';

import { StudentServiceFunctions } from '../types/services';

export function createStudentService(
  studentRepository: StudentRepositoryFunctions,
  eventRepository: EventRepositoryFunctions,
  entryRepository: EntryRepositoryFunctions,
  entryGroupRepository: EntryGroupRepositoryFunctions,
  notificationRepository: NotificationRepositoryFunctions,
  changeLogRepository: ChangeLogRepositoryFunctions
): StudentServiceFunctions {
  return {
    // 🔹 학생 ID로 단건 조회
    async getStudentById(id: number): Promise<StudentEntity> {
      const student = await studentRepository.findById(id);
      if (!student) throw new Error('Student not found');
      return student;
    },

    // 🔹 학번으로 단건 조회
    async getStudentByStudentNum(studentNum: string): Promise<StudentEntity> {
      const student = await studentRepository.findByStudentNum(studentNum);
      if (!student) throw new Error('Student not found');
      return student;
    },

    // 🔹 학번 + 생년월일로 단건 조회 (보안 강화)
    async getStudentByStudentNumAndBirthday(studentNum: string, birthday: string): Promise<StudentEntity> {
      const student = await studentRepository.findByStudentNumAndBirthday(studentNum, birthday);
      if (!student) throw new Error('Student not found or invalid birthday');
      return student;
    },

    // 🔹 학번 기준 기본 페이로드 (학생 + 이벤트 + 출전 여부 flag)
    async getStudentPayloadByStudentNum(studentNum: string): Promise<{
      m_students: StudentEntity;
      t_events: (EventEntity & { f_is_my_entry: boolean })[];
    }> {
      const student = await studentRepository.findByStudentNum(studentNum);
      if (!student) throw new Error('Student not found');

      // 학생이 출전한 엔트리
      const myEntries = await entryRepository.findByStudentId(
        student.f_student_id
      );
      const myEventIds = new Set(myEntries.map(entry => entry.f_event_id));

      // 전체 이벤트
      const allEventsResult = await eventRepository.findAll({});
      const allEvents = allEventsResult.events;

      // 내 출전 여부 flag 추가
      const eventsWithFlag = allEvents.map((event: any) => ({
        ...event,
        f_is_my_entry: myEventIds.has(event.f_event_id),
      }));

      return {
        m_students: student,
        t_events: eventsWithFlag,
      };
    },

    // 🔹 학번 기준 전체 페이로드 (학생 + 엔트리 + 이벤트 + 그룹 + 알림 + 변경 로그)
    async getStudentFullPayload(studentNum: string): Promise<{
      m_students: StudentEntity;
      t_entries: EntryEntity[];
      t_events: EventEntity[];
      t_entry_groups: EntryGroupEntity[];
      t_notifications: NotificationEntity[];
      t_change_logs: ChangeLogEntity[];
    }> {
      const student = await studentRepository.findByStudentNum(studentNum);
      if (!student) throw new Error('Student not found');

      const [
        entries,
        eventsResult,
        entryGroupsResult,
        notificationsResult,
        changeLogsResult,
      ] = await Promise.all([
        entryRepository.findByStudentId(student.f_student_id),
        eventRepository.findAll({}),
        entryGroupRepository.findAll({}),
        notificationRepository.findAll({}),
        changeLogRepository.findAll({}),
      ]);

      return {
        m_students: student,
        t_entries: entries,
        t_events: eventsResult.events,
        t_entry_groups: entryGroupsResult.entryGroups,
        t_notifications: notificationsResult.notifications,
        t_change_logs: changeLogsResult.changeLogs,
      };
    },
  };
}
