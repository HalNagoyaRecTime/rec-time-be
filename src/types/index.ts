import type { D1Database } from '@cloudflare/workers-types'; // ✅ 추가
import type { ReactNode } from 'react'; // ✅ Route 타입에서 사용하려면 필요

export * from './domains'; // ← Student, Event 등 정의들

export type Bindings = {
  DB: D1Database;
  NODE_ENV: string;
};

// ✅ Route 타입 정의 (PWA 루트에서 사용 가능)
export type Route = {
  path: string;
  element: ReactNode;
};
