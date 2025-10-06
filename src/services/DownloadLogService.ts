// src/services/DownloadLogService.ts
import { createDownloadLogRepository } from '../repositories/DownloadLogRepository';
import {
  DownloadLogEntity,
  CreateDownloadLogData,
} from '../types/domains/DownloadLog';

export interface DownloadLogServiceFunctions {
  createLog: (data: CreateDownloadLogData) => Promise<DownloadLogEntity>;
  getAllLogs: (options: {
    f_student_num?: string;
    f_function?: string;
    f_success?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ logs: DownloadLogEntity[]; total: number }>;
  getLogsByStudentNum: (studentNum: string) => Promise<DownloadLogEntity[]>;
  getDownloadStats: () => Promise<{
    totalStudents: number;
    successfulDownloads: number;
    failedDownloads: number;
    studentsWithEntries: number;
  }>;
  logStudentDataDownload: (
    studentNum: string,
    success: boolean,
    count?: number
  ) => Promise<void>;
  logEntryDataDownload: (
    studentNum: string,
    success: boolean,
    count?: number
  ) => Promise<void>;
}

export function createDownloadLogService(
  downloadLogRepository: ReturnType<typeof createDownloadLogRepository>
): DownloadLogServiceFunctions {
  return {
    // -------------------------
    // createLog
    // -------------------------
    async createLog(data: CreateDownloadLogData): Promise<DownloadLogEntity> {
      return await downloadLogRepository.create(data);
    },

    // -------------------------
    // getAllLogs
    // -------------------------
    async getAllLogs(options: {
      f_student_num?: string;
      f_function?: string;
      f_success?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ logs: DownloadLogEntity[]; total: number }> {
      return await downloadLogRepository.findAll(options);
    },

    // -------------------------
    // getLogsByStudentNum
    // -------------------------
    async getLogsByStudentNum(
      studentNum: string
    ): Promise<DownloadLogEntity[]> {
      return await downloadLogRepository.findByStudentNum(studentNum);
    },

    // -------------------------
    // getDownloadStats
    // -------------------------
    async getDownloadStats(): Promise<{
      totalStudents: number;
      successfulDownloads: number;
      failedDownloads: number;
      studentsWithEntries: number;
    }> {
      return await downloadLogRepository.getDownloadStats();
    },

    // -------------------------
    // logStudentDataDownload
    // -------------------------
    async logStudentDataDownload(
      studentNum: string,
      success: boolean,
      count?: number
    ): Promise<void> {
      await downloadLogRepository.create({
        student_num: studentNum,
        function: '学生情報取得',
        success: success ? '成功' : '失敗',
        count: count || null,
      });
    },

    // -------------------------
    // logEntryDataDownload
    // -------------------------
    async logEntryDataDownload(
      studentNum: string,
      success: boolean,
      count?: number
    ): Promise<void> {
      await downloadLogRepository.create({
        student_num: studentNum,
        function: '出場情報取得',
        success: success ? '成功' : '失敗',
        count: count || null,
      });
    },
  };
}
