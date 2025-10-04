// src/controllers/EntryController.ts
import { Context } from 'hono';
import {
  EntryServiceFunctions,
  StudentServiceFunctions,
} from '../types/services';
import { EntryControllerFunctions } from '../types/controllers';

export function createEntryController(
  entryService: EntryServiceFunctions,
  studentService: StudentServiceFunctions
): EntryControllerFunctions {
  return {
    getAllEntries: async (c: Context) => {
      try {
        const limit = c.req.query('limit');
        const offset = c.req.query('offset');
        const f_student_id = c.req.query('f_student_id');
        const f_event_id = c.req.query('f_event_id');

        const result = await entryService.getAllEntries({
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined,
          f_student_id: f_student_id ? parseInt(f_student_id) : undefined,
          f_event_id: f_event_id ? parseInt(f_event_id) : undefined,
        });

        return c.json(result);
      } catch {
        return c.json({ error: 'Failed to fetch entries' }, 500);
      }
    },

    getEntryById: async (c: Context) => {
      try {
        const id = parseInt(c.req.param('entryId'));
        const entry = await entryService.getEntryById(id);
        if (!entry) return c.json({ error: 'Entry not found' }, 404);
        return c.json(entry);
      } catch {
        return c.json({ error: 'Failed to fetch entry' }, 500);
      }
    },

    getEntriesByStudentNum: async (c: Context) => {
      try {
        const studentNum = c.req.param('studentNum');
        if (!studentNum)
          return c.json({ error: 'studentNum is required' }, 400);

        const student = await studentService.getStudentByStudentNum(studentNum);
        if (!student) return c.json({ error: 'Student not found' }, 404);

        const { entries } = await entryService.getAllEntries({
          f_student_id: student.f_student_id,
        });
        return c.json(entries);
      } catch {
        return c.json({ error: 'Failed to fetch entries' }, 500);
      }
    },

    getAlarmEntriesByStudentNum: async (c: Context) => {
      try {
        const studentNum = c.req.param('studentNum');
        if (!studentNum)
          return c.json({ error: 'studentNum is required' }, 400);

        const entries =
          await entryService.findAlarmEntriesByStudentNum(studentNum);
        return c.json(entries);
      } catch {
        return c.json({ error: 'Failed to fetch alarm entries' }, 500);
      }
    },
  };
}
