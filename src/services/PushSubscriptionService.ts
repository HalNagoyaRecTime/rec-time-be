// src/services/PushSubscriptionService.ts

import { D1Database } from '@cloudflare/workers-types';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface SaveSubscriptionParams {
  studentNum: string;
  subscription: PushSubscriptionData;
  userAgent?: string;
  platform?: string;
}

export function createPushSubscriptionService(db: D1Database) {
  return {
    /**
     * プッシュ購読情報を保存
     */
    async saveSubscription(params: SaveSubscriptionParams): Promise<void> {
      const { studentNum, subscription, userAgent, platform } = params;

      // 既存の購読情報を削除（同じエンドポイントが存在する場合）
      await db
        .prepare('DELETE FROM push_subscriptions WHERE endpoint = ?')
        .bind(subscription.endpoint)
        .run();

      // 新しい購読情報を挿入
      await db
        .prepare(
          `INSERT INTO push_subscriptions 
           (student_num, endpoint, p256dh_key, auth_key, user_agent, platform, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
        )
        .bind(
          studentNum,
          subscription.endpoint,
          subscription.keys.p256dh,
          subscription.keys.auth,
          userAgent || null,
          platform || null
        )
        .run();
    },

    /**
     * プッシュ購読情報を削除
     */
    async deleteSubscription(endpoint: string): Promise<void> {
      await db
        .prepare('DELETE FROM push_subscriptions WHERE endpoint = ?')
        .bind(endpoint)
        .run();
    },

    /**
     * 学生のプッシュ購読情報を取得
     */
    async getSubscriptionsByStudentNum(studentNum: string): Promise<PushSubscriptionData[]> {
      const result = await db
        .prepare(
          'SELECT endpoint, p256dh_key, auth_key FROM push_subscriptions WHERE student_num = ?'
        )
        .bind(studentNum)
        .all();

      return (result.results || []).map((row: any) => ({
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh_key,
          auth: row.auth_key,
        },
      }));
    },

    /**
     * 全てのプッシュ購読情報を取得（管理用）
     */
    async getAllSubscriptions(): Promise<any[]> {
      const result = await db
        .prepare('SELECT * FROM push_subscriptions ORDER BY created_at DESC')
        .all();

      return result.results || [];
    },
  };
}

export type PushSubscriptionServiceFunctions = ReturnType<
  typeof createPushSubscriptionService
>;
