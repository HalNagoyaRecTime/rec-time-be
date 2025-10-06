import type { D1Database } from '@cloudflare/workers-types';

export * from './domains';

export type Bindings = {
  DB: D1Database;
  NODE_ENV: string;
  RESEND_API_KEY?: string;
};
