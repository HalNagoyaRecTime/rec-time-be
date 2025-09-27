//import { D1Database } from '@cloudflare/workers-types';
import {Database} from 'better-sqlite3'

import { StudentEntity } from '../types/domains/Student';

export function createStudentRepository(db: Database) {
  return {
    async findById(id: number): Promise<StudentEntity | null> {
      const result = await db.prepare('SELECT * FROM m_students WHERE f_student_id = ?').bind(id).get() as any;

      if (!result) {
        return null;
      }

      // Transform raw database result to typed entity
      return {
        f_student_id: result.f_student_id as number,
        f_student_num: result.f_student_num as string,
        f_class: result.f_class as string,
        f_number: result.f_number as string,
        f_name: result.f_name as string,
        f_note: result.f_note as string | null,
      };
    },

    async findAll(): Promise<StudentEntity[]> {
      const result = await db.prepare('SELECT * FROM m_students ORDER BY f_student_num').all() as any[];

      return result.map(row => ({
        f_student_id: row.f_student_id as number,
        f_student_num: row.f_student_num as string,
        f_class: row.f_class as string,
        f_number: row.f_number as string,
        f_name: row.f_name as string,
        f_note: row.f_note as string | null,
      }));
    },

    async findByStudentNum(studentNum: string): Promise<StudentEntity | null> {
      const result = await db.prepare('SELECT * FROM m_students WHERE f_student_num = ?').bind(studentNum).get() as StudentEntity | undefined;

      if (!result) {
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
    },
  };
}
