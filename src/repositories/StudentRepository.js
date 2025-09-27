// export function createStudentRepository(db) {
//     return {
//         async findById(id) {
//             const result = await db.prepare('SELECT * FROM m_students WHERE f_student_id = ?').bind(id).first();
//             if (!result) {
//                 return null;
//             }
//             // Transform raw database result to typed entity
//             return {
//                 f_student_id: result.f_student_id,
//                 f_student_num: result.f_student_num,
//                 f_class: result.f_class,
//                 f_number: result.f_number,
//                 f_name: result.f_name,
//                 f_note: result.f_note,
//             };
//         },
//         async findAll() {
//             const result = await db.prepare('SELECT * FROM m_students ORDER BY f_student_num').all();
//             return result.results.map(row => ({
//                 f_student_id: row.f_student_id,
//                 f_student_num: row.f_student_num,
//                 f_class: row.f_class,
//                 f_number: row.f_number,
//                 f_name: row.f_name,
//                 f_note: row.f_note,
//             }));
//         },
//         async findByStudentNum(studentNum) {
//             const result = await db.prepare('SELECT * FROM m_students WHERE f_student_num = ?').bind(studentNum).first();
//             if (!result) {
//                 return null;
//             }
//             return {
//                 f_student_id: result.f_student_id,
//                 f_student_num: result.f_student_num,
//                 f_class: result.f_class,
//                 f_number: result.f_number,
//                 f_name: result.f_name,
//                 f_note: result.f_note,
//             };
//         },
//     };
// }
