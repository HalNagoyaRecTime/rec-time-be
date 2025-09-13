import { StudentEntity, StudentRepositoryFunctions, StudentServiceFunctions } from "../types"

export function createStudentService(studentRepository: StudentRepositoryFunctions): StudentServiceFunctions {
  return {
    async getStudentById(id: number) 
      : Promise<StudentEntity> {
      const student = await studentRepository.findById(id)
      if (!student) {
        throw new Error('Student not found')
      }
      // Transform to match frontend interface
      return {
        studentId: student.studentId,
        classCode: student.classCode,
        attendanceNumber: student.attendanceNumber,
        name: student.name,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      }
    },
  }
}
