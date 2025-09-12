import { Hono } from 'hono'
import type { StudentController } from '../controllers'

export function createStudentRoutes(studentController: StudentController) {
  const app = new Hono()

  // GET /api/users - Get all students
  app.get('/', studentController.getAllStudents)

  // GET /api/users/:id - Get student by ID
  app.get('/:id', studentController.getStudentById)

  // POST /api/users - Create new student
  app.post('/', studentController.createStudent)

  // PUT /api/users/:id - Update student
  app.put('/:id', studentController.updateStudent)

  // DELETE /api/users/:id - Delete student
  app.delete('/:id', studentController.deleteStudent)

  return app
}
