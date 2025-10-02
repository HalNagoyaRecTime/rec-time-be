// src/repositories/EntryRepository.ts
import { D1Database } from '@cloudflare/workers-types';
import { EntryEntity, EntryAlarmRow } from '../types/domains/Entry';
import { EntryRepositoryFunctions } from '../types/repositories';
import { toEntryAlarmRow } from '../utils/transformers';

function transformToEntryEntity(raw: any): EntryEntity {
  return {
    f_entry_id: raw.f_entry_id as number,
    f_student_id: raw.f_student_id as number,
    f_event_id: raw.f_event_id as number,
  };
}

export function createEntryRepository(
  db: D1Database
): EntryRepositoryFunctions {
  return {
    async findAll(options) {
      const conditions = [];
      const params: any[] = [];

      if (options.f_student_id) {
        conditions.push('f_student_id = ?');
        params.push(options.f_student_id);
      }

      if (options.f_event_id) {
        conditions.push('f_event_id = ?');
        params.push(options.f_event_id);
      }

      const whereClause =
        conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
      let query = `SELECT * FROM t_entries ${whereClause} ORDER BY f_entry_id`;

      if (options.limit) query += ` LIMIT ${options.limit}`;
      if (options.offset) query += ` OFFSET ${options.offset}`;

      const countQuery = `SELECT COUNT(*) as total FROM t_entries ${whereClause}`;

      const [entries, totalResult] = await Promise.all([
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
        entries: entries.results.map(transformToEntryEntity),
        total: (totalResult as any)?.total ?? 0,
      };
    },

    async findById(id) {
      const result = await db
        .prepare('SELECT * FROM t_entries WHERE f_entry_id = ?')
        .bind(id)
        .first();
      return result ? transformToEntryEntity(result) : null;
    },

    async findByStudentId(studentId) {
      const result = await db
        .prepare('SELECT * FROM t_entries WHERE f_student_id = ?')
        .bind(studentId)
        .all();
      return result.results.map(transformToEntryEntity);
    },

    async findByEventId(eventId) {
      const result = await db
        .prepare('SELECT * FROM t_entries WHERE f_event_id = ?')
        .bind(eventId)
        .all();
      return result.results.map(transformToEntryEntity);
    },

    async findByStudentAndEvent(studentId, eventId) {
      const result = await db
        .prepare(
          'SELECT * FROM t_entries WHERE f_student_id = ? AND f_event_id = ?'
        )
        .bind(studentId, eventId)
        .first();
      return result ? transformToEntryEntity(result) : null;
    },

    async create(studentId, eventId) {
      const result = await db
        .prepare(
          'INSERT INTO t_entries (f_student_id, f_event_id) VALUES (?, ?) RETURNING *'
        )
        .bind(studentId, eventId)
        .first();
      return transformToEntryEntity(result);
    },

    async delete(id) {
      const result = await db
        .prepare('DELETE FROM t_entries WHERE f_entry_id = ?')
        .bind(id)
        .run();
      return result.success;
    },

    // ✅ 알람용 쿼리
    async findAlarmEntriesByStudentNum(
      studentNum: string
    ): Promise<EntryAlarmRow[]> {
      const query = `
        SELECT
          ev.f_event_id,
          ev.f_event_name,
          ev.f_time AS f_start_time,
          ev.f_duration,
          eg.f_place,
          eg.f_gather_time,
          ev.f_summary,
          1 AS f_is_my_entry
        FROM m_students s
        INNER JOIN t_entries en ON s.f_student_id = en.f_student_id
        INNER JOIN t_events ev ON en.f_event_id = ev.f_event_id
        INNER JOIN t_entries_group eg ON en.f_event_id = eg.f_event_id AND en.f_seq = eg.f_seq
        WHERE s.f_student_num = ?
        ORDER BY ev.f_time;
      `;

      const result = await db.prepare(query).bind(studentNum).all();
      return result.results.map(toEntryAlarmRow);
    },
  };
}
