import fs from 'fs'
import Database from 'better-sqlite3'
import { parse } from 'csv-parse/sync'

// CSVファイルを読み込む
let csvText = fs.readFileSync('./events.csv', 'utf-8')

// BOMがある場合は削除
if (csvText.charCodeAt(0) === 0xfeff) {
  csvText = csvText.slice(1)
  console.log('⚙️ BOMを検出したので削除しました')
}

// CSVを解析して、空行や空データを除外
const records = parse(csvText, {
  columns: true,          // 1行目をカラム名にする
  skip_empty_lines: true, // 空行をスキップ
  trim: true              // 各セルの前後スペースを削除
}).filter((row: any) => {
  // イベント種別とイベント名が存在する行だけ残す
  return row['イベント種別'] && row['イベント名']
})

// デバッグ確認（不要なら削除してOK）
console.log(`📄 読み込んだレコード数: ${records.length}`)

// SQLiteデータベースを開く
const db = new Database('./mydb.sqlite')

// 外部キー制約を無効化（開発中は安全対策としてオフ）
db.pragma('foreign_keys = OFF')

// 登録SQLを準備
const insert = db.prepare(`
  INSERT INTO t_events (f_event_code, f_event_name, f_time, f_duration, f_summary)
  VALUES (@f_event_code, @f_event_name, @f_time, @f_duration, @f_summary)
`)

// トランザクションで一括登録
const insertMany = db.transaction((rows: any[]) => {
  for (const row of rows) {
    // CSV列の値をそのまま使う
    const code = row['イベント種別'] || ''
    const name = row['イベント名'] || ''
    const time = row['開始時刻'] || ''
    const duration = Number(row['所要時間'] || 0)
    const summary = row['イベント概要'] || ''

    // 1レコードずつ登録
    insert.run({
      f_event_code: code,
      f_event_name: name,
      f_time: time,
      f_duration: duration,
      f_summary: summary
    })
  }
})

// 実際に登録処理を実行
if (records.length > 0) {
  insertMany(records)
  console.log(`✅ ${records.length}件のイベント情報をDBに登録しました！`)
} else {
  console.log('⚠️ 有効なデータが見つかりませんでした（CSVが空または形式が違う可能性）')
}
