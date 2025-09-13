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
      return student
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