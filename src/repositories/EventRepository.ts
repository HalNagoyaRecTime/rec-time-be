import { D1Database } from '@cloudflare/workers-types';
import { EventEntity } from '../types/domains/Event';
import { EventRepositoryFunctions } from '../types/repositories';

function transformToEventEntity(raw: any): EventEntity {
  return {
    f_event_id: raw.f_event_id,
    f_event_code: raw.f_event_code,
    f_event_name: raw.f_event_name,
    f_time: raw.f_time,
    f_duration: raw.f_duration,
    f_place: raw.f_place,
    f_gather_time: raw.f_gather_time,
    f_summary: raw.f_summary,
  };
}

export function createEventRepository(
  db: D1Database
): EventRepositoryFunctions {
  return {
    async findAll({ f_event_code, f_time, limit, offset }) {
      const conditions = [];
      const params: any[] = [];

      if (f_event_code) {
        conditions.push('f_event_code = ?');
        params.push(f_event_code);
      }

      if (f_time) {
        conditions.push('f_time = ?');
        params.push(f_time);
      }

      const whereClause =
        conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      let query = `SELECT * FROM t_events ${whereClause} ORDER BY f_event_id`;
      if (limit) query += ` LIMIT ${limit}`;
      if (offset) query += ` OFFSET ${offset}`;

      const countQuery = `SELECT COUNT(*) as total FROM t_events ${whereClause}`;

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
        events: rows.results.map(transformToEventEntity),
        total: (count as any)?.total ?? 0,
      };
    },

    async findById(id: number) {
      const row = await db
        .prepare('SELECT * FROM t_events WHERE f_event_id = ?')
        .bind(id)
        .first();

      return row ? transformToEventEntity(row) : null;
    },

    async findByIdWithEntryCount(id: number) {
      const row = await db
        .prepare(
          `SELECT e.*, (
            SELECT COUNT(*) 
            FROM t_entries 
            WHERE f_event_id = e.f_event_id
          ) AS entry_count
          FROM t_events e
          WHERE f_event_id = ?`
        )
        .bind(id)
        .first();

      return row ? transformToEventEntity(row) : null;
    },

    async findByEventCode(eventCode: string) {
      const row = await db
        .prepare('SELECT * FROM t_events WHERE f_event_code = ?')
        .bind(eventCode)
        .first();

      return row ? transformToEventEntity(row) : null;
    },
  };
}
