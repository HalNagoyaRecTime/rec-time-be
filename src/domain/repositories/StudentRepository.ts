import type { Student } from '../entities'

export interface CreateStudentInput {
  studentId: string
  classCode: string
  attendanceNumber: number
  name: string
}

export interface StudentRepository {
  findMany(): Promise<Student[]>
  findById(id: string): Promise<Student | null>
  create(data: CreateStudentInput): Promise<Student>
  update(id: string, data: Partial<CreateStudentInput>): Promise<Student>
  delete(id: string): Promise<void>
}