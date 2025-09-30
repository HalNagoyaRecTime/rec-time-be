-- 기존 엔트리 다 삭제
DELETE FROM t_entries WHERE f_student_id = 1;

-- 원하는 엔트리만 다시 삽입 (예: 開会式=2, 8人50mリレー=5)
INSERT INTO t_entries (f_student_id, f_event_id, f_seq) VALUES (1, 2, 1);
INSERT INTO t_entries (f_student_id, f_event_id, f_seq) VALUES (1, 5, 1);
