import {
  RecreationRepositoryFunctions,
  RecreationServiceFunctions,
} from '../types';

export function createRecreationService(
  recreationRepository: RecreationRepositoryFunctions
): RecreationServiceFunctions {
  return {
    async getAllRecreations(options: {
      status?: string;
      fromDate?: string;
      toDate?: string;
      limit?: number;
      offset?: number;
    }) {
      const result = await recreationRepository.findAll({
        ...options,
        fromTime: options.fromDate
          ? new Date(options.fromDate).getTime()
          : undefined,
        toTime: options.toDate ? new Date(options.toDate).getTime() : undefined,
        limit: options.limit || 50,
        offset: options.offset || 0,
      });

      return {
        recreations: result.recreations || result,
        total: result.total || (Array.isArray(result) ? result.length : 0),
      };
    },

    async getRecreationById(id: number) {
      const recreation =
        await recreationRepository.findByIdWithParticipantCount(id);
      if (!recreation) {
        throw new Error('Recreation not found');
      }
      return recreation;
    },
  };
}
