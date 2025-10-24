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
                    return c.json({
                        version: "25.1.0",
                        updated_at: new Date().toISOString(),
                    });
                }
                
                return c.json({
                    version: result.f_version as string,
                    updated_at: result.f_updated_at as string,
                });
            } catch (error) {
                console.error('[VersionController] getVersion error:', error);
                // エラー時はフォールバック
                return c.json({
                    version: "25.1.0",
                    updated_at: new Date().toISOString(),
                }, 500);
            }
        },
    };
}
