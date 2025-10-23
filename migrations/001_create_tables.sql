-- 学生テーブル
CREATE TABLE IF NOT EXISTS m_students (
  f_student_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_student_num TEXT NOT NULL UNIQUE,
  f_class TEXT NOT NULL,
  f_number TEXT NOT NULL,
  f_name TEXT NOT NULL,
  f_note TEXT,
  f_birthday TEXT          -- ✅ 생년월일 컬럼 추가
);

-- イベントテーブル
CREATE TABLE IF NOT EXISTS t_events (
  f_event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_event_code TEXT NOT NULL,
  f_event_name TEXT NOT NULL,
  f_time TEXT NOT NULL,
  f_duration INTEGER,
  f_place TEXT,         -- 開催場所
  f_gather_time TEXT,   -- 集合時間
  f_summary TEXT
);

-- 出場テーブル
CREATE TABLE IF NOT EXISTS t_entries (
  f_entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_student_id INTEGER NOT NULL,
  f_event_id INTEGER NOT NULL,
  f_seq INTEGER NOT NULL
  -- Foreign Key 제거: 데이터 입력 유연성을 위해 제거
  -- 데이터 무결성은 애플리케이션 레벨에서 검증
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

-- メタデータテーブル
CREATE TABLE IF NOT EXISTS t_meta (
  f_key TEXT PRIMARY KEY,
  f_value TEXT NOT NULL
);

-- ダウンロードログテーブル
CREATE TABLE IF NOT EXISTS download_logs (
  f_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  f_student_num TEXT NOT NULL,
  f_datetime TEXT NOT NULL,
  f_function TEXT NOT NULL,
  f_success TEXT NOT NULL,
  f_count INTEGER
);

-- ========================================
-- 데이터 무결성 검증용 쿼리들
-- ========================================

-- 1. 존재하지 않는 학생 ID로 등록된 출전 찾기
-- SELECT
--   te.f_entry_id,
--   te.f_student_id,
--   te.f_event_id,
--   te.f_seq
-- FROM t_entries te
-- LEFT JOIN m_students ms ON te.f_student_id = ms.f_student_id
-- WHERE ms.f_student_id IS NULL;

-- 2. 존재하지 않는 이벤트 ID로 등록된 출전 찾기
-- SELECT
--   te.f_entry_id,
--   te.f_student_id,
--   te.f_event_id,
--   te.f_seq
-- FROM t_entries te
-- LEFT JOIN t_events ev ON te.f_event_id = ev.f_event_id
-- WHERE ev.f_event_id IS NULL;

-- 3. 중복된 출전 등록 찾기 (같은 학생이 같은 이벤트에 중복 등록)
-- SELECT
--   f_student_id,
--   f_event_id,
--   COUNT(*) as duplicate_count
-- FROM t_entries
-- GROUP BY f_student_id, f_event_id
-- HAVING COUNT(*) > 1;
