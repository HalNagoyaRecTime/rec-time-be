import { config } from 'dotenv';
import path from 'path';

// 環境に応じて適切なファイルを読み込み
const envFile = process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev';

// .envファイルのパスを指定して読み込み
const envPath = path.resolve(process.cwd(), envFile);
config({ path: envPath });

// フォールバックとして .env も読み込み
config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8080'),
  HOST: process.env.HOST || '0.0.0.0',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  HTTPS_KEY_PATH: process.env.HTTPS_KEY_PATH || './localhost+1-key.pem',
  HTTPS_CERT_PATH: process.env.HTTPS_CERT_PATH || './localhost+1.pem',
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
  ],
};

// 設定値をログ出力（開発環境のみ）
if (ENV.NODE_ENV === 'development') {
  console.log(`   Environment Variables Loaded:`);
  console.log(`   NODE_ENV: ${ENV.NODE_ENV}`);
  console.log(`   PORT: ${ENV.PORT}`);
  console.log(`   HOST: ${ENV.HOST}`);
  console.log(`   DATABASE_URL: ${ENV.DATABASE_URL}`);
  console.log(`   HTTPS_KEY_PATH: ${ENV.HTTPS_KEY_PATH}`);
  console.log(`   HTTPS_CERT_PATH: ${ENV.HTTPS_CERT_PATH}`);
  console.log(`   CORS_ORIGINS: ${ENV.CORS_ORIGINS.join(', ')}`);
}
