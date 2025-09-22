# Back-End環境変数ファイル設定手順書

※この手順書はNode.js環境用です。（起動コマンドnpm run dev）
Cloudflare Workers環境では[02-be-wrangler-.toml設定手順書.md](./wrangler/02-be-wrangler-.toml設定手順書.md)を参照してください。

## 概要
環境変数ファイル設定手順書です。
開発環境・本番環境での適切な環境変数設定を行います。

## 環境変数ファイル構成
.env.exampleをコピーして作成.env.devとprodを作成する。

- `.env.dev` - 開発環境用 ←（コミットしない）
- `.env.prod` - 本番環境用 ←（コミットしない）
- `.env.example` - 設定例 ←（コピーをするサンプル）

## 設定手順

### 0. dotenvパッケージのインストール

環境変数ファイルを読み込むために、dotenvパッケージをインストールします。

```bash
# dotenvパッケージをインストール
npm install 
```

**dotenvとは:**
- `.env`ファイルから環境変数を`process.env`に読み込むライブラリ
- 開発環境と本番環境で設定を切り替えられる
- Node.jsプロジェクトでの環境変数管理の標準的な方法

### 1. 開発環境用設定

#### `.env` (メイン開発環境)
```bash
# 開発用環境変数
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# HTTPS証明書パス (開発環境)
HTTPS_KEY_PATH=./localhost+1-key.pem
HTTPS_CERT_PATH=./localhost+1.pem

# サーバー設定
PORT=8080
HOST=0.0.0.0

# CORS許可オリジン
CORS_ORIGINS=https://192.168.10.50:5173

# Cloudflare D1 Database ID (開発環境では未使用)
# CLOUDFLARE_DATABASE_ID=""
```

#### `.env.dev` (開発環境用)
```bash
# 環境変数設定
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# HTTPS証明書パス (開発環境)
HTTPS_KEY_PATH=./localhost+1-key.pem
HTTPS_CERT_PATH=./localhost+1.pem

# サーバー設定
PORT=8080
HOST=0.0.0.0

# CORS許可オリジン
CORS_ORIGINS=https://192.168.10.50:5173

# Cloudflare D1 Database ID (開発環境では未使用)
# CLOUDFLARE_DATABASE_ID=""
```

### 2. 本番環境用設定

#### `.env.prod` (本番環境用)
```bash
# 本番環境用設定
NODE_ENV=production

# Database (本番環境ではCloudflare D1を使用)
DATABASE_URL="file:./prod.db"

# HTTPS証明書パス (本番環境では正式SSL証明書)
# HTTPS_KEY_PATH=/path/to/ssl/private.key
# HTTPS_CERT_PATH=/path/to/ssl/certificate.crt

# サーバー設定
PORT=8080
HOST=0.0.0.0

# CORS許可オリジン (本番環境)
CORS_ORIGINS=https://your-production-domain.com

# Cloudflare D1 Database ID (本番環境)
CLOUDFLARE_DATABASE_ID=""

# その他本番環境用設定
LOG_LEVEL=info
RATE_LIMIT_ENABLED=true
```

### 3. 設定例ファイル

#### `.env.example` (設定例)
```bash
# 環境変数設定
NODE_ENV=#development

# Database
DATABASE_URL=#"file:./dev.db"

# HTTPS証明書パス
HTTPS_KEY_PATH=#./localhost+1-key.pem
HTTPS_CERT_PATH=#./localhost+1.pem

# サーバー設定
PORT=8080
HOST=0.0.0.0

# CORS許可オリジン
CORS_ORIGINS=#https://192.168.10.50:5173

# Cloudflare D1 Database ID (開発環境では未使用)
# CLOUDFLARE_DATABASE_ID=""
```

## 環境変数説明

### 基本設定
- `NODE_ENV`: 実行環境（development/production）
- `PORT`: サーバーポート番号
- `HOST`: バインドするホストアドレス

### データベース設定
- `DATABASE_URL`: データベース接続文字列
- `CLOUDFLARE_DATABASE_ID`: Cloudflare D1データベースID（本番環境）

### HTTPS証明書設定
- `HTTPS_KEY_PATH`: SSL秘密鍵ファイルのパス
- `HTTPS_CERT_PATH`: SSL証明書ファイルのパス

### フロントエンド連携設定
- `CORS_ORIGINS`: CORS許可オリジン（カンマ区切り）

### 本番環境専用設定
- `LOG_LEVEL`: ログレベル（debug/info/warn/error）
- `RATE_LIMIT_ENABLED`: レート制限有効化フラグ

## セキュリティ設定

### .gitignore設定
```gitignore
# 環境変数ファイル
.env
.env.dev
.env.prod

# HTTPS証明書（秘密鍵は絶対にコミットしない）
*.pem
*.key
*.crt
```

### 環境変数の優先順位
1. `.env.prod` (NODE_ENV=production時)
2. `.env.dev` (NODE_ENV=development時)
3. `.env` (デフォルト)

## 使用方法

### 開発環境での起動
```bash
# デフォルト(.env)を使用
npm run dev

# 特定の環境変数ファイルを指定
NODE_ENV=development npm run dev
```

### 本番環境での起動
```bash
# 本番環境変数を使用
NODE_ENV=production npm start
```

## トラブルシューティング

### 環境変数が読み込まれない
- ファイル名の確認（拡張子含む）
- ファイルの配置場所確認（プロジェクトルート）
- NODE_ENV設定の確認

### CORS エラー
- `CORS_ORIGINS` 設定の確認
- フロントエンドURLとの一致確認
- プロトコル（http/https）の一致確認

### 証明書エラー
- `HTTPS_KEY_PATH` / `HTTPS_CERT_PATH` のパス確認
- ファイルの存在確認
- ファイルの権限確認

## 参考情報

- **dotenv公式**: https://github.com/motdotla/dotenv
- **Node.js環境変数**: https://nodejs.org/api/process.html#process_process_env
- **Hono公式ドキュメント**: https://hono.dev/
- **TypeScript設定**: https://www.typescriptlang.org/docs/

---

**最終更新**: 2025年9月22日

