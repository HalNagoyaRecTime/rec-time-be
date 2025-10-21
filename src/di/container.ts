import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { Bindings } from '../types';
import { createFCMService } from '../services/FCMService';
import { createFCMController } from '../controllers/FCMController';

// 다른 controller들 import
import { createStudentController } from '../controllers/StudentController';
import { createEventController } from '../controllers/EventController';
import { createEntryController } from '../controllers/EntryController';
import { createEntryGroupController } from '../controllers/EntryGroupController';
import { createNotificationController } from '../controllers/NotificationController';
import { createChangeLogController } from '../controllers/ChangeLogController';
import { createDownloadLogController } from '../controllers/DownloadLogController';
import { createDataUpdateController } from '../controllers/DataUpdateController';
import { createErrorController } from '../controllers/ErrorController';

// 다른 service들 import
import { createStudentService } from '../services/StudentService';
import { createEventService } from '../services/EventService';
import { createEntryService } from '../services/EntryService';
import { createEntryGroupService } from '../services/EntryGroupService';
import { createNotificationService } from '../services/NotificationService';
import { createChangeLogService } from '../services/ChangeLogService';
import { createDownloadLogService } from '../services/DownloadLogService';
import { createDataUpdateService } from '../services/DataUpdateService';

// 다른 repository들 import
import { createStudentRepository } from '../repositories/StudentRepository';
import { createEventRepository } from '../repositories/EventRepository';
import { createEntryRepository } from '../repositories/EntryRepository';
import { createEntryGroupRepository } from '../repositories/EntryGroupRepository';
import { createNotificationRepository } from '../repositories/NotificationRepository';
import { createChangeLogRepository } from '../repositories/ChangeLogRepository';
import { createDownloadLogRepository } from '../repositories/DownloadLogRepository';

// ------------------------------------------------------------
// ✅ FCM Controller Factory (DI용)
// ------------------------------------------------------------
export function createFCMControllerFactory(fcmService: ReturnType<typeof createFCMService>) {
  return {
    // 🔹 FCM 토큰 등록
    async registerToken(c: Context) {
      try {
        const body = await c.req.json();
        const result = await fcmService.registerToken({
          token: body.token,
          studentNum: body.studentNum,
          timestamp: body.timestamp,
          deviceInfo: body.deviceInfo,
        });

        return c.json({
          success: result.success,
          message: result.message,
          registeredAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[FCMController] registerToken error:', error);
        return c.json(
          {
            success: false,
            message:
              error instanceof Error ? error.message : '토큰 등록 실패',
          },
          500
        );
      }
    },

    // 🔹 FCM 토큰 해제
    async unregisterToken(c: Context) {
      try {
        const studentNum = c.req.param('studentNum');
        const result = await fcmService.unregisterToken(studentNum);
        return c.json(result);
      } catch (error) {
        console.error('[FCMController] unregisterToken error:', error);
        return c.json({ success: false, message: '토큰 해제 실패' }, 500);
      }
    },

    // 🔹 FCM 상태 확인
    async getFCMStatus(c: Context) {
      try {
        const studentNum = c.req.param('studentNum');
        const result = await fcmService.getFCMStatus(studentNum);
        return c.json(result);
      } catch (error) {
        console.error('[FCMController] getFCMStatus error:', error);
        return c.json({ registered: false, error: '상태 조회 실패' }, 500);
      }
    },

    // 🔹 단일 학생 푸시 테스트
    async sendTestPush(c: Context) {
      try {
        const studentNum = c.req.param('studentNum');
        const result = await fcmService.sendNotificationToStudent(studentNum, {
          title: '🧪 테스트 알림',
          body: 'FCM 푸시 알림이 정상적으로 작동합니다!',
        });

        return c.json({
          success: result,
          message: result
            ? `테스트 푸시 전송 성공 (학번: ${studentNum})`
            : `테스트 푸시 전송 실패 (학번: ${studentNum})`,
        });
      } catch (error) {
        console.error('[FCMController] sendTestPush error:', error);
        return c.json({ success: false, message: '푸시 전송 실패' }, 500);
      }
    },

    // 🔹 전체 푸시
    async sendNotificationToAll(c: Context) {
      try {
        const body = await c.req.json();
        const result = await fcmService.sendNotificationToAll({
          title: body.title || '📢 전체 공지',
          body: body.body || '전체 알림이 발송되었습니다.',
        });

        return c.json({
          success: true,
          message: '전체 푸시 전송 완료',
          result,
        });
      } catch (error) {
        console.error('[FCMController] sendNotificationToAll error:', error);
        return c.json({ success: false, message: '전체 푸시 실패' }, 500);
      }
    },

    // 🔹 푸시 로그 조회
    async getNotificationLogs(c: Context) {
      try {
        const logs = await fcmService.getActiveTokens();
        return c.json(logs);
      } catch (error) {
        console.error('[FCMController] getNotificationLogs error:', error);
        return c.json({ success: false, message: '로그 조회 실패' }, 500);
      }
    },
  };
}

// ------------------------------------------------------------
// ✅ FCM Controller 생성 및 반환 (DI용)
// ------------------------------------------------------------
export function createFCMControllerForDI(env: any, db: any) {
  const fcmService = createFCMService(db, {
    FCM_PROJECT_ID: env.FCM_PROJECT_ID,
    FCM_PRIVATE_KEY: env.FCM_PRIVATE_KEY,
    FCM_CLIENT_EMAIL: env.FCM_CLIENT_EMAIL,
  });
  
  return createFCMController(fcmService);
}

// ------------------------------------------------------------
// ✅ DI Container
// ------------------------------------------------------------
export function getDIContainer(env: Bindings) {
  const db = env.DB;

  // Repositories
  const studentRepository = createStudentRepository(db);
  const eventRepository = createEventRepository(db);
  const entryRepository = createEntryRepository(db);
  const entryGroupRepository = createEntryGroupRepository(db);
  const notificationRepository = createNotificationRepository(db);
  const changeLogRepository = createChangeLogRepository(db);
  const downloadLogRepository = createDownloadLogRepository(db);

  // Services
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
  const fcmService = createFCMService(db, {
    FCM_PROJECT_ID: env.FCM_PROJECT_ID,
    FCM_PRIVATE_KEY: env.FCM_PRIVATE_KEY,
    FCM_CLIENT_EMAIL: env.FCM_CLIENT_EMAIL,
  });
  const entryGroupService = createEntryGroupService(entryGroupRepository);
  const notificationService = createNotificationService(notificationRepository, fcmService);
  const changeLogService = createChangeLogService(changeLogRepository);
  const downloadLogService = createDownloadLogService(downloadLogRepository);
  const dataUpdateService = createDataUpdateService(changeLogRepository);

  // Controllers
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