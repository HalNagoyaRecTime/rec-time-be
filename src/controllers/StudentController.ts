import { Context } from 'hono'
import { StudentControllerFunctions } from '../types/controllers'
import { StudentServiceFunctions } from '../types/services'

export function createStudentController(
  studentService: StudentServiceFunctions
): StudentControllerFunctions {

  const getAllStudents = async (c: Context) => {
    try {
      const students = await studentService.getAllStudents()
      return c.json(students)
    } catch (error) {
      console.error('Error in getAllStudents:', error)
      return c.json({ error: 'Failed to fetch students', details: error instanceof Error ? error.message : String(error) }, 500)
    }
  }

  const getStudentById = async (c: Context) => {
    try {
      const id = c.req.param('studentId') || c.req.param('id')
      const student = await studentService.getStudentById(parseInt(id))
      return c.json(student)
    } catch (error) {
      return c.json({ error: 'Student not found' }, 404)
    }
  }

  const createStudent = async (c: Context) => {
    try {
      const body = await c.req.json()
      const student = await studentService.createStudent(body)
      return c.json(student, 201)
    } catch (error) {
      return c.json({ error: 'Failed to create student' }, 400)
    }
  }

  const updateStudent = async (c: Context) => {
    try {
      const id = c.req.param('studentId') || c.req.param('id')
      const body = await c.req.json()
      const student = await studentService.updateStudent(parseInt(id), body)
      return c.json(student)
    } catch (error) {
      return c.json({ error: 'Failed to update student' }, 400)
    }
  }

  const deleteStudent = async (c: Context) => {
    try {
      const id = c.req.param('studentId') || c.req.param('id')
      await studentService.deleteStudent(parseInt(id))
      return c.json({ message: 'Student deleted successfully' })
    } catch (error) {
      return c.json({ error: 'Failed to delete student' }, 400)
    }
  }

  return {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
  }
}