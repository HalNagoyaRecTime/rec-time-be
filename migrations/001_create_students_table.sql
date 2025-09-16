-- Create Students table
CREATE TABLE IF NOT EXISTS Student (
    studentId INTEGER PRIMARY KEY AUTOINCREMENT,
    classCode TEXT NOT NULL,
    attendanceNumber INTEGER NOT NULL,
    name TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(classCode, attendanceNumber)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_student_class_attendance ON Student(classCode, attendanceNumber);