import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import Database from 'better-sqlite3'
 
const app = new Hono()
const db = new Database('./sqlite-tools-win-x64-3500400/mine.db')
 
app.get('/events', (c) => {
  const rows = db.prepare('SELECT * FROM t_events').all()
  return c.json(rows)   // ← JSONレスポンス
})
 
app.get('/students', (c) => {
  const rows = db.prepare('SELECT * FROM m_students').all()
  return c.json(rows)   // ← JSONレスポンス
})

app.get('/entries', (c) => {
  const rows = db.prepare('SELECT * FROM t_entries').all()
  return c.json(rows)   // ← JSONレスポンス
})

app.get('/entries_group', (c) => {
  const rows = db.prepare('SELECT * FROM t_entries_group').all()
  return c.json(rows)   // ← JSONレスポンス
})

app.get('/', (c) => {
  return c.text('Hello! サーバーは動いています 🚀')
})
 
serve(app, (info) => {
  console.log(`🚀 Server is running at http://localhost:${info.port}`)
})