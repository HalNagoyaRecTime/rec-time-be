-- Insert sample data for testing

-- Sample Students
INSERT OR IGNORE INTO Student (classCode, attendanceNumber, name) VALUES
('2A', 1, '田中太郎'),
('2A', 2, '佐藤花子'),
('2B', 1, '山田次郎'),
('2B', 2, '鈴木美咲'),
('3A', 1, '高橋健太'),
('3A', 2, '伊藤愛美');

-- Sample Recreations
INSERT OR IGNORE INTO Recreation (title, description, location, startTime, endTime, maxParticipants, status) VALUES
('春の運動会', '年に一度の大運動会です', '学校グラウンド', 1000, 1600, 200, 'scheduled'),
('文化祭', '各クラスの出し物を楽しもう', '学校全体', 0900, 1700, 500, 'scheduled'),
('体育祭', 'クラス対抗の競技大会', '体育館', 1300, 1700, 150, 'scheduled'),
('音楽発表会', '合唱コンクール', '音楽室', 1400, 1600, 100, 'completed');

-- Sample Participations
INSERT OR IGNORE INTO Participation (studentId, recreationId, status) VALUES
(1, 1, 'registered'),
(1, 2, 'confirmed'),
(2, 1, 'registered'),
(3, 1, 'registered'),
(4, 2, 'registered'),
(5, 3, 'confirmed'),
(6, 4, 'cancelled');