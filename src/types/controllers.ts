import { Context } from 'hono';

export type ControllerFunction = (c: Context) => Promise<any>;

export interface StudentControllerFunctions {
  getStudentById: ControllerFunction;
  getStudentByStudentNum: ControllerFunction;
  getStudentPayloadByStudentNum: ControllerFunction;
  getStudentFullPayload: ControllerFunction; // ✅ 추가
}

export interface EntryControllerFunctions {
  getEventById: ControllerFunction;
  getAllEvents: ControllerFunction;
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
