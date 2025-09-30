-- ============================================
-- 通知履歴テーブル (t_notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS t_notifications (
  f_notif_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_type TEXT NOT NULL,       -- 通知の種類 (例: push, email)
  f_target TEXT NOT NULL,     -- 対象 (学生番号や全員など)
  f_event_id INTEGER,         -- 関連イベント (NULL可)
  f_title TEXT NOT NULL,      -- 通知タイトル
  f_body TEXT NOT NULL,       -- 通知本文
  f_sent_at TEXT NOT NULL     -- 送信日時 (ISO8601文字列)
);

-- ============================================
-- 変更履歴テーブル (t_change_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS t_change_logs (
  f_update_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_event_id INTEGER NOT NULL,   -- 対象イベントID
  f_updated_item TEXT NOT NULL,  -- 更新項目 (例: 時間, 場所)
  f_before TEXT,                 -- 更新前の値
  f_after TEXT,                  -- 更新後の値
  f_updated_at TEXT,             -- 更新日時 (ISO8601文字列)
  f_reason TEXT                  -- 変更理由
);
