import { PrismaClient } from '@prisma/client'

export function createStudentRepository(prisma: PrismaClient) {
  return {
    async findAll() {
      return prisma.student.findMany()
    },

    async findById(id: number) {
      return prisma.student.findUnique({
        where: { studentId: id }
      })
    },

    async create(data: {
      studentId: number
      classCode: string
      attendanceNumber: number
      name: string
    }) {
      return prisma.student.create({ 
        data: {
          ...data,
          studentId: data.studentId
        } 
      })
    },

    async update(id: number, data: {
      classCode?: string
      attendanceNumber?: number
      name?: string
    }) {
      return prisma.student.update({
        where: { studentId: id },
        data
      })
    },

    async delete(id: number) {
      await prisma.student.delete({
        where: { studentId: id }
      })
    }
  }
}
