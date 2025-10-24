// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { D1Database } from '@cloudflare/workers-types';

import { Bindings } from './types';
import { ControllerMap } from './types/context';
import { getDIContainer } from './di/container';
import { requestLogger, errorHandler } from './middleware/logging';
import { logger } from './utils/logger';

const app = new Hono<{
  Bindings: Bindings;
  Variables: ControllerMap & { db: D1Database };
}>();

// ================================
// 🌐 CORS 설정 (프론트/백 분리 환경 대응)
// ================================
const ALLOWED_ORIGINS = [
  'https://rec-time-fe.pages.dev',               // 🔹 프로덕션
  'https://develop.rec-time-fe.pages.dev',       // 🔹 개발 환경 (테스트용)
  'http://localhost:5173',                       // 🔹 로컬 개발
];

// ✅ 미리보기(Preview) 브랜치 자동 허용 + 보안 최소화
app.use(
  '/*',
  cors({
    origin: origin => {
      if (!origin) return '*'; // 내부 요청 (cron 등)
      // 명시적 허용
      if (ALLOWED_ORIGINS.includes(origin)) return origin;
      // Cloudflare Pages Preview 브랜치 허용 (*.pages.dev)
      if (origin.endsWith('.rec-time-fe.pages.dev')) return origin;
      return '*'; // 그 외는 제한적으로 허용 (필요시 강화 가능)
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  })
);

// ✅ 명시적 OPTIONS 프리플라이트 허용
app.options('/*', c => c.body(null, 204));

// ================================
// 📝 로깅 미들웨어
// ================================
app.use('*', requestLogger());

// ================================
// 💡 공통 DI 주입 미들웨어
// ================================
app.use('*', async (c, next) => {
  const { db, ...controllers } = getDIContainer(c.env);
  Object.entries(controllers).forEach(([key, value]) => {
    c.set(key as keyof ControllerMap, value);
  });
  c.set('db', db);
  await next();
});

// ================================
// 🧩 API prefix
// ================================
const api = app.basePath('/api');

// ================================
// ✅ 기본 라우트
// ================================
api.get('/', c => {
  logger.info('Root endpoint accessed', 'API');
  return c.text('Hello from Cloudflare Worker 🚀');
});

api.get('/health', c => {
  logger.info('Health check endpoint accessed', 'API');
  return c.json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

// ================================
// ✅ Students (보안 강화)
// ================================
api.get('/students/by-student-num/:studentNum/birthday/:birthday', c =>
  c.get('studentController').getStudentByStudentNumAndBirthday(c)
);

// ================================
// ✅ Events
// ================================
api.get('/events', c => c.get('eventController').getAllEvents(c));
api.get('/events/:eventId', c => c.get('eventController').getEventById(c));

// ================================
// ✅ Entries
// ================================
api.get('/entries', c => c.get('entryController').getAllEntries(c));
api.get('/entries/:entryId', c => c.get('entryController').getEntryById(c));

// 알람용 엔드포인트 복구
api.get('/entries/alarm/:studentNum', c =>
  c.get('entryController').getAlarmEntriesByStudentNum(c)
);

// ================================
// ✅ Entry Groups
// ================================
api.get('/entry-groups', c => c.get('entryGroupController').getAll(c));

// ================================
// ✅ Notifications
// ================================
api.get('/notifications', c => c.get('notificationController').getAll(c));

// ================================
// ✅ Change Logs
// ================================
api.get('/change-logs', c => c.get('changeLogController').getAll(c));

// ================================
// ✅ Download Logs
// ================================
api.get('/download-logs', c => c.get('downloadLogController').getAllLogs(c));
api.get('/download-logs/student/:studentNum', c =>
  c.get('downloadLogController').getLogsByStudentNum(c)
);
api.get('/download-logs/stats', c =>
  c.get('downloadLogController').getDownloadStats(c)
);
api.get('/download-logs/comparison', c =>
  c.get('downloadLogController').getStudentDownloadComparison(c)
);

// ================================
// ✅ Data Update Check
// ================================
api.get('/data-update/info', c =>
  c.get('dataUpdateController').getUpdateInfo(c)
);
api.get('/data-update/check', c =>
  c.get('dataUpdateController').checkDataChanged(c)
);

// ================================
// 🔔 FCM Push Notifications
// ================================
api.post('/fcm/register', c => c.get('fcmController').registerToken(c));
api.post('/fcm/test-push/:studentNum', c => c.get('fcmController').sendTestPush(c));
api.post('/fcm/push-all', c => c.get('fcmController').sendNotificationToAll(c));
api.get('/fcm/logs', c => c.get('fcmController').getNotificationLogs(c));
api.get('/fcm/debug', c => c.get('fcmController').debugFCMConfig(c));

// ================================
// 🧱 에러 핸들링
// ================================
app.onError(errorHandler());

// ================================
// 🚀 서버 시작 로그
// ================================
logger.info(
  'RecTime Backend Server started / RecTime バックエンドサーバー開始',
  'Server',
  { environment: process.env.NODE_ENV || 'development' }
);

// ================================
// ⏰ Cron Trigger
// ================================
export { scheduled } from './cron';

export default {
  fetch: app.fetch,
};
