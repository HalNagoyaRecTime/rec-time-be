// Student Repository Types
export interface StudentRepositoryFunctions {
  findAll: () => Promise<any[]>
  findById: (id: string) => Promise<any | null>
  create: (data: any) => Promise<any>
  update: (id: string, data: any) => Promise<any>
  delete: (id: string) => Promise<void>
}

// Recreation Repository Types
export interface RecreationRepositoryFunctions {
  findAll: (options?: {
    status?: string
    fromDate?: Date
    toDate?: Date
    limit?: number
    offset?: number
  }) => Promise<{ recreations: any[], total: number }>
  findById: (id: number) => Promise<any | null>
  findByIdWithParticipantCount: (id: number) => Promise<any | null>
  create: (data: any) => Promise<any>
  update: (id: number, data: any) => Promise<any>
  delete: (id: number) => Promise<void>
}

// Participation Repository Types
export interface ParticipationRepositoryFunctions {
  findByStudentId: (studentId: string, options?: {
    status?: string
    fromDate?: Date
    toDate?: Date
  }) => Promise<any[]>
  findByRecreationId: (recreationId: number) => Promise<any[]>
  findByStudentAndRecreation: (studentId: string, recreationId: number) => Promise<any | null>
  findById: (id: number) => Promise<any | null>
  create: (data: {
    studentId: string
    recreationId: number
  }) => Promise<any>
  delete: (id: number) => Promise<void>
}

// All Repository Functions (without extending due to conflicting method signatures)
export interface AllRepositoryFunctions {
  // Student methods
  findAllStudents: () => Promise<any[]>
  findStudentById: (id: string) => Promise<any | null>
  createStudent: (data: any) => Promise<any>
  updateStudent: (id: string, data: any) => Promise<any>
  deleteStudent: (id: string) => Promise<void>
  
  // Recreation methods
  findAllRecreations: (options?: {
    status?: string
    fromDate?: Date
    toDate?: Date
    limit?: number
    offset?: number
  }) => Promise<{ recreations: any[], total: number }>
  findRecreationById: (id: number) => Promise<any | null>
  findRecreationByIdWithParticipantCount: (id: number) => Promise<any | null>
  createRecreation: (data: any) => Promise<any>
  updateRecreation: (id: number, data: any) => Promise<any>
  deleteRecreation: (id: number) => Promise<void>
  
  // Participation methods
  findParticipationsByStudentId: (studentId: string, options?: {
    status?: string
    fromDate?: Date
    toDate?: Date
  }) => Promise<any[]>
  findParticipationsByRecreationId: (recreationId: number) => Promise<any[]>
  findParticipationByStudentAndRecreation: (studentId: string, recreationId: number) => Promise<any | null>
  findParticipationById: (id: number) => Promise<any | null>
  createParticipation: (data: {
    studentId: string
    recreationId: number
  }) => Promise<any>
  deleteParticipation: (id: number) => Promise<void>
}