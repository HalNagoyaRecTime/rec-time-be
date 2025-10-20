// src/di/container.ts
import { getDb } from '../lib/db';
import {
  createStudentRepository,
  createEventRepository,
  createEntryRepository,
  createEntryGroupRepository,
  createNotificationRepository,
  createChangeLogRepository,
  createDownloadLogRepository,
} from '../repositories';

import {
  createStudentService,
  createEventService,
  createEntryService,
  createEntryGroupService,
  createNotificationService,
  createChangeLogService,
  createDownloadLogService,
} from '../services';
import { createDataUpdateService } from '../services/DataUpdateService';
import { createFCMService } from '../services/FCMService';

import {
  createStudentController,
  createEventController,
  createEntryController,
  createEntryGroupController,
  createNotificationController,
  createChangeLogController,
  createDownloadLogController,
  createErrorController,
} from '../controllers';
import { createDataUpdateController } from '../controllers/DataUpdateController';
import { createFCMController } from '../controllers/FCMController';

import { D1Database } from '@cloudflare/workers-types';

// ------------------------------------------------------------
// ✅ Env 타입 정의
// ------------------------------------------------------------
type Env = {
  DB: D1Database;
  RESEND_API_KEY?: string;
  FCM_PROJECT_ID?: string;
  FCM_PRIVATE_KEY?: string;
  FCM_CLIENT_EMAIL?: string;
};

// ------------------------------------------------------------
// ✅ DI 컨테이너 생성 함수
// ------------------------------------------------------------
export function createDIContainer(env?: Env) {
  // ✅ getDb()에 env 전체를 전달 (타입 에러 해결)
  const db = getDb(env);
  if (!db) {
    throw new Error('❌ Database is not available');
  }

  // Repository
  const studentRepository = createStudentRepository(db);
  const eventRepository = createEventRepository(db);
  const entryRepository = createEntryRepository(db);
  const entryGroupRepository = createEntryGroupRepository(db);
  const notificationRepository = createNotificationRepository(db);
  const changeLogRepository = createChangeLogRepository(db);
  const downloadLogRepository = createDownloadLogRepository(db);

  // FCM Service
  const fcmService = createFCMService(db, {
    FCM_PROJECT_ID: env?.FCM_PROJECT_ID || '',
    FCM_PRIVATE_KEY: env?.FCM_PRIVATE_KEY || '',
    FCM_CLIENT_EMAIL: env?.FCM_CLIENT_EMAIL || '',
  });

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
  const notificationService = createNotificationService(notificationRepository, fcmService);
  const changeLogService = createChangeLogService(changeLogRepository);
  const downloadLogService = createDownloadLogService(downloadLogRepository);
  const dataUpdateService = createDataUpdateService(changeLogRepository);

  // Controller
  const studentController = createStudentController(studentService, downloadLogService);
  const eventController = createEventController(eventService, downloadLogService);
  const entryController = createEntryController(entryService, studentService, downloadLogService);
  const entryGroupController = createEntryGroupController(entryGroupService);
  const notificationController = createNotificationController(notificationService);
  const changeLogController = createChangeLogController(changeLogService);
  const downloadLogController = createDownloadLogController(downloadLogService);
  const dataUpdateController = createDataUpdateController(dataUpdateService);
  const fcmController = createFCMController(fcmService);
  const errorController = createErrorController();

  // ------------------------------------------------------------
  // 반환 (컨트롤러 + DB)
  // ------------------------------------------------------------
  return {
    db,
    studentController,
    eventController,
    entryController,
    entryGroupController,
    notificationController,
    changeLogController,
    downloadLogController,
    dataUpdateController,
    fcmController,
    errorController,
  };
}

// ------------------------------------------------------------
// ✅ DIContainer 타입 및 인스턴스 관리
// ------------------------------------------------------------
export type DIContainer = ReturnType<typeof createDIContainer>;

let containerInstance: DIContainer | null = null;

export function getDIContainer(env?: Env): DIContainer {
  if (env) return createDIContainer(env);
  if (!containerInstance) containerInstance = createDIContainer();
  return containerInstance;
}
