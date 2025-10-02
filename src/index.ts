import { Hono } from 'hono';
import { Bindings } from './types';
import { ControllerMap } from './types/context';
import { getDIContainer } from './di/container';

const app = new Hono<{
  Bindings: Bindings;
  Variables: ControllerMap & { db: D1Database };
}>();

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

export default {
  fetch: app.fetch,
};
