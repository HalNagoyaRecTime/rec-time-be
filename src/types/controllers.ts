import { Context } from 'hono';

export type ControllerFunction = (c: Context) => Promise<any>;

export interface StudentControllerFunctions {
  getStudentById: ControllerFunction;
}

// Recreation Controller Functions
export interface RecreationControllerFunctions {
  getAllRecreations: ControllerFunction;
  getRecreationById: ControllerFunction;
}
