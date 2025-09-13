import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { D1Database } from '@cloudflare/workers-types';

type Env = {
  DB: D1Database;
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrisma(env?: Env): PrismaClient {
  // ローカル開発環境では常にSQLiteを使用
  // D1データベースが利用できない場合はSQLiteを使用
  if (!env?.DB) {
    return globalForPrisma.prisma ?? new PrismaClient();
  }

  // 本番のCloudflare Workers環境でD1を使用
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}

// ローカル開発用の既存エクスポート（後方互換性のため）
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
