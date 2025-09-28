// src/index.local.ts

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import DatabaseConstructor from 'better-sqlite3';

import { createD1Compat } from './lib/d1Compat';

// Repositories
import { createStudentRepository } from './repositories/StudentRepository';
import { createEventRepository } from './repositories/EventRepository';
import { createEntryRepository } from './repositories/EntryRepository';
import { createEntryGroupRepository } from './repositories/EntryGroupRepository';
import { createNotificationRepository } from './repositories/NotificationRepository';
import { createChangeLogRepository } from './repositories/ChangeLogRepository';

// Services
import { createStudentService } from './services/StudentService';
import { createEntryGroupService } from './services/EntryGroupService';
import { createNotificationService } from './services/NotificationService';
import { createChangeLogService } from './services/ChangeLogService';

// Controllers
import { createStudentController } from './controllers/StudentController';
import { createEntryGroupController } from './controllers/EntryGroupController';
import { createNotificationController } from './controllers/NotificationController';
import { createChangeLogController } from './controllers/ChangeLogController';

const app = new Hono();

// 👉 로컬 SQLite DB 생성
const sqlite = new DatabaseConstructor('../mine.db');
const db = createD1Compat(sqlite);

// Repositories 생성
const studentRepository = createStudentRepository(db as any);
const eventRepository = createEventRepository(db as any);
const entryRepository = createEntryRepository(db as any);
const entryGroupRepository = createEntryGroupRepository(db as any);
const notificationRepository = createNotificationRepository(db as any);
const changeLogRepository = createChangeLogRepository(db as any);

// Service 생성
const studentService = createStudentService(
  studentRepository,
  eventRepository,
  entryRepository,
  entryGroupRepository,
  notificationRepository,
  changeLogRepository
);

// Controller 생성
const studentController = createStudentController(studentService);
const entryGroupController = createEntryGroupController(
  createEntryGroupService(entryGroupRepository)
);
const notificationController = createNotificationController(
  createNotificationService(notificationRepository)
);
const changeLogController = createChangeLogController(
  createChangeLogService(changeLogRepository)
);

// Routes
app.get('/', c => c.text('Hello (local) 🚀'));

app.get(
  '/students/by-student-num/:studentNum',
  studentController.getStudentByStudentNum
);
app.get(
  '/student-payload/by-student-num/:studentNum',
  studentController.getStudentPayloadByStudentNum
);

app.get('/entry-groups', entryGroupController.getAll);
app.get('/notifications', notificationController.getAll);
app.get('/change-logs', changeLogController.getAll);

// 서버 시작
serve(app, info => {
  console.log(`🚀 Local server running at http://localhost:${info.port}`);
});
