import fs from 'fs'
import Database from 'better-sqlite3'
import { parse } from 'csv-parse/sync'

//CSVファイルを読み込む
let csvText = fs.readFileSync('./students.csv', 'utf-8')

//BOMがある場合は削除
// BOMのコードは「0xFEFF」なので、先頭がそれなら削除する
if (csvText.charCodeAt(0) === 0xFEFF) {
  csvText = csvText.slice(1)
  console.log('⚙️ BOMを検出したので削除しました')
}

//CSVを解析して、空行や空データを除外
const records = parse(csvText, {
  columns: true,          // 1行目をカラム名にする
  skip_empty_lines: true, // 空行をスキップ
  trim: true              // 各セルの前後スペースを削除
}).filter((row: any) => {
  // f_student_num が存在する行だけ残す（空データ対策）
  return row.f_student_num && row.f_student_num.trim() !== ''
})

// デバッグ確認（不要なら削除してOK）
console.log(`📄 読み込んだレコード数: ${records.length}`)

//SQLiteデータベースを開く
const db = new Database('./mydb.sqlite')

//登録SQLを準備
const insert = db.prepare(`
  INSERT INTO m_students (f_student_num, f_class, f_number, f_name, f_note)
  VALUES (@f_student_num, @f_class, @f_number, @f_name, @f_note)
`)

//トランザクションで一括登録
const insertMany = db.transaction((rows: any[]) => {
  for (const row of rows) {
    insert.run(row)
  }
})

//実際に登録処理を実行
if (records.length > 0) {
  insertMany(records)
  console.log(`✅ ${records.length}件のデータをDBに登録しました！`)
} else {
  console.log('⚠️ 有効なデータが見つかりませんでした（CSVが空または形式が違う可能性）')
}
