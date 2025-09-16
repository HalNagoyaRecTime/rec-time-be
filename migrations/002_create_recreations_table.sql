-- Create Recreations table
CREATE TABLE IF NOT EXISTS Recreation (
    recreationId INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    startTime INTEGER NOT NULL, -- HHMM format (e.g., 0910)
    endTime INTEGER NOT NULL,   -- HHMM format (e.g., 1630)
    maxParticipants INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_recreation_status ON Recreation(status);
CREATE INDEX IF NOT EXISTS idx_recreation_start_time ON Recreation(startTime);
CREATE INDEX IF NOT EXISTS idx_recreation_end_time ON Recreation(endTime);