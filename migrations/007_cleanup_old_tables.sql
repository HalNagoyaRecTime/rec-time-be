-- マイグレーション: 古いスキーマのテーブルを削除
PRAGMA foreign_keys=OFF;

-- 古いテーブル構造を削除
-- 新しいスキーマ以外のテーブルをすべて削除
DROP TABLE IF EXISTS Participation;
DROP TABLE IF EXISTS Recreation;
DROP TABLE IF EXISTS Student;

-- もし他の古いテーブルが存在する場合も削除
-- (プロジェクトの履歴に基づいて追加)
DROP TABLE IF EXISTS recreations;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS participations;

-- 古いインデックスがあれば削除
DROP INDEX IF EXISTS idx_recreation_id;
DROP INDEX IF EXISTS idx_student_id;
DROP INDEX IF EXISTS idx_participation_student;
DROP INDEX IF EXISTS idx_participation_recreation;

PRAGMA foreign_keys=ON;
