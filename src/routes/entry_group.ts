// 特定IDのエントリーグループすべて取得


import { Hono } from 'hono'
import { env } from '../env'
import { D1Database } from '@cloudflare/workers-types'
const entryGroupRoute = new Hono()
entryGroupRoute.get('/api/entry_group', async (c) => {
  try {
    const { DB4 } = env(c)
    const db = DB4 as D1Database
    const result = await db.prepare('SELECT * FROM entry_group').all()
    if (!result.success) {
      return c.text('Entry not found', 404)
    }
    return c.json(result.results)
  } catch (e) {
    console.error(e)
    return c.text('Internal Server Error', 500)
  }
})

// 特定IDのエントリーグループ取得イベントid別
entryGroupRoute.get('/api/entry_group/:eventId', async (c) => {
  try {
    const { DB4 } = env(c)
    const db = DB4 as D1Database
    const eventId = c.req.param('eventId') // URLパラメータからIDを取得
    const result = await db.prepare('SELECT * FROM entry_group WHERE f_event_id = ?').bind(eventId).first()
    if (!result) {
      return c.text('Entry not found', 404)
    }
    return c.json(result)
  } catch (e) {
    console.error(e)
    return c.text('Internal Server Error', 500)
  }
})

export default entryGroupRoute