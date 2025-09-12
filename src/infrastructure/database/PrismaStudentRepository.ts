import type { PrismaClient } from '@prisma/client'
import type { Student } from '../../domain/entities'
import type { StudentRepository, CreateStudentInput } from '../../domain/repositories'

export function createPrismaStudentRepository(prisma: PrismaClient): StudentRepository {
  return {
    async findMany(): Promise<Student[]> {
      return await prisma.student.findMany()
    },

    async findById(id: string): Promise<Student | null> {
      return await prisma.student.findUnique({
        where: { studentId: id }
      })
    },

    async create(data: CreateStudentInput): Promise<Student> {
      return await prisma.student.create({
        data
      })
    },

    async update(id: string, data: Partial<CreateStudentInput>): Promise<Student> {
      return await prisma.student.update({
        where: { studentId: id },
        data
      })
    },

    async delete(id: string): Promise<void> {
      await prisma.student.delete({
        where: { studentId: id }
      })
    }
  }
}