import { PrismaClient } from '@prisma/client'

function buildWhereClause(options: {
  status?: string
  fromTime?: number
  toTime?: number
}) {
  const where: {
    status?: string
    startTime?: {
      gte?: number
      lte?: number
    }
  } = {}

  if (options.status) {
    where.status = options.status
  }

  if (options.fromTime || options.toTime) {
    where.startTime = {}
    if (options.fromTime) {
      where.startTime.gte = options.fromTime
    }
    if (options.toTime) {
      where.startTime.lte = options.toTime
    }
  }

  return where
}

export function createRecreationRepository(prisma: PrismaClient) {
  return {
    async findAll(options: {
      status?: string
      fromTime?: number
      toTime?: number
      limit?: number
      offset?: number
    }) {
      const where = buildWhereClause(options)

      const [recreations, total] = await Promise.all([
        prisma.recreation.findMany({
          where,
          orderBy: { startTime: 'asc' },
          take: options.limit,
          skip: options.offset,
          include: {
            participations: {
              where: {
                status: 'registered'
              },
              select: {
                studentId: true,
                status: true
              }
            }
          }
        }),
        prisma.recreation.count({ where })
      ])

      return { recreations, total }
    },

    async findById(id: number) {
      return prisma.recreation.findUnique({
        where: { recreationId: id }
      })
    },

    async findByIdWithParticipantCount(id: number) {
      const recreation = await prisma.recreation.findUnique({
        where: { recreationId: id },
        include: {
          _count: {
            select: {
              participations: {
                where: {
                  status: { not: 'cancelled' }
                }
              }
            }
          }
        }
      })

      if (!recreation) return null

      return {
        ...recreation,
        current_participants: recreation._count.participations
      }
    },

    async create(data: {
      title: string
      description?: string
      location: string
      startTime: number
      endTime: number
      maxParticipants: number
      status?: string
    }) {
      return prisma.recreation.create({ 
        data: {
          ...data,
          status: data.status || 'scheduled'
        }
      })
    },

    async update(id: number, data: {
      title?: string
      description?: string
      location?: string
      startTime?: number
      endTime?: number
      maxParticipants?: number
      status?: string
    }) {
      return prisma.recreation.update({
        where: { recreationId: id },
        data
      })
    },

    async delete(id: number) {
      await prisma.recreation.delete({
        where: { recreationId: id }
      })
    }
  }
}