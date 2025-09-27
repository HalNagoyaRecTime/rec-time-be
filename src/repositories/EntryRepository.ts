// import { D1Database } from '@cloudflare/workers-types';
import {Database} from 'better-sqlite3'
import { EntryEntity } from '../types/domains/Entry';

function transformToEntryEntity(raw: any): EntryEntity {
  return {
    f_entry_id: raw.f_entry_id as number,
    f_student_id: raw.f_student_id as number,
    f_event_id: raw.f_event_id as number,
    f_seq: raw.f_seq as number,
  };
}

export function createEntryRepository(db: Database) {
  return {
    async findAll(options: {
      f_student_id?: number;
      f_event_id?: number;
      limit?: number;
      offset?: number;
    }): Promise<{ entries: EntryEntity[]; total: number }> {
      const conditions = [];
      const params = [];

      if (options.f_student_id) {
        conditions.push('f_student_id = ?');
        params.push(options.f_student_id);
      }

      if (options.f_event_id) {
        conditions.push('f_event_id = ?');
        params.push(options.f_event_id);
      }

      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      let query = `SELECT * FROM t_entries ${whereClause} ORDER BY f_entry_id`;

      if (options.limit) {
        query += ` LIMIT ${options.limit}`;
      }
      if (options.offset) {
        query += ` OFFSET ${options.offset}`;
      }

      const countQuery = `SELECT COUNT(*) as total FROM t_entries ${whereClause}`;

      const [entries, totalResult] = await Promise.all([
        db.prepare(query).bind(...params).all(),
        db.prepare(countQuery).bind(...params).get()
      ]);

      return {
        entries: entries.map(transformToEntryEntity),
        total: (totalResult as Record<string, unknown>)?.total as number || 0
      };
    },

    async findById(id: number): Promise<EntryEntity | null> {
      const result = await db.prepare('SELECT * FROM t_entries WHERE f_entry_id = ?').bind(id).get();

      if (!result) {
        return null;
      }

      return transformToEntryEntity(result);
    },

    async findByStudentId(studentId: number): Promise<EntryEntity[]> {
      const result = await db.prepare('SELECT * FROM t_entries WHERE f_student_id = ?').bind(studentId).all();

      return result.map(transformToEntryEntity);
    },

    async findByEventId(eventId: number): Promise<EntryEntity[]> {
      const result = await db.prepare('SELECT * FROM t_entries WHERE f_event_id = ?').bind(eventId).all();

      return result.map(transformToEntryEntity);
    },

    async findByStudentAndEvent(studentId: number, eventId: number): Promise<EntryEntity | null> {
      const result = await db.prepare('SELECT * FROM t_entries WHERE f_student_id = ? AND f_event_id = ?').bind(studentId, eventId).get();

      if (!result) {
        return null;
      }

      return transformToEntryEntity(result);
    },

    async create(studentId: number, eventId: number): Promise<EntryEntity> {
      const result = await db.prepare('INSERT INTO t_entries (f_student_id, f_event_id) VALUES (?, ?) RETURNING *').bind(studentId, eventId).get();

      return transformToEntryEntity(result);
    },

    async delete(id: number): Promise<boolean> {
      const result = await db.prepare('DELETE FROM t_entries WHERE f_entry_id = ?').bind(id).run();

      return result.changes > 0;
    },
  };
}