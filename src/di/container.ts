import { PrismaClient } from '@prisma/client'
import { getPrisma } from '../lib/db'
import { 
  createStudentUseCases, 
} from '../application/usecases'
import { 
  createPrismaStudentRepository, 
} from '../infrastructure/database'
import { 
  createStudentController, 
} from '../presentation/controllers'

type Env = {
  DB: D1Database;
}

export function createDIContainer(env?: Env) {
  const prisma = getPrisma(env)
  
  // Repositories
  const studentRepository = createPrismaStudentRepository(prisma)
  
  // UseCases
  const studentUseCases = createStudentUseCases(studentRepository)
  
  // Controllers
  const studentController = createStudentController(studentUseCases)

  return {
    prisma,
    studentController,
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
