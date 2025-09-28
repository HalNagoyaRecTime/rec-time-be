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
    async getStudentById(id: number): Promise<StudentEntity> {
      const student = await studentRepository.findById(id);
      if (!student) throw new Error('Student not found');
      return student;
    },

    async getStudentByStudentNum(studentNum: string): Promise<StudentEntity> {
      const student = await studentRepository.findByStudentNum(studentNum);
      if (!student) throw new Error('Student not found');
      return student;
    },

    async getStudentPayloadByStudentNum(studentNum: string): Promise<{
      m_students: StudentEntity;
      t_events: (EventEntity & { f_is_my_entry: boolean })[];
    }> {
      const student = await studentRepository.findByStudentNum(studentNum);
      if (!student) throw new Error('Student not found');

      const myEntries = await entryRepository.findByStudentId(
        student.f_student_id
      );
      const myEventIds = new Set(myEntries.map(entry => entry.f_event_id));

      const allEventsResult = await eventRepository.findAll({});
      const allEvents = allEventsResult.events;

      const eventsWithFlag = allEvents.map(event => ({
        ...event,
        f_is_my_entry: myEventIds.has(event.f_event_id),
      }));

      return {
        m_students: student,
        t_events: eventsWithFlag,
      };
    },

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

      const [entries, eventsResult, entryGroups, notifications, changeLogs] =
        await Promise.all([
          entryRepository.findByStudentId(student.f_student_id),
          eventRepository.findAll({}),
          entryGroupRepository.findAll(),
          notificationRepository.findAll(),
          changeLogRepository.findAll(),
        ]);

      return {
        m_students: student,
        t_entries: entries,
        t_events: eventsResult.events,
        t_entry_groups: entryGroups,
        t_notifications: notifications,
        t_change_logs: changeLogs,
      };
    },
  };
}
