# Back-End Cloudflare Workers HTTPS設定手順書

### ※この手順書はnpm run dev:wranglerで起動するCloudflare Workers用です。

## 概要
Cloudflare Workers環境でHTTPS開発環境を構築する手順です。
wranglerが自動的にHTTPS証明書を生成するため、mkcertのような手動証明書作成は**不要**です。

## wrangler devでのHTTPS化

**特徴:**
- ✅ 証明書の手動作成が不要
- ✅ `--local-protocol https`フラグで自動HTTPS化
- ✅ 複数端末からのアクセス対応
- ✅ IPアドレス指定でネットワーク内アクセス可能


## 設定手順

### 2. package.jsonの設定確認

現在の設定を確認します：

```json
{
  "scripts": {
    "dev:wrangler": "wrangler dev --local-protocol https --ip 0.0.0.0 --port 8787"
  }
}
```

**オプション説明:**
- `--local-protocol https`: HTTPS化
- `--ip 0.0.0.0`: 全ネットワークインターフェースでリッスン
- `--port 8787`: ポート指定（デフォルト8787）

### 3. サーバー起動

```bash
# HTTPS + 複数端末アクセス対応で起動
npm run dev:wrangler
```

**起動時の表示例:**
```
 ⛅️ wrangler 4.36.0
─────────────────
Ready on https://0.0.0.0:8787
[wrangler:info] - https://169.254.83.107:8787
[wrangler:info] - https://192.168.10.50:8787
[wrangler:info] - https://127.0.0.1:8787
[wrangler:info] - https://172.25.96.1:8787
```

## トラブルシューティング

### ポート8787でアクセスできない
```bash
# wranglerが起動しているか確認
npm run dev:wrangler

# プロセス確認
netstat -ano | findstr :8787

# プロセスを終了させる（PIDを確認後）
taskkill /PID <プロセスID> /F
```

**手順例:**
```bash
# 1. ポート使用状況確認
netstat -ano | findstr :8787
# TCP    127.0.0.1:8787    0.0.0.0:0    LISTENING    12345

# 2. プロセス終了（PID 12345の場合）
taskkill /PID 12345 /F
```

### 他端末からアクセスできない
1. **ファイアウォール設定確認**
   - Windows Defender ファイアウォール
   - ポート8787の許可

2. **IPアドレス確認**
   - `ipconfig`で正しいIPアドレスを確認
   - WiFi接続の確認

3. **同じネットワークか確認**
   - 同じWiFi/LANに接続されているか

### 証明書警告が表示される
- 自己署名証明書のため、ブラウザで警告が表示されます
- 「詳細設定」→「安全でないページに進む」をクリック
- 開発環境では正常な動作です


## 参考情報

- **Wrangler公式ドキュメント**: https://developers.cloudflare.com/workers/wrangler/
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Hono公式ドキュメント**: https://hono.dev/

---

**最終更新**: 2025年9月22日