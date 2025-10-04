import { D1Database } from '@cloudflare/workers-types';

export function createNotificationRepository(db: D1Database) {
  return {
    async findAll(options: {
      f_student_id?: number;
      f_type?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ notifications: any[]; total: number }> {
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

      let query = `SELECT * FROM t_notifs ${whereClause} ORDER BY f_notif_id`;
      if (options.limit) query += ` LIMIT ${options.limit}`;
      if (options.offset) query += ` OFFSET ${options.offset}`;

      const countQuery = `SELECT COUNT(*) as total FROM t_notifs ${whereClause}`;

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
        notifications: rows.results || [],
        total: (count as any)?.total ?? 0,
      };
    },

    async findById(id: number): Promise<any | null> {
      const row = await db
        .prepare('SELECT * FROM t_notifs WHERE f_notif_id = ?')
        .bind(id)
        .first();

      return row || null;
    },

    async findByStudentId(studentId: number): Promise<any[]> {
      const rows = await db
        .prepare('SELECT * FROM t_notifs WHERE f_student_id = ?')
        .bind(studentId)
        .all();

      return rows.results || [];
    },

    async create(data: {
      student_id: number;
      type: string;
      title: string;
      message: string;
      is_read?: boolean;
    }): Promise<any> {
      const result = await db
        .prepare(
          'INSERT INTO t_notifs (f_student_id, f_type, f_title, f_body, f_is_read) VALUES (?, ?, ?, ?, ?)'
        )
        .bind(
          data.student_id,
          data.type,
          data.title,
          data.message,
          data.is_read || false
        )
        .run();

      return { id: result.meta.last_row_id, ...data };
    },

    async update(
      id: number,
      data: {
        type?: string;
        title?: string;
        message?: string;
        is_read?: boolean;
      }
    ): Promise<any> {
      const fields = [];
      const params = [];

      if (data.type !== undefined) {
        fields.push('f_type = ?');
        params.push(data.type);
      }
      if (data.title !== undefined) {
        fields.push('f_title = ?');
        params.push(data.title);
      }
      if (data.message !== undefined) {
        fields.push('f_body = ?');
        params.push(data.message);
      }
      if (data.is_read !== undefined) {
        fields.push('f_is_read = ?');
        params.push(data.is_read);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      params.push(id);
      const query = `UPDATE t_notifs SET ${fields.join(', ')} WHERE f_notif_id = ?`;

      await db
        .prepare(query)
        .bind(...params)
        .run();

      return { id, ...data };
    },

    async delete(id: number): Promise<boolean> {
      const result = await db
        .prepare('DELETE FROM t_notifs WHERE f_notif_id = ?')
        .bind(id)
        .run();

      return result.meta.changes > 0;
    },
  };
}
