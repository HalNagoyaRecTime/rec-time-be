import { PrismaClient } from '@prisma/client'
import { getPrisma } from '../lib/db'
import { createStudentRepository } from '../repositories/StudentRepository'
import { createStudentService } from '../services/StudentService'
import { StudentController } from '../controllers/StudentController'
import { createRecreationRepository } from '../repositories/RecreationRepository'
import { createRecreationService } from '../services/RecreationService'
import { RecreationController } from '../controllers/RecreationController'
import { createParticipationRepository } from '../repositories/ParticipationRepository'
import { createParticipationService } from '../services/ParticipationService'
import { ParticipationController } from '../controllers/ParticipationController'
type Env = {
  DB: D1Database;
}

export function createDIContainer(env?: Env) {
  const prisma = env ? getPrisma(env) : new PrismaClient()
  
  // Repositories
  const studentRepository = createStudentRepository(prisma)
  const recreationRepository = createRecreationRepository(prisma)
  const participationRepository = createParticipationRepository(prisma)
  
  // Services
  const studentService = createStudentService(studentRepository)
  const recreationService = createRecreationService(recreationRepository)
  const participationService = createParticipationService(participationRepository, recreationRepository, studentRepository)
  
  // Controllers
  const studentController = new StudentController(studentService)
  const recreationController = new RecreationController(recreationService)
  const participationController = new ParticipationController(participationService)

  return {
    prisma,
    studentController,
    recreationController,
    participationController,
  }
}

export type DIContainer = ReturnType<typeof createDIContainer>

let containerInstance: DIContainer | null = null

export function getDIContainer(env?: Env): DIContainer {
  // Cloudflare Workers環境では毎回新しいインスタンスを作成
  if (env) {
    return createDIContainer(env)
  }
  
  // ローカル開発環境ではシングルトンを使用
  if (!containerInstance) {
    containerInstance = createDIContainer()
  }
  return containerInstance
}
