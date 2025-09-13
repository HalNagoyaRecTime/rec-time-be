import { Context } from 'hono'

// Base Controller Function Type
export type ControllerFunction = (c: Context) => Promise<Response>

// Student Controller Functions
export interface StudentControllerFunctions {
  getAllStudents: ControllerFunction
  getStudentById: ControllerFunction
}

// Recreation Controller Functions
export interface RecreationControllerFunctions {
  getAllRecreations: ControllerFunction
  getRecreationById: ControllerFunction
}

// Participation Controller Functions
export interface ParticipationControllerFunctions {
  getStudentParticipations: ControllerFunction
  getRecreationParticipants: ControllerFunction
}

// All Controller Functions
export interface AllControllerFunctions 
  extends StudentControllerFunctions, 
          RecreationControllerFunctions, 
          ParticipationControllerFunctions {}
