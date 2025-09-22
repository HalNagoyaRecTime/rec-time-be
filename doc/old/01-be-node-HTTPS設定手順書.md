# Back-EndHTTPS化手順書

※この手順書はNode.js環境用です。（起動コマンドnpm run dev）  
Cloudflare Workers環境では[01-be-wrangler-HTTPS設定手順書.md](./wrangler/01-be-wrangler-HTTPS設定手順書.md)を参照してください。

## 概要
開発環境にてhttps化する方法として、mkcertを使う。  
すでにインストール済みの人は0. を飛ばして1. に進んでください。  
```bash
# mkcertがインストールされているか確認
where mkcert
```


## 手順

### 0. mkcertのインストール

#### Windows (Chocolatey)
```bash
# Chocolateyでインストール
choco install mkcert

# インストール確認
mkcert -version
```

#### macOS (Homebrew)
```bash
# Homebrewでインストール
brew install mkcert

# インストール確認
mkcert -version
```

#### Linux (Ubuntu/Debian)
```bash
# certutilをインストール
sudo apt install libnss3-tools

# mkcertをダウンロード・インストール
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert

# インストール確認
mkcert -version
```

#### 初期設定（全OS共通）
```bash
# ローカル認証局をインストール（初回のみ）
mkcert -install
```

### 1. IPアドレスの確認

まず、自分のPCのIPアドレスを確認します：

#### Windows
```bash
# IPアドレスを確認
ipconfig

```

#### macOS/Linux
```bash
# IPアドレスを確認
ifconfig

# または
ip addr show
```

**確認のポイント:**
- WiFi接続の場合：`Wi-Fi`または`wlan0`のIPv4アドレス
- 有線接続の場合：`イーサネット`または`eth0`のIPv4アドレス
- 通常 `192.168.x.x` や `10.x.x.x` の形式

### 2. mkcertによる証明書生成

```bash
# mkcertがインストールされているか確認
where mkcert

# localhost + 自分のIPアドレス用の証明書を生成
# 例：IPアドレスが 192.168.10.50 の場合
mkcert localhost 192.168.10.50  

# 例：IPアドレスが 192.168.1.100 の場合
mkcert localhost 192.168.1.100
```

**重要:**
- `192.168.10.50` の部分は、先ほど確認した自分のIPアドレスに変更してください
- スマホからアクセスする場合、このIPアドレスが必要になります

**生成されるファイル:**
- `localhost+1.pem` (証明書)
- `localhost+1-key.pem` (秘密鍵)

### 2. 環境変数ファイルの設定

詳細な環境変数設定については [02-be-.env設定手順書.md](02-be-.env設定手順書.md) を参照してください。

### 3. 動作確認

#### サーバー起動
```bash
# 現在の開発環境用
npm run dev:wrangler

#※使用禁止（DBが動作しません）
npm run dev
```

#### 接続確認
- **PC**: `https://localhost:8787`
- **スマホ**: `https://192.168.10.50:8787`

**注意**: Cloudflare Workers環境では.envファイルは使用されません。環境変数はwrangler.tomlで管理されます。

#### APIエンドポイントテスト
```bash
# ルートエンドポイント
curl -k https://localhost:8787/

# 学生情報取得（例）
curl -k https://localhost:8787/api/v1/students/20306

# イベント一覧取得
curl -k https://localhost:8787/api/v1/events
```

### 4. 証明書管理

#### .gitignoreに追加
```gitignore
# HTTPS証明書（秘密鍵は絶対にコミットしない）
*.pem
*.key
*.crt
```

### 6. トラブルシューティング

#### ポート8787が使用中エラー
```bash
# 使用中のプロセスを確認
netstat -ano | findstr :8787

# プロセスを終了させる
taskkill /PID <プロセスID> /F
```

#### 証明書エラー（開発環境）
```bash
# mkcertのルート証明書をインストール
mkcert -install
```

## 参考情報

- **mkcert公式**: https://github.com/FiloSottile/mkcert
- **Hono公式ドキュメント**: https://hono.dev/
- **@hono/node-server**: https://github.com/honojs/node-server

---

**最終更新**: 2025年9月22日