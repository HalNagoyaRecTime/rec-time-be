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
                
                // 現在のバージョンを取得
                const current = await db
                    .prepare('SELECT f_version, f_updated_at FROM m_app_version WHERE f_id = 1')
                    .first();
                
                if (!current) {
                    return c.json({
                        version: "25.1.0",
                        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' JST',
                        message: "システムエラー",
                    });
                }
                
                // 該当バージョンの変更メッセージを取得
                const history = await db
                    .prepare('SELECT f_message FROM t_version_history WHERE f_version = ? ORDER BY f_id DESC LIMIT 1')
                    .bind(current.f_version)
                    .first();
                
                // UTC → JST変換
                const utcDate = new Date(current.f_updated_at as string);
                const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
                const formattedDate = jstDate.toISOString().replace('T', ' ').substring(0, 19) + ' JST';
                
                return c.json({
                    version: current.f_version as string,
                    updated_at: formattedDate,
                    message: (history?.f_message as string) || "更新情報なし",
                });
            } catch (error) {
                console.error('[VersionController] getVersion error:', error);
                const now = new Date();
                const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
                const formatted = jst.toISOString().replace('T', ' ').substring(0, 19) + ' JST';
                return c.json({
                    version: "25.1.0",
                    updated_at: formatted,
                    message: "エラーが発生しました",
                }, 500);
            }
        },
    };
}
