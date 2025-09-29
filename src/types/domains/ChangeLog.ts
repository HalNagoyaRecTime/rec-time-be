// src/types/domains/ChangeLog.ts

export interface ChangeLogEntity {
  f_change_log_id: number;
  f_table_name: string;
  f_record_id: number;
  f_change_type: 'INSERT' | 'UPDATE' | 'DELETE';
  f_changed_at: string; // ISO timestamp
  f_changed_by: string;
}
