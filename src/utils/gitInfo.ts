// src/utils/gitInfo.ts
import { logger } from './logger';

export interface GitInfo {
  commitHash: string;
  commitMessage: string;
  commitAuthor: string;
  commitDate: string;
  branch: string;
  lastMergeCommit?: {
    hash: string;
    message: string;
    author: string;
    date: string;
  };
  buildTime: string;
  buildVersion?: string;
}

// Git 정보 획득 함수 (Cloudflare Workers 환경 고려) / Git情報取得関数（Cloudflare Workers環境考慮）
export function getGitInfo(): GitInfo {
  try {
    // Cloudflare Workers에서는 git 명령어를 직접 실행할 수 없으므로
    // 빌드 시점에 주입된 환경변수를 사용 / Cloudflare Workersではgitコマンドを直接実行できないため、
    // ビルド時点に注入された環境変数を使用
    const commitHash = process.env.GIT_COMMIT_HASH || 'unknown';
    const commitMessage = process.env.GIT_COMMIT_MESSAGE || 'Git情報を取得できませんでした / Git 정보를 획득할 수 없었습니다';
    const commitAuthor = process.env.GIT_COMMIT_AUTHOR || 'unknown';
    const commitDate = process.env.GIT_COMMIT_DATE || new Date().toISOString();
    const branch = process.env.GIT_BRANCH || 'unknown';
    
    // 마지막 머지 커밋 정보 / 最後のマージコミット情報
    let lastMergeCommit = null;
    if (process.env.GIT_MERGE_COMMIT_HASH) {
      lastMergeCommit = {
        hash: process.env.GIT_MERGE_COMMIT_HASH,
        message: process.env.GIT_MERGE_COMMIT_MESSAGE || 'unknown',
        author: process.env.GIT_MERGE_COMMIT_AUTHOR || 'unknown',
        date: process.env.GIT_MERGE_COMMIT_DATE || new Date().toISOString(),
      };
    }
    
    return {
      commitHash,
      commitMessage,
      commitAuthor,
      commitDate,
      branch,
      lastMergeCommit,
      buildTime: new Date().toISOString(),
      buildVersion: process.env.BUILD_VERSION || 'unknown',
    };
  } catch (error) {
    logger.error('Git情報取得中にエラーが発生 / Git 정보 획득 중 에러 발생', 'GitInfo', null, error as Error);
    return {
      commitHash: 'unknown',
      commitMessage: 'Git情報を取得できませんでした / Git 정보를 획득할 수 없었습니다',
      commitAuthor: 'unknown',
      commitDate: new Date().toISOString(),
      branch: 'unknown',
      buildTime: new Date().toISOString(),
      buildVersion: process.env.BUILD_VERSION || 'unknown',
    };
  }
}

// Git 정보를 로그에 출력 / Git情報をログに出力
export function logGitInfo(gitInfo: GitInfo): void {
  logger.info('=== Git情報 / Git 정보 ===', 'GitInfo');
  logger.info(`コミットハッシュ / 커밋 해시: ${gitInfo.commitHash}`, 'GitInfo');
  logger.info(`コミット作者 / 커밋 작성자: ${gitInfo.commitAuthor}`, 'GitInfo');
  logger.info(`ブランチ / 브랜치: ${gitInfo.branch}`, 'GitInfo');
  logger.info(`ビルド時刻 / 빌드 시각: ${gitInfo.buildTime}`, 'GitInfo');
  
  if (gitInfo.lastMergeCommit) {
    logger.info('=== 最後のマージ情報 / 마지막 머지 정보 ===', 'GitInfo');
    logger.info(`マージした人 / 머지한 사람: ${gitInfo.lastMergeCommit.author}`, 'GitInfo');
    logger.info(`マージ日時 / 머지 일시: ${gitInfo.lastMergeCommit.date}`, 'GitInfo');
  }
}

// Git 정보를 JSON으로 반환 / Git情報をJSONで返す
export function getGitInfoJson(): string {
  return JSON.stringify(getGitInfo(), null, 2);
}
