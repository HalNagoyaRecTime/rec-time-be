import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { PrismaClient } from '@prisma/client'
import { StudentRepository } from './repositories/StudentRepository'
import { StudentService } from './services/StudentService'
import { StudentController } from './controllers/StudentController'
import { RecreationRepository } from './repositories/RecreationRepository'
import { RecreationService } from './services/RecreationService'
import { RecreationController } from './controllers/RecreationController'
import { ParticipationRepository } from './repositories/ParticipationRepository'
import { ParticipationService } from './services/ParticipationService'
import { ParticipationController } from './controllers/ParticipationController'

const app = new Hono()

app.use('*', cors())

// Initialize dependencies with regular Prisma (local SQLite)
const prisma = new PrismaClient()
const studentRepository = new StudentRepository(prisma)
const studentService = new StudentService(studentRepository)
const studentController = new StudentController(studentService)

const recreationRepository = new RecreationRepository(prisma)
const recreationService = new RecreationService(recreationRepository)
const recreationController = new RecreationController(recreationService)

const participationRepository = new ParticipationRepository(prisma)
const participationService = new ParticipationService(participationRepository, recreationRepository, studentRepository)
const participationController = new ParticipationController(participationService)

app.get('/', (c) => {
  return c.json({
    message: 'Recreation Management API - Three Layer Architecture',
    version: '1.0.0',
    endpoints: {
      students: '/api/v1/students/{studentId}',
      recreations: '/api/v1/recreations',
      participations: '/api/v1/participations',
    },
    swagger: '/swagger.yml'
  })
})

// API v1 routes
const apiV1 = new Hono()

// Student routes
apiV1.get('/students/:studentId', (c) => studentController.getStudentById(c))
apiV1.get('/students/:studentId/participations', (c) => participationController.getStudentParticipations(c))

// Recreation routes
apiV1.get('/recreations', (c) => recreationController.getAllRecreations(c))
apiV1.get('/recreations/:recreationId', (c) => recreationController.getRecreationById(c))
apiV1.get('/recreations/:recreationId/competitions', (c) => participationController.getRecreationParticipants(c))
apiV1.post('/recreations', (c) => recreationController.createRecreation(c))
apiV1.put('/recreations/:recreationId', (c) => recreationController.updateRecreation(c))
apiV1.delete('/recreations/:recreationId', (c) => recreationController.deleteRecreation(c))

// Participation routes
apiV1.post('/participations', (c) => participationController.createParticipation(c))
apiV1.delete('/participations/:participationId', (c) => participationController.cancelParticipation(c))

// Mount API v1
app.route('/api/v1', apiV1)

// Legacy routes for backward compatibility
app.get('/api/students', (c) => studentController.getAllStudents(c))
app.get('/api/students/:id', (c) => studentController.getStudentById(c))
app.post('/api/students', (c) => studentController.createStudent(c))
app.put('/api/students/:id', (c) => studentController.updateStudent(c))
app.delete('/api/students/:id', (c) => studentController.deleteStudent(c))

const port = 3000
console.log(`Server is running on http://localhost:${port}`)
console.log(`API documentation: http://localhost:${port}/swagger.yml`)
console.log(`API v1 base URL: http://localhost:${port}/api/v1`)

serve({
  fetch: app.fetch,
  port,
})
