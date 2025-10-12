// scripts/injectGitInfo.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitInfo() {
  try {
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    const commitAuthor = execSync('git log -1 --pretty=%an', { encoding: 'utf8' }).trim();
    const commitDate = execSync('git log -1 --pretty=%ai', { encoding: 'utf8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    
    // 마지막 머지 커밋 정보
    let lastMergeCommit = null;
    try {
      const mergeCommitHash = execSync('git log --merges -1 --pretty=%H', { encoding: 'utf8' }).trim();
      if (mergeCommitHash) {
        const mergeCommitMessage = execSync(`git log -1 --pretty=%B ${mergeCommitHash}`, { encoding: 'utf8' }).trim();
        const mergeCommitAuthor = execSync(`git log -1 --pretty=%an ${mergeCommitHash}`, { encoding: 'utf8' }).trim();
        const mergeCommitDate = execSync(`git log -1 --pretty=%ai ${mergeCommitHash}`, { encoding: 'utf8' }).trim();
        
        lastMergeCommit = {
          hash: mergeCommitHash,
          message: mergeCommitMessage,
          author: mergeCommitAuthor,
          date: mergeCommitDate,
        };
      }
    } catch (e) {
      // 머지 커밋이 없는 경우는 무시
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
    console.warn('Git情報の取得に失敗 / Git 정보 획득 실패:', error.message);
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

// Git 정보를 환경 변수로 설정
const gitInfo = getGitInfo();
process.env.GIT_COMMIT_HASH = gitInfo.commitHash;
process.env.GIT_COMMIT_MESSAGE = gitInfo.commitMessage;
process.env.GIT_COMMIT_AUTHOR = gitInfo.commitAuthor;
process.env.GIT_COMMIT_DATE = gitInfo.commitDate;
process.env.GIT_BRANCH = gitInfo.branch;

if (gitInfo.lastMergeCommit) {
  process.env.GIT_MERGE_COMMIT_HASH = gitInfo.lastMergeCommit.hash;
  process.env.GIT_MERGE_COMMIT_MESSAGE = gitInfo.lastMergeCommit.message;
  process.env.GIT_MERGE_COMMIT_AUTHOR = gitInfo.lastMergeCommit.author;
  process.env.GIT_MERGE_COMMIT_DATE = gitInfo.lastMergeCommit.date;
}

// Git 정보를 JSON 파일로 저장 (선택사항)
const gitInfoPath = path.join(__dirname, '..', 'src', 'git-info.json');
fs.writeFileSync(gitInfoPath, JSON.stringify(gitInfo, null, 2));

console.log('Git情報を環境変数に設定しました / Git 정보를 환경변수에 설정했습니다:', gitInfo.commitHash);
console.log('Git情報をJSONファイルに保存しました / Git 정보를 JSON 파일에 저장했습니다:', gitInfoPath);
