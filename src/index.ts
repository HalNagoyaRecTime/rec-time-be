// src/index.ts
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
  // DI 컨테이너 생성
  const { db, ...controllers } = getDIContainer(c.env);

  // 컨트롤러들을 context 에 주입
  Object.entries(controllers).forEach(([key, value]) => {
    c.set(key as keyof ControllerMap, value);
  });

  // DB 핸들 context에 등록 (필요시)
  c.set('db', db);

  // CORS 헤더 추가 (프론트와 분리된 경우 필요)
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Preflight (CORS) OPTIONS 대응
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

// 학생 단건 조회
api.get('/students/by-student-num/:studentNum', c =>
  c.get('studentController').getStudentByStudentNum(c)
);

// 학생 + 이벤트 (내 출전 여부 포함)
api.get('/students/payload/:studentNum', c =>
  c.get('studentController').getStudentPayloadByStudentNum(c)
);

// 학생 + 이벤트 + 엔트리 + 그룹 + 알림 + 변경 로그 (풀 페이로드)
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
