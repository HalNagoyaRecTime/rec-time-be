import { PrismaClient } from '@prisma/client'

function buildWhereClauseForStudent(studentId: number, options: {
  status?: string
  fromTime?: number
  toTime?: number
}) {
  const where: {
    studentId: number
    status?: string
    recreation?: {
      startTime?: {
        gte?: number
        lte?: number
      }
    }
  } = { studentId }

  if (options.status) {
    where.status = options.status
  }

  if (options.fromTime || options.toTime) {
    where.recreation = {
      startTime: {}
    }
    if (options.fromTime) {
      where.recreation.startTime!.gte = options.fromTime
    }
    if (options.toTime) {
      where.recreation.startTime!.lte = options.toTime
    }
  }

  return where
}

export function createParticipationRepository(prisma: PrismaClient) {
  return {
    async findByStudentId(studentId: number, options: {
      status?: string
      fromTime?: number
      toTime?: number
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
            startTime: 'asc'
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

    async findByStudentAndRecreation(studentId: number, recreationId: number) {
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
      studentId: number
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
      await prisma.participation.delete({
        where: { participationId: id }
      })
    }
  }
}
