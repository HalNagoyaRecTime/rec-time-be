
# Documentation（ドキュメント）

## 📋 ドキュメント一覧

### 🔧 開発環境設定

| ファイル名                                                                       | 説明 | 対象環境 |
|-----------------------------------------------------------------------------|------|----------|
| [/node/01-be-HTTPS設定手順書.md](./node/01-be-node-HTTPS設定手順書.md)                | HTTPS開発環境の構築手順 | Node.js環境 |
| [/node/02-be-.env設定手順書.md](./node/02-be-node-.env設定手順書.md)                  | 環境変数ファイル(.env)の設定手順 | Node.js環境 |
| [/wrangler/01-be-HTTPS設定手順書.md](../01-be-wrangler-HTTPS設定手順書.md)    | HTTPS開発環境の構築手順 | Cloudflare Workers |
| [/wrangler/02-be-.toml設定手順書.md](../02-be-wrangler-.toml設定手順書.md) | wrangler.toml設定手順 | Cloudflare Workers |

## 概要

この現在**Cloudflare Workers**をメイン環境として開発しています。

### wrangler環境（推奨）

1. **サーバー起動**
   ```bash
   npm run dev:wrangler
   ```

### Node.js環境（現在使用停止）

1. **サーバー起動**
   ```bash
   npm run dev
   ```


## 🌟 環境の違い

| 項目 | Cloudflare Workers | Node.js       |
|------|-------------------|---------------|
| **起動コマンド** | `npm run dev:wrangler` | `npm run dev` |
| **ポート** | 8787 | 8080          |
| **設定ファイル** | wrangler.toml | .env          |
| **データベース** | D1（ローカル） | 現在未実装     |
| **HTTPS証明書** | wrangler自動生成 | mkcertで手動生成   |


## 🔗 関連リンク

- [Cloudflare Workers公式ドキュメント](https://developers.cloudflare.com/workers/)
- [Wrangler公式ドキュメント](https://developers.cloudflare.com/workers/wrangler/)
- [mkcert公式GitHub](https://github.com/FiloSottile/mkcert)
- [Hono公式ドキュメント](https://hono.dev/)

---

**最終更新**: 2025年9月22日