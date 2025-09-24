import { Hono } from 'hono'
import { env } from '../env'
import { D1Database } from '@cloudflare/workers-types'

const entryRoute = new Hono()

entryRoute.get('/api/entry/:entryId', async (c) => {
  try {
    const { DB3 } = env(c)
    const db = DB3 as D1Database
    const entryId = c.req.param('entryId')
    const result = await db.prepare('SELECT * FROM entry WHERE f_entry_id = ?').bind(entryId).first()
    if (!result) return c.text('Entry not found', 404)
    return c.json(result)
  } catch (e) {
    console.error(e)
    return c.text('Internal Server Error', 500)
  }
})

export default entryRoute
