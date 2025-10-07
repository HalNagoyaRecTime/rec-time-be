// src/controllers/EntryController.ts
import { Context } from 'hono';
import {
  EntryServiceFunctions,
  StudentServiceFunctions,
} from '../types/services';
import { EntryControllerFunctions } from '../types/controllers';
import { DownloadLogServiceFunctions } from '../services/DownloadLogService';

export function createEntryController(
  entryService: EntryServiceFunctions,
  studentService: StudentServiceFunctions,
  downloadLogService: DownloadLogServiceFunctions
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
        if (!studentNum) {
          return c.json({ error: 'studentNum is required' }, 400);
        }

        const student = await studentService.getStudentByStudentNum(studentNum);
        if (!student) {
          // 로그 등록: 실패 (학생 없음) / ログ登録: 失敗（学生なし）
          await downloadLogService.logEntryDataDownload(studentNum, false);
          return c.json({ error: 'Student not found' }, 404);
        }

        const { entries } = await entryService.getAllEntries({
          f_student_id: student.f_student_id,
        });
        
        // 로그 등록: 성공 / ログ登録: 成功
        await downloadLogService.logEntryDataDownload(studentNum, true, entries.length);
        
        return c.json(entries);
      } catch (error) {
        console.error('[getEntriesByStudentNum] error =', error);
        
        // 로그 등록: 실패 / ログ登録: 失敗
        try {
          const studentNum = c.req.param('studentNum');
          await downloadLogService.logEntryDataDownload(studentNum, false);
        } catch (logError) {
          console.error('[log error] error =', logError);
        }
        
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
        
        // 엔트리 데이터 0건 에러 처리 / エントリーデータ0件エラー処理
        if (!entries || entries.length === 0) {
          // 로그 등록: 실패 (0건) / ログ登録: 失敗（0件）
          await downloadLogService.logEntryDataDownload(studentNum, false, 0);
          return c.json({ 
            error: '出場情報が見つかりません。', 
            code: 'NO_ENTRIES_FOUND',
            details: 'この学籍番号の出場情報がありません。'
          }, 404);
        }
        
        // 로그 등록: 성공 / ログ登録: 成功
        await downloadLogService.logEntryDataDownload(studentNum, true, entries.length);
        
        return c.json(entries);
      } catch (error) {
        console.error('[getAlarmEntriesByStudentNum] error =', error);
        // 로그 등록: 실패 / ログ登録: 失敗
        try {
          const studentNum = c.req.param('studentNum');
          await downloadLogService.logEntryDataDownload(studentNum, false);
        } catch (logError) {
          console.error('[log error] error =', logError);
        }
        return c.json({ error: 'Failed to fetch alarm entries' }, 500);
      }
    },
  };
}
