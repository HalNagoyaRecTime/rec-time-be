import { PrismaClient } from '@prisma/client'

export class RecreationRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(options: {
    status?: string
    fromDate?: Date
    toDate?: Date
    limit?: number
    offset?: number
  }) {
    const where: any = {}
    
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

    const [recreations, total] = await Promise.all([
      this.prisma.recreation.findMany({
        where,
        orderBy: { startDatetime: 'asc' },
        take: options.limit,
        skip: options.offset,
      }),
      this.prisma.recreation.count({ where })
    ])

    return { recreations, total }
  }

  async findById(id: number) {
    return this.prisma.recreation.findUnique({
      where: { recreationId: id }
    })
  }

  async findByIdWithParticipantCount(id: number) {
    const recreation = await this.prisma.recreation.findUnique({
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
  }

  async create(data: {
    title: string
    description?: string
    location: string
    startDatetime: Date
    endDatetime: Date
    maxParticipants: number
    status?: string
  }) {
    return this.prisma.recreation.create({ 
      data: {
        ...data,
        status: data.status || 'scheduled'
      }
    })
  }

  async update(id: number, data: {
    title?: string
    description?: string
    location?: string
    startDatetime?: Date
    endDatetime?: Date
    maxParticipants?: number
    status?: string
  }) {
    return this.prisma.recreation.update({
      where: { recreationId: id },
      data
    })
  }

  async delete(id: number) {
    return this.prisma.recreation.delete({
      where: { recreationId: id }
    })
  }
}