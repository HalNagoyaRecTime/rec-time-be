-- マイグレーション: アプリバージョン管理テーブル作成
-- Migration: Create app_version tables

CREATE TABLE IF NOT EXISTS m_app_version (
    f_id INTEGER PRIMARY KEY DEFAULT 1,
    f_version TEXT NOT NULL,
    f_updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS t_version_history (
    f_id INTEGER PRIMARY KEY AUTOINCREMENT,
    f_version TEXT NOT NULL,
    f_message TEXT,
    f_updated_at TEXT NOT NULL,
    f_created_at TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

-- 初期データ
INSERT INTO m_app_version (f_id, f_version, f_updated_at)
VALUES (1, '25.1.0', datetime('now'))
ON CONFLICT(f_id) DO NOTHING;

INSERT INTO t_version_history (f_version, f_message, f_updated_at)
VALUES ('25.1.0', '自動更新機能を追加、バージョン管理システムの実装、リリースノート表示機能、キャッシュ管理の改善', datetime('now'))
ON CONFLICT DO NOTHING;