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
import { createPushSubscriptionService } from '../services/PushSubscriptionService';
import { createNotificationScheduleService } from '../services/NotificationScheduleService';
import { createFCMPushService } from '../services/FCMPushService';

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
import { createPushNotificationController } from '../controllers/PushNotificationController';

import { D1Database } from '@cloudflare/workers-types';

// ------------------------------------------------------------
// ✅ Env 타입 정의
// ------------------------------------------------------------
type Env = {
  DB: D1Database;
  RESEND_API_KEY?: string;
  FCM_SERVER_KEY?: string;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
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
  const downloadLogService = createDownloadLogService(downloadLogRepository);
  const dataUpdateService = createDataUpdateService(changeLogRepository);
  
  // Push Notification Services
  const pushSubscriptionService = createPushSubscriptionService(db);
  const notificationScheduleService = createNotificationScheduleService(db);
  const fcmPushService = createFCMPushService(env as any);

  // Controller
  const studentController = createStudentController(studentService, downloadLogService);
  const eventController = createEventController(eventService, downloadLogService);
  const entryController = createEntryController(entryService, studentService, downloadLogService);
  const entryGroupController = createEntryGroupController(entryGroupService);
  const notificationController = createNotificationController(notificationService);
  const changeLogController = createChangeLogController(changeLogService);
  const downloadLogController = createDownloadLogController(downloadLogService);
  const dataUpdateController = createDataUpdateController(dataUpdateService);
  const errorController = createErrorController();
  
  // Push Notification Controller
  const pushNotificationController = createPushNotificationController(
    pushSubscriptionService,
    notificationScheduleService,
    fcmPushService
  );

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
    errorController,
    pushNotificationController,
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
