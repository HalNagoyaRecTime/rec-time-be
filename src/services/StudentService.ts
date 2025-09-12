import { StudentRepository } from '../repositories/StudentRepository'

export class StudentService {
  constructor(private studentRepository: StudentRepository) {}

  async getAllStudents() {
    return this.studentRepository.findAll()
  }

  async getStudentById(id: string) {
    const student = await this.studentRepository.findById(id)
    if (!student) {
      throw new Error('Student not found')
    }
    return student
  }

  async createStudent(data: {
    studentId: string
    classCode: string
    attendanceNumber: number
    name: string
  }) {
    return this.studentRepository.create(data)
  }

  async updateStudent(id: string, data: {
    classCode?: string
    attendanceNumber?: number
    name?: string
  }) {
    return this.studentRepository.update(id, data)
  }

  async deleteStudent(id: string) {
    return this.studentRepository.delete(id)
  }
}