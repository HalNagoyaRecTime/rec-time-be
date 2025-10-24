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
  DownloadLogControllerFunctions,
  ErrorControllerFunctions,
} from './controllers';
import type { DataUpdateControllerFunctions } from '../controllers/DataUpdateController';
import type { VersionControllerFunctions } from '../controllers/VersionController';

export type ControllerMap = {
  studentController: StudentControllerFunctions;
  eventController: EventControllerFunctions;
  entryController: EntryControllerFunctions;
  entryGroupController: EntryGroupControllerFunctions;
  notificationController: NotificationControllerFunctions;
  changeLogController: ChangeLogControllerFunctions;
  downloadLogController: DownloadLogControllerFunctions;
  errorController: ErrorControllerFunctions;
  dataUpdateController: DataUpdateControllerFunctions;
  versionController: VersionControllerFunctions;
};

export type CustomContext = Context<{
  Bindings: Bindings;
  Variables: ControllerMap;
}>;
