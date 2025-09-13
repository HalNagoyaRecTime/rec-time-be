import { PrismaClient } from '@prisma/client'

export function createStudentRepository(prisma: PrismaClient) {
  return {
    async findAll() {
      return prisma.student.findMany()
    },

    async findById(id: string) {
      return prisma.student.findUnique({
        where: { studentId: id }
      })
    },

    async create(data: {
      studentId: string
      classCode: string
      attendanceNumber: number
      name: string
    }) {
      return prisma.student.create({ data })
    },

    async update(id: string, data: {
      classCode?: string
      attendanceNumber?: number
      name?: string
    }) {
      return prisma.student.update({
        where: { studentId: id },
        data
      })
    },

    async delete(id: string) {
      return prisma.student.delete({
        where: { studentId: id }
      })
    }
  }
}