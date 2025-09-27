import { Database } from 'better-sqlite3';
import { EventEntity } from '../types/domains/Event';

function transformToEventEntity(raw: any): EventEntity {
  return {
    f_event_id: raw.f_event_id as number,
    f_event_code: raw.f_event_code as string,
    f_event_name: raw.f_event_name as string,
    f_time: raw.f_time as string,
    f_duration: raw.f_duration as string,
    f_summary: raw.f_summary as string | null,
  };
}

export function createEventRepository(db: Database) {
  return {
    async findAll(options: {
      f_event_code?: string;
      f_time?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ events: EventEntity[]; total: number }> {
      const conditions = [];
      const params = [];

      if (options.f_event_code) {
        conditions.push('e.f_event_code = ?');
        params.push(options.f_event_code);
      }

      if (options.f_time) {
        conditions.push('e.f_time = ?');
        params.push(options.f_time);
      }

      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      let query = `
        SELECT e.*
        FROM t_events e
        ${whereClause}
        ORDER BY e.f_time ASC
      `;

      if (options.limit) {
        query += ` LIMIT ${options.limit}`;
      }
      if (options.offset) {
        query += ` OFFSET ${options.offset}`;
      }

      const countQuery = `SELECT COUNT(*) as total FROM t_events e ${whereClause}`;

      const [events, totalResult] = await Promise.all([
        db.prepare(query).bind(...params).all(),
        db.prepare(countQuery).bind(...params).get() as Promise<{ total: number } | undefined>
      ]);

      return {
        events: events.map(transformToEventEntity),
        total: totalResult && typeof totalResult.total === 'number' ? totalResult.total : 0
      };
    },

    async findById(id: number): Promise<EventEntity | null> {
      const result = await db.prepare('SELECT * FROM t_events WHERE f_event_id = ?').bind(id).get();
      return result ? transformToEventEntity(result) : null;
    },

    async findByEventCode(eventCode: string): Promise<EventEntity | null> {
      const result = await db.prepare('SELECT * FROM t_events WHERE f_event_code = ?').bind(eventCode).get();
      return result ? transformToEventEntity(result) : null;
    },
  };
}
