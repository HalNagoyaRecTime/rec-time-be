import { Context } from 'hono';
import { StudentControllerFunctions } from '../types/controllers';
import { StudentServiceFunctions } from '../types/services';

export function createStudentController(
  studentService: StudentServiceFunctions
): StudentControllerFunctions {

  const getStudentByNum = async (c: Context) => {
    try {
      const num = c.req.param('f_student_num');
      const student = await studentService.getStudentByNum(num);
      return c.json(student);
    } catch (error) {
      if (error instanceof Error && error.message === 'Student not found') {
        return c.json({ error: 'Student nott found' }, 404);
      }
      return c.json({ error: 'Failed to fetch student' }, 500);
    }
  };

  return {
    getStudentByNum,
  };
}
