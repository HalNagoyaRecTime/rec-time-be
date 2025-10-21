import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import { cors } from 'hono/cors'                   // ← 修正：named import
import { serveStatic } from '@hono/node-server/serve-static'

const app = new Hono()

// CORS
app.use('*', cors())

// 静的ファイル（/public をそのまま配信）
app.use('/', serveStatic({ root: './public' }))

// 実行エンドポイント
app.post('/run-script', async (c) => {
  try {
    const body = await c.req.parseBody()
    const script = body['script'] as string
    const file = body['file'] as File

    // 許可スクリプト
    const allowedScripts = [
      'import_students.ts',
      'import_events.ts',
      'import_entries.ts',
      'import_entries_group.ts',
    ]
    if (!allowedScripts.includes(script)) {
      return c.json({ error: '⚠️ 無効なスクリプトです。選択内容を確認してください。' }, 400)
    }

    // アップロード保存
    const uploadDir = './uploads'
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)
    const filePath = path.join(uploadDir, file.name)
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)
    console.log(`📂 保存完了: ${filePath}`)

    // スクリプト ↔ CSV 名一致チェック
    const csvExpected: Record<string, string> = {
      'import_students.ts': 'students.csv',
      'import_events.ts': 'events.csv',
      'import_entries.ts': 'entries.csv',
      'import_entries_group.ts': 'entries_group.csv',
    }
    const expectedCsv = csvExpected[script]
    if (file.name !== expectedCsv) {
      return c.json({
        success: false,
        output: `❌ ファイル名が一致しません。\n正しくは「${expectedCsv}」を選択すべきです。`,
      })
    }

    // スクリプト実行
    const scriptPath = path.join(process.cwd(), script)
    const command = `npx tsx "${scriptPath}"`
    console.log(`▶️ 実行中: ${command}`)

    // ← ここがポイント：Promise の型を Response に
    return await new Promise<Response>((resolve) => {
      exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          resolve(
            c.json({
              success: false,
              output: stderr || error.message || '不明なエラーが発生しました。',
            })
          )
          return
        }
        console.log(stdout)
        resolve(
          c.json({
            success: true,
            output: stdout || '完了しました。',
          })
        )
      })
    })
  } catch (err: any) {
    console.error(err)
    return c.json({ error: err.message || 'サーバー側でエラーが発生しました。' }, 500)
  }
})

// サーバー起動
serve({ fetch: app.fetch, port: 8787 })
console.log('🚀 サーバー起動: http://localhost:8787/')
