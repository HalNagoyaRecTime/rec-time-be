import { ParticipationRepositoryFunctions, RecreationRepositoryFunctions, StudentRepositoryFunctions, ParticipationServiceFunctions } from "../types"

export function createParticipationService(
  participationRepository: ParticipationRepositoryFunctions,
): ParticipationServiceFunctions {
  return {
    async getStudentParticipations(studentId: number, options: {
      status?: string
      fromDate?: string
      toDate?: string
    }) {
      const participations = await participationRepository.findByStudentId(studentId, {
        ...options,
        fromTime: options.fromDate ? new Date(options.fromDate).getTime() : undefined,
        toTime: options.toDate ? new Date(options.toDate).getTime() : undefined
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

  }
}
