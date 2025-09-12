import type { Context } from 'hono'
import type { StudentUseCases } from '../../application/usecases'

export function createStudentController(studentUseCases: StudentUseCases) {
  return {
    getAllStudents: async (c: Context) => {
      const students = await studentUseCases.getAllStudents()
      return c.json(students)
    },

    getStudentById: async (c: Context) => {
      const id = c.req.param('id')
      const student = await studentUseCases.getStudentById(id)
      
      if (!student) {
        return c.json({ error: 'Student not found' }, 404)
      }
      
      return c.json(student)
    },

    createStudent: async (c: Context) => {
      const data = await c.req.json() 
      const student = await studentUseCases.createStudent(data)
      return c.json(student, 201)
    },

    updateStudent: async (c: Context) => {
      const id = c.req.param('id')
      const data = await c.req.json()
      const student = await studentUseCases.updateStudent(id, data)
      
      if (!student) {
        return c.json({ error: 'Student not found' }, 404)
      }
      
      return c.json(student)
    },

    deleteStudent: async (c: Context) => {
      const id = c.req.param('id')
      
      try {
        await studentUseCases.deleteStudent(id)
        return c.body(null, 204)
      } catch {
        return c.json({ error: 'Student not found' }, 404)
      }
    }
  }
}

export type StudentController = ReturnType<typeof createStudentController>
