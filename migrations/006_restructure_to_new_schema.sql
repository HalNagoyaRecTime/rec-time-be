-- マイグレーション: 新しいテーブル構造に変更
PRAGMA foreign_keys=ON;

-- 既存テーブルを削除
DROP TABLE IF EXISTS Participation;
DROP TABLE IF EXISTS Recreation;
DROP TABLE IF EXISTS Student;

-- 学生マスター(アップロードされたm_student.jsonのキーをそのまま使用)
CREATE TABLE IF NOT EXISTS m_student (
  f_student_id   INTEGER PRIMARY KEY,
  f_student_num  TEXT NOT NULL,
  f_class        TEXT NOT NULL,
  f_number       TEXT NOT NULL,
  f_name         TEXT NOT NULL,
  f_note         TEXT
);

-- イベントマスター(t_events.json構造)
CREATE TABLE IF NOT EXISTS t_events (
  f_event_id     INTEGER PRIMARY KEY,
  f_event_code   TEXT NOT NULL,
  f_event_name   TEXT NOT NULL,
  f_time         TEXT NOT NULL,      -- 「0930」などHHMM文字列
  f_duration     TEXT NOT NULL,      -- 「20」等分単位文字列
  f_place        TEXT NOT NULL,
  f_gather_time  TEXT NOT NULL,
  f_summary      TEXT
);

-- 参加マッピング (t_entries.json 構造)
CREATE TABLE IF NOT EXISTS t_entries (
  f_entry_id     INTEGER PRIMARY KEY,
  f_student_id   INTEGER NOT NULL,
  f_event_id     INTEGER NOT NULL,
  FOREIGN KEY (f_student_id) REFERENCES m_student(f_student_id) ON DELETE CASCADE,
  FOREIGN KEY (f_event_id)  REFERENCES t_events(f_event_id)    ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_m_student_num ON m_student(f_student_num);
CREATE INDEX IF NOT EXISTS idx_m_student_class ON m_student(f_class);
CREATE INDEX IF NOT EXISTS idx_t_events_code ON t_events(f_event_code);
CREATE INDEX IF NOT EXISTS idx_t_events_time ON t_events(f_time);
CREATE INDEX IF NOT EXISTS idx_t_entries_student ON t_entries(f_student_id);
CREATE INDEX IF NOT EXISTS idx_t_entries_event ON t_entries(f_event_id);