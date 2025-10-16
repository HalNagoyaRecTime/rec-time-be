import fs from 'fs'
import Database from 'better-sqlite3'
import { parse } from 'csv-parse/sync'

// ① CSVファイルを読み込む
let csvText = fs.readFileSync('./notifs.csv', 'utf-8')

// ② BOM（Byte Order Mark）がある場合は削除
// Excelで保存したCSVが「UTF-8 with BOM」形式だと先頭に不要な文字がつくため削除
if (csvText.charCodeAt(0) === 0xFEFF) {
  csvText = csvText.slice(1)
  console.log('⚙️ BOMを検出したので削除しました')
}

// ③ CSVを解析してオブジェクト配列に変換
// 空行や余計な空白を除外して安全に処理できるようにする
const records = parse(csvText, {
  columns: true,          // 1行目をキーとして使用
  skip_empty_lines: true, // 空行をスキップ
  trim: true              // 各値の前後のスペースを削除
}).filter((row: any) => {
  // f_type が存在する行のみ残す（空データ対策）
  return row.f_type && row.f_type.trim() !== ''
})

console.log(`📄 読み込んだレコード数: ${records.length}`)

// ④ SQLiteデータベースを開く
const db = new Database('./mydb.sqlite')

// ⑤ 外部キー制約をオフ
// 他テーブル（t_eventsなど）とまだ連携前なので、一時的に無効化
db.pragma('foreign_keys = OFF')

// ⑥ 登録用SQLを準備
const insert = db.prepare(`
  INSERT INTO t_notifs (
    f_type, f_target, f_event_id, f_title, f_body, f_schedule_time, f_status
  )
  VALUES (
    @f_type, @f_target, @f_event_id, @f_title, @f_body, @f_schedule_time, @f_status
  )
`)

// ⑦ トランザクションで一括登録
const insertMany = db.transaction((rows: any[]) => {
  for (const row of rows) {
    insert.run(row)
  }
})

// ⑧ 実行
if (records.length > 0) {
  try {
    insertMany(records)
    console.log(`✅ ${records.length}件のデータをDBに登録しました！（t_notifs）`)
  } catch (err: any) {
    console.error('❌ 登録中にエラー:', err.message)
  }
} else {
  console.log('⚠️ 有効なデータが見つかりませんでした（CSVが空または形式が違う可能性）')
}
