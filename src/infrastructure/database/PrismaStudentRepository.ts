import type { PrismaClient } from '@prisma/client'
import type { Student } from '../../domain/entities'
import type { StudentRepository, CreateStudentInput } from '../../domain/repositories'

export class PrismaStudentRepository implements StudentRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(): Promise<Student[]> {
    return await this.prisma.student.findMany()
  }

  async findById(id: string): Promise<Student | null> {
    return await this.prisma.student.findUnique({
      where: { studentId: id }
    })
  }

  async create(data: CreateStudentInput): Promise<Student> {
    return await this.prisma.student.create({
      data
    })
  }

  async update(id: string, data: Partial<CreateStudentInput>): Promise<Student> {
    return await this.prisma.student.update({
      where: { studentId: id },
      data
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.student.delete({
      where: { studentId: id }
    })
  }
}

export function createPrismaStudentRepository(prisma: PrismaClient): StudentRepository {
  return new PrismaStudentRepository(prisma)
}