-- 学生テーブル
CREATE TABLE IF NOT EXISTS m_students (
  f_student_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_student_num TEXT NOT NULL UNIQUE,
  f_class TEXT NOT NULL,
  f_number TEXT NOT NULL,
  f_name TEXT NOT NULL,
  f_note TEXT
);

-- イベントテーブル
CREATE TABLE IF NOT EXISTS t_events (
  f_event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_event_code TEXT NOT NULL,
  f_event_name TEXT NOT NULL,
  f_time TEXT NOT NULL,
  f_duration INTEGER,
  f_place TEXT,         -- ✅ 追加: 開催場所
  f_gather_time TEXT,   -- ✅ 追加: 集合時間
  f_summary TEXT
);

-- 出場テーブル
CREATE TABLE IF NOT EXISTS t_entries (
  f_entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_student_id INTEGER NOT NULL,
  f_event_id INTEGER NOT NULL,
  f_seq INTEGER NOT NULL
);

-- 出場グループテーブル
CREATE TABLE IF NOT EXISTS t_entries_group (
  f_event_id INTEGER NOT NULL,
  f_seq INTEGER NOT NULL,
  f_place TEXT,
  f_gather_time TEXT,
  PRIMARY KEY (f_event_id, f_seq)
);

-- 通知履歴テーブル
CREATE TABLE IF NOT EXISTS t_notifs (
  f_notif_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_type TEXT NOT NULL,
  f_target TEXT NOT NULL,
  f_event_id INTEGER,
  f_title TEXT NOT NULL,
  f_body TEXT NOT NULL,
  f_sent_at TEXT NOT NULL
);

-- 変更履歴テーブル
CREATE TABLE IF NOT EXISTS t_update (
  f_update_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_event_id INTEGER NOT NULL,
  f_updated_item TEXT NOT NULL,
  f_before TEXT,
  f_after TEXT,
  f_updated_at TEXT,
  f_reason TEXT
);
