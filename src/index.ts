import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import Database from 'better-sqlite3'
 
const app = new Hono()
const db = new Database('./sqlite-tools-win-x64-3500400/mine.db')
 

import { createEntryController } from './controllers/EntryController'
import { createEntryService } from './services/EntryService'
import { createEntryRepository } from './repositories/EntryRepository'

const entryRepository = createEntryRepository(db)
const entryService = createEntryService(entryRepository)
const entryController = createEntryController(entryService)

// app.get('/entries', entryController.getAllEntries)
app.get('/entries/:f_entry_id', entryController.getEntryById)






app.get('/', (c) => {
  return c.text('Hello! サーバーは動いています 🚀')
})
 
serve(app, (info) => {
  console.log(`🚀 Server is running at http://localhost:${info.port}`)
})