// Student Repository Types
export interface StudentRepositoryFunctions {
  findAll: () => Promise<any[]>
  findById: (id: number) => Promise<any | null>
}

// Recreation Repository Types
export interface RecreationRepositoryFunctions {
  findAll: (options: {
    status?: string
    fromTime?: number
    toTime?: number
    limit?: number
    offset?: number
  }) => Promise<{ recreations: any[], total: number }>
  findById: (id: number) => Promise<any | null>
  findByIdWithParticipantCount: (id: number) => Promise<any | null>
}

// Participation Repository Types
export interface ParticipationRepositoryFunctions {
  findByStudentId: (studentId: number, options: {
    status?: string
    fromTime?: number
    toTime?: number
  }) => Promise<any[]>
  findByRecreationId: (recreationId: number) => Promise<any[]>
  findByStudentAndRecreation: (studentId: number, recreationId: number) => Promise<any | null>
  findById: (id: number) => Promise<any | null>
}

// All Repository Functions (without extending due to conflicting method signatures)
export interface AllRepositoryFunctions {
  // Student methods
  findAllStudents: () => Promise<any[]>
  findStudentById: (id: string) => Promise<any | null>
  
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
  
  // Participation methods
  findParticipationsByStudentId: (studentId: string, options?: {
    status?: string
    fromDate?: Date
    toDate?: Date
  }) => Promise<any[]>
  findParticipationsByRecreationId: (recreationId: number) => Promise<any[]>
  findParticipationByStudentAndRecreation: (studentId: string, recreationId: number) => Promise<any | null>
  findParticipationById: (id: number) => Promise<any | null>
}
