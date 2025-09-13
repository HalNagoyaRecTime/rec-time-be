import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../lib/db';
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
  const prisma = env ? getPrisma(env) : new PrismaClient();

  // Repositories
  const studentRepository = createStudentRepository(prisma);
  const recreationRepository = createRecreationRepository(prisma);

  // Services
  const studentService = createStudentService(studentRepository);
  const recreationService = createRecreationService(recreationRepository);

  // Controllers (function-based)
  const studentController = createStudentController(studentService);
  const recreationController = createRecreationController(recreationService);

  return {
    prisma,
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
