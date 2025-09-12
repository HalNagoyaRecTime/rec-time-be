import { ParticipationRepository } from '../repositories/ParticipationRepository'
import { RecreationRepository } from '../repositories/RecreationRepository'
import { StudentRepository } from '../repositories/StudentRepository'

export class ParticipationService {
  constructor(
    private participationRepository: ParticipationRepository,
    private recreationRepository: RecreationRepository,
    private studentRepository: StudentRepository
  ) {}

  async getStudentParticipations(studentId: string, options: {
    status?: string
    fromDate?: string
    toDate?: string
  }) {
    const queryOptions = {
      ...options,
      fromDate: options.fromDate ? new Date(options.fromDate) : undefined,
      toDate: options.toDate ? new Date(options.toDate) : undefined
    }

    const participations = await this.participationRepository.findByStudentId(studentId, queryOptions)
    
    return participations.map(participation => ({
      ...participation,
      is_participating: participation.status === 'registered' || participation.status === 'confirmed'
    }))
  }

  async getRecreationParticipants(recreationId: number) {
    const participations = await this.participationRepository.findByRecreationId(recreationId)
    
    return participations.map(participation => ({
      ...participation,
      is_participating: participation.status === 'registered' || participation.status === 'confirmed'
    }))
  }

  async createParticipation(data: {
    studentId: string
    recreationId: number
  }) {
    // Check if student exists
    const student = await this.studentRepository.findById(data.studentId)
    if (!student) {
      throw new Error('Student not found')
    }

    // Check if recreation exists
    const recreation = await this.recreationRepository.findById(data.recreationId)
    if (!recreation) {
      throw new Error('Recreation not found')
    }

    // Check if already registered
    const existingParticipation = await this.participationRepository.findByStudentAndRecreation(
      data.studentId,
      data.recreationId
    )
    if (existingParticipation) {
      throw new Error('Already registered for this recreation')
    }

    // Check if recreation has available spots
    const recreationWithCount = await this.recreationRepository.findByIdWithParticipantCount(data.recreationId)
    if (recreationWithCount && recreationWithCount.current_participants >= recreationWithCount.maxParticipants) {
      throw new Error('Recreation is full')
    }

    const participation = await this.participationRepository.create(data)
    
    return {
      ...participation,
      is_participating: true
    }
  }

  async cancelParticipation(participationId: number) {
    const participation = await this.participationRepository.findById(participationId)
    if (!participation) {
      throw new Error('Participation not found')
    }

    return this.participationRepository.delete(participationId)
  }
}