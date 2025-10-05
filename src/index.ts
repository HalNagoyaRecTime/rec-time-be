import { Hono } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { Bindings } from './types';
import { ControllerMap } from './types/context';
import { getDIContainer } from './di/container';
import { cors } from 'hono/cors'; // ✅ 추가

const app = new Hono<{
  Bindings: Bindings;
  Variables: ControllerMap & { db: D1Database };
}>();

// ================================
// 🌐 CORS (프론트/백 분리 환경 대응)
// ================================
app.use('*', cors({ origin: '*' }));

// ================================
// 공통 미들웨어
// ================================
app.use('*', async (c, next) => {
  const { db, ...controllers } = getDIContainer(c.env);

  Object.entries(controllers).forEach(([key, value]) => {
    c.set(key as keyof ControllerMap, value);
  });

  c.set('db', db);

  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
});

// ================================
// API prefix 붙이기
// ================================
const api = app.basePath('/api');

// Root
api.get('/', c => c.text('Hello from Cloudflare Worker 🚀'));

// Health check
api.get('/health', c =>
  c.json({ status: 'ok', time: new Date().toISOString() })
);

// ================================
// Students
// ================================
api.get('/students/by-student-num/:studentNum', c =>
  c.get('studentController').getStudentByStudentNum(c)
);
// 🔒 학번 + 생년월일 검증용
api.get('/students/by-student-num/:studentNum/birthday/:birthday', c =>
  c.get('studentController').getStudentByStudentNumAndBirthday(c)
);
api.get('/students/payload/:studentNum', c =>
  c.get('studentController').getStudentPayloadByStudentNum(c)
);
api.get('/students/full/:studentNum', c =>
  c.get('studentController').getStudentFullPayload(c)
);

// ================================
// Events
// ================================
api.get('/events', c => c.get('eventController').getAllEvents(c));
api.get('/events/:eventId', c => c.get('eventController').getEventById(c));

// ================================
// Entries
// ================================
api.get('/entries', c => c.get('entryController').getAllEntries(c));
api.get('/entries/:entryId', c => c.get('entryController').getEntryById(c));
api.get('/entries/by-student/:studentNum', c =>
  c.get('entryController').getEntriesByStudentNum(c)
);

// ✅ 알람용 엔트리 라우트
api.get('/entries/alarm/:studentNum', c =>
  c.get('entryController').getAlarmEntriesByStudentNum(c)
);

// ================================
// Entry Groups
// ================================
api.get('/entry-groups', c => c.get('entryGroupController').getAll(c));

// ================================
// Notifications
// ================================
api.get('/notifications', c => c.get('notificationController').getAll(c));

// ================================
// Change Logs
// ================================
api.get('/change-logs', c => c.get('changeLogController').getAll(c));

// ================================
// Data Update Check & Test Insert
// ================================
api.get('/data-update/info', c =>
  c.get('dataUpdateController').getUpdateInfo(c)
);
api.get('/data-update/check', c =>
  c.get('dataUpdateController').checkDataChanged(c)
);

// 🧪 테스트 데이터 추가용 (프론트의 “테스트데이터추가” 버튼 대응)
api.post('/data-update/insert-test-data', async c => {
  const db = c.get('db');

  try {
    // 더미 학생 추가
    await db
      .prepare(
        `
        INSERT INTO m_students (f_student_num, f_class, f_number, f_name, f_note, f_birthday)
        VALUES ('99999', 'TEST', '1', 'テスト 太郎', 'テスト用', '20000101');
      `
      )
      .run();

    // update_count 증가
    await db
      .prepare(
        `
        INSERT INTO t_meta (f_key, f_value)
        VALUES ('update_count', '1')
        ON CONFLICT(f_key)
        DO UPDATE SET f_value = CAST(f_value AS INTEGER) + 1;
      `
      )
      .run();

    return c.json({
      success: true,
      message: '🧪 Test data inserted & update_count incremented',
    });
  } catch (err) {
    console.error('Error inserting test data:', err);
    return c.json({ success: false, error: String(err) }, 500);
  }
});

export default {
  fetch: app.fetch,
};
