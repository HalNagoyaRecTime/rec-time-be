import fs from 'fs'
import Database from 'better-sqlite3'
import { parse } from 'csv-parse/sync'

// === 共通関数 ===
function makeTimestampedFilename(baseName: string): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  return `${baseName}_${yyyy}-${mm}-${dd}_${hh}-${mi}.csv`
}

// === CSV読み込み ===
let csvText = fs.readFileSync('./entries.csv', 'utf-8')
if (csvText.charCodeAt(0) === 0xfeff) {
  csvText = csvText.slice(1)
  console.log('⚙️ BOMを検出したので削除しました')
}

const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
  trim: true
}).filter((r: any) => r['イベント名'] && r['グループ番号'] && r['クラス'] && r['出席番号'])

console.log(`📄 CSVから ${records.length} 件の出場者データを読み込みました`)

// === 重複行スキップ用セット ===
const seen = new Set<string>()
const uniqueRecords = records.filter((row: any) => {
  const key = `${row['イベント名']}|${row['グループ番号']}|${row['クラス']}|${row['出席番号']}`
  if (seen.has(key)) {
    console.log(`⚠️ 重複スキップ: ${key}`)
    return false
  }
  seen.add(key)
  return true
})

console.log(`🧩 重複除外後の有効レコード数: ${uniqueRecords.length}`)

// === DB接続 ===
const db = new Database('./mydb.sqlite')
db.pragma('foreign_keys = OFF')

const TABLE = 't_entries'
const BACKUP_DIR = './backup'

// === 既存データバックアップ ===
try {
  const existingRows = db.prepare(`SELECT * FROM ${TABLE}`).all() as Record<string, any>[]
  if (existingRows.length > 0) {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR)
    const header = Object.keys(existingRows[0]).join(',')
    const body = existingRows
      .map(row =>
        Object.values(row)
          .map(v => (v == null ? '' : `"${String(v).replace(/"/g, '""')}"`))
          .join(',')
      )
      .join('\n')
    const backupPath = `${BACKUP_DIR}/${makeTimestampedFilename(TABLE)}`
    fs.writeFileSync(backupPath, [header, body].join('\n'), 'utf-8')
    console.log(`✅ 既存データをバックアップしました: ${backupPath}`)
  } else {
    console.log('ℹ️ バックアップ対象データは0件でした')
  }
} catch (e) {
  console.error('⚠️ バックアップ中にエラーが発生しました:', e)
}

// === 全削除 ===
try {
  db.prepare(`DELETE FROM ${TABLE}`).run()
  console.log('🧹 既存データを全削除しました')
} catch (e) {
  console.error('❌ 削除中にエラーが発生しました:', e)
  process.exit(1)
}

// === 登録SQL ===
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

// === 登録処理 ===
const insertMany = db.transaction((rows: any[]) => {
  for (const row of rows) {
    const event_name = row['イベント名']
    const groupNum = Number(row['グループ番号'] || 0)
    const className = row['クラス']
    const number = Number(row['出席番号'] || 0)

    if (!event_name || !groupNum || !className || !number) {
      console.log(`⚠️ スキップ: 不正データ → ${JSON.stringify(row)}`)
      continue
    }

    const result = insertEntry.run({
      event_name,
      class: className,
      number,
      f_seq: groupNum
    })

    if (result.changes > 0) {
      console.log(`✅ 登録完了: ${className} ${number}番 → ${event_name}（グループ${groupNum}）`)
    } else {
      console.log(`⚠️ 登録失敗: ${className} ${number}番 → ${event_name}（グループ${groupNum}）`)
    }
  }
})

// === 実行 ===
if (uniqueRecords.length > 0) {
  const start = Date.now()
  insertMany(uniqueRecords)
  const end = Date.now()
  const sec = ((end - start) / 1000).toFixed(2)
  console.log(`🏁 全${uniqueRecords.length}件の出場者登録が完了しました（${sec}秒）`)
} else {
  console.log('⚠️ 有効なデータがありません。')
}
