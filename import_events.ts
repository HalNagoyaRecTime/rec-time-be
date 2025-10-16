import fs from 'fs'
import Database from 'better-sqlite3'
import { parse } from 'csv-parse/sync'

// 1️⃣ CSVファイルを読み込む
let csvText = fs.readFileSync('./events.csv', 'utf-8')

// ✅ BOMがある場合は削除
if (csvText.charCodeAt(0) === 0xFEFF) {
  csvText = csvText.slice(1)
  console.log('⚙️ BOMを検出したので削除しました')
}

// 2️⃣ CSVを解析（空行や空データを除外）
const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
  trim: true
}).filter((row: any) => row.f_event_code && row.f_event_code.trim() !== '')

console.log(`📄 読み込んだレコード数: ${records.length}`)

// 3️⃣ SQLiteデータベースを開く
const db = new Database('./mydb.sqlite')

// ✅ 開発時は外部キー制約をオフ（安全に登録）
db.pragma('foreign_keys = OFF')

// 4️⃣ データ登録SQLを準備
const insert = db.prepare(`
  INSERT INTO t_events (
    f_event_code, f_event_name, f_time, f_duration, f_place, f_gather_time, f_summary
  )
  VALUES (
    @f_event_code, @f_event_name, @f_time, @f_duration, @f_place, @f_gather_time, @f_summary
  )
`)

// 5️⃣ トランザクションで一括登録
const insertMany = db.transaction((rows: any[]) => {
  for (const row of rows) {
    insert.run(row)
  }
})

// 6️⃣ 実行
if (records.length > 0) {
  try {
    insertMany(records)
    console.log(`✅ ${records.length}件のデータをDBに登録しました！（t_events）`)
  } catch (err: any) {
    console.error('❌ 登録中にエラー:', err.message)
  }
} else {
  console.log('⚠️ 有効なデータが見つかりませんでした（CSVが空または形式が違う可能性）')
}
