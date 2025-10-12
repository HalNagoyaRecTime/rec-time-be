// src/controllers/DownloadLogController.ts
import { Context } from 'hono';
import { DownloadLogServiceFunctions } from '../services/DownloadLogService';

export interface DownloadLogControllerFunctions {
  getAllLogs: (c: Context) => Promise<Response>;
  getLogsByStudentNum: (c: Context) => Promise<Response>;
  getDownloadStats: (c: Context) => Promise<Response>;
  getStudentDownloadComparison: (c: Context) => Promise<Response>;
  createLog: (c: Context) => Promise<Response>;
}

export function createDownloadLogController(
  downloadLogService: DownloadLogServiceFunctions
): DownloadLogControllerFunctions {
  return {
    // -------------------------
    // getAllLogs
    // -------------------------
    getAllLogs: async (c: Context) => {
      try {
        const f_student_num = c.req.query('f_student_num');
        const f_function = c.req.query('f_function');
        const f_success = c.req.query('f_success');
        const limit = c.req.query('limit');
        const offset = c.req.query('offset');

        const result = await downloadLogService.getAllLogs({
          f_student_num,
          f_function,
          f_success,
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined,
        });

        return c.json(result);
      } catch (error) {
        console.error('[getAllLogs] error =', error);
        return c.json({ error: 'Failed to fetch download logs' }, 500);
      }
    },

    // -------------------------
    // getLogsByStudentNum
    // -------------------------
    getLogsByStudentNum: async (c: Context) => {
      try {
        const studentNum = c.req.param('studentNum');
        if (!studentNum) {
          return c.json({ error: 'studentNum is required' }, 400);
        }

        const logs = await downloadLogService.getLogsByStudentNum(studentNum);
        return c.json({ logs });
      } catch (error) {
        console.error('[getLogsByStudentNum] error =', error);
        return c.json({ error: 'Failed to fetch logs for student' }, 500);
      }
    },

    // -------------------------
    // getDownloadStats
    // -------------------------
    getDownloadStats: async (c: Context) => {
      try {
        const stats = await downloadLogService.getDownloadStats();
        return c.json(stats);
      } catch (error) {
        console.error('[getDownloadStats] error =', error);
        return c.json({ error: 'Failed to fetch download statistics' }, 500);
      }
    },

    // -------------------------
    // getStudentDownloadComparison
    // -------------------------
    getStudentDownloadComparison: async (c: Context) => {
      try {
        const studentNum = c.req.query('student_num');
        if (!studentNum) {
          return c.json({ error: 'student_num parameter is required' }, 400);
        }

        const comparison = await downloadLogService.getStudentDownloadComparison(studentNum);
        return c.json(comparison);
      } catch (error) {
        console.error('[getStudentDownloadComparison] error =', error);
        return c.json({ error: 'Failed to fetch student download comparison' }, 500);
      }
    },

    // -------------------------
    // createLog
    // -------------------------
    createLog: async (c: Context) => {
      try {
        const body = await c.req.json();
        const { student_num, function: func, success, count } = body;

        if (!student_num || !func || !success) {
          return c.json({ 
            error: 'student_num, function, and success are required' 
          }, 400);
        }

        const log = await downloadLogService.createLog({
          student_num,
          function: func,
          success,
          count,
        });

        return c.json(log, 201);
      } catch (error) {
        console.error('[createLog] error =', error);
        return c.json({ error: 'Failed to create download log' }, 500);
      }
    },
  };
}
