export * from './domains'; // ← 타입 정의들 (예: Student, Event 등)

export type Bindings = {
  DB: D1Database;
  NODE_ENV: string;
};
