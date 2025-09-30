import { D1Database } from '@cloudflare/workers-types';
import { EntryGroupEntity } from '../types/domains/EntryGroup';

function transformToEntryGroupEntity(raw: any): EntryGroupEntity {
  return {
    f_event_id: raw.f_event_id as number,
    f_seq: raw.f_seq as number,
    f_place: raw.f_place as string | null,
    f_gather_time: raw.f_gather_time as string | null,
  };
}

export function createEntryGroupRepository(db: D1Database) {
  return {
    async findAll(): Promise<EntryGroupEntity[]> {
      const result = await db.prepare('SELECT * FROM t_entries_group').all();
      return result.results.map(transformToEntryGroupEntity);
    },
  };
}
