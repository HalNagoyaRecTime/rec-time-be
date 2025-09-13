import { RecreationEntity, StudentEntity } from "./domains"

// Student Repository Types
export interface StudentRepositoryFunctions {
  findById: (id: number) => Promise<
    StudentEntity | null
  >
}

// Recreation Repository Types
export interface RecreationRepositoryFunctions {
  findAll: (options: {
    status?: string
    fromTime?: number
    toTime?: number
    limit?: number
    offset?: number
  }) => Promise<{ recreations: 
    RecreationEntity[], total: number }>
  findByIdWithParticipantCount: (id: number) => Promise<
    RecreationEntity | null
  >
}
