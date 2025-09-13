import { PrismaClient } from '@prisma/client';

function buildWhereClause(options: {
  status?: string;
  fromTime?: number;
  toTime?: number;
}) {
  const where: {
    status?: string;
    startTime?: {
      gte?: number;
      lte?: number;
    };
  } = {};

  if (options.status) {
    where.status = options.status;
  }

  if (options.fromTime || options.toTime) {
    where.startTime = {};
    if (options.fromTime) {
      where.startTime.gte = options.fromTime;
    }
    if (options.toTime) {
      where.startTime.lte = options.toTime;
    }
  }

  return where;
}

export function createRecreationRepository(prisma: PrismaClient) {
  return {
    async findAll(options: {
      status?: string;
      fromTime?: number;
      toTime?: number;
      limit?: number;
      offset?: number;
    }) {
      const where = buildWhereClause(options);

      const [recreations, total] = await Promise.all([
        prisma.recreation.findMany({
          where,
          orderBy: { startTime: 'asc' },
          take: options.limit,
          skip: options.offset,
          include: {
            participations: {
              where: {
                status: 'registered',
              },
              select: {
                studentId: true,
                status: true,
              },
            },
          },
        }),
        prisma.recreation.count({ where }),
      ]);

      return { recreations, total };
    },

    async findByIdWithParticipantCount(id: number) {
      const recreation = await prisma.recreation.findUnique({
        where: { recreationId: id },
        include: {
          _count: {
            select: {
              participations: {
                where: {
                  status: { not: 'cancelled' },
                },
              },
            },
          },
        },
      });

      if (!recreation) return null;

      return {
        ...recreation,
        current_participants: recreation._count.participations,
      };
    },
  };
}
