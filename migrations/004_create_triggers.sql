-- Create triggers to automatically update updatedAt timestamps

-- Trigger for Student table
CREATE TRIGGER IF NOT EXISTS update_student_updated_at
    AFTER UPDATE ON Student
    FOR EACH ROW
    WHEN NEW.updatedAt = OLD.updatedAt
BEGIN
    UPDATE Student SET updatedAt = CURRENT_TIMESTAMP WHERE studentId = NEW.studentId;
END;

-- Trigger for Recreation table
CREATE TRIGGER IF NOT EXISTS update_recreation_updated_at
    AFTER UPDATE ON Recreation
    FOR EACH ROW
    WHEN NEW.updatedAt = OLD.updatedAt
BEGIN
    UPDATE Recreation SET updatedAt = CURRENT_TIMESTAMP WHERE recreationId = NEW.recreationId;
END;

-- Trigger for Participation table
CREATE TRIGGER IF NOT EXISTS update_participation_updated_at
    AFTER UPDATE ON Participation
    FOR EACH ROW
    WHEN NEW.updatedAt = OLD.updatedAt
BEGIN
    UPDATE Participation SET updatedAt = CURRENT_TIMESTAMP WHERE participationId = NEW.participationId;
END;