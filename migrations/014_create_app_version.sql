-- マイグレーション: アプリバージョン管理テーブル作成
-- Migration: Create app_version table

CREATE TABLE IF NOT EXISTS m_app_version (
    f_id INTEGER PRIMARY KEY DEFAULT 1, -- 常に1行のみ（シングルトン）
    f_version TEXT NOT NULL,            -- 現在のバージョン (例: "25.1.0")
    f_updated_at TEXT NOT NULL          -- 更新日時 (ISO8601)
) STRICT;

-- 初期データ挿入
INSERT INTO m_app_version (f_id, f_version, f_updated_at)
VALUES (1, '25.1.0', datetime('now'))
ON CONFLICT(f_id) DO NOTHING;
