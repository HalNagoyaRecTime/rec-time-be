import { Context } from 'hono';
import { StudentServiceFunctions } from '../types/services';
import { StudentControllerFunctions } from '../types/controllers';

export function createStudentController(
  studentService: StudentServiceFunctions
): StudentControllerFunctions {
  return {
    // 🔹 학생 ID로 조회
    getStudentById: async (c: Context): Promise<Response> => {
      try {
        const id = c.req.param('studentId') || c.req.param('id');
        const student = await studentService.getStudentById(parseInt(id));
        return c.json(student);
      } catch (error) {
        console.error('[getStudentById] error =', error);
        if (error instanceof Error && error.message === 'Student not found') {
          return c.json({ error: 'Student not found' }, 404);
        }
        return c.json({ error: 'Failed to fetch student' }, 500);
      }
    },

    // 🔹 학번으로 학생 조회
    getStudentByStudentNum: async (c: Context): Promise<Response> => {
      try {
        const studentNum = c.req.param('studentNum');
        const student = await studentService.getStudentByStudentNum(studentNum);
        return c.json(student);
      } catch (error) {
        console.error('[getStudentByStudentNum] error =', error);
        if (error instanceof Error && error.message === 'Student not found') {
          return c.json({ error: 'Student not found' }, 404);
        }
        return c.json({ error: 'Failed to fetch student' }, 500);
      }
    },

    // 🔹 학번 기준 기본 페이로드 (학생 + 이벤트 + 내 출전 여부 flag)
    getStudentPayloadByStudentNum: async (c: Context): Promise<Response> => {
      try {
        const studentNum = c.req.param('studentNum');
        if (!studentNum)
          return c.json({ error: 'studentNum is required' }, 400);

        const payload =
          await studentService.getStudentPayloadByStudentNum(studentNum);
        return c.json(payload);
      } catch (error) {
        console.error('[getStudentPayloadByStudentNum] error =', error);
        if (error instanceof Error && error.message === 'Student not found') {
          return c.json({ error: 'Student not found' }, 404);
        }
        return c.json({ error: 'Failed to fetch student payload' }, 500);
      }
    },

    // 🔹 학번 기준 풀 페이로드 (학생 + 엔트리 + 이벤트 + 그룹 + 알림 + 변경 로그)
    getStudentFullPayload: async (c: Context): Promise<Response> => {
      try {
        const studentNum = c.req.param('studentNum');
        if (!studentNum)
          return c.json({ error: 'studentNum is required' }, 400);

        const payload = await studentService.getStudentFullPayload(studentNum);
        return c.json(payload);
      } catch (error) {
        console.error('[getStudentFullPayload] error =', error);
        if (error instanceof Error && error.message === 'Student not found') {
          return c.json({ error: 'Student not found' }, 404);
        }
        return c.json({ error: 'Failed to fetch full student payload' }, 500);
      }
    },
  };
}
