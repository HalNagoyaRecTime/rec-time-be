// src/utils/logger.ts
import { ENV } from '../config/env';

// 로그 레벨 정의 / ログレベル定義
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

// 로그 레벨 이름 / ログレベル名
const LOG_LEVEL_NAMES = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.CRITICAL]: 'CRITICAL',
};

// 로그 포맷터 / ログフォーマッター
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  data?: any;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  service: string;
  environment: string;
  version?: string;
}

// 현재 로그 레벨 설정 / 現在のログレベル設定
const getCurrentLogLevel = (): LogLevel => {
  const envLevel = ENV.NODE_ENV === 'production' ? 'warn' : 'debug';
  switch (envLevel) {
    case 'debug': return LogLevel.DEBUG;
    case 'info': return LogLevel.INFO;
    case 'warn': return LogLevel.WARN;
    case 'error': return LogLevel.ERROR;
    case 'critical': return LogLevel.CRITICAL;
    default: return LogLevel.INFO;
  }
};

// 로그 포맷팅 / ログフォーマット
const formatLogEntry = (entry: LogEntry): string => {
  const timestamp = new Date().toISOString();
  const level = entry.level;
  const message = entry.message;
  const context = entry.context ? `[${entry.context}]` : '';
  const data = entry.data ? ` | Data: ${JSON.stringify(entry.data)}` : '';
  const error = entry.error ? ` | Error: ${entry.error.message}` : '';
  
  return `${timestamp} [${level}] ${context} ${message}${data}${error}`;
};

// Cloudflare Workers용 로깅 함수 / Cloudflare Workers用ロギング関数
const logToConsole = (entry: LogEntry): void => {
  const formattedLog = formatLogEntry(entry);
  
  switch (entry.level) {
    case 'DEBUG':
      console.debug(formattedLog);
      break;
    case 'INFO':
      console.info(formattedLog);
      break;
    case 'WARN':
      console.warn(formattedLog);
      break;
    case 'ERROR':
    case 'CRITICAL':
      console.error(formattedLog);
      if (entry.error?.stack) {
        console.error('Stack Trace:', entry.error.stack);
      }
      break;
    default:
      console.log(formattedLog);
  }
};


// 메인 로깅 함수 / メインロギング関数
const log = (level: LogLevel, message: string, context?: string, data?: any, error?: Error): void => {
  const currentLevel = getCurrentLogLevel();
  
  // 현재 설정된 레벨보다 낮은 로그는 무시 / 現在設定されたレベルより低いログは無視
  if (level < currentLevel) return;
  
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: LOG_LEVEL_NAMES[level],
    message,
    context,
    data,
    error: error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : undefined,
    service: 'rec-time-backend',
    environment: ENV.NODE_ENV,
    version: process.env.BUILD_VERSION || 'unknown',
  };
  
  // 콘솔에 로그 출력 / コンソールにログ出力
  logToConsole(entry);
};

// 로깅 함수들 export / ロギング関数をexport
export const logger = {
  debug: (message: string, context?: string, data?: any) => {
    log(LogLevel.DEBUG, message, context, data);
  },
  
  info: (message: string, context?: string, data?: any) => {
    log(LogLevel.INFO, message, context, data);
  },
  
  warn: (message: string, context?: string, data?: any) => {
    log(LogLevel.WARN, message, context, data);
  },
  
  error: (message: string, context?: string, data?: any, error?: Error) => {
    log(LogLevel.ERROR, message, context, data, error);
  },
  
  critical: (message: string, context?: string, data?: any, error?: Error) => {
    log(LogLevel.CRITICAL, message, context, data, error);
  },
};

export default logger;
