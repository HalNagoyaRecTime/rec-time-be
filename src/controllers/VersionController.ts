// src/controllers/VersionController.ts
import {Context} from 'hono';
import {ControllerFunction} from '../types/controllers';

/**
 * アプリケーションバージョン情報を返すコントローラー
 * フロントエンドの自動更新チェックに使用
 * データベースから動的に取得（コード変更不要）
 */
export interface VersionControllerFunctions {
    getLatestVersion: ControllerFunction;
    getVersionDetail: ControllerFunction;
}

/**
 * UTC → JST変換ユーティリティ
 */
function formatToJST(utcDateString: string): string {
    const utcDate = new Date(utcDateString);
    const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    return jstDate.toISOString().replace('T', ' ').substring(0, 19) + ' JST';
}

export function createVersionController(): VersionControllerFunctions {
    return {
        /**
         * GET /api/version/latest
         * 最新バージョン番号のみを返す（更新確認用・アナリティクス用）
         */
        getLatestVersion: async (c: Context) => {
            try {
                const db = c.get('db');

                // 現在のバージョンを取得
                const current = await db
                    .prepare('SELECT f_version FROM m_app_version WHERE f_id = 1')
                    .first();

                if (!current) {
                    return c.json({
                        version: "25.1.0",
                    });
                }

                return c.json({
                    version: current.f_version as string,
                });
            } catch (error) {
                console.error('[VersionController] getLatestVersion error:', error);
                return c.json({
                    version: "25.1.0",
                }, 500);
            }
        },

        /**
         * GET /api/version/detail/:version
         * 指定バージョンの詳細情報を返す（バージョン名、更新日時、更新内容）
         * アナリティクスで内容確認をトラッキング可能
         */
        getVersionDetail: async (c: Context) => {
            try {
                const db = c.get('db');
                const requestedVersion = c.req.param('version');

                // 特定バージョンの履歴を取得
                const versionHistory = await db
                    .prepare('SELECT f_version, f_updated_at, f_message FROM t_version_history WHERE f_version = ? ORDER BY f_id DESC LIMIT 1')
                    .bind(requestedVersion)
                    .first();

                if (!versionHistory) {
                    return c.json({
                        error: "指定されたバージョンが見つかりません",
                    }, 404);
                }

                return c.json({
                    version: versionHistory.f_version as string,
                    updated_at: formatToJST(versionHistory.f_updated_at as string),
                    message: (versionHistory.f_message as string) || "更新情報なし",
                });
            } catch (error) {
                console.error('[VersionController] getVersionDetail error:', error);
                return c.json({
                    error: "エラーが発生しました",
                }, 500);
            }
        },
    };
}
