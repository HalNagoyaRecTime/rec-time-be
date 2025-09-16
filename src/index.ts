import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getDb } from './lib/db';
import { createStudentRepository } from './repositories/StudentRepository';
import { createStudentService } from './services/StudentService';
import { createStudentController } from './controllers/StudentController';
import { createRecreationRepository } from './repositories/RecreationRepository';
import { createRecreationService } from './services/RecreationService';
import { createRecreationController } from './controllers/RecreationController';
import { D1Database } from '@cloudflare/workers-types';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

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
const apiV1 = new Hono<{ Bindings: Bindings }>();

// Student routes
apiV1.get('/students/:studentId', c => {
  const db = getDb(c.env);
  const studentRepository = createStudentRepository(db);
  const studentService = createStudentService(studentRepository);
  const studentController = createStudentController(studentService);
  return studentController.getStudentById(c);
});

// Recreation routes
apiV1.get('/recreations', c => {
  const db = getDb(c.env);
  const recreationRepository = createRecreationRepository(db);
  const recreationService = createRecreationService(recreationRepository);
  const recreationController = createRecreationController(recreationService);
  return recreationController.getAllRecreations(c);
});

apiV1.get('/recreations/:recreationId', c => {
  const db = getDb(c.env);
  const recreationRepository = createRecreationRepository(db);
  const recreationService = createRecreationService(recreationRepository);
  const recreationController = createRecreationController(recreationService);
  return recreationController.getRecreationById(c);
});

// Mount API v1
app.route('/api/v1', apiV1);

export default app;
