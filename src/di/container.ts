import { getDb } from '../lib/db';
import {
  createStudentRepository,
  createEventRepository,
  createEntryRepository,
  createEntryGroupRepository,
  createNotificationRepository,
  createChangeLogRepository,
} from '../repositories';

import {
  createStudentService,
  createEventService,
  createEntryService,
  createEntryGroupService,
  createNotificationService,
  createChangeLogService,
} from '../services';

import {
  createStudentController,
  createEventController,
  createEntryController,
  createEntryGroupController,
  createNotificationController,
  createChangeLogController,
} from '../controllers';

import { D1Database } from '@cloudflare/workers-types';

type Env = {
  DB: D1Database;
};

export function createDIContainer(env?: Env) {
  const db = getDb(env);
  if (!db) {
    throw new Error('Database is not available');
  }

  const studentRepository = createStudentRepository(db);
  const eventRepository = createEventRepository(db);
  const entryRepository = createEntryRepository(db);
  const entryGroupRepository = createEntryGroupRepository(db);
  const notificationRepository = createNotificationRepository(db);
  const changeLogRepository = createChangeLogRepository(db);

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

  return {
    db,
    studentController,
    eventController,
    entryController,
    entryGroupController,
    notificationController,
    changeLogController,
  };
}

export type DIContainer = ReturnType<typeof createDIContainer>;

let containerInstance: DIContainer | null = null;

export function getDIContainer(env?: Env): DIContainer {
  if (env) return createDIContainer(env);
  if (!containerInstance) containerInstance = createDIContainer();
  return containerInstance;
}
