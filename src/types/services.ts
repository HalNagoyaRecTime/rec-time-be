// Student Service Types
export interface StudentServiceFunctions {
  getAllStudents: () => Promise<any[]>
  getStudentById: (id: string) => Promise<any>
  createStudent: (data: any) => Promise<any>
  updateStudent: (id: string, data: any) => Promise<any>
  deleteStudent: (id: string) => Promise<void>
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
  createRecreation: (data: any) => Promise<any>
  updateRecreation: (id: number, data: any) => Promise<any>
  deleteRecreation: (id: number) => Promise<void>
}

// Participation Service Types
export interface ParticipationServiceFunctions {
  getStudentParticipations: (studentId: string, options: {
    status?: string
    fromDate?: string
    toDate?: string
  }) => Promise<any[]>
  getRecreationParticipants: (recreationId: number) => Promise<any[]>
  createParticipation: (data: {
    studentId: string
    recreationId: number
  }) => Promise<any>
  cancelParticipation: (participationId: number) => Promise<void>
}

// All Service Functions
export interface AllServiceFunctions 
  extends StudentServiceFunctions, 
          RecreationServiceFunctions, 
          ParticipationServiceFunctions {}