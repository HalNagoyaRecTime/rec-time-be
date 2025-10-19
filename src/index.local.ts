// src/index.local.ts
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import DatabaseConstructor from 'better-sqlite3';
import { createD1Compat } from './lib/d1Compat';
import { cors } from 'hono/cors';
import { createDIContainer } from './di/container';

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// ✅ 현재 파일 경로 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 정확한 SQLite 경로 지정
const sqlitePath = path.resolve(__dirname, '../mine.db');
if (!fs.existsSync(sqlitePath)) {
  console.error('❌ SQLite DB 파일을 찾을 수 없습니다:', sqlitePath);
  process.exit(1);
}
console.log('✅ 연결할 SQLite 파일 경로:', sqlitePath);

// ✅ D1 호환 DB 생성
const sqlite = new DatabaseConstructor(sqlitePath);
const db = createD1Compat(sqlite);

// ✅ DI Container 사용으로 간소화
const {
  studentController,
  eventController,
  entryController,
  entryGroupController,
  notificationController,
  changeLogController,
  downloadLogController,
  errorController,
} = createDIContainer({ DB: db as any });

// ================================
// 🚀 Hono 서버 설정
// ================================
const app = new Hono();

// 🌐 CORS (프로덕션과 동일 정책 권장)
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // 필요시 프론트 프리뷰 도메인도 추가
  'https://develop.rec-time-fe.pages.dev',
  'https://rec-time-fe.pages.dev',
];

app.use(
  '/*',
  cors({
    origin: origin => (ALLOWED_ORIGINS.includes(origin) ? origin : ''),
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // 쿠키/세션을 안 쓰면 false로 바꿔도 됨
    maxAge: 86400,
  })
);

// ✅ 프리플라이트 명시 허용
app.options('/*', c => c.body(null, 204));

// ================================
// 📡 라우트 정의 (프로덕션과 같은 /api prefix)
// ================================
const api = app.basePath('/api');

api.get('/', c => c.text('Hello (local) 🚀'));

// ✅ 학생 정보 (보안 강화: 학번 + 생년월일 인증만 허용)
// 🔒 보안상 비활성화: 학번만으로 접근 가능한 API들
// api.get('/students/by-student-num/:studentNum', studentController.getStudentByStudentNum);
// api.get('/students/payload/:studentNum', studentController.getStudentPayloadByStudentNum);
// api.get('/students/full/:studentNum', studentController.getStudentFullPayload);

// ✅ 보안 인증된 API: 학번 + 생년월일로만 접근 가능
api.get(
  '/students/by-student-num/:studentNum/birthday/:birthday',
  studentController.getStudentByStudentNumAndBirthday
);

// ✅ 이벤트
api.get('/events', eventController.getAllEvents);
api.get('/events/:eventId', eventController.getEventById);

// ✅ 출전 정보 (보안 강화: 학번만으로 접근 불가)
api.get('/entries', entryController.getAllEntries);
api.get('/entries/:entryId', entryController.getEntryById);

// 🔒 보안상 비활성화: 학번만으로 접근 가능한 출전 정보 API들
// api.get('/entries/by-student/:studentNum', entryController.getEntriesByStudentNum);

// ✅ 알람용 엔드포인트 복구 / アラーム用エンドポイント復旧
api.get(
  '/entries/alarm/:studentNum',
  entryController.getAlarmEntriesByStudentNum
);

// ✅ 그룹 / 알림 / 변경로그
api.get('/entry-groups', entryGroupController.getAll);
api.get('/notifications', notificationController.getAll);
api.get('/change-logs', changeLogController.getAll);

// ✅ 다운로드 로그
api.get('/download-logs', downloadLogController.getAllLogs);
api.get(
  '/download-logs/student/:studentNum',
  downloadLogController.getLogsByStudentNum
);
api.get('/download-logs/stats', downloadLogController.getDownloadStats);

// ✅ 에러 리포트 (메일 전송)
api.post('/error/report', errorController.reportError);

// ================================
// 🧩 로컬 서버 실행
// ================================
serve(app, info => {
  console.log(`🚀 Local server running at http://localhost:${info.port}`);
});
