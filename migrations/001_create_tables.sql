-- 001_create_tables.sql

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
  f_summary TEXT
);

-- 出場テーブル
CREATE TABLE IF NOT EXISTS t_entries (
  f_entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_student_id INTEGER NOT NULL,
  f_event_id INTEGER NOT NULL,
  FOREIGN KEY (f_student_id) REFERENCES m_students(f_student_id),
  FOREIGN KEY (f_event_id) REFERENCES t_events(f_event_id)
);

-- 出場グループテーブル
CREATE TABLE IF NOT EXISTS t_entry_groups (
  f_entry_group_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_event_id INTEGER NOT NULL,
  f_group_name TEXT NOT NULL,
  FOREIGN KEY (f_event_id) REFERENCES t_events(f_event_id)
);

-- 通知履歴テーブル
CREATE TABLE IF NOT EXISTS t_notifications (
  f_notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_target_student_id INTEGER NOT NULL,
  f_message TEXT NOT NULL,
  f_sent_at TEXT NOT NULL,
  FOREIGN KEY (f_target_student_id) REFERENCES m_students(f_student_id)
);

-- 変更履歴テーブル
CREATE TABLE IF NOT EXISTS t_change_logs (
  f_change_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_table_name TEXT NOT NULL,
  f_record_id INTEGER NOT NULL,
  f_change_type TEXT NOT NULL CHECK (f_change_type IN ('INSERT', 'UPDATE', 'DELETE')),
  f_changed_at TEXT NOT NULL,
  f_changed_by TEXT NOT NULL
);
