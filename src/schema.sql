CREATE TABLE events (
  f_event_id integer PRIMARY KEY,
  f_event_code TEXT CHECK (f_event_code IN ('E','C','A')),
  f_event_name varchar(30),
  f_time time,
  f_duration integer,
  f_summary TEXT
);

CREATE TABLE IF NOT EXISTS students (
  f_student_id INTEGER PRIMARY KEY,
  f_student_num CHAR(5),
  f_class VARCHAR(5),
  f_number CHAR(2),
  f_student_name VARCHAR(50),
  f_note TEXT
);

CREATE TABLE IF NOT EXISTS entry (
  f_entry_id INTEGER PRIMARY KEY,
  f_student_id INTEGER,
  f_event_id INTEGER
);

CREATE TABLE IF NOT EXISTS entry_group (
  f_event_id INTEGER,
  f_place VARCHAR(100),
  f_gather_time TIME
);



import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const events = sqliteTable('events', {
  f_event_id: integer('f_event_id').primaryKey(),
  f_event_code: text('f_event_code'),
  f_event_name: text('f_event_name'),
  f_time: text('f_time'),
  f_duration: integer('f_duration'),
  f_summary: text('f_summary'),
})
