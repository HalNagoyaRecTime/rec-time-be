// src/controllers/DataUpdateController.ts
import { Context } from 'hono';
import { DataUpdateServiceFunctions } from '../services/DataUpdateService';

export interface DataUpdateControllerFunctions {
  getUpdateInfo: (c: Context) => Promise<Response>;
  checkDataChanged: (c: Context) => Promise<Response>;
}

export function createDataUpdateController(
  dataUpdateService: DataUpdateServiceFunctions
) {
  return {
    // 🔍 데이터 업데이트 정보 조회
    getUpdateInfo: async (c: Context) => {
      try {
        const updateInfo = await dataUpdateService.getUpdateInfo();
        return c.json(updateInfo);
      } catch (error) {
        console.error('[DataUpdateController] getUpdateInfo error:', error);
        return c.json({ error: 'Failed to get update info' }, 500);
      }
    },

    // 🔍 데이터 변경 여부 확인
    checkDataChanged: async (c: Context) => {
      try {
        const lastKnownCount = parseInt(c.req.query('lastKnownCount') || '0');
        
        const hasChanged = await dataUpdateService.hasDataChanged(lastKnownCount);
        
        return c.json({
          hasChanged,
          lastKnownCount,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[DataUpdateController] checkDataChanged error:', error);
        return c.json({ error: 'Failed to check data changes' }, 500);
      }
    },
  };
}
