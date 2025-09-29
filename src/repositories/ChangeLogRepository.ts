import { D1Database } from '@cloudflare/workers-types';
import { ChangeLogEntity } from '../types/domains/ChangeLog';

function transformToChangeLogEntity(raw: any): ChangeLogEntity {
  return {
    f_change_log_id: raw.f_change_log_id as number,
    f_table_name: raw.f_table_name as string,
    f_record_id: raw.f_record_id as number,
    f_change_type: raw.f_change_type as 'INSERT' | 'UPDATE' | 'DELETE',
    f_changed_at: raw.f_changed_at as string,
    f_changed_by: raw.f_changed_by as string,
  };
}

export function createChangeLogRepository(db: D1Database) {
  return {
    async findAll(): Promise<ChangeLogEntity[]> {
      const result = await db.prepare('SELECT * FROM t_change_logs').all();
      return result.results.map(transformToChangeLogEntity);
    },
  };
}
