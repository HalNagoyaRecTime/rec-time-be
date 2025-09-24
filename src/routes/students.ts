import { Hono } from 'hono'
import { env } from '../env'
import { D1Database } from '@cloudflare/workers-types'

const studentsRoute = new Hono()

studentsRoute.get('/api/students/:studentsid', async (c) => {
  try {
    const { DB2 } = env(c)
    const db = DB2 as D1Database
    const studentsid = c.req.param('studentsid')
    const result = await db.prepare('SELECT * FROM students WHERE f_student_num = ?').bind(studentsid).first()
    if (!result) return c.text('Student not found', 404)
    return c.json(result)
  } catch (e) {
    console.error(e)
    return c.text('Internal Server Error', 500)
  }
})

export default studentsRoute
