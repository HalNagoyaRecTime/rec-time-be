import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import DatabaseConstructor from 'better-sqlite3';

import { createStudentRepository } from './repositories/StudentRepository';
import { createEventRepository } from './repositories/EventRepository';
import { createEntryRepository } from './repositories/EntryRepository';

import { createStudentService } from './services/StudentService';
import { createStudentController } from './controllers/StudentController';

const app = new Hono();

const db = new DatabaseConstructor('./sqlite-tools-win-x64-3500400/mine.db');

const studentRepository = createStudentRepository(db);
const eventRepository = createEventRepository(db);
const entryRepository = createEntryRepository(db);

const studentService = createStudentService(
  studentRepository,
  eventRepository,
  entryRepository
);

const studentController = createStudentController(studentService);

app.get(
  '/students/by-student-num/:studentNum',
  studentController.getStudentByStudentNum
);
app.get(
  '/student-payload/by-student-num/:studentNum',
  studentController.getStudentPayloadByStudentNum
);

app.get('/', c => c.text('Hello! サーバーは動いています 🚀'));

serve(app, info => {
  console.log(`🚀 Server is running at http://localhost:${info.port}`);
});
