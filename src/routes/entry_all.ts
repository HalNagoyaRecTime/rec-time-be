import { Hono } from 'hono'
import { env } from '../env'
import { D1Database } from '@cloudflare/workers-types'

const entryAllRoute = new Hono()

entryAllRoute.get('/api/entry', async (c) => {
  try {
    const { DB3 } = env(c)
    const db = DB3 as D1Database
    const result = await db.prepare('SELECT * FROM entry').all()
    if (!result.success) return c.text('Entry not found', 404)
    return c.json(result.results)
  } catch (e) {
    console.error(e)
    return c.text('Internal Server Error', 500)
  }
})

export default entryAllRoute
