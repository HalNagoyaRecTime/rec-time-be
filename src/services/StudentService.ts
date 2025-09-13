import { StudentRepositoryFunctions, StudentServiceFunctions } from "../types"

export function createStudentService(studentRepository: StudentRepositoryFunctions): StudentServiceFunctions {
  return {
    async getAllStudents() {
      return studentRepository.findAll()
    },

    async getStudentById(id: number) {
      const student = await studentRepository.findById(id)
      if (!student) {
        throw new Error('Student not found')
      }
      // Transform to match frontend interface
      return {
        studentId: student.studentId.toString(),
        class: student.classCode,
        attendanceNumber: student.attendanceNumber.toString(),
        name: student.name
      }
    },
  }
}
