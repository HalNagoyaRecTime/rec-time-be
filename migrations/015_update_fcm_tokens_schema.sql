-- ============================================
-- FCM 토큰 테이블 스키마 업데이트 (학번 연동)
-- ============================================

-- 기존 테이블 삭제 후 재생성
DROP TABLE IF EXISTS fcm_tokens;

-- 새로운 FCM 토큰 테이블 생성
CREATE TABLE fcm_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_num TEXT NOT NULL,                    -- 학번 (학생 식별)
  token TEXT NOT NULL UNIQUE,                   -- FCM 디바이스 토큰
  device_info TEXT,                             -- 디바이스 정보 (JSON)
  registered_at TEXT NOT NULL,                  -- 등록일시 (ISO8601)
  last_used TEXT,                               -- 마지막 사용일시 (ISO8601)
  is_active INTEGER DEFAULT 1,                  -- 활성 상태 (0: 비활성, 1: 활성)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,    -- 생성일시
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP     -- 수정일시
);

-- 인덱스 생성
CREATE INDEX idx_fcm_tokens_student_num ON fcm_tokens(student_num);
CREATE INDEX idx_fcm_tokens_active ON fcm_tokens(is_active);
CREATE INDEX idx_fcm_tokens_token ON fcm_tokens(token);
CREATE INDEX idx_fcm_tokens_last_used ON fcm_tokens(last_used);

-- 알림 로그 테이블 생성
CREATE TABLE notification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_num TEXT NOT NULL,                    -- 학번
  token TEXT NOT NULL,                          -- FCM 토큰
  title TEXT NOT NULL,                          -- 알림 제목
  body TEXT NOT NULL,                           -- 알림 내용
  sent_at TEXT NOT NULL,                        -- 전송일시 (ISO8601)
  success INTEGER DEFAULT 0,                    -- 성공 여부 (0: 실패, 1: 성공)
  error_message TEXT,                           -- 에러 메시지
  notification_type TEXT,                        -- 알림 타입 (event_reminder, event_start, test, etc.)
  event_id TEXT,                                -- 이벤트 ID (선택사항)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP     -- 생성일시
);

-- 알림 로그 인덱스
CREATE INDEX idx_notification_logs_student_num ON notification_logs(student_num);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX idx_notification_logs_success ON notification_logs(success);
CREATE INDEX idx_notification_logs_type ON notification_logs(notification_type);
