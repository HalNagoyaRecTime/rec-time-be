-- ============================================
-- FCM 토큰 저장 테이블 (fcm_tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS fcm_tokens (
  token TEXT PRIMARY KEY,           -- FCM 토큰 (고유키)
  registered_at TEXT NOT NULL,      -- 등록일시 (ISO8601)
  last_used TEXT NOT NULL           -- 마지막 사용일시 (ISO8601)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_last_used ON fcm_tokens(last_used);
