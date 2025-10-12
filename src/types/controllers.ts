// src/types/controllers.ts
import { Context } from 'hono';

export type ControllerFunction = (c: Context) => Promise<any>;

export interface StudentControllerFunctions {
  getStudentById: ControllerFunction;
  getStudentByStudentNum: ControllerFunction;
  getStudentByStudentNumAndBirthday: ControllerFunction;
  getStudentPayloadByStudentNum: ControllerFunction;
  getStudentFullPayload: ControllerFunction;
}

export interface EntryControllerFunctions {
  getEntriesByStudentNum: ControllerFunction;
  getAllEntries: ControllerFunction;
  getEntryById: ControllerFunction;
  getAlarmEntriesByStudentNum: ControllerFunction;
}

export interface EventControllerFunctions {
  getAllEvents: ControllerFunction;
  getEventById: ControllerFunction;
}

export interface EntryGroupControllerFunctions {
  getAll: ControllerFunction;
}

export interface NotificationControllerFunctions {
  getAll: ControllerFunction;
}

export interface ChangeLogControllerFunctions {
  getAll: ControllerFunction;
}

export interface DownloadLogControllerFunctions {
  getAllLogs: ControllerFunction;
  getLogsByStudentNum: ControllerFunction;
  getDownloadStats: ControllerFunction;
  getStudentDownloadComparison: ControllerFunction;
}

export interface ErrorControllerFunctions {
  reportError: ControllerFunction;
}
