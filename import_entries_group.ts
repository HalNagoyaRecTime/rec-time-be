import fs from 'fs'
import Database from 'better-sqlite3'
import { parse } from 'csv-parse/sync'

// === CSVファイルを読み込む ===
let csvText = fs.readFileSync('./entries_group.csv', 'utf-8')

// BOM（Excel特有の文字）を削除
if (csvText.charCodeAt(0) === 0xfeff) {
  csvText = csvText.slice(1)
  console.log('⚙️ BOMを検出したので削除しました')
}

// === CSVを解析 ===
const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
  trim: true
}).filter((row: any) => {
  // イベント名と集合場所が空でない行だけ残す
  return row['イベント名'] && row['集合場所']
})

// ★ここで集合時刻を加工する（例：9:00 → 0900）
records.forEach((record: any) => {
  const time = record['集合時刻']
  if (typeof time === 'string' && /^\d{1,2}:\d{2}$/.test(time)) {
    record['集合時刻'] = time.replace(
      /^(\d{1,2}):(\d{2})$/,
      (_: string, h: string, m: string) => `${h.padStart(2, '0')}${m}`
    )
  }
})

console.log(`📄 CSVから ${records.length} 件のデータを読み込みました`)

// === SQLiteデータベースを開く ===
const db = new Database('./mydb.sqlite')
db.pragma('foreign_keys = OFF')

// === SQL準備 ===
const selectGroup = db.prepare(`
  SELECT * FROM t_entries_group WHERE f_event_id = ?
`)

const insertGroup = db.prepare(`
  INSERT INTO t_entries_group (f_event_id, f_place, f_gather_time)
  VALUES (?, ?, ?)
`)

const updateGroup = db.prepare(`
  UPDATE t_entries_group
  SET f_place = ?, f_gather_time = ?
  WHERE f_event_id = ?
`)

// === トランザクションで一括登録・更新 ===
const upsertMany = db.transaction((rows: any[]) => {
  for (const row of rows) {
    const event_name = row['イベント名'] || ''
    const place = row['集合場所'] || ''
    const gather_time = row['集合時刻'] || ''

    if (!event_name) {
      console.log(`⚠️ スキップ: イベント名が空の行 → ${JSON.stringify(row)}`)
      continue
    }

    // === イベントIDを取得 ===
    const event = db
      .prepare('SELECT f_event_id FROM t_events WHERE f_event_name = ?')
      .get(event_name) as { f_event_id: number } | undefined

    if (!event) {
      console.log(`⚠️ イベントが存在しません: ${event_name}`)
      continue
    }

    // === 既存データを確認 ===
    const existing = selectGroup.get(event.f_event_id)

    if (existing) {
      // 既存あり → UPDATE
      updateGroup.run(place, gather_time, event.f_event_id)
      console.log(`🔁 更新: ${event_name} → ${place} / ${gather_time}`)
    } else {
      // 既存なし → INSERT
      insertGroup.run(event.f_event_id, place, gather_time)
      console.log(`🆕 追加: ${event_name} → ${place} / ${gather_time}`)
    }
  }
})

// === 実行 ===
if (records.length > 0) {
  upsertMany(records)
  console.log(`🏁 全${records.length}件の集合情報を登録・更新しました！`)
} else {
  console.log('⚠️ CSVに有効なデータがありません（空または形式が違う可能性）')
}
