// src/controllers/FCMController.ts
// FCM 컨트롤러 (학번 연동)

import { Context } from 'hono';
import { FCMServiceFunctions, FCMTokenData, NotificationPayload } from '../services/FCMService';

export interface FCMControllerFunctions {
  registerToken(c: Context): Promise<Response>;
  unregisterToken(c: Context): Promise<Response>;
  getFCMStatus(c: Context): Promise<Response>;
  sendTestPush(c: Context): Promise<Response>;
  sendNotificationToAll(c: Context): Promise<Response>;
  getNotificationLogs(c: Context): Promise<Response>;
}

export function createFCMController(fcmService: FCMServiceFunctions): FCMControllerFunctions {
  return {
    // FCM 토큰 등록
    async registerToken(c: Context): Promise<Response> {
      try {
        const body = await c.req.json() as FCMTokenData;
        
        // 필수 필드 검증
        if (!body.token || !body.studentNum || !body.timestamp) {
          return c.json({
            success: false,
            message: '필수 필드가 누락되었습니다 (token, studentNum, timestamp)'
          }, 400);
        }

        // 토큰 등록
        const result = await fcmService.registerToken(body);
        
        if (result.success) {
          return c.json({
            success: true,
            message: result.message,
            registeredAt: body.timestamp
          });
        } else {
          return c.json({
            success: false,
            message: result.message
          }, 500);
        }
      } catch (error) {
        console.error('[FCM Controller] 토큰 등록 오류:', error);
        return c.json({
          success: false,
          message: '토큰 등록 중 오류가 발생했습니다'
        }, 500);
      }
    },

    // FCM 토큰 해제
    async unregisterToken(c: Context): Promise<Response> {
      try {
        const studentNum = c.req.param('studentNum');
        
        if (!studentNum) {
          return c.json({
            success: false,
            message: '학번이 필요합니다'
          }, 400);
        }

        const result = await fcmService.unregisterToken(studentNum);
        
        if (result.success) {
          return c.json({
            success: true,
            message: result.message
          });
        } else {
          return c.json({
            success: false,
            message: result.message
          }, 500);
        }
      } catch (error) {
        console.error('[FCM Controller] 토큰 해제 오류:', error);
        return c.json({
          success: false,
          message: '토큰 해제 중 오류가 발생했습니다'
        }, 500);
      }
    },

    // FCM 상태 확인
    async getFCMStatus(c: Context): Promise<Response> {
      try {
        const studentNum = c.req.param('studentNum');
        
        if (!studentNum) {
          return c.json({
            success: false,
            message: '학번이 필요합니다'
          }, 400);
        }

        const status = await fcmService.getFCMStatus(studentNum);
        
        return c.json({
          success: true,
          registered: status.registered,
          lastUpdated: status.lastUpdated,
          deviceInfo: status.deviceInfo
        });
      } catch (error) {
        console.error('[FCM Controller] 상태 확인 오류:', error);
        return c.json({
          success: false,
          message: '상태 확인 중 오류가 발생했습니다'
        }, 500);
      }
    },

    // 테스트 푸시 전송
    async sendTestPush(c: Context): Promise<Response> {
      try {
        const studentNum = c.req.param('studentNum');
        const body = await c.req.json() as { title?: string; body?: string; timestamp?: string };
        
        if (!studentNum) {
          return c.json({
            success: false,
            message: '학번이 필요합니다'
          }, 400);
        }

        const payload: NotificationPayload = {
          title: body.title || '🧪 테스트 알림',
          body: body.body || 'FCM 푸시 알림이 정상적으로 작동합니다!',
          data: {
            type: 'test',
            timestamp: body.timestamp || new Date().toISOString()
          }
        };

        const success = await fcmService.sendNotificationToStudent(studentNum, payload);
        
        if (success) {
          return c.json({
            success: true,
            message: '테스트 푸시가 성공적으로 전송되었습니다',
            sentAt: new Date().toISOString()
          });
        } else {
          return c.json({
            success: false,
            message: '테스트 푸시 전송에 실패했습니다'
          }, 500);
        }
      } catch (error) {
        console.error('[FCM Controller] 테스트 푸시 오류:', error);
        return c.json({
          success: false,
          message: '테스트 푸시 전송 중 오류가 발생했습니다'
        }, 500);
      }
    },

    // 전체 알림 전송
    async sendNotificationToAll(c: Context): Promise<Response> {
      try {
        const body = await c.req.json() as { title: string; body: string; data?: any };
        
        if (!body.title || !body.body) {
          return c.json({
            success: false,
            message: '제목과 내용이 필요합니다'
          }, 400);
        }

        const payload: NotificationPayload = {
          title: body.title,
          body: body.body,
          data: body.data || {}
        };

        const result = await fcmService.sendNotificationToAll(payload);
        
        return c.json({
          success: true,
          message: `알림이 전송되었습니다 (성공: ${result.success}, 실패: ${result.failed})`,
          sentAt: new Date().toISOString(),
          results: result
        });
      } catch (error) {
        console.error('[FCM Controller] 전체 알림 전송 오류:', error);
        return c.json({
          success: false,
          message: '전체 알림 전송 중 오류가 발생했습니다'
        }, 500);
      }
    },

    // 알림 로그 조회
    async getNotificationLogs(c: Context): Promise<Response> {
      try {
        const studentNum = c.req.query('studentNum');
        const limit = parseInt(c.req.query('limit') || '50');
        const offset = parseInt(c.req.query('offset') || '0');
        
        // 여기서는 간단한 구현만 제공
        // 실제로는 데이터베이스에서 로그를 조회해야 함
        
        return c.json({
          success: true,
          message: '알림 로그 조회 기능은 추후 구현 예정입니다',
          studentNum,
          limit,
          offset
        });
      } catch (error) {
        console.error('[FCM Controller] 로그 조회 오류:', error);
        return c.json({
          success: false,
          message: '로그 조회 중 오류가 발생했습니다'
        }, 500);
      }
    }
  };
}