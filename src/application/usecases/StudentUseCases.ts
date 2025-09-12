import type { Student } from '../../domain/entities'
import type { StudentRepository, CreateStudentInput } from '../../domain/repositories'

export function createStudentUseCases(studentRepository: StudentRepository) {
  return {
    getAllStudents: async (): Promise<Student[]> => {
      return studentRepository.findMany()
    },

    getStudentById: async (id: string): Promise<Student | null> => {
      return studentRepository.findById(id)
    },

    createStudent: async (data: CreateStudentInput): Promise<Student> => {
      return studentRepository.create(data)
    },

    updateStudent: async (id: string, data: Partial<CreateStudentInput>): Promise<Student> => {
      return studentRepository.update(id, data)
    },

    deleteStudent: async (id: string): Promise<void> => {
      return studentRepository.delete(id)
    }
  }
}

export type StudentUseCases = ReturnType<typeof createStudentUseCases>