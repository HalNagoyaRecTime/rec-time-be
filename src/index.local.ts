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

// ✅ 로컬 SQLite 파일 경로 (루트 mine.db)
const sqlitePath = path.resolve(__dirname, '../mine.db');

if (!fs.existsSync(sqlitePath)) {
  console.error('❌ SQLite DB 파일을 찾을 수 없습니다:', sqlitePath);
  process.exit(1);
}
console.log('✅ 연결할 SQLite 파일 경로:', sqlitePath);

// ✅ DB 인스턴스 생성 및 D1 호환 래핑
const sqlite = new DatabaseConstructor(sqlitePath);
const db = createD1Compat(sqlite);

// ------------------------
// Repositories
// ------------------------
import { createStudentRepository } from './repositories/StudentRepository';
import { createEventRepository } from './repositories/EventRepository';
import { createEntryRepository } from './repositories/EntryRepository';
import { createEntryGroupRepository } from './repositories/EntryGroupRepository';
import { createNotificationRepository } from './repositories/NotificationRepository';
import { createChangeLogRepository } from './repositories/ChangeLogRepository';

const studentRepository = createStudentRepository(db as any);
const eventRepository = createEventRepository(db as any);
const entryRepository = createEntryRepository(db as any);
const entryGroupRepository = createEntryGroupRepository(db as any);
const notificationRepository = createNotificationRepository(db as any);
const changeLogRepository = createChangeLogRepository(db as any);

// ------------------------
// Services
// ------------------------
import { createStudentService } from './services/StudentService';
import { createEventService } from './services/EventService';
import { createEntryGroupService } from './services/EntryGroupService';
import { createNotificationService } from './services/NotificationService';
import { createChangeLogService } from './services/ChangeLogService';

const studentService = createStudentService(
  studentRepository,
  eventRepository,
  entryRepository,
  entryGroupRepository,
  notificationRepository,
  changeLogRepository
);
const eventService = createEventService(eventRepository);
const entryGroupService = createEntryGroupService(entryGroupRepository);
const notificationService = createNotificationService(notificationRepository);
const changeLogService = createChangeLogService(changeLogRepository);

// ------------------------
// Controllers
// ------------------------
import { createStudentController } from './controllers/StudentController';
import { createEventController } from './controllers/EventController';
import { createEntryController } from './controllers/EntryController';
import { createEntryGroupController } from './controllers/EntryGroupController';
import { createNotificationController } from './controllers/NotificationController';
import { createChangeLogController } from './controllers/ChangeLogController';

const studentController = createStudentController(studentService);
const eventController = createEventController(eventService);
const entryController = createEntryController(
  entryRepository,
  studentRepository
);
const entryGroupController = createEntryGroupController(entryGroupService);
const notificationController =
  createNotificationController(notificationService);
const changeLogController = createChangeLogController(changeLogService);

// ------------------------
// Routes
// ------------------------
const app = new Hono();

app.get('/', c => c.text('Hello (local) 🚀'));

// Student
app.get(
  '/students/by-student-num/:studentNum',
  studentController.getStudentByStudentNum
);
app.get(
  '/student-payload/by-student-num/:studentNum',
  studentController.getStudentPayloadByStudentNum
);
app.get('/student-data/:studentNum', studentController.getStudentFullPayload);

// Event
app.get('/events', eventController.getAllEvents);
app.get('/events/:eventId', eventController.getEventById);

// Entry
app.get('/entries', entryController.getAllEntries);
app.get('/entries/:entryId', entryController.getEntryById);
app.get(
  '/entries/by-student/:studentNum',
  entryController.getEntriesByStudentNum
);

// EntryGroup
app.get('/entry-groups', entryGroupController.getAll);

// Notification
app.get('/notifications', notificationController.getAll);

// ChangeLog
app.get('/change-logs', changeLogController.getAll);

// ------------------------
// 서버 실행
// ------------------------
serve(app, info => {
  console.log(`🚀 Local server running at http://localhost:${info.port}`);
});
