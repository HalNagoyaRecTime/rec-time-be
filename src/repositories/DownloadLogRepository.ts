// src/repositories/DownloadLogRepository.ts
import { D1Database } from '@cloudflare/workers-types';
import { DownloadLogEntity, CreateDownloadLogData } from '../types/domains/DownloadLog';

export function createDownloadLogRepository(db: D1Database) {
  // 테이블 자동 생성 / テーブル自動作成
  const ensureTableExists = async () => {
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS download_logs (
          f_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
          f_student_num TEXT NOT NULL,
          f_datetime TEXT NOT NULL,
          f_function TEXT NOT NULL,
          f_success TEXT NOT NULL,
          f_count INTEGER
        )
      `).run();
    } catch (error) {
      console.error('[DownloadLogRepository] 테이블 생성 실패:', error);
    }
  };

  return {
    // -------------------------
    // create
    // -------------------------
    async create(data: CreateDownloadLogData): Promise<DownloadLogEntity> {
      // 테이블 존재 확인 및 생성 / テーブル存在確認と作成
      await ensureTableExists();
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
        logs: (rows.results || []) as unknown as DownloadLogEntity[],
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

      return (rows.results || []) as unknown as DownloadLogEntity[];
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

    // -------------------------
    // getStudentDownloadComparison
    // -------------------------
    async getStudentDownloadComparison(studentNum: string): Promise<{
      studentNum: string;
      actualEntryCount: number;
      downloadedEntryCount: number;
      downloadedEventCount: number;
      downloadStatus: {
        entryDownloadSuccess: boolean;
        eventDownloadSuccess: boolean;
        entryDownloadCount: number;
        eventDownloadCount: number;
        lastEntryDownload: string | null;
        lastEventDownload: string | null;
      };
      missingDownloads: {
        entryCount: number;
        eventCount: number;
      };
    }> {
      // 1. 실제 출전 수 조회
      const actualEntries = await db
        .prepare(`
          SELECT COUNT(*) as count 
          FROM t_entries te 
          JOIN m_students ms ON te.f_student_id = ms.f_student_id 
          WHERE ms.f_student_num = ?
        `)
        .bind(studentNum)
        .first();

      // 2. 다운로드된 출전 정보 수 조회
      const entryDownload = await db
        .prepare(`
          SELECT f_count, f_success, f_datetime 
          FROM download_logs 
          WHERE f_student_num = ? AND f_function = "出場情報取得" 
          ORDER BY f_log_id DESC 
          LIMIT 1
        `)
        .bind(studentNum)
        .first();

      // 3. 다운로드된 이벤트 정보 수 조회
      const eventDownload = await db
        .prepare(`
          SELECT f_count, f_success, f_datetime 
          FROM download_logs 
          WHERE f_student_num = ? AND f_function = "イベント情報取得" 
          ORDER BY f_log_id DESC 
          LIMIT 1
        `)
        .bind(studentNum)
        .first();

      const actualEntryCount = (actualEntries as any)?.count ?? 0;
      const downloadedEntryCount = (entryDownload as any)?.f_count ?? 0;
      const downloadedEventCount = (eventDownload as any)?.f_count ?? 0;

      return {
        studentNum,
        actualEntryCount,
        downloadedEntryCount,
        downloadedEventCount,
        downloadStatus: {
          entryDownloadSuccess: (entryDownload as any)?.f_success === '成功',
          eventDownloadSuccess: (eventDownload as any)?.f_success === '成功',
          entryDownloadCount: downloadedEntryCount,
          eventDownloadCount: downloadedEventCount,
          lastEntryDownload: (entryDownload as any)?.f_datetime ?? null,
          lastEventDownload: (eventDownload as any)?.f_datetime ?? null,
        },
        missingDownloads: {
          entryCount: Math.max(0, actualEntryCount - downloadedEntryCount),
          eventCount: Math.max(0, downloadedEventCount), // 이벤트는 전체 이벤트 수와 비교
        },
      };
    },
  };
}
