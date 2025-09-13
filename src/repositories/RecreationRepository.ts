import { PrismaClient } from '@prisma/client'

function buildWhereClause(options: {
  status?: string
  fromDate?: Date
  toDate?: Date
}) {
  const where: {
    status?: string
    startDatetime?: {
      gte?: Date
      lte?: Date
    }
  } = {}
  
  if (options.status) {
    where.status = options.status
  }
  
  if (options.fromDate || options.toDate) {
    where.startDatetime = {}
    if (options.fromDate) {
      where.startDatetime.gte = options.fromDate
    }
    if (options.toDate) {
      where.startDatetime.lte = options.toDate
    }
  }

  return where
}

export function createRecreationRepository(prisma: PrismaClient) {
  return {
    async findAll(options: {
      status?: string
      fromDate?: Date
      toDate?: Date
      limit?: number
      offset?: number
    }) {
      const where = buildWhereClause(options)

      const [recreations, total] = await Promise.all([
        prisma.recreation.findMany({
          where,
          orderBy: { startDatetime: 'asc' },
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
      startDatetime: Date
      endDatetime: Date
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
      startDatetime?: Date
      endDatetime?: Date
      maxParticipants?: number
      status?: string
    }) {
      return prisma.recreation.update({
        where: { recreationId: id },
        data
      })
    },

    async delete(id: number) {
      return prisma.recreation.delete({
        where: { recreationId: id }
      })
    }
  }
}