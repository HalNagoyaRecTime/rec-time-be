import { D1Database } from '@cloudflare/workers-types';
import { StudentEntity } from '../types/domains/Student';

export function createStudentRepository(db: D1Database) {
  return {
    async findById(id: number): Promise<StudentEntity | null> {
      const result = await db.prepare('SELECT * FROM Student WHERE studentId = ?').bind(id).first();

      if (!result) {
        return null;
      }

      // Transform raw database result to typed entity
      return {
        studentId: result.studentId as number,
        classCode: result.classCode as string,
        attendanceNumber: result.attendanceNumber as number,
        name: result.name as string,
        createdAt: new Date(result.createdAt as string),
        updatedAt: new Date(result.updatedAt as string),
      };
    },
  };
}
