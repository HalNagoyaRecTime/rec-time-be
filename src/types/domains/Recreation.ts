export interface RecreationEntity {
  recreationId: number
  title: string
  description: string | null
  location: string
  startTime: number // HHMM format (e.g., 0910)
  endTime: number   // HHMM format (e.g., 1630)
  maxParticipants: number
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface RecreationFilters {
  status?: string
  fromDate?: string
  toDate?: string
  limit?: number
  offset?: number
}