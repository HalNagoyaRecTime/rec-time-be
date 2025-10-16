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

// 🌐 CORS (모든 요청 허용)
app.use('*', cors({ origin: '*' }));

// ================================
// 📡 라우트 정의 (index.ts와 동일한 구조)
// ================================
app.get('/', c => c.text('Hello (local) 🚀'));

// ✅ 학생 정보 (보안 강화: 학번 + 생년월일 인증만 허용)
// 🔒 보안상 비활성화: 학번만으로 접근 가능한 API들
// app.get('/students/by-student-num/:studentNum', studentController.getStudentByStudentNum);
// app.get('/students/payload/:studentNum', studentController.getStudentPayloadByStudentNum);
// app.get('/students/full/:studentNum', studentController.getStudentFullPayload);

// ✅ 보안 인증된 API: 학번 + 생년월일로만 접근 가능
app.get('/students/by-student-num/:studentNum/birthday/:birthday', studentController.getStudentByStudentNumAndBirthday);

// ✅ 이벤트
app.get('/events', eventController.getAllEvents);
app.get('/events/:eventId', eventController.getEventById);

// ✅ 출전 정보 (보안 강화: 학번만으로 접근 불가)
app.get('/entries', entryController.getAllEntries);
app.get('/entries/:entryId', entryController.getEntryById);

// 🔒 보안상 비활성화: 학번만으로 접근 가능한 출전 정보 API들
// app.get('/entries/by-student/:studentNum', entryController.getEntriesByStudentNum);

// ✅ 알람용 엔드포인트 복구 / アラーム用エンドポイント復旧
app.get('/entries/alarm/:studentNum', entryController.getAlarmEntriesByStudentNum);

// ✅ 그룹 / 알림 / 변경로그
app.get('/entry-groups', entryGroupController.getAll);
app.get('/notifications', notificationController.getAll);
app.get('/change-logs', changeLogController.getAll);

// ✅ 다운로드 로그
app.get('/download-logs', downloadLogController.getAllLogs);
app.get('/download-logs/student/:studentNum', downloadLogController.getLogsByStudentNum);
app.get('/download-logs/stats', downloadLogController.getDownloadStats);

// ✅ 에러 리포트 (메일 전송)
app.post('/error/report', errorController.reportError);

// ================================
// 🧩 로컬 서버 실행
// ================================
serve(app, info => {
  console.log(`🚀 Local server running at http://localhost:${info.port}`);
});
