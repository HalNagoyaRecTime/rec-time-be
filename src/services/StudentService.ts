export function createStudentService(studentRepository: any) {
  return {
    async getAllStudents() {
      return studentRepository.findAll()
    },

    async getStudentById(id: string) {
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

    async createStudent(data: {
      studentId: string
      classCode: string
      attendanceNumber: number
      name: string
    }) {
      return studentRepository.create(data)
    },

    async updateStudent(id: string, data: {
      classCode?: string
      attendanceNumber?: number
      name?: string
    }) {
      return studentRepository.update(id, data)
    },

    async deleteStudent(id: string) {
      return studentRepository.delete(id)
    }
  }
}