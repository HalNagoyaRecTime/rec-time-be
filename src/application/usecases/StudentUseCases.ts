import type { Student } from '../../domain/entities'
import type { StudentRepository, CreateStudentInput } from '../../domain/repositories'

export class StudentUseCases {
  constructor(private studentRepository: StudentRepository) {}

  async getAllStudents(): Promise<Student[]> {
    return this.studentRepository.findMany()
  }

  async getStudentById(id: string): Promise<Student | null> {
    return this.studentRepository.findById(id)
  }

  async createStudent(data: CreateStudentInput): Promise<Student> {
    return this.studentRepository.create(data)
  }

  async updateStudent(id: string, data: Partial<CreateStudentInput>): Promise<Student> {
    return this.studentRepository.update(id, data)
  }

  async deleteStudent(id: string): Promise<void> {
    return this.studentRepository.delete(id)
  }
}

export function createStudentUseCases(studentRepository: StudentRepository) {
  return new StudentUseCases(studentRepository)
}