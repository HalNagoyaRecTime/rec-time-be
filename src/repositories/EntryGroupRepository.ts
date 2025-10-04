import { D1Database } from '@cloudflare/workers-types';

export function createEntryGroupRepository(db: D1Database) {
  return {
    async findAll(options: {
      f_name?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ entryGroups: any[]; total: number }> {
      const conditions = [];
      const params: any[] = [];

      if (options.f_name) {
        conditions.push('f_name LIKE ?');
        params.push(`%${options.f_name}%`);
      }

      const whereClause =
        conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      let query = `SELECT * FROM t_entries_group ${whereClause} ORDER BY f_event_id`;
      if (options.limit) query += ` LIMIT ${options.limit}`;
      if (options.offset) query += ` OFFSET ${options.offset}`;

      const countQuery = `SELECT COUNT(*) as total FROM t_entries_group ${whereClause}`;

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
        entryGroups: rows.results || [],
        total: (count as any)?.total ?? 0,
      };
    },

    async findById(id: number): Promise<any | null> {
      const row = await db
        .prepare('SELECT * FROM t_entries_group WHERE f_event_id = ?')
        .bind(id)
        .first();

      return row || null;
    },

    async findByName(name: string): Promise<any | null> {
      const row = await db
        .prepare('SELECT * FROM t_entries_group WHERE f_name = ?')
        .bind(name)
        .first();

      return row || null;
    },

    async create(data: { name: string; description?: string }): Promise<any> {
      const result = await db
        .prepare(
          'INSERT INTO t_entries_group (f_name, f_description) VALUES (?, ?)'
        )
        .bind(data.name, data.description || null)
        .run();

      return { id: result.meta.last_row_id, ...data };
    },

    async update(
      id: number,
      data: {
        name?: string;
        description?: string;
      }
    ): Promise<any> {
      const fields = [];
      const params = [];

      if (data.name !== undefined) {
        fields.push('f_name = ?');
        params.push(data.name);
      }
      if (data.description !== undefined) {
        fields.push('f_description = ?');
        params.push(data.description);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      params.push(id);
      const query = `UPDATE t_entries_group SET ${fields.join(', ')} WHERE f_event_id = ?`;

      await db
        .prepare(query)
        .bind(...params)
        .run();

      return { id, ...data };
    },

    async delete(id: number): Promise<boolean> {
      const result = await db
        .prepare('DELETE FROM t_entries_group WHERE f_event_id = ?')
        .bind(id)
        .run();

      return result.meta.changes > 0;
    },
  };
}
