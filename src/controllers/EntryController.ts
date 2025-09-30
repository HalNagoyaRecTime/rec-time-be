import { Context } from 'hono';
import {
  EntryRepositoryFunctions,
  StudentRepositoryFunctions,
} from '../types/repositories';
import { EntryControllerFunctions } from '../types/controllers';

export function createEntryController(
  entryRepository: EntryRepositoryFunctions,
  studentRepository: StudentRepositoryFunctions
): EntryControllerFunctions {
  return {
    getAllEntries: async (c: Context): Promise<Response> => {
      try {
        const result = await entryRepository.findAll({ offset: 0 }); // 단순 예시
        return c.json(result.entries);
      } catch (error) {
        return c.json({ error: 'Failed to fetch entries' }, 500);
      }
    },

    getEntryById: async (c: Context): Promise<Response> => {
      try {
        const id = parseInt(c.req.param('entryId'));
        const entry = await entryRepository.findById(id);
        if (!entry) return c.json({ error: 'Entry not found' }, 404);
        return c.json(entry);
      } catch (error) {
        return c.json({ error: 'Failed to fetch entry' }, 500);
      }
    },

    getEntriesByStudentNum: async (c: Context): Promise<Response> => {
      try {
        const studentNum = c.req.param('studentNum');
        if (!studentNum)
          return c.json({ error: 'studentNum is required' }, 400);

        const student = await studentRepository.findByStudentNum(studentNum);
        if (!student) return c.json({ error: 'Student not found' }, 404);

        const entries = await entryRepository.findByStudentId(
          student.f_student_id
        );
        return c.json(entries);
      } catch (error) {
        return c.json({ error: 'Failed to fetch entries' }, 500);
      }
    },
  };
}
