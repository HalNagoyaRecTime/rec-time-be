export function createRecreationService(recreationRepository: any) {
  return {
    async getAllRecreations(options: {
      status?: string
      fromDate?: string
      toDate?: string
      limit?: number
      offset?: number
    }) {
      const queryOptions = {
        ...options,
        fromDate: options.fromDate ? new Date(options.fromDate) : undefined,
        toDate: options.toDate ? new Date(options.toDate) : undefined,
        limit: options.limit || 50,
        offset: options.offset || 0
      }

      return recreationRepository.findAll(queryOptions)
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
      startDatetime: string
      endDatetime: string
      maxParticipants: number
      status?: string
    }) {
      const recreationData = {
        ...data,
        startDatetime: new Date(data.startDatetime),
        endDatetime: new Date(data.endDatetime)
      }

      return recreationRepository.create(recreationData)
    },

    async updateRecreation(id: number, data: {
      title?: string
      description?: string
      location?: string
      startDatetime?: string
      endDatetime?: string
      maxParticipants?: number
      status?: string
    }) {
      const updateData = {
        ...data,
        startDatetime: data.startDatetime ? new Date(data.startDatetime) : undefined,
        endDatetime: data.endDatetime ? new Date(data.endDatetime) : undefined
      }

      return recreationRepository.update(id, updateData)
    },

    async deleteRecreation(id: number) {
      return recreationRepository.delete(id)
    }
  }
}