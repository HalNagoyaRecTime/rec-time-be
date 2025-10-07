import { D1Database } from '@cloudflare/workers-types';

export function createChangeLogRepository(db: D1Database) {
  return {
    // 🔍 全変更履歴を取得（オプション条件付き）
    async findAll(options: {
      f_student_id?: number;
      f_type?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ changeLogs: any[]; total: number }> {
      const conditions = [];
      const params: any[] = [];

      if (options.f_student_id) {
        conditions.push('f_student_id = ?');
        params.push(options.f_student_id);
      }

      if (options.f_type) {
        conditions.push('f_type = ?');
        params.push(options.f_type);
      }

      const whereClause =
        conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      // ✅ 실제 테이블명 수정
      let query = `SELECT * FROM t_change_logs ${whereClause} ORDER BY f_update_id DESC`;
      if (options.limit) query += ` LIMIT ${options.limit}`;
      if (options.offset) query += ` OFFSET ${options.offset}`;

      const countQuery = `SELECT COUNT(*) as total FROM t_change_logs ${whereClause}`;

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
        changeLogs: rows.results || [],
        total: (count as any)?.total ?? 0,
      };
    },

    // 🔍 ID指定で履歴を取得
    async findById(id: number): Promise<any | null> {
      const row = await db
        .prepare('SELECT * FROM t_change_logs WHERE f_update_id = ?')
        .bind(id)
        .first();
      return row || null;
    },

    // 🔍 学生ID指定で履歴を取得
    async findByStudentId(studentId: number): Promise<any[]> {
      const rows = await db
        .prepare('SELECT * FROM t_change_logs WHERE f_student_id = ?')
        .bind(studentId)
        .all();
      return rows.results || [];
    },

    // 🆕 新しい変更履歴を追加
    async create(data: {
      student_id: number;
      type: string;
      description: string;
      old_value?: string;
      new_value?: string;
    }): Promise<any> {
      const result = await db
        .prepare(
          `INSERT INTO t_change_logs 
            (f_student_id, f_type, f_description, f_old_value, f_new_value, f_updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          data.student_id,
          data.type,
          data.description,
          data.old_value || null,
          data.new_value || null,
          new Date().toISOString()
        )
        .run();

      return { id: result.meta.last_row_id, ...data };
    },

    // 🔍 데이터 업데이트 통계 조회
    async getUpdateStats(): Promise<{ recordCount: number }> {
      try {
        // ✅ 테이블명 변경 완료
        const countResult = await db
          .prepare('SELECT COUNT(*) as recordCount FROM t_change_logs')
          .first();

        return {
          recordCount: (countResult as any)?.recordCount ?? 0,
        };
      } catch (error) {
        console.error('[ChangeLogRepository] getUpdateStats error:', error);
        throw error;
      }
    },
  };
}
