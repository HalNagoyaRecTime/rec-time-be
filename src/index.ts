import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import Database from 'better-sqlite3'
 
const app = new Hono()
const db = new Database('./sqlite-tools-win-x64-3500400/mine.db')
 

import { createEntryController } from './controllers/EntryController'
import { createEntryService } from './services/EntryService'
import { createEntryRepository } from './repositories/EntryRepository'
import { createEventRepository } from './repositories/EventRepository'
import { createEventService } from './services/EventService'
import { createEventController } from './controllers/EventController'
import { createStudentRepository } from './repositories/StudentRepository'
import { createStudentService } from './services/StudentService'
import { createStudentController } from './controllers/StudentController'
import { createEntryGroupController } from './controllers/Entry_groupController'
import { createEntryGroupService } from './services/Entry_groupService'
import { createEntryGroupRepository } from './repositories/Entry_groupRepository'

const entryRepository = createEntryRepository(db)
const entryService = createEntryService(entryRepository)
const entryController = createEntryController(entryService)

const eventRepository = createEventRepository(db)
const eventService = createEventService(eventRepository)
const eventController = createEventController(eventService)

const studentRepository = createStudentRepository(db)
const studentService = createStudentService(studentRepository)
const studentController = createStudentController(studentService)

const entryGroupRepository = createEntryGroupRepository(db)
const entryGroupService = createEntryGroupService(entryGroupRepository)
const entryGroupController = createEntryGroupController(entryGroupService)

app.get('/entries/:f_entry_id', entryController.getEntryById)
app.get('/events', eventController.getAllEvents)
app.get('/students/:f_student_num', studentController.getStudentByNum)
app.get('/entry-groups/:f_event_id', entryGroupController.getGroupsByEventId)






app.get('/', (c) => {
  return c.text('Hello! サーバーは動いています 🚀')
})
 
serve(app, (info) => {
  console.log(`🚀 Server is running at http://localhost:${info.port}`)
})