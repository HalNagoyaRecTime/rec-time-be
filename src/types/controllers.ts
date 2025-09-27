import { Context } from 'hono';

export type ControllerFunction = (c: Context) => Promise<any>;

export interface StudentControllerFunctions {
  getStudentByNum: ControllerFunction;
}

// Event Controller Functions
export interface EventControllerFunctions {
  getAllEvents: ControllerFunction;
}

// Entry Controller Functions
export interface EntryControllerFunctions {
  // getAllEntries: ControllerFunction;
  getEntryById: ControllerFunction;
}

// Group Controller Functions
export interface EntryGroupControllerFunctions {
  getGroupsByEventId: ControllerFunction;
}
