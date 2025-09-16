# レクリエーション管理API

Hono + Cloudflare D1 + TypeScriptを使用したレクリエーション管理システムのバックエンドAPI

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルを作成（`.env.example` を参考に）：

```bash
cp .env.example .env
```

### 3. 開発サーバーの起動

```bash
# ローカル開発（tsx使用）
npm run dev

# Cloudflare Workers開発環境
npm run dev:wrangler
```

## データベース操作

### マイグレーションの実行

ローカル環境：
```bash
npm run "db:migrate --local"
```

本番環境：
```bash
npm run "db:migrate --remote"
```

## データベーステーブル

### Student テーブル
- `studentId` (主キー): 学生ID
- `classCode`: クラスコード
- `attendanceNumber`: 出席番号
- `name`: 学生名
- `createdAt`, `updatedAt`: タイムスタンプ

### Recreation テーブル
- `recreationId` (主キー): レクリエーションID
- `title`: タイトル
- `description`: 説明
- `location`: 開催場所
- `startDatetime`, `endDatetime`: 開始・終了日時

### Participation テーブル
- 学生とレクリエーションの参加関係を管理
- `studentId` と `recreationId` の関連テーブル

## プロジェクト構成

```
be/
├── src/                       # アプリケーションソースコード
│   ├── controllers/          # コントローラー
│   ├── di/                   # 依存性注入
│   ├── lib/                  # ライブラリ（DB接続など）
│   ├── repositories/         # リポジトリ実装
│   ├── services/            # サービス層
│   ├── types/               # 型定義
│   │   └── domains/        # ドメイン型
│   └── utils/               # ユーティリティ
├── migrations/               # D1データベースマイグレーション
├── .env                     # 環境変数設定
├── .env.example            # 環境変数設定例
├── package.json            # 依存関係とスクリプト
├── swagger.yml             # API仕様書
├── tsconfig.json           # TypeScript設定
├── wrangler.toml           # Cloudflare Workers設定
└── README.md               # プロジェクトドキュメント
```

## 利用可能なコマンド

### 開発・デプロイ関連
- `npm run dev` - ローカル開発サーバーを起動（tsx使用）
- `npm run dev:wrangler` - Cloudflare Workers開発環境で起動
- `npm run deploy` - 本番環境にデプロイ（minify付き）
- `npm run cf-typegen` - Cloudflare Bindingsの型定義を生成

### データベース管理
- `npm run "db:migrate --local"` - ローカルD1データベースでマイグレーション実行
- `npm run "db:migrate --remote"` - 本番D1データベースでマイグレーション実行

### コード品質
- `npm run format` - Prettierでコードフォーマット
- `npm run format:check` - フォーマットチェック
- `npm run type-check` - TypeScriptの型チェック

## 技術スタック

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **Language**: TypeScript
- **バリデーション**: Zod
- **ローカル開発**: tsx

## デプロイ

本番環境にデプロイする場合：

```bash
npm run deploy
```

## API仕様

API仕様は `swagger.yml` に記載されています。
