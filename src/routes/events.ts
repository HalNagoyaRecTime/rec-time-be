import { Hono } from 'hono'
import { env } from '../env'
import { D1Database } from '@cloudflare/workers-types'

const eventsRoute = new Hono()

eventsRoute.get('/api/events', async (c) => {
  try {
    const { DB } = env(c)
    const db = DB as D1Database
    const result = await db.prepare('SELECT * FROM events').all()
    if (!result.success) return c.text('Event not found', 404)
    return c.json(result.results)
  } catch (e) {
    console.error(e)
    return c.text('Internal Server Error', 500)
  }
})

export default eventsRoute
