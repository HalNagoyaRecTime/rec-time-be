import { Context } from 'hono'

// Base Controller Function Type
export type ControllerFunction = (c: Context) => Promise<Response>

// Student Controller Functions
export interface StudentControllerFunctions {
  getStudentById: ControllerFunction
}

// Recreation Controller Functions
export interface RecreationControllerFunctions {
  getAllRecreations: ControllerFunction
  getRecreationById: ControllerFunction
}
