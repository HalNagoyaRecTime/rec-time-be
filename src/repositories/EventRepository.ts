//import { D1Database } from '@cloudflare/workers-types';
import {Database} from 'better-sqlite3'
import { EventEntity } from '../types/domains/Event';

function buildWhereClause(options: {
  f_event_code?: string;
  f_time?: string;
}) {
  const conditions = [];
  const params = [];

  if (options.f_event_code) {
    conditions.push('f_event_code = ?');
    params.push(options.f_event_code);
  }

  if (options.f_time) {
    conditions.push('f_time = ?');
    params.push(options.f_time);
  }

  return {
    whereClause: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
    params,
  };
}

function transformToEventEntity(raw: Record<string, unknown>): EventEntity {
  return {
    f_event_id: raw.f_event_id as number,
    f_event_code: raw.f_event_code as string,
    f_event_name: raw.f_event_name as string,
    f_time: raw.f_time as string,
    f_duration: raw.f_duration as string,
    f_place: raw.f_place as string,
    f_gather_time: raw.f_gather_time as string,
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
      const { whereClause, params } = buildWhereClause(options);

      let query = `
        SELECT e.*,
               COUNT(en.f_entry_id) as entry_count
        FROM t_events e
        LEFT JOIN t_entries en ON e.f_event_id = en.f_event_id
        ${whereClause}
        GROUP BY e.f_event_id
        ORDER BY e.f_time ASC
      `;

      if (options.limit) {
        query += ` LIMIT ${options.limit}`;
      }
      if (options.offset) {
        query += ` OFFSET ${options.offset}`;
      }

      const countQuery = `SELECT COUNT(*) as total FROM t_events ${whereClause}`;

      const [events, totalResult] = await Promise.all([
        db.prepare(query).bind(...params).all(),
        db.prepare(countQuery).bind(...params).get()
      ]);

      return {
        events: events.map(e => transformToEventEntity(e as Record<string, unknown>)),
        total: (totalResult as Record<string, unknown>)?.total as number || 0
      };
    },

    async findByIdWithEntryCount(id: number): Promise<EventEntity | null> {
      const query = `
        SELECT e.*,
               COUNT(en.f_entry_id) as entry_count
        FROM t_events e
        LEFT JOIN t_entries en ON e.f_event_id = en.f_event_id
        WHERE e.f_event_id = ?
        GROUP BY e.f_event_id
      `;

      const result = await db.prepare(query).bind(id).get();

      if (!result) {
        return null;
      }

      return transformToEventEntity(result as Record<string, unknown>);
    },

    async findById(id: number): Promise<EventEntity | null> {
      const result = await db.prepare('SELECT * FROM t_events WHERE f_event_id = ?').bind(id).get();

      if (!result) {
        return null;
      }

      return transformToEventEntity(result as Record<string, unknown>);
    },

    async findByEventCode(eventCode: string): Promise<EventEntity | null> {
      const result = await db.prepare('SELECT * FROM t_events WHERE f_event_code = ?').bind(eventCode).get();

      if (!result) {
        return null;
      }

      return transformToEventEntity(result as Record<string, unknown>);
    },
  };
}
