import { RecreationEntity } from "./domains"

// Student Service Types
export interface StudentServiceFunctions {
  getStudentById: (id: number) => Promise<any>
}

// Recreation Service Types
export interface RecreationServiceFunctions {
  getAllRecreations: (options: {
    status?: string
    fromDate?: string
    toDate?: string
    limit?: number
    offset?: number
  }) => Promise<{ recreations: 
    RecreationEntity[], total: number }>
  getRecreationById: (id: number) => Promise<
  RecreationEntity
  >
}
