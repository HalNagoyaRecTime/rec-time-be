import fs from 'fs'
import Database from 'better-sqlite3'
import { parse } from 'csv-parse/sync'

// CSVファイルを読み込む
// UTF-8形式でファイルを読み取り、文字列として取得
let csvText = fs.readFileSync('./update.csv', 'utf-8')

// BOM（Byte Order Mark）がある場合は削除
// Excelで保存したCSVは「UTF-8 with BOM」形式になることが多いため対策
if (csvText.charCodeAt(0) === 0xFEFF) {
  csvText = csvText.slice(1)
  console.log('⚙️ BOMを検出したので削除しました')
}

// CSVを解析してオブジェクト配列に変換
// 各カラムをキーとして扱い、空行や空データを除外する
const records = parse(csvText, {
  columns: true,          // 1行目をキー名として使用
  skip_empty_lines: true, // 空行をスキップ
  trim: true              // 各項目の前後の空白を削除
}).filter((row: any) => {
  // f_updated_item が空でない行のみを残す（安全対策）
  return row.f_updated_item && row.f_updated_item.trim() !== ''
})

console.log(`📄 読み込んだレコード数: ${records.length}`)

// SQLiteデータベースを開く
// 同じフォルダ内の mydb.sqlite を開く
const db = new Database('./mydb.sqlite')

// 外部キー制約をオフにして安全に登録（開発用）
// FKが存在していなくても登録できるようにする
db.pragma('foreign_keys = OFF')

// データ登録SQLを準備
const insert = db.prepare(`
  INSERT INTO t_update (
    f_event_id, f_updated_item, f_before, f_after, f_reason
  )
  VALUES (
    @f_event_id, @f_updated_item, @f_before, @f_after, @f_reason
  )
`)

// トランザクションで一括登録
// 途中で失敗しても自動的にロールバックされるので安全
const insertMany = db.transaction((rows: any[]) => {
  for (const row of rows) {
    insert.run(row)
  }
})

// 実行
if (records.length > 0) {
  try {
    insertMany(records)
    console.log(`✅ ${records.length}件のデータをDBに登録しました！（t_update）`)
  } catch (err: any) {
    console.error('❌ 登録中にエラー:', err.message)
  }
} else {
  console.log('⚠️ 有効なデータが見つかりませんでした（CSVが空または形式が違う可能性）')
}
