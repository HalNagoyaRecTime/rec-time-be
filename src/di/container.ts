import { getDb } from '../lib/db';
import { createStudentRepository } from '../repositories/StudentRepository';
import { createStudentService } from '../services/StudentService';
import { createStudentController } from '../controllers/StudentController';
import { createRecreationRepository } from '../repositories/RecreationRepository';
import { createRecreationService } from '../services/RecreationService';
import { createRecreationController } from '../controllers/RecreationController';
import { D1Database } from '@cloudflare/workers-types';

type Env = {
  DB: D1Database;
};

export function createDIContainer(env?: Env) {
  const db = getDb(env);

  if (!db) {
    throw new Error('Database is not available');
  }

  // Repositories
  const studentRepository = createStudentRepository(db);
  const recreationRepository = createRecreationRepository(db);

  // Services
  const studentService = createStudentService(studentRepository);
  const recreationService = createRecreationService(recreationRepository);

  // Controllers (function-based)
  const studentController = createStudentController(studentService);
  const recreationController = createRecreationController(recreationService);

  return {
    db,
    studentController,
    recreationController,
  };
}

export type DIContainer = ReturnType<typeof createDIContainer>;

let containerInstance: DIContainer | null = null;

export function getDIContainer(env?: Env): DIContainer {
  // Cloudflare Workers環境では毎回新しいインスタンスを作成
  if (env) {
    return createDIContainer(env);
  }

  // ローカル開発環境ではシングルトンを使用
  if (!containerInstance) {
    containerInstance = createDIContainer();
  }
  return containerInstance;
}
