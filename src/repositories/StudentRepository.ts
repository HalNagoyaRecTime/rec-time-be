//import { D1Database } from '@cloudflare/workers-types';
import {Database} from 'better-sqlite3'

import { StudentEntity } from '../types/domains/Student';

export function createStudentRepository(db: Database) {
  return {
    // 

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
