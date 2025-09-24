function transformToEntryEntity(raw) {
    return {
        f_entry_id: raw.f_entry_id,
        f_student_id: raw.f_student_id,
        f_event_id: raw.f_event_id,
    };
}
export function createEntryRepository(db) {
    return {
        async findAll(options) {
            const conditions = [];
            const params = [];
            if (options.f_student_id) {
                conditions.push('f_student_id = ?');
                params.push(options.f_student_id);
            }
            if (options.f_event_id) {
                conditions.push('f_event_id = ?');
                params.push(options.f_event_id);
            }
            const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
            let query = `SELECT * FROM t_entries ${whereClause} ORDER BY f_entry_id`;
            if (options.limit) {
                query += ` LIMIT ${options.limit}`;
            }
            if (options.offset) {
                query += ` OFFSET ${options.offset}`;
            }
            const countQuery = `SELECT COUNT(*) as total FROM t_entries ${whereClause}`;
            const [entries, totalResult] = await Promise.all([
                db.prepare(query).bind(...params).all(),
                db.prepare(countQuery).bind(...params).first()
            ]);
            return {
                entries: entries.results.map(transformToEntryEntity),
                total: totalResult?.total || 0
            };
        },
        async findById(id) {
            const result = await db.prepare('SELECT * FROM t_entries WHERE f_entry_id = ?').bind(id).first();
            if (!result) {
                return null;
            }
            return transformToEntryEntity(result);
        },
        async findByStudentId(studentId) {
            const result = await db.prepare('SELECT * FROM t_entries WHERE f_student_id = ?').bind(studentId).all();
            return result.results.map(transformToEntryEntity);
        },
        async findByEventId(eventId) {
            const result = await db.prepare('SELECT * FROM t_entries WHERE f_event_id = ?').bind(eventId).all();
            return result.results.map(transformToEntryEntity);
        },
        async findByStudentAndEvent(studentId, eventId) {
            const result = await db.prepare('SELECT * FROM t_entries WHERE f_student_id = ? AND f_event_id = ?').bind(studentId, eventId).first();
            if (!result) {
                return null;
            }
            return transformToEntryEntity(result);
        },
        async create(studentId, eventId) {
            const result = await db.prepare('INSERT INTO t_entries (f_student_id, f_event_id) VALUES (?, ?) RETURNING *').bind(studentId, eventId).first();
            return transformToEntryEntity(result);
        },
        async delete(id) {
            const result = await db.prepare('DELETE FROM t_entries WHERE f_entry_id = ?').bind(id).run();
            return result.success;
        },
    };
}
