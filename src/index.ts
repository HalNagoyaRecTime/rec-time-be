import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createAdaptorServer } from '@hono/node-server';
import https from 'https';
import fs from 'fs';
import { getDIContainer } from './di/container';
import { ENV } from './config/env';

const app = new Hono();

app.use('*', cors({
  origin: ENV.CORS_ORIGINS,
  credentials: true
}));

// Initialize dependencies through DI container
const container = getDIContainer();
const { studentController, recreationController } = container;

app.get('/', c => {
  return c.json({
    message: 'Recreation Management API - Three Layer Architecture',
    version: '1.0.0',
    endpoints: {
      students: '/api/v1/students/{studentId}',
      recreations: '/api/v1/recreations',
    },
    swagger: '/swagger.yml',
  });
});

// API v1 routes
const apiV1 = new Hono();

// Student routes
apiV1.get('/students/:studentId', c => studentController.getStudentById(c));

// Recreation routes
apiV1.get('/recreations', c => recreationController.getAllRecreations(c));
apiV1.get('/recreations/:recreationId', c =>
  recreationController.getRecreationById(c)
);

// Mount API v1
app.route('/api/v1', apiV1);

// HTTPS options
const httpsOptions = {
  key: fs.readFileSync(ENV.HTTPS_KEY_PATH),
  cert: fs.readFileSync(ENV.HTTPS_CERT_PATH),
};

// HTTPS サーバーを作成
const server = createAdaptorServer({
  fetch: app.fetch,
  createServer: https.createServer,
  serverOptions: httpsOptions,
});

server.listen(ENV.PORT, ENV.HOST, () => {
  console.log(`HTTPS Server running on https://localhost:${ENV.PORT}`);
});
