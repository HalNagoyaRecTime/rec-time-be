// src/controllers/FCMController.ts
// FCM 관련 API 컨트롤러

import { Context } from 'hono';
import { FCMServiceFunctions } from '../services/FCMService';

export interface FCMControllerFunctions {
  registerToken(c: Context): Promise<Response>;
  sendPush(c: Context): Promise<Response>;
  getTokens(c: Context): Promise<Response>;
}

export function createFCMController(
  fcmService: FCMServiceFunctions
): FCMControllerFunctions {
  return {
    // FCM 토큰 등록 API
    async registerToken(c: Context): Promise<Response> {
      try {
        const { token } = await c.req.json();
        
        if (!token) {
          return c.json({ 
            success: false, 
            message: 'FCM 토큰이 필요합니다' 
          }, 400);
        }

        const result = await fcmService.registerToken(token);
        
        if (result) {
          return c.json({
            success: true,
            message: 'FCM 토큰이 성공적으로 등록되었습니다',
            token: token.substring(0, 20) + '...'
          });
        } else {
          return c.json({
            success: false,
            message: 'FCM 토큰 등록에 실패했습니다'
          }, 500);
        }
      } catch (error) {
        console.error('[FCM Controller] 토큰 등록 오류:', error);
        return c.json({
          success: false,
          message: '서버 오류가 발생했습니다'
        }, 500);
      }
    },

    // 푸시 알림 전송 API
    async sendPush(c: Context): Promise<Response> {
      try {
        const { title, body, data, token } = await c.req.json();
        
        if (!title || !body) {
          return c.json({
            success: false,
            message: '제목과 내용이 필요합니다'
          }, 400);
        }

        const message = { title, body, data };

        if (token) {
          // 특정 토큰에 전송
          const result = await fcmService.sendNotification(token, message);
          
          if (result) {
            return c.json({
              success: true,
              message: '푸시 알림이 성공적으로 전송되었습니다',
              target: 'single',
              token: token.substring(0, 20) + '...'
            });
          } else {
            return c.json({
              success: false,
              message: '푸시 알림 전송에 실패했습니다'
            }, 500);
          }
        } else {
          // 모든 등록된 토큰에 전송
          const result = await fcmService.sendNotificationToAll(message);
          
          return c.json({
            success: true,
            message: '전체 푸시 알림 전송이 완료되었습니다',
            target: 'all',
            results: {
              success: result.success,
              failed: result.failed,
              total: result.success + result.failed
            }
          });
        }
      } catch (error) {
        console.error('[FCM Controller] プッシュ送信エラー:', error);
        return c.json({
          success: false,
          message: 'サーバーエラーが発生しました'
        }, 500);
      }
    },

    // 등록된 FCM 토큰 목록 조회 API
    async getTokens(c: Context): Promise<Response> {
      try {
        const tokens = await fcmService.getRegisteredTokens();
        
        return c.json({
          success: true,
          count: tokens.length,
          tokens: tokens.map(token => ({
            token: token.substring(0, 20) + '...',
            fullToken: token // 실제 운영에서는 보안상 제거 필요
          }))
        });
      } catch (error) {
        console.error('[FCM Controller] トークン一覧取得エラー:', error);
        return c.json({
          success: false,
          message: 'サーバーエラーが発生しました'
        }, 500);
      }
    },
  };
}
