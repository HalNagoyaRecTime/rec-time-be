import { D1Database } from '@cloudflare/workers-types';
import { ChangeLogEntity } from '../types/domains/ChangeLog';

function transformToChangeLogEntity(raw: any): ChangeLogEntity {
  return {
    f_update_id: raw.f_update_id as number,
    f_event_id: raw.f_event_id as number,
    f_updated_item: raw.f_updated_item as string,
    f_before: raw.f_before as string | null,
    f_after: raw.f_after as string | null,
    f_updated_at: raw.f_updated_at as string,
    f_reason: raw.f_reason as string | null,
  };
}

export function createChangeLogRepository(db: D1Database) {
  return {
    async findAll(): Promise<ChangeLogEntity[]> {
      const result = await db.prepare('SELECT * FROM t_update').all();
      return result.results.map(transformToChangeLogEntity);
    },
  };
}
