-- マイグレーション: アプリバージョン管理テーブル作成
-- Migration: Create app_version table

CREATE TABLE IF NOT EXISTS m_app_version (
    f_id INTEGER PRIMARY KEY DEFAULT 1, -- 常に1行のみ（シングルトン）
    f_version TEXT NOT NULL,            -- 現在のバージョン (例: "25.1.0")
    f_updated_at TEXT NOT NULL          -- 更新日時 (ISO8601)
) STRICT;

-- バージョン履歴テーブル（過去のバージョンを保存）
CREATE TABLE IF NOT EXISTS t_version_history (
    f_id INTEGER PRIMARY KEY AUTOINCREMENT,
    f_version TEXT NOT NULL,                -- バージョン番号
    f_message TEXT,                         -- 変更メッセージ（リリースノート）
    f_released_at TEXT NOT NULL,            -- リリース日時 (ISO8601)
    f_created_at TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

-- 現在のバージョン初期データ
INSERT INTO m_app_version (f_id, f_version, f_updated_at)
VALUES (1, '25.1.0', datetime('now'))
ON CONFLICT(f_id) DO NOTHING;

-- バージョン履歴の初期データ
INSERT INTO t_version_history (f_version, f_message, f_released_at)
VALUES ('25.1.0', '自動更新機能を追加、バージョン管理システムの実装、リリースノート表示機能、キャッシュ管理の改善', datetime('now'))
ON CONFLICT DO NOTHING;
