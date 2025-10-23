// src/di/container.ts
import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { Bindings } from '../types';

// Repository
import { createStudentRepository } from '../repositories/StudentRepository';
import { createEventRepository } from '../repositories/EventRepository';
import { createEntryRepository } from '../repositories/EntryRepository';
import { createEntryGroupRepository } from '../repositories/EntryGroupRepository';
import { createNotificationRepository } from '../repositories/NotificationRepository';
import { createChangeLogRepository } from '../repositories/ChangeLogRepository';
import { createDownloadLogRepository } from '../repositories/DownloadLogRepository';

// Service
import { createStudentService } from '../services/StudentService';
import { createEventService } from '../services/EventService';
import { createEntryService } from '../services/EntryService';
import { createEntryGroupService } from '../services/EntryGroupService';
import { createNotificationService } from '../services/NotificationService';
import { createChangeLogService } from '../services/ChangeLogService';
import { createDownloadLogService } from '../services/DownloadLogService';
import { createDataUpdateService } from '../services/DataUpdateService';
import { createFCMService } from '../services/FCMService';

// Controller
import { createStudentController } from '../controllers/StudentController';
import { createEventController } from '../controllers/EventController';
import { createEntryController } from '../controllers/EntryController';
import { createEntryGroupController } from '../controllers/EntryGroupController';
import { createNotificationController } from '../controllers/NotificationController';
import { createChangeLogController } from '../controllers/ChangeLogController';
import { createDownloadLogController } from '../controllers/DownloadLogController';
import { createDataUpdateController } from '../controllers/DataUpdateController';
import { createErrorController } from '../controllers/ErrorController';
import { createFCMController } from '../controllers/FCMController';

// ------------------------------------------------------------
// ✅ Env 타입 정의
// ------------------------------------------------------------
type Env = Bindings & {
  DB: D1Database;
  FCM_PROJECT_ID?: string;
  FCM_CLIENT_EMAIL?: string;
  FCM_PRIVATE_KEY?: string;
};

// ------------------------------------------------------------
// ✅ DI 컨테이너 생성 함수
// ------------------------------------------------------------
export function getDIContainer(env: Env) {
  const db = env.DB;
  if (!db) throw new Error('❌ D1 Database 연결 실패: env.DB가 없습니다.');

  // 🔍 FCM 환경 변수 체크 로그
  console.log('[DI] FCM 환경 변수 상태 확인:', {
    hasProjectId: !!env.FCM_PROJECT_ID,
    hasClientEmail: !!env.FCM_CLIENT_EMAIL,
    hasPrivateKey: !!env.FCM_PRIVATE_KEY,
  });

  // Repository 생성
  const studentRepository = createStudentRepository(db);
  const eventRepository = createEventRepository(db);
  const entryRepository = createEntryRepository(db);
  const entryGroupRepository = createEntryGroupRepository(db);
  const notificationRepository = createNotificationRepository(db);
  const changeLogRepository = createChangeLogRepository(db);
  const downloadLogRepository = createDownloadLogRepository(db);

  // ✅ FCM Service (환경변수 검증 포함)
  const missingVars: string[] = [];
  if (!env.FCM_PROJECT_ID) missingVars.push('FCM_PROJECT_ID');
  if (!env.FCM_CLIENT_EMAIL) missingVars.push('FCM_CLIENT_EMAIL');
  if (!env.FCM_PRIVATE_KEY) missingVars.push('FCM_PRIVATE_KEY');

  if (missingVars.length > 0) {
    console.error(
      `⚠️ FCM 환경변수 누락: ${missingVars.join(', ')} — FCM 기능이 비활성화됩니다.`
    );
  }

  const fcmService = createFCMService(db, {
    FCM_PROJECT_ID: env.FCM_PROJECT_ID || '',
    FCM_PRIVATE_KEY: env.FCM_PRIVATE_KEY || '',
    FCM_CLIENT_EMAIL: env.FCM_CLIENT_EMAIL || '',
  });

  // Service 생성
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
  const notificationService = createNotificationService(
    notificationRepository,
    fcmService
  );
  const changeLogService = createChangeLogService(changeLogRepository);
  const downloadLogService = createDownloadLogService(downloadLogRepository);
  const dataUpdateService = createDataUpdateService(changeLogRepository);

  // Controller 생성
  const studentController = createStudentController(
    studentService,
    downloadLogService
  );
  const eventController = createEventController(eventService, downloadLogService);
  const entryController = createEntryController(
    entryService,
    studentService,
    downloadLogService
  );
  const entryGroupController = createEntryGroupController(entryGroupService);
  const notificationController = createNotificationController(notificationService);
  const changeLogController = createChangeLogController(changeLogService);
  const downloadLogController = createDownloadLogController(downloadLogService);
  const dataUpdateController = createDataUpdateController(dataUpdateService);
  const fcmController = createFCMController(fcmService);
  const errorController = createErrorController();

  // ------------------------------------------------------------
  // ✅ 반환
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
