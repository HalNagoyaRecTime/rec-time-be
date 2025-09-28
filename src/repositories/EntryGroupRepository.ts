// src/repositories/EntryGroupRepository.ts

import { D1Database } from '@cloudflare/workers-types';
import { EntryGroupEntity } from '../types/domains/EntryGroup';

// 👉 결과 레코드를 Entity 타입으로 변환
function transformToEntryGroupEntity(raw: any): EntryGroupEntity {
  return {
    f_entry_group_id: raw.f_entry_group_id as number,
    f_entry_group_name: raw.f_entry_group_name as string,
    f_event_id: raw.f_event_id as number,
    f_note: raw.f_note as string | null,
  };
}

// ✅ Repository 생성 함수
export function createEntryGroupRepository(db: D1Database) {
  return {
    async findAll(): Promise<EntryGroupEntity[]> {
      const result = await db.prepare('SELECT * FROM t_entry_groups').all();
      return result.results.map(transformToEntryGroupEntity);
    },
  };
}
