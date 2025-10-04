// src/services/DataUpdateService.ts
import { ChangeLogRepositoryFunctions } from '../types/repositories';

export interface DataUpdateInfo {
  recordCount: number;
  lastUpdated: string;
}

export interface DataUpdateServiceFunctions {
  getUpdateInfo: () => Promise<DataUpdateInfo>;
  hasDataChanged: (lastKnownCount: number) => Promise<boolean>;
}

export function createDataUpdateService(
  changeLogRepository: ChangeLogRepositoryFunctions
): DataUpdateServiceFunctions {
  return {
    // 🔍 데이터베이스 업데이트 정보 조회
    async getUpdateInfo(): Promise<DataUpdateInfo> {
      try {
        // t_update 테이블의 레코드 수만 조회
        const result = await changeLogRepository.getUpdateStats();
        
        return {
          recordCount: result.recordCount,
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error('[DataUpdateService] getUpdateInfo error:', error);
        throw new Error('Failed to get update info');
      }
    },

    // 🔍 데이터 변경 여부 확인
    async hasDataChanged(lastKnownCount: number): Promise<boolean> {
      try {
        const currentInfo = await this.getUpdateInfo();
        
        // 레코드 수가 변경되었으면 데이터가 변경된 것으로 판단
        return currentInfo.recordCount !== lastKnownCount;
      } catch (error) {
        console.error('[DataUpdateService] hasDataChanged error:', error);
        return true; // 에러가 발생하면 안전하게 변경된 것으로 간주
      }
    },
  };
}
