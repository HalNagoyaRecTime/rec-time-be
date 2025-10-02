import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import DatabaseConstructor from 'better-sqlite3';
import { createD1Compat } from './lib/d1Compat';
import {
  createStudentController,
  createEventController,
  createEntryController,
  createEntryGroupController,
  createNotificationController,
  createChangeLogController,
  createStudentService,
  createEventService,
  createEntryService,
  createEntryGroupService,
  createNotificationService,
  createChangeLogService,
  createStudentRepository,
  createEventRepository,
  createEntryRepository,
  createEntryGroupRepository,
  createNotificationRepository,
  createChangeLogRepository,
} from './exports';

// __dirname 대체
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 정확한 SQLite 경로
const sqlitePath = path.resolve(__dirname, '../mine.db');
if (!fs.existsSync(sqlitePath)) {
  console.error('❌ SQLite DB 파일을 찾을 수 없습니다:', sqlitePath);
  process.exit(1);
}
console.log('✅ 연결할 SQLite 파일 경로:', sqlitePath);

// D1-compatible DB 생성
const sqlite = new DatabaseConstructor(sqlitePath);
const db = createD1Compat(sqlite);

// Repository
const studentRepository = createStudentRepository(db as any);
const eventRepository = createEventRepository(db as any);
const entryRepository = createEntryRepository(db as any);
const entryGroupRepository = createEntryGroupRepository(db as any);
const notificationRepository = createNotificationRepository(db as any);
const changeLogRepository = createChangeLogRepository(db as any);

// Service
const studentService = createStudentService(
  studentRepository,
  eventRepository,
  entryRepository,
  entryGroupRepository,
  notificationRepository,
  changeLogRepository
);
const eventService = createEventService(eventRepository);
const entryService = createEntryService(entryRepository);
const entryGroupService = createEntryGroupService(entryGroupRepository);
const notificationService = createNotificationService(notificationRepository);
const changeLogService = createChangeLogService(changeLogRepository);

// Controller
const studentController = createStudentController(studentService);
const eventController = createEventController(eventService);
const entryController = createEntryController(entryService, studentService);
const entryGroupController = createEntryGroupController(entryGroupService);
const notificationController =
  createNotificationController(notificationService);
const changeLogController = createChangeLogController(changeLogService);

// Hono 앱 초기화
const app = new Hono();

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

app.get('/events', eventController.getAllEvents);
app.get('/events/:eventId', eventController.getEventById);

app.get('/entries', entryController.getAllEntries);
app.get('/entries/:entryId', entryController.getEntryById);
app.get(
  '/entries/by-student/:studentNum',
  entryController.getEntriesByStudentNum
);

// ✅ 알람용 엔트리 라우트 (로컬)
app.get(
  '/entries/alarm/:studentNum',
  entryController.getAlarmEntriesByStudentNum
);

app.get('/entry-groups', entryGroupController.getAll);
app.get('/notifications', notificationController.getAll);
app.get('/change-logs', changeLogController.getAll);

serve(app, info => {
  console.log(`🚀 Local server running at http://localhost:${info.port}`);
});
