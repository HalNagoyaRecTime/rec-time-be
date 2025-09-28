import { ChangeLogRepositoryFunctions } from '../types/repositories';
import { ChangeLogEntity } from '../types/domains';

export function createChangeLogService(
  changeLogRepository: ChangeLogRepositoryFunctions
) {
  return {
    async findAll(): Promise<ChangeLogEntity[]> {
      return await changeLogRepository.findAll();
    },
  };
}
