import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { StudentEntity } from '../types/domains/Student'; // ✅ 이 줄 추가

export function createStudentRepository(db: D1Database) {
  return {
    async findById(id: number): Promise<StudentEntity | null> {
      const result = await db
        .prepare('SELECT * FROM m_students WHERE f_student_id = ?')
        .bind(id)
        .first();

      if (!result) return null;

      return {
        f_student_id: result.f_student_id as number,
        f_student_num: result.f_student_num as string,
        f_class: result.f_class as string,
        f_number: result.f_number as string,
        f_name: result.f_name as string,
        f_note: result.f_note as string | null,
      };
    },

    async findByStudentNum(studentNum: string): Promise<StudentEntity | null> {
      const result = await db
        .prepare('SELECT * FROM m_students WHERE f_student_num = ?')
        .bind(studentNum)
        .first();

      if (!result) return null;

      return {
        f_student_id: result.f_student_id as number,
        f_student_num: result.f_student_num as string,
        f_class: result.f_class as string,
        f_number: result.f_number as string,
        f_name: result.f_name as string,
        f_note: result.f_note as string | null,
      };
    },
  };
}
