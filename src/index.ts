import { Hono } from 'hono'
import eventsRoute from './routes/events'
import studentsRoute from './routes/students'
import studentsNameRoute from './routes/studentsname'
import entryRoute from './routes/entry'
import entryAllRoute from './routes/entry_all'
import entryGroupRoute from './routes/entry_group'

const app = new Hono()

app.route('/', eventsRoute)
app.route('/', studentsRoute)
app.route('/', studentsNameRoute)
app.route('/', entryRoute)
app.route('/', entryAllRoute)
app.route('/', entryGroupRoute)

app.get('/', (c) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Backend Server</title>
      </head>
      <body>
        <h1>Hello! This is the backend server.</h1>
        <button onclick="location.href='/api/events'">Go to /api/events</button>
        <button onclick="location.href='/api/students/50013'">Go to /api/students</button>
        <button onclick="location.href='/api/entry'">Go to /api/entry</button>
        <button onclick="location.href='/api/entry_group'">Go to /api/entry_group</button>
      </body>
    </html>
  `
return c.html(html)
})


export default app
