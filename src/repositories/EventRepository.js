function buildWhereClause(options) {
    const conditions = [];
    const params = [];
    if (options.f_event_code) {
        conditions.push('f_event_code = ?');
        params.push(options.f_event_code);
    }
    if (options.f_time) {
        conditions.push('f_time = ?');
        params.push(options.f_time);
    }
    return {
        whereClause: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
        params,
    };
}
function transformToEventEntity(raw) {
    return {
        f_event_id: raw.f_event_id,
        f_event_code: raw.f_event_code,
        f_event_name: raw.f_event_name,
        f_time: raw.f_time,
        f_duration: raw.f_duration,
        f_place: raw.f_place,
        f_gather_time: raw.f_gather_time,
        f_summary: raw.f_summary,
    };
}
export function createEventRepository(db) {
    return {
        async findAll(options) {
            const { whereClause, params } = buildWhereClause(options);
            let query = `
        SELECT e.*,
               COUNT(en.f_entry_id) as entry_count
        FROM t_events e
        LEFT JOIN t_entries en ON e.f_event_id = en.f_event_id
        ${whereClause}
        GROUP BY e.f_event_id
        ORDER BY e.f_time ASC
      `;
            if (options.limit) {
                query += ` LIMIT ${options.limit}`;
            }
            if (options.offset) {
                query += ` OFFSET ${options.offset}`;
            }
            const countQuery = `SELECT COUNT(*) as total FROM t_events ${whereClause}`;
            const [events, totalResult] = await Promise.all([
                db.prepare(query).bind(...params).all(),
                db.prepare(countQuery).bind(...params).first()
            ]);
            return {
                events: events.results.map(transformToEventEntity),
                total: totalResult?.total || 0
            };
        },
        async findByIdWithEntryCount(id) {
            const query = `
        SELECT e.*,
               COUNT(en.f_entry_id) as entry_count
        FROM t_events e
        LEFT JOIN t_entries en ON e.f_event_id = en.f_event_id
        WHERE e.f_event_id = ?
        GROUP BY e.f_event_id
      `;
            const result = await db.prepare(query).bind(id).first();
            if (!result) {
                return null;
            }
            return transformToEventEntity(result);
        },
        async findById(id) {
            const result = await db.prepare('SELECT * FROM t_events WHERE f_event_id = ?').bind(id).first();
            if (!result) {
                return null;
            }
            return transformToEventEntity(result);
        },
        async findByEventCode(eventCode) {
            const result = await db.prepare('SELECT * FROM t_events WHERE f_event_code = ?').bind(eventCode).first();
            if (!result) {
                return null;
            }
            return transformToEventEntity(result);
        },
    };
}
