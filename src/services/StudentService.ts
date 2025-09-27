import {
  StudentEntity,
  StudentRepositoryFunctions,
  StudentServiceFunctions,
} from '../types';

export function createStudentService(
  studentRepository: StudentRepositoryFunctions
): StudentServiceFunctions {
  return {
    async getStudentByNum(num: string): Promise<StudentEntity> {
      const student = await studentRepository.findByStudentNum(num);
      if (!student) {
        throw new Error('Student not found');
      }
      return student;
    },
  };
}
