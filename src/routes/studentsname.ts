import { Hono } from 'hono'
import { env } from '../env'
import { D1Database } from '@cloudflare/workers-types'

const studentsNameRoute = new Hono()

studentsNameRoute.get('/api/studentsname/:num', async (c) => {
  try {
    const { DB2 } = env(c)
    const db = DB2 as D1Database
    const num = c.req.param('num')
    const result = await db.prepare('SELECT f_name FROM students WHERE f_student_num = ?').bind(num).first()
    if (!result) return c.text('Student not found', 404)
    return c.json(result)
  } catch (e) {
    console.error(e)
    return c.text('Internal Server Error', 500)
  }
})

export default studentsNameRoute
