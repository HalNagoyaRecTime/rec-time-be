import { D1Database } from '@cloudflare/workers-types';
import { RecreationEntity } from '../types/domains/Recreation';

function buildWhereClause(options: {
  status?: string;
  fromTime?: number;
  toTime?: number;
}) {
  const conditions = [];
  const params = [];

  if (options.status) {
    conditions.push('status = ?');
    params.push(options.status);
  }

  if (options.fromTime) {
    conditions.push('startTime >= ?');
    params.push(options.fromTime);
  }

  if (options.toTime) {
    conditions.push('startTime <= ?');
    params.push(options.toTime);
  }

  return {
    whereClause: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
    params,
  };
}

function transformToRecreationEntity(raw: any): RecreationEntity {
  return {
    recreationId: raw.recreationId as number,
    title: raw.title as string,
    description: raw.description as string | null,
    location: raw.location as string,
    startTime: raw.startTime as number,
    endTime: raw.endTime as number,
    maxParticipants: raw.maxParticipants as number,
    status: raw.status as string,
    createdAt: new Date(raw.createdAt as string),
    updatedAt: new Date(raw.updatedAt as string),
  };
}

export function createRecreationRepository(db: D1Database) {
  return {
    async findAll(options: {
      status?: string;
      fromTime?: number;
      toTime?: number;
      limit?: number;
      offset?: number;
    }): Promise<{ recreations: RecreationEntity[]; total: number }> {
      const { whereClause, params } = buildWhereClause(options);

      let query = `
        SELECT r.*,
               COUNT(p.participationId) as participant_count
        FROM Recreation r
        LEFT JOIN Participation p ON r.recreationId = p.recreationId
                                   AND p.status = 'registered'
        ${whereClause}
        GROUP BY r.recreationId
        ORDER BY r.startTime ASC
      `;

      if (options.limit) {
        query += ` LIMIT ${options.limit}`;
      }
      if (options.offset) {
        query += ` OFFSET ${options.offset}`;
      }

      const countQuery = `SELECT COUNT(*) as total FROM Recreation ${whereClause}`;

      const [recreations, totalResult] = await Promise.all([
        db.prepare(query).bind(...params).all(),
        db.prepare(countQuery).bind(...params).first()
      ]);

      return {
        recreations: recreations.results.map(transformToRecreationEntity),
        total: (totalResult as any)?.total || 0
      };
    },

    async findByIdWithParticipantCount(id: number): Promise<RecreationEntity | null> {
      const query = `
        SELECT r.*,
               COUNT(CASE WHEN p.status != 'cancelled' THEN p.participationId END) as current_participants
        FROM Recreation r
        LEFT JOIN Participation p ON r.recreationId = p.recreationId
        WHERE r.recreationId = ?
        GROUP BY r.recreationId
      `;

      const result = await db.prepare(query).bind(id).first();

      if (!result) {
        return null;
      }

      return transformToRecreationEntity(result);
    },
  };
}
