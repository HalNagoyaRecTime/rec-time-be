// import { D1Database } from '@cloudflare/workers-types';

// type Env = {
//   DB: D1Database;
// };

import type { Database } from 'better-sqlite3';

type Env = {
  DB: Database;
};

export function getDb(env?: Env): Database {
  if (!env?.DB) {
    throw new Error('DB binding not found. Make sure to run with wrangler dev or deploy to Cloudflare Workers.');
  }
  return env.DB;
}
