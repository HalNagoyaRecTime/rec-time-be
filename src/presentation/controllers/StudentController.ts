import type { Context } from 'hono'
import type { StudentUseCases } from '../../application/usecases'

export class StudentController {
  constructor(private studentUseCases: StudentUseCases) {}

  async getAllStudents(c: Context) {
    const students = await this.studentUseCases.getAllStudents()
    return c.json(students)
  }

  async getStudentById(c: Context) {
    const id = c.req.param('id')
    const student = await this.studentUseCases.getStudentById(id)
    
    if (!student) {
      return c.json({ error: 'Student not found' }, 404)
    }
    
    return c.json(student)
  }

  async createStudent(c: Context) {
    const data = await c.req.json() 
    const student = await this.studentUseCases.createStudent(data)
    return c.json(student, 201)
  }

  async updateStudent(c: Context) {
    const id = c.req.param('id')
    const data = await c.req.json()
    const student = await this.studentUseCases.updateStudent(id, data)
    
    if (!student) {
      return c.json({ error: 'Student not found' }, 404)
    }
    
    return c.json(student)
  }

  async deleteStudent(c: Context) {
    const id = c.req.param('id')
    
    try {
      await this.studentUseCases.deleteStudent(id)
      return c.body(null, 204)
    } catch {
      return c.json({ error: 'Student not found' }, 404)
    }
  }
}

export function createStudentController(studentUseCases: StudentUseCases) {
  return new StudentController(studentUseCases)
}
