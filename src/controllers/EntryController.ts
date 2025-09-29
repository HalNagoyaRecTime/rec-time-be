// src/types/controllers/EntryGroupController.ts

import { Context } from 'hono';

export interface EntryGroupControllerFunctions {
  getAll(c: Context): Promise<Response>;
}
