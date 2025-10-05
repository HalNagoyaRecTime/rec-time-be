// src/controllers/ErrorController.ts
import { Context } from 'hono';
import { EmailServiceFunctions } from '../services/EmailService';

export interface ErrorControllerFunctions {
  reportError: (c: Context) => Promise<Response>;
}

export function createErrorController(
  emailService: EmailServiceFunctions
): ErrorControllerFunctions {
  return {
    // -------------------------
    // reportError
    // -------------------------
    reportError: async (c: Context) => {
      try {
        const body = await c.req.json();
        const { 
          studentNum, 
          errorType, 
          errorMessage, 
          stackTrace, 
          userAgent, 
          url 
        } = body;

        // 에러 정보를 메일로 전송
        await emailService.sendErrorEmail({
          studentNum,
          errorType: errorType || 'Unknown Error',
          errorMessage: errorMessage || 'No error message provided',
          stackTrace,
          timestamp: new Date().toISOString(),
          userAgent: userAgent || c.req.header('User-Agent'),
          url: url || c.req.url,
        });

        return c.json({ 
          success: true, 
          message: '에러 리포트가 전송되었습니다.' 
        });
      } catch (error) {
        console.error('[reportError] error =', error);
        return c.json({ 
          error: '에러 리포트 전송에 실패했습니다.' 
        }, 500);
      }
    },
  };
}
