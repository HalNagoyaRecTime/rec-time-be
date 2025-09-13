import { Context } from 'hono'

export class StudentController {
  constructor(private studentService: any) {}

  async getAllStudents(c: Context) {
    try {
      const students = await this.studentService.getAllStudents()
      return c.json(students)
    } catch (error) {
      console.error('Error in getAllStudents:', error)
      return c.json({ error: 'Failed to fetch students', details: error instanceof Error ? error.message : String(error) }, 500)
    }
  }

  async getStudentById(c: Context) {
    try {
      const id = c.req.param('id')
      const student = await this.studentService.getStudentById(id)
      return c.json(student)
    } catch (error) {
      return c.json({ error: 'Student not found' }, 404)
    }
  }

  async createStudent(c: Context) {
    try {
      const body = await c.req.json()
      const student = await this.studentService.createStudent(body)
      return c.json(student, 201)
    } catch (error) {
      return c.json({ error: 'Failed to create student' }, 400)
    }
  }

  async updateStudent(c: Context) {
    try {
      const id = c.req.param('id')
      const body = await c.req.json()
      const student = await this.studentService.updateStudent(id, body)
      return c.json(student)
    } catch (error) {
      return c.json({ error: 'Failed to update student' }, 400)
    }
  }

  async deleteStudent(c: Context) {
    try {
      const id = c.req.param('id')
      await this.studentService.deleteStudent(id)
      return c.json({ message: 'Student deleted successfully' })
    } catch (error) {
      return c.json({ error: 'Failed to delete student' }, 400)
    }
  }
}