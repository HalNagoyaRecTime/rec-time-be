import { PrismaClient } from '@prisma/client'

function buildWhereClauseForStudent(studentId: string, options: {
  status?: string
  fromDate?: Date
  toDate?: Date
}) {
  const where: {
    studentId: string
    status?: string
    recreation?: {
      startDatetime?: {
        gte?: Date
        lte?: Date
      }
    }
  } = { studentId }
  
  if (options.status) {
    where.status = options.status
  }
  
  if (options.fromDate || options.toDate) {
    where.recreation = {
      startDatetime: {}
    }
    if (options.fromDate) {
      where.recreation.startDatetime!.gte = options.fromDate
    }
    if (options.toDate) {
      where.recreation.startDatetime!.lte = options.toDate
    }
  }

  return where
}

export function createParticipationRepository(prisma: PrismaClient) {
  return {
    async findByStudentId(studentId: string, options: {
      status?: string
      fromDate?: Date
      toDate?: Date
    }) {
      const where = buildWhereClauseForStudent(studentId, options)

      return prisma.participation.findMany({
        where,
        include: {
          student: true,
          recreation: true
        },
        orderBy: {
          recreation: {
            startDatetime: 'asc'
          }
        }
      })
    },

    async findByRecreationId(recreationId: number) {
      return prisma.participation.findMany({
        where: { recreationId },
        include: {
          student: true,
          recreation: true
        },
        orderBy: {
          registeredAt: 'asc'
        }
      })
    },

    async findById(id: number) {
      return prisma.participation.findUnique({
        where: { participationId: id },
        include: {
          student: true,
          recreation: true
        }
      })
    },

    async findByStudentAndRecreation(studentId: string, recreationId: number) {
      return prisma.participation.findUnique({
        where: {
          studentId_recreationId: {
            studentId,
            recreationId
          }
        }
      })
    },

    async create(data: {
      studentId: string
      recreationId: number
      status?: string
    }) {
      return prisma.participation.create({
        data: {
          ...data,
          status: data.status || 'registered'
        },
        include: {
          student: true,
          recreation: true
        }
      })
    },

    async update(id: number, data: {
      status?: string
    }) {
      return prisma.participation.update({
        where: { participationId: id },
        data,
        include: {
          student: true,
          recreation: true
        }
      })
    },

    async delete(id: number) {
      return prisma.participation.delete({
        where: { participationId: id }
      })
    }
  }
}
