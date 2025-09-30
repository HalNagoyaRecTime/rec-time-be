import { Hono } from 'hono';
import { Bindings } from './types';
import { ControllerMap } from './types/context';
import { getDIContainer } from './di/container';

const app = new Hono<{ Bindings: Bindings; Variables: ControllerMap }>();

app.use('*', async (c, next) => {
  const container = getDIContainer(c.env);

  c.set('studentController', container.studentController);
  c.set('eventController', container.eventController);
  c.set('entryController', container.entryController);
  c.set('entryGroupController', container.entryGroupController);
  c.set('notificationController', container.notificationController);
  c.set('changeLogController', container.changeLogController);

  await next();
});

// ================================
// API prefix 붙이기
// ================================
const api = app.basePath('/api');

// Root
api.get('/', c => c.text('Hello from Cloudflare Worker 🚀'));

// Students
api.get('/students/by-student-num/:studentNum', c =>
  c.get('studentController').getStudentByStudentNum(c)
);
api.get('/student-payload/by-student-num/:studentNum', c =>
  c.get('studentController').getStudentPayloadByStudentNum(c)
);
api.get('/student-data/:studentNum', c =>
  c.get('studentController').getStudentFullPayload(c)
);

// Events
api.get('/events', c => c.get('eventController').getAllEvents(c));
api.get('/events/:eventId', c => c.get('eventController').getEventById(c));

// Entries
api.get('/entries', c => c.get('entryController').getAllEntries(c));
api.get('/entries/:entryId', c => c.get('entryController').getEntryById(c));
api.get('/entries/by-student/:studentNum', c =>
  c.get('entryController').getEntriesByStudentNum(c)
);

// Entry Groups
api.get('/entry-groups', c => c.get('entryGroupController').getAll(c));

// Notifications
api.get('/notifications', c => c.get('notificationController').getAll(c));

// Change Logs
api.get('/change-logs', c => c.get('changeLogController').getAll(c));

export default {
  fetch: app.fetch,
};
