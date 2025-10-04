// src/repositories/StudentRepository.ts
import { D1Database } from '@cloudflare/workers-types';
import { StudentEntity } from '../types/domains/Student';

export function createStudentRepository(db: D1Database) {
  return {
    // -------------------------
    // findById
    // -------------------------
    async findById(id: number): Promise<StudentEntity | null> {
      console.log('[DEBUG] findById input:', id);

      try {
        const stmt = db.prepare(
          'SELECT * FROM m_students WHERE f_student_id = ?'
        );
        console.log('[DEBUG] prepared statement (findById):', stmt.toString());

        const result = await stmt.bind(id).first();
        console.log('[DEBUG] query result (findById):', result);

        if (!result) return null;

        return {
          f_student_id: result.f_student_id as number,
          f_student_num: result.f_student_num as string,
          f_class: result.f_class as string,
          f_number: result.f_number as string,
          f_name: result.f_name as string,
          f_note: result.f_note as string | null,
          f_birthday: result.f_birthday as string | null,
        };
      } catch (err) {
        console.error('[DEBUG] DB query error (findById):', err);
        throw err;
      }
    },

    // -------------------------
    // findByStudentNum
    // -------------------------
    async findByStudentNum(studentNum: string): Promise<StudentEntity | null> {
      const value = String(studentNum);
      console.log(
        '[DEBUG] findByStudentNum input:',
        value,
        'type:',
        typeof value
      );

      try {
        const stmt = db.prepare(
          // TEXT 비교 문제 방지용으로 CAST 추가
          'SELECT * FROM m_students WHERE CAST(f_student_num AS TEXT) = ?'
        );
        console.log(
          '[DEBUG] prepared statement (findByStudentNum):',
          stmt.toString()
        );

        const result = await stmt.bind(value).first();
        console.log('[DEBUG] query result (findByStudentNum):', result);

        if (!result) {
          console.log('[DEBUG] No student found for:', value);
          return null;
        }

        return {
          f_student_id: result.f_student_id as number,
          f_student_num: result.f_student_num as string,
          f_class: result.f_class as string,
          f_number: result.f_number as string,
          f_name: result.f_name as string,
          f_note: result.f_note as string | null,
          f_birthday: result.f_birthday as string | null,
        };
      } catch (err) {
        console.error('[DEBUG] DB query error (findByStudentNum):', err);
        throw err;
      }
    },

    // -------------------------
    // findByStudentNumAndBirthday (보안 강화)
    // -------------------------
    async findByStudentNumAndBirthday(studentNum: string, birthday: string): Promise<StudentEntity | null> {
      const value = String(studentNum);
      console.log(
        '[DEBUG] findByStudentNumAndBirthday input:',
        value,
        'birthday:',
        birthday,
        'type:',
        typeof value
      );

      try {
        const stmt = db.prepare(
          'SELECT * FROM m_students WHERE CAST(f_student_num AS TEXT) = ? AND f_birthday = ?'
        );
        console.log(
          '[DEBUG] prepared statement (findByStudentNumAndBirthday):',
          stmt.toString()
        );

        const result = await stmt.bind(value, birthday).first();
        console.log('[DEBUG] query result (findByStudentNumAndBirthday):', result);

        if (!result) {
          console.log('[DEBUG] No student found for:', value, 'with birthday:', birthday);
          return null;
        }

        return {
          f_student_id: result.f_student_id as number,
          f_student_num: result.f_student_num as string,
          f_class: result.f_class as string,
          f_number: result.f_number as string,
          f_name: result.f_name as string,
          f_note: result.f_note as string | null,
          f_birthday: result.f_birthday as string | null,
        };
      } catch (err) {
        console.error('[DEBUG] DB query error (findByStudentNumAndBirthday):', err);
        throw err;
      }
    },

    // -------------------------
    // findAll
    // -------------------------
    async findAll(options: {
      f_student_num?: string;
      f_name?: string;
      f_entry_group_id?: number;
      limit?: number;
      offset?: number;
    }): Promise<{ students: any[]; total: number }> {
      const conditions = [];
      const params: any[] = [];

      if (options.f_student_num) {
        conditions.push('f_student_num = ?');
        params.push(options.f_student_num);
      }

      if (options.f_name) {
        conditions.push('f_name LIKE ?');
        params.push(`%${options.f_name}%`);
      }

      if (options.f_entry_group_id) {
        conditions.push('f_entry_group_id = ?');
        params.push(options.f_entry_group_id);
      }

      const whereClause =
        conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      let query = `SELECT * FROM m_students ${whereClause} ORDER BY f_student_id`;
      if (options.limit) query += ` LIMIT ${options.limit}`;
      if (options.offset) query += ` OFFSET ${options.offset}`;

      const countQuery = `SELECT COUNT(*) as total FROM m_students ${whereClause}`;

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
        students: rows.results || [],
        total: (count as any)?.total ?? 0,
      };
    },

    // -------------------------
    // findByEntryGroupId
    // -------------------------
    async findByEntryGroupId(entryGroupId: number): Promise<any[]> {
      const rows = await db
        .prepare('SELECT * FROM m_students WHERE f_entry_group_id = ?')
        .bind(entryGroupId)
        .all();

      return rows.results || [];
    },

    // -------------------------
    // create
    // -------------------------
    async create(data: {
      student_num: string;
      name: string;
      entry_group_id: number;
    }): Promise<any> {
      const result = await db
        .prepare(
          'INSERT INTO m_students (f_student_num, f_name, f_entry_group_id) VALUES (?, ?, ?)'
        )
        .bind(data.student_num, data.name, data.entry_group_id)
        .run();

      return { id: result.meta.last_row_id, ...data };
    },

    // -------------------------
    // update
    // -------------------------
    async update(
      id: number,
      data: {
        student_num?: string;
        name?: string;
        entry_group_id?: number;
      }
    ): Promise<any> {
      const fields = [];
      const params = [];

      if (data.student_num !== undefined) {
        fields.push('f_student_num = ?');
        params.push(data.student_num);
      }
      if (data.name !== undefined) {
        fields.push('f_name = ?');
        params.push(data.name);
      }
      if (data.entry_group_id !== undefined) {
        fields.push('f_entry_group_id = ?');
        params.push(data.entry_group_id);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      params.push(id);
      const query = `UPDATE m_students SET ${fields.join(', ')} WHERE f_student_id = ?`;

      await db
        .prepare(query)
        .bind(...params)
        .run();

      return { id, ...data };
    },

    // -------------------------
    // delete
    // -------------------------
    async delete(id: number): Promise<boolean> {
      const result = await db
        .prepare('DELETE FROM m_students WHERE f_student_id = ?')
        .bind(id)
        .run();

      return result.meta.changes > 0;
    },
  };
}
