import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { getDIContainer } from './di/container'

const app = new Hono()

app.use('*', cors())

// Initialize dependencies through DI container
const container = getDIContainer()
const { studentController, recreationController, participationController } = container

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


const port = 8080
console.log(`Server is running on http://localhost:${port}`)
console.log(`API documentation: http://localhost:${port}/swagger.yml`)
console.log(`API v1 base URL: http://localhost:${port}/api/v1`)

serve({
  fetch: app.fetch,
  port,
})
