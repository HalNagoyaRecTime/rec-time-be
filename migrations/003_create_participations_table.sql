-- Create Participations table
CREATE TABLE IF NOT EXISTS Participation (
    participationId INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId INTEGER NOT NULL,
    recreationId INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled')),
    registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES Student(studentId) ON DELETE CASCADE,
    FOREIGN KEY (recreationId) REFERENCES Recreation(recreationId) ON DELETE CASCADE,
    UNIQUE(studentId, recreationId)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_participation_student ON Participation(studentId);
CREATE INDEX IF NOT EXISTS idx_participation_recreation ON Participation(recreationId);
CREATE INDEX IF NOT EXISTS idx_participation_status ON Participation(status);