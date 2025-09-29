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
        };
      } catch (err) {
        console.error('[DEBUG] DB query error (findByStudentNum):', err);
        throw err;
      }
    },
  };
}
