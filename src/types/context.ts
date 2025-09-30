// src/types/context.ts
import type { Context } from 'hono';
import type { Bindings } from './index';

import type {
  StudentControllerFunctions,
  EventControllerFunctions,
  EntryControllerFunctions,
  EntryGroupControllerFunctions,
  NotificationControllerFunctions,
  ChangeLogControllerFunctions,
} from './controllers';

export type ControllerMap = {
  studentController: StudentControllerFunctions;
  eventController: EventControllerFunctions;
  entryController: EntryControllerFunctions;
  entryGroupController: EntryGroupControllerFunctions;
  notificationController: NotificationControllerFunctions;
  changeLogController: ChangeLogControllerFunctions;
};

export type CustomContext = Context<{
  Bindings: Bindings;
  Variables: ControllerMap;
}>;
