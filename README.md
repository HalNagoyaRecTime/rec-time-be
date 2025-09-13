# レクリエーション管理API

Node.js + Hono + Prisma + SQLiteを使用したレクリエーション管理システムのバックエンドAPI

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルでデータベースURLを設定：

```bash
DATABASE_URL="file:./dev.db"
```

### 3. データベースの初期化

Prismaクライアントを生成し、データベーススキーマを作成：

```bash
npm run db:generate
npm run db:push
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

## データベース操作

### Prismaクライアントの生成

スキーマ変更後、クライアントを再生成：

```bash
npm run db:generate
```

### データベーススキーマの更新

開発環境でスキーマをプッシュ：

```bash
npm run db:push
```

### マイグレーションの作成・実行

本番環境用のマイグレーション：

```bash
npm run db:migrate
```

### シードデータの投入

テスト用データを投入：

```bash
npm run db:seed
```

## データベーステーブル

### students テーブル
- 学生情報を管理
- student_id (主キー), class_code, attendance_number, name

### recreations テーブル
- レクリエーション情報を管理
- recreation_id (主キー), title, description, location, start_datetime, end_datetime

### participations テーブル
- 学生のレクリエーション参加状況を管理
- student_id と recreation_id の関連テーブル

## プロジェクト構成

```
be/
├── src/                           # アプリケーションソースコード
│   ├── application/              # アプリケーション層
│   │   └── usecases/            # ユースケース
│   ├── controllers/             # コントローラー（レガシー）
│   ├── di/                      # 依存性注入
│   ├── domain/                  # ドメイン層
│   │   ├── entities/           # エンティティ
│   │   └── repositories/       # リポジトリインターフェース
│   ├── infrastructure/          # インフラストラクチャ層
│   │   └── database/          # データベース設定
│   ├── lib/                     # ライブラリ
│   ├── presentation/            # プレゼンテーション層
│   │   ├── controllers/        # APIコントローラー
│   │   └── routes/            # ルーティング
│   ├── repositories/            # リポジトリ実装
│   ├── services/               # サービス
│   └── utils/                  # ユーティリティ
├── prisma/                      # Prismaスキーマとマイグレーション
│   └── schema.prisma          # データベーススキーマ定義
├── migrations/                  # データベースマイグレーション
├── .env                        # 環境変数設定
├── .env.example               # 環境変数設定例
├── package.json               # 依存関係とスクリプト
├── swagger.yml                # API仕様書
├── tsconfig.json              # TypeScript設定
├── wrangler.toml              # Cloudflare Workers設定
└── README.md                  # プロジェクトドキュメント
```

## 利用可能なコマンド

### 開発・デプロイ関連
- `npm run dev` - 開発サーバーを起動 (Wrangler使用)
- `npm run deploy` - 本番環境にデプロイ (minify付き)
- `npm run cf-typegen` - Cloudflare Bindingsの型定義を生成

### データベース管理
- `npm run db:generate` - Prismaクライアントを生成
- `npm run db:push` - データベーススキーマをプッシュ (開発用)
- `npm run db:migrate` - マイグレーションを作成・実行
- `npm run db:seed` - データベースにシードデータを投入

## 技術スタック

- **Runtime**: Node.js
- **Framework**: Hono
- **Database**: SQLite
- **ORM**: Prisma
- **Deployment**: Cloudflare Workers
- **Language**: TypeScript

## デプロイ

本番環境にデプロイする場合：

```bash
npm run deploy
```
# rec-time-be
