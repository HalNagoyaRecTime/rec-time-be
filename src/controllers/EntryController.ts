import { Context } from 'hono';
import { EntryControllerFunctions } from '../types/controllers';
import {
  EntryRepositoryFunctions,
  StudentRepositoryFunctions,
} from '../types/repositories';

export function createEntryController(
  entryRepository: EntryRepositoryFunctions,
  studentRepository: StudentRepositoryFunctions
): EntryControllerFunctions {
  const getAllEntries = async (c: Context) => {
    try {
      const result = await entryRepository.findAll({ offset: 0 }); // 단순 예시
      return c.json(result.entries);
    } catch (error) {
      return c.json({ error: 'Failed to fetch entries' }, 500);
    }
  };

  const getEntryById = async (c: Context) => {
    try {
      const id = parseInt(c.req.param('entryId'));
      const entry = await entryRepository.findById(id);
      if (!entry) return c.json({ error: 'Entry not found' }, 404);
      return c.json(entry);
    } catch (error) {
      return c.json({ error: 'Failed to fetch entry' }, 500);
    }
  };

  const getEntriesByStudentNum = async (c: Context) => {
    try {
      const studentNum = c.req.param('studentNum');
      if (!studentNum) return c.json({ error: 'studentNum is required' }, 400);

      const student = await studentRepository.findByStudentNum(studentNum);
      if (!student) return c.json({ error: 'Student not found' }, 404);

      const entries = await entryRepository.findByStudentId(
        student.f_student_id
      );
      return c.json(entries);
    } catch (error) {
      return c.json({ error: 'Failed to fetch entries' }, 500);
    }
  };

  return {
    getAllEntries,
    getEntryById,
    getEntriesByStudentNum,
  };
}
