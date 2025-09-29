import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { Bindings } from './types';
import {
  createStudentController,
  createEventController,
  createEntryController,
  createEntryGroupController,
  createNotificationController,
  createChangeLogController,
  createStudentService,
  createEventService,
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

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
  const db = c.env.DB;

  // Repository
  const studentRepository = createStudentRepository(db);
  const eventRepository = createEventRepository(db);
  const entryRepository = createEntryRepository(db);
  const entryGroupRepository = createEntryGroupRepository(db);
  const notificationRepository = createNotificationRepository(db);
  const changeLogRepository = createChangeLogRepository(db);

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
  const entryGroupService = createEntryGroupService(entryGroupRepository);
  const notificationService = createNotificationService(notificationRepository);
  const changeLogService = createChangeLogService(changeLogRepository);

  // Controller
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

  // Routes
  app.get('/', c => c.text('Hello from Cloudflare Worker 🚀'));

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

  app.get('/entry-groups', entryGroupController.getAll);
  app.get('/notifications', notificationController.getAll);
  app.get('/change-logs', changeLogController.getAll);

  await next();
});

export default {
  fetch: app.fetch,
};
