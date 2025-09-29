// src/lib/d1Compat.ts
import type BetterSqlite3 from 'better-sqlite3';

type D1LikeStmt = {
  bind: (...args: any[]) => {
    all: () => { results: any[] };
    first: () => any | null;
    run: () => { success: boolean };
  };
};

export type D1Like = {
  prepare: (sql: string) => D1LikeStmt;
};

export function createD1Compat(db: BetterSqlite3.Database): D1Like {
  return {
    prepare(sql: string): D1LikeStmt {
      const stmt = db.prepare(sql);
      return {
        bind: (...args: any[]) => ({
          all: () => {
            const rows = stmt.all(...args);
            return { results: rows ?? [] };
          },
          first: () => {
            const row = stmt.get(...args);
            return row ?? null;
          },
          run: () => {
            stmt.run(...args);
            return { success: true };
          },
        }),
      };
    },
  };
}
