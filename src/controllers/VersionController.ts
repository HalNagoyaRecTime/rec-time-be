// src/controllers/VersionController.ts
import { Context } from 'hono';
import { ControllerFunction } from '../types/controllers';

/**
 * アプリケーションバージョン情報を返すコントローラー
 * フロントエンドの自動更新チェックに使用
 * データベースから動的に取得（コード変更不要）
 */
export interface VersionControllerFunctions {
    getVersion: ControllerFunction;
}

export function createVersionController(): VersionControllerFunctions {
    return {
        /**
         * GET /api/version
         * DBからバージョン情報を取得して返す
         */
        getVersion: async (c: Context) => {
            try {
                const db = c.get('db');
                
                // DBから最新バージョンを取得
                const result = await db
                    .prepare('SELECT f_version, f_updated_at FROM m_app_version WHERE f_id = 1')
                    .first();
                
                if (!result) {
                    // 念のため初期値を返す
                    const now = new Date();
                    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9
                    const formatted = jst.toISOString().replace('T', ' ').substring(0, 19) + ' JST';
                    return c.json({
                        version: "25.1.0",
                        updated_at: formatted,
                    });
                }
                
                // ISO8601形式（UTC）を日本時間（JST = UTC+9）に変換
                const utcDate = new Date(result.f_updated_at as string);
                const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
                const formattedDate = jstDate.toISOString().replace('T', ' ').substring(0, 19) + ' JST';
                
                return c.json({
                    version: result.f_version as string,
                    updated_at: formattedDate, // 例: "2025-01-25 04:29:09 JST"
                });
            } catch (error) {
                console.error('[VersionController] getVersion error:', error);
                // エラー時はフォールバック
                const now = new Date();
                const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9
                const formatted = jst.toISOString().replace('T', ' ').substring(0, 19) + ' JST';
                return c.json({
                    version: "25.1.0",
                    updated_at: formatted,
                }, 500);
            }
        },
    };
}
