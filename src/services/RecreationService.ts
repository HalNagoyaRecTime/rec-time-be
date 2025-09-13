export function createRecreationService(recreationRepository: any) {
  return {
    async getAllRecreations(options: {
      status?: string
      fromTime?: number
      toTime?: number
      limit?: number
      offset?: number
    }) {
      const queryOptions = {
        ...options,
        limit: options.limit || 50,
        offset: options.offset || 0
      }

      const result = await recreationRepository.findAll(queryOptions)
      
      return {
        recreations: result.recreations || result,
        total: result.total || (Array.isArray(result) ? result.length : 0)
      }
    },

    async getRecreationById(id: number) {
      const recreation = await recreationRepository.findByIdWithParticipantCount(id)
      if (!recreation) {
        throw new Error('Recreation not found')
      }
      return recreation
    },

    async createRecreation(data: {
      title: string
      description?: string
      location: string
      startTime: number
      endTime: number
      maxParticipants: number
      status?: string
    }) {
      return recreationRepository.create(data)
    },

    async updateRecreation(id: number, data: {
      title?: string
      description?: string
      location?: string
      startTime?: number
      endTime?: number
      maxParticipants?: number
      status?: string
    }) {
      return recreationRepository.update(id, data)
    },

    async deleteRecreation(id: number) {
      return recreationRepository.delete(id)
    }
  }
}