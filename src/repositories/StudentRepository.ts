import { PrismaClient } from '@prisma/client'

export class StudentRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.student.findMany()
  }

  async findById(id: string) {
    return this.prisma.student.findUnique({
      where: { studentId: id }
    })
  }

  async create(data: {
    studentId: string
    classCode: string
    attendanceNumber: number
    name: string
  }) {
    return this.prisma.student.create({ data })
  }

  async update(id: string, data: {
    classCode?: string
    attendanceNumber?: number
    name?: string
  }) {
    return this.prisma.student.update({
      where: { studentId: id },
      data
    })
  }

  async delete(id: string) {
    return this.prisma.student.delete({
      where: { studentId: id }
    })
  }
}