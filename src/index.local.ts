// src/index.local.ts
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import DatabaseConstructor from 'better-sqlite3';

import { createD1Compat } from './lib/d1Compat';

// ESM 환경에서 __dirname 대체
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 로컬 SQLite 파일 경로 지정 (절대경로 사용)
const sqlitePath = path.resolve(
  __dirname,
  '../sqlite-tools-win-x64-3500400/mine.db'
);

// ✅ 파일 존재 확인 (없으면 종료)
if (!fs.existsSync(sqlitePath)) {
  console.error('❌ SQLite DB 파일을 찾을 수 없습니다:', sqlitePath);
  process.exit(1);
}

console.log('✅ 연결할 SQLite 파일 경로:', sqlitePath);

// ✅ DB 인스턴스 생성 및 D1 호환 래핑
const sqlite = new DatabaseConstructor(sqlitePath);
const db = createD1Compat(sqlite);

// Repositories
import { createStudentRepository } from './repositories/StudentRepository';
import { createEventRepository } from './repositories/EventRepository';
import { createEntryRepository } from './repositories/EntryRepository';
import { createEntryGroupRepository } from './repositories/EntryGroupRepository';
import { createNotificationRepository } from './repositories/NotificationRepository';
import { createChangeLogRepository } from './repositories/ChangeLogRepository';

// Services
import { createStudentService } from './services/StudentService';

// Controllers
import { createStudentController } from './controllers/StudentController';

const app = new Hono();

// ✅ Repository 생성
const studentRepository = createStudentRepository(db as any);
const eventRepository = createEventRepository(db as any);
const entryRepository = createEntryRepository(db as any);
const entryGroupRepository = createEntryGroupRepository(db as any);
const notificationRepository = createNotificationRepository(db as any);
const changeLogRepository = createChangeLogRepository(db as any);

// ✅ Service 생성
const studentService = createStudentService(
  studentRepository,
  eventRepository,
  entryRepository,
  entryGroupRepository,
  notificationRepository,
  changeLogRepository
);

// ✅ Controller 생성
const studentController = createStudentController(studentService);

// ✅ 라우팅
app.get('/', c => c.text('Hello (local) 🚀'));

app.get(
  '/students/by-student-num/:studentNum',
  studentController.getStudentByStudentNum
);

app.get(
  '/student-payload/by-student-num/:studentNum',
  studentController.getStudentPayloadByStudentNum
);

app.get('/student-data/:studentNum', studentController.getStudentFullPayload);

// ✅ 서버 실행
serve(app, info => {
  console.log(`🚀 Local server is running at http://localhost:${info.port}`);
});
