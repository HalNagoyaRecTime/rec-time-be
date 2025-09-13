// Student Service Types
export interface StudentServiceFunctions {
  getAllStudents: () => Promise<any[]>
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
  }) => Promise<{ recreations: any[], total: number }>
  getRecreationById: (id: number) => Promise<any>
}

// Participation Service Types
export interface ParticipationServiceFunctions {
  getStudentParticipations: (studentId: number, options: {
    status?: string
    fromDate?: string
    toDate?: string
  }) => Promise<any[]>
  getRecreationParticipants: (recreationId: number) => Promise<any[]>
}

// All Service Functions
export interface AllServiceFunctions 
  extends StudentServiceFunctions, 
          RecreationServiceFunctions, 
          ParticipationServiceFunctions {}
