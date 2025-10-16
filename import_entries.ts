import fs from 'fs'
import Database from 'better-sqlite3'
import { parse } from 'csv-parse/sync'

// === CSVファイルを読み込む ===
let csvText = fs.readFileSync('./entries.csv', 'utf-8')

// BOM（Excel特有の文字）を削除
if (csvText.charCodeAt(0) === 0xfeff) {
  csvText = csvText.slice(1)
  console.log('⚙️ BOMを検出したので削除しました')
}

// ===  CSVを解析してオブジェクトに変換 ===
const records = parse(csvText, {
  columns: true,          // 1行目をヘッダーとして使う
  skip_empty_lines: true, // 空行スキップ
  trim: true              // 余分な空白を削除
})

console.log(`📄 CSVから ${records.length} 件の出場者データを読み込みました`)

// ===データベースを開く ===
const db = new Database('./mydb.sqlite')
db.pragma('foreign_keys = OFF')

// === 出場者登録SQL（テーブル名すべて正しい） ===
const insertEntry = db.prepare(`
  INSERT INTO t_entries (f_student_id, f_event_id, f_seq)
  SELECT
    s.f_student_id,
    e.f_event_id,
    @f_seq
  FROM m_students s
  INNER JOIN t_events e ON e.f_event_name = @event_name
  WHERE s.f_class = @class
    AND s.f_number = @number
`)

// ===トランザクションで一括登録 ===
const insertMany = db.transaction((rows: any[]) => {
  for (const row of rows) {
    // CSV1行分のデータを取り出す
    const event_name = row['イベント名']
    const className = row['クラス']
    const number = Number(row['出席番号'] || 0)
    const seq = Number(row['順番'] || 1)

    if (!event_name || !className || !number) {
      console.log(`⚠️ スキップ: 不正な行 → ${JSON.stringify(row)}`)
      continue
    }

    // SQLにCSVの値をそのまま渡す
    const result = insertEntry.run({
      event_name: event_name, // ← CSVの「イベント名」
      class: className,       // ← CSVの「クラス」
      number: number,         // ← CSVの「出席番号」
      f_seq: seq              // ← CSVの「順番」
    })

    if (result.changes > 0) {
      console.log(`✅ 登録完了: ${className} の ${number}番 → ${event_name}`)
    } else {
      console.log(`⚠️ 登録失敗: ${className} の ${number}番 → ${event_name}`)
    }
  }
})

// ===  実行 ===
if (records.length > 0) {
  insertMany(records)
  console.log(`🏁 全${records.length}件の出場者登録が完了しました！`)
} else {
  console.log('⚠️ CSVに有効なデータがありません。')
}
