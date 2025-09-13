
export function createParticipationService(
  participationRepository: any,
  recreationRepository: any,
  studentRepository: any
) {
  return {
    async getStudentParticipations(studentId: string, options: {
      status?: string
      fromDate?: string
      toDate?: string
    }) {
      const participations = await participationRepository.findByStudentId(studentId, {
        ...options,
        fromDate: options.fromDate ? new Date(options.fromDate) : undefined,
        toDate: options.toDate ? new Date(options.toDate) : undefined
      })
      
      return participations.map((participation: any) => ({
        ...participation,
        is_participating: participation.status === 'registered' || participation.status === 'confirmed'
      }))
    },

    async getRecreationParticipants(recreationId: number) {
      const participations = await participationRepository.findByRecreationId(recreationId)
      
      return participations.map((participation: any) => ({
        ...participation,
        is_participating: participation.status === 'registered' || participation.status === 'confirmed'
      }))
    },

    async createParticipation(data: {
      studentId: string
      recreationId: number
    }) {
      // Check if student exists
      const student = await studentRepository.findById(data.studentId)
      if (!student) {
        throw new Error('Student not found')
      }

      // Check if recreation exists
      const recreation = await recreationRepository.findById(data.recreationId)
      if (!recreation) {
        throw new Error('Recreation not found')
      }

      // Check if already registered
      const existingParticipation = await participationRepository.findByStudentAndRecreation(
        data.studentId,
        data.recreationId
      )
      if (existingParticipation) {
        throw new Error('Already registered for this recreation')
      }

      // Check if recreation has available spots
      const recreationWithCount = await recreationRepository.findByIdWithParticipantCount(data.recreationId)
      if (recreationWithCount && recreationWithCount.current_participants >= recreationWithCount.maxParticipants) {
        throw new Error('Recreation is full')
      }

      const participation = await participationRepository.create(data)
      
      return {
        ...participation,
        is_participating: true
      }
    },

    async cancelParticipation(participationId: number) {
      const participation = await participationRepository.findById(participationId)
      if (!participation) {
        throw new Error('Participation not found')
      }

      return participationRepository.delete(participationId)
    }
  }
}