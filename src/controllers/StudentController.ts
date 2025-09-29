import { Context } from 'hono';
import { StudentServiceFunctions } from '../types/services';
import { StudentControllerFunctions } from '../types/controllers';

export function createStudentController(
  studentService: StudentServiceFunctions
): StudentControllerFunctions {
  const getStudentById = async (c: Context) => {
    try {
      const id = c.req.param('studentId') || c.req.param('id');
      const student = await studentService.getStudentById(parseInt(id));
      return c.json(student);
    } catch (error) {
      if (error instanceof Error && error.message === 'Student not found') {
        return c.json({ error: 'Student not found' }, 404);
      }
      return c.json({ error: 'Failed to fetch student' }, 500);
    }
  };

  const getStudentByStudentNum = async (c: Context) => {
    try {
      const studentNum = c.req.param('studentNum');
      const student = await studentService.getStudentByStudentNum(studentNum);
      return c.json(student);
    } catch (error) {
      if (error instanceof Error && error.message === 'Student not found') {
        return c.json({ error: 'Student not found' }, 404);
      }
      return c.json({ error: 'Failed to fetch student' }, 500);
    }
  };

  const getStudentPayloadByStudentNum = async (c: Context) => {
    try {
      const studentNum = c.req.param('studentNum');
      if (!studentNum) return c.json({ error: 'studentNum is required' }, 400);

      const payload =
        await studentService.getStudentPayloadByStudentNum(studentNum);
      return c.json(payload);
    } catch (error) {
      if (error instanceof Error && error.message === 'Student not found') {
        return c.json({ error: 'Student not found' }, 404);
      }
      return c.json({ error: 'Failed to fetch student payload' }, 500);
    }
  };

  const getStudentFullPayload = async (c: Context) => {
    try {
      const studentNum = c.req.param('studentNum');
      if (!studentNum) return c.json({ error: 'studentNum is required' }, 400);

      const payload = await studentService.getStudentFullPayload(studentNum);
      return c.json(payload);
    } catch (error) {
      if (error instanceof Error && error.message === 'Student not found') {
        return c.json({ error: 'Student not found' }, 404);
      }
      return c.json({ error: 'Failed to fetch full student payload' }, 500);
    }
  };

  return {
    getStudentById,
    getStudentByStudentNum,
    getStudentPayloadByStudentNum,
    getStudentFullPayload,
  };
}
