// src/middleware/logging.ts
import { Context, Next } from 'hono';
import { logger } from '../utils/logger';
import { getGitInfo } from '../utils/gitInfo';

// 요청 로깅 미들웨어 / リクエストロギングミドルウェア
export function requestLogger() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const method = c.req.method;
    const url = c.req.url;
    const userAgent = c.req.header('User-Agent') || 'unknown';
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    
    // 요청 시작 로깅 / リクエスト開始ロギング
    logger.debug(`Request started: ${method} ${url}`, 'RequestLogger', {
      method,
      url,
      userAgent,
      ip,
    });
    
    try {
      await next();
      
      const duration = Date.now() - startTime;
      const statusCode = c.res.status;
      
      // 응답 완료 로깅 / レスポンス完了ロギング
      if (statusCode >= 400) {
        logger.error(`API Error: ${method} ${url} - ${statusCode} (${duration}ms)`, 'RequestLogger', {
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
          userAgent,
          ip,
        });
      } else {
        logger.info(`Request completed: ${method} ${url} - ${statusCode} (${duration}ms)`, 'RequestLogger', {
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.critical(`Unhandled request error: ${method} ${url}`, 'RequestLogger', {
        method,
        url,
        duration: `${duration}ms`,
        userAgent,
        ip,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : error,
      }, error instanceof Error ? error : new Error(String(error)));
      
      throw error;
    }
  };
}

// 에러 핸들링 미들웨어 / エラーハンドリングミドルウェア
export function errorHandler() {
  return async (error: Error, c: Context) => {
    const gitInfo = getGitInfo();
    
    logger.critical('Unhandled error occurred / 미처리 에러가 발생했습니다', 'ErrorHandler', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      request: {
        method: c.req.method,
        url: c.req.url,
        headers: Object.fromEntries(c.req.raw.headers.entries()),
      },
      gitInfo: {
        commitHash: gitInfo.commitHash,
        commitAuthor: gitInfo.commitAuthor,
        branch: gitInfo.branch,
      },
    }, error);
    
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
      timestamp: new Date().toISOString(),
    }, 500);
  };
}

// API 응답 로깅 헬퍼 / APIレスポンスロギングヘルパー
export function logApiResponse(c: Context, data: any, context: string = 'API'): void {
  logger.debug(`API Response: ${c.req.method} ${c.req.url}`, context, {
    method: c.req.method,
    url: c.req.url,
    responseData: data,
  });
}

// 데이터베이스 쿼리 로깅 헬퍼 / データベースクエリロギングヘルパー
export function logDatabaseQuery(query: string, params?: any[], duration?: number): void {
  logger.debug(`Database Query executed`, 'Database', {
    query,
    params,
    duration: duration ? `${duration}ms` : undefined,
  });
}

// 메일 전송 로깅 헬퍼 / メール送信ロギングヘルパー
export function logEmailSent(to: string, subject: string, success: boolean, error?: Error): void {
  if (success) {
    logger.info(`Email sent successfully`, 'EmailService', {
      to,
      subject,
    });
  } else {
    logger.error(`Email sending failed`, 'EmailService', {
      to,
      subject,
    }, error);
  }
}
