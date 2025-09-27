import { Context } from 'hono';

export type ControllerFunction = (c: Context) => Promise<any>;

export interface StudentControllerFunctions {
  getStudentById: ControllerFunction;
  getStudentByStudentNum: ControllerFunction; // ✅ 추가
  getStudentPayloadByStudentNum: ControllerFunction;
}

// Event Controller Functions
export interface EventControllerFunctions {
  getAllEvents: ControllerFunction;
  getEventById: ControllerFunction;
}

// Entry Controller Functions
export interface EntryControllerFunctions {
  getAllEntries: ControllerFunction;
  getEntryById: ControllerFunction;
}
