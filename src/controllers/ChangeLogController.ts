// types/controllers/ChangeLogController.ts

import { Context } from 'hono';

export interface ChangeLogControllerFunctions {
  getAll(c: Context): Promise<Response>;
}
