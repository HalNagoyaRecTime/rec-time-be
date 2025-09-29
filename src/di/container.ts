import { getDb } from '../lib/db';

// Repositories (필수만)
import { createStudentRepository } from '../repositories/StudentRepository';
import { createEventRepository } from '../repositories/EventRepository';
import { createEntryRepository } from '../repositories/EntryRepository';
import { createEntryGroupRepository } from '../repositories/EntryGroupRepository';
import { createNotificationRepository } from '../repositories/NotificationRepository';
import { createChangeLogRepository } from '../repositories/ChangeLogRepository';

// Services (필수만)
import { createStudentService } from '../services/StudentService';
import { createEventService } from '../services/EventService';
import { createEntryService } from '../services/EntryService';

// Controllers (필수만)
import { createStudentController } from '../controllers/StudentController';
import { createEventController } from '../controllers/EventController';
import { createEntryController } from '../controllers/EntryController';

import { D1Database } from '@cloudflare/workers-types';

type Env = {
  DB: D1Database;
};

export function createDIContainer(env?: Env) {
  const db = getDb(env);

  if (!db) {
    throw new Error('Database is not available');
  }

  // ✅ Repositories
  const studentRepository = createStudentRepository(db);
  const eventRepository = createEventRepository(db);
  const entryRepository = createEntryRepository(db);

  // 🔧 추가된 필수 Repository
  const entryGroupRepository = createEntryGroupRepository(db);
  const notificationRepository = createNotificationRepository(db);
  const changeLogRepository = createChangeLogRepository(db);

  // ✅ Services
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

  // ✅ Controllers
  const studentController = createStudentController(studentService);
  const eventController = createEventController(eventService);
  const entryController = createEntryController(
    entryRepository,
    studentRepository
  );

  return {
    db,
    studentController,
    eventController,
    entryController,
  };
}

export type DIContainer = ReturnType<typeof createDIContainer>;

let containerInstance: DIContainer | null = null;

export function getDIContainer(env?: Env): DIContainer {
  // Cloudflare Workers 환경에서는 매번 새 인스턴스 생성
  if (env) {
    return createDIContainer(env);
  }

  // 로컬 개발 환경에서는 싱글턴 사용
  if (!containerInstance) {
    containerInstance = createDIContainer();
  }
  return containerInstance;
}
