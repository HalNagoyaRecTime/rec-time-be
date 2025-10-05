// src/repositories/DownloadLogRepository.ts
import { D1Database } from '@cloudflare/workers-types';
import { DownloadLogEntity, CreateDownloadLogData } from '../types/domains/DownloadLog';

export function createDownloadLogRepository(db: D1Database) {
  return {
    // -------------------------
    // create
    // -------------------------
    async create(data: CreateDownloadLogData): Promise<DownloadLogEntity> {
      const now = new Date().toISOString();
      
      const result = await db
        .prepare(
          'INSERT INTO download_logs (f_student_num, f_datetime, f_function, f_success, f_count) VALUES (?, ?, ?, ?, ?)'
        )
        .bind(
          data.student_num,
          now,
          data.function,
          data.success,
          data.count || null
        )
        .run();

      return {
        f_log_id: result.meta.last_row_id as number,
        f_student_num: data.student_num,
        f_datetime: now,
        f_function: data.function,
        f_success: data.success,
        f_count: data.count || null,
      };
    },

    // -------------------------
    // findAll
    // -------------------------
    async findAll(options: {
      f_student_num?: string;
      f_function?: string;
      f_success?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ logs: DownloadLogEntity[]; total: number }> {
      const conditions = [];
      const params: any[] = [];

      if (options.f_student_num) {
        conditions.push('f_student_num = ?');
        params.push(options.f_student_num);
      }

      if (options.f_function) {
        conditions.push('f_function = ?');
        params.push(options.f_function);
      }

      if (options.f_success) {
        conditions.push('f_success = ?');
        params.push(options.f_success);
      }

      const whereClause =
        conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      let query = `SELECT * FROM download_logs ${whereClause} ORDER BY f_log_id DESC`;
      if (options.limit) query += ` LIMIT ${options.limit}`;
      if (options.offset) query += ` OFFSET ${options.offset}`;

      const countQuery = `SELECT COUNT(*) as total FROM download_logs ${whereClause}`;

      const [rows, count] = await Promise.all([
        db
          .prepare(query)
          .bind(...params)
          .all(),
        db
          .prepare(countQuery)
          .bind(...params)
          .first(),
      ]);

      return {
        logs: (rows.results || []) as DownloadLogEntity[],
        total: (count as any)?.total ?? 0,
      };
    },

    // -------------------------
    // findByStudentNum
    // -------------------------
    async findByStudentNum(studentNum: string): Promise<DownloadLogEntity[]> {
      const rows = await db
        .prepare('SELECT * FROM download_logs WHERE f_student_num = ? ORDER BY f_log_id DESC')
        .bind(studentNum)
        .all();

      return (rows.results || []) as DownloadLogEntity[];
    },

    // -------------------------
    // getDownloadStats
    // -------------------------
    async getDownloadStats(): Promise<{
      totalStudents: number;
      successfulDownloads: number;
      failedDownloads: number;
      studentsWithEntries: number;
    }> {
      const [totalStudents, successfulDownloads, failedDownloads, studentsWithEntries] = await Promise.all([
        db.prepare('SELECT COUNT(DISTINCT f_student_num) as count FROM download_logs').first(),
        db.prepare('SELECT COUNT(*) as count FROM download_logs WHERE f_success = "成功"').first(),
        db.prepare('SELECT COUNT(*) as count FROM download_logs WHERE f_success = "失敗"').first(),
        db.prepare('SELECT COUNT(DISTINCT f_student_num) as count FROM download_logs WHERE f_function = "出場情報取得" AND f_success = "成功" AND f_count > 0').first(),
      ]);

      return {
        totalStudents: (totalStudents as any)?.count ?? 0,
        successfulDownloads: (successfulDownloads as any)?.count ?? 0,
        failedDownloads: (failedDownloads as any)?.count ?? 0,
        studentsWithEntries: (studentsWithEntries as any)?.count ?? 0,
      };
    },
  };
}
