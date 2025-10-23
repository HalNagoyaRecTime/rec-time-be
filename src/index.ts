// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { D1Database } from '@cloudflare/workers-types';

import { Bindings } from './types';
import { ControllerMap } from './types/context';
import { getDIContainer } from './di/container';
import { requestLogger, errorHandler } from './middleware/logging';
import { logger } from './utils/logger';

// Cloudflare Workers型定義
interface ScheduledEvent {
  scheduledTime: number;
  cron: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

const app = new Hono<{
  Bindings: Bindings;
  Variables: ControllerMap & { db: D1Database };
}>();

// ================================
// 🌐 CORS 설정 (프론트/백 분리 환경 대응)
// ================================
const ALLOWED_ORIGINS = [
  'https://develop.rec-time-fe.pages.dev',
  'https://rec-time-fe.pages.dev',
  'https://ded22f03.rec-time-fe.pages.dev', // ⚠️ 실제 배포 프론트엔드 도메인
  'http://localhost:5173',
];

app.use(
  '/*',
  cors({
    origin: origin => {
      if (!origin) return '*'; // 서버 내부 호출 시
      if (ALLOWED_ORIGINS.includes(origin)) return origin;
      if (origin.endsWith('.pages.dev')) return origin; // preview 환경 대응
      return '*';
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  })
);

// ✅ 명시적으로 OPTIONS 프리플라이트 허용
app.options('/*', c => c.body(null, 204));

// ================================
// 📝 로깅 미들웨어
// ================================
app.use('*', requestLogger());

// ================================
// 공통 DI 주입 미들웨어
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
// API prefix
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
// ✅ Students (보안 강화: 학번 + 생년월일 인증만 허용)
// ================================
// 🔒 비활성화된 공개 엔드포인트 (필요시만 복구)
// api.get('/students/by-student-num/:studentNum', (c) =>
//   c.get('studentController').getStudentByStudentNum(c)
// )
// api.get('/students/payload/:studentNum', (c) =>
//   c.get('studentController').getStudentPayloadByStudentNum(c)
// )
// api.get('/students/full/:studentNum', (c) =>
//   c.get('studentController').getStudentFullPayload(c)
// )

// ✅ 인증 필요 엔드포인트
api.get('/students/by-student-num/:studentNum/birthday/:birthday', c =>
  c.get('studentController').getStudentByStudentNumAndBirthday(c)
);

// ================================
// ✅ Events
// ================================
api.get('/events', c => c.get('eventController').getAllEvents(c));
api.get('/events/:eventId', c => c.get('eventController').getEventById(c));

// ================================
// ✅ Entries (보안 강화: 학번만으로 접근 불가)
// ================================
api.get('/entries', c => c.get('entryController').getAllEntries(c));
api.get('/entries/:entryId', c => c.get('entryController').getEntryById(c));

// 🔒 공개 학번 조회 엔드포인트 비활성화
// api.get('/entries/by-student/:studentNum', (c) =>
//   c.get('entryController').getEntriesByStudentNum(c)
// )

// ✅ 알람용 엔드포인트 복구 / アラーム用エンドポイント復旧
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
// 🔔 Push Notifications (Web Push API)
// ================================
api.post('/push/subscribe', c =>
  c.get('pushNotificationController').subscribe(c)
);
api.post('/push/unsubscribe', c =>
  c.get('pushNotificationController').unsubscribe(c)
);
api.post('/push/schedule', c =>
  c.get('pushNotificationController').saveSchedule(c)
);
api.post('/push/test', c =>
  c.get('pushNotificationController').sendTest(c)
);

// ================================
// ⏰ Scheduled Tasks (Cron Jobs)
// ================================
export default {
  ...app,
  
  // 1分ごとに実行される通知チェック
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    const { db, ...controllers } = getDIContainer(env);
    
    try {
      // 現在時刻取得（HHmm形式）
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
      
      console.log(`[Cron] 通知チェック開始: ${currentTime}`);
      
      // スケジュールサービスとプッシュサービスを取得
      const scheduleService = getDIContainer(env).db; // TODO: サービスを正しく取得
      
      // 送信処理は別途実装が必要
      console.log(`[Cron] 通知チェック完了`);
    } catch (error) {
      console.error('[Cron] エラー:', error);
    }
  }
};

// ================================
// 📝 エラーハンドリング (ラウト이後)
// ================================
app.onError(errorHandler());

// ================================
// 🚀 서버 시작 로깅
// ================================
logger.info(
  'RecTime Backend Server started / RecTime 백엔드 서버 시작',
  'Server',
  { environment: process.env.NODE_ENV || 'development' }
);

export default {
  fetch: app.fetch,
};
