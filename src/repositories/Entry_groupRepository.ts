//import { D1Database } from '@cloudflare/workers-types';
import {Database} from 'better-sqlite3'

import { Entry_groupEntity } from '../types/domains/Entry_gourp';

export function createEntryGroupRepository(db: Database) {
  return {
    async findByEventId(id: number): Promise<Entry_groupEntity | null> {
      const result = await db.prepare('SELECT * FROM t_entries_group WHERE f_event_id = ?').bind(id).get() as Entry_groupEntity | undefined;

      if (!result) {
        return null;
      }

      return {
        f_event_id: result.f_event_id as number,
        f_seq: result.f_seq as number,
        f_place: result.f_place as string,
        f_gather_time: result.f_gather_time as string | null,
      };
    },
  };
}
