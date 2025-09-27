import { StudentEntity } from '../types/domains/Student';
import { EventEntity } from '../types/domains/Event';

import {
  StudentRepositoryFunctions,
  EventRepositoryFunctions,
  EntryRepositoryFunctions,
} from '../types/repositories';

import { StudentServiceFunctions } from '../types/services';

export function createStudentService(
  studentRepository: StudentRepositoryFunctions,
  eventRepository: EventRepositoryFunctions,
  entryRepository: EntryRepositoryFunctions
): StudentServiceFunctions {
  return {
    async getStudentById(id: number): Promise<StudentEntity> {
      const student = await studentRepository.findById(id);
      if (!student) {
        throw new Error('Student not found');
      }
      return student;
    },

    async getStudentByStudentNum(studentNum: string): Promise<StudentEntity> {
      const student = await studentRepository.findByStudentNum(studentNum);
      if (!student) {
        throw new Error('Student not found');
      }
      return student;
    },

    // ✅ 새로 추가되는 함수
    async getStudentPayloadByStudentNum(studentNum: string): Promise<{
      m_students: StudentEntity;
      t_events: (EventEntity & { f_is_my_entry: boolean })[];
    }> {
      const student = await studentRepository.findByStudentNum(studentNum);
      if (!student) {
        throw new Error('Student not found');
      }

      // 참가 이벤트 조회
      const myEntries = await entryRepository.findByStudentId(
        student.f_student_id
      );
      const myEventIds = new Set(myEntries.map(entry => entry.f_event_id));

      // 전체 이벤트 조회
      const allEventsResult = await eventRepository.findAll({});
      const allEvents = allEventsResult.events;

      // is_my_entry 설정
      const eventsWithFlag = allEvents.map(event => ({
        ...event,
        f_is_my_entry: myEventIds.has(event.f_event_id),
      }));

      return {
        m_students: student,
        t_events: eventsWithFlag,
      };
    },
  };
}
