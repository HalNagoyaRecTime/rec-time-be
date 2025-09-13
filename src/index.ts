import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { getDIContainer } from './di/container';

const app = new Hono();

app.use('*', cors());

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

const port = 8080;

serve({
  fetch: app.fetch,
  port,
});
