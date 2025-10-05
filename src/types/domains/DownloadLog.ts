// src/types/domains/DownloadLog.ts
export interface DownloadLogEntity {
  f_log_id: number;
  f_student_num: string;
  f_datetime: string;
  f_function: string;
  f_success: string; // "成功" | "失敗"
  f_count: number | null;
}

export interface CreateDownloadLogData {
  student_num: string;
  function: string;
  success: string;
  count?: number | null;
}
