import fs from 'fs'
import Database from 'better-sqlite3'
import { parse } from 'csv-parse/sync'

// === CSVファイルを読み込む ===
let csvText = fs.readFileSync('./entries_group.csv', 'utf-8')
if (csvText.charCodeAt(0) === 0xfeff) {
  csvText = csvText.slice(1)
  console.log('⚙️ BOMを検出したので削除しました')
}

// === カラム名 ===
const COLUMN_EVENT_NAME = 'イベント名'
const COLUMN_GROUP_SEQ = 'グループ番号'
const COLUMN_PLACE = '集合場所'
const COLUMN_GATHER_TIME = '集合時刻'

// === 正規化関数 ===
function normalizePlace(v: string | null): string {
  if (!v) return ''
  return v
    .toString()
    .replace(/\r?\n/g, '')
    .replace(/[\u200B-\u200D\uFEFF\u00A0\u202A-\u202C]/g, '')
    .replace(/\u3000/g, ' ')
    .replace(/\s+/g, ' ')
    .normalize('NFKC')
    .trim()
}

function normalizeTime(v: string | null): string {
  if (!v) return ''
  const s = v.toString()
    .replace(/[\u200B-\u200D\uFEFF\u00A0\u202A-\u202C]/g, '')
    .trim()

  if (/^\d{1,2}:\d{2}$/.test(s)) {
    // 9:00 → 0900
    return s.replace(/^(\d{1,2}):(\d{2})$/, (_, h, m) => `${h.padStart(2, '0')}${m}`)
  } else if (/^\d{3,4}$/.test(s)) {
    // 900 → 0900
    return s.padStart(4, '0')
  }
  return s
}

// === CSV解析 ===
const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
  trim: true
}).filter((row: any) => row[COLUMN_EVENT_NAME] && row[COLUMN_GROUP_SEQ])

console.log(`📄 CSVから ${records.length} 件のデータを読み込みました`)

// === DB接続 ===
const db = new Database('./mydb.sqlite')
db.pragma('foreign_keys = OFF')

// === SQL定義 ===
const selectGroup = db.prepare(`
  SELECT f_place, f_gather_time
  FROM t_entries_group
  WHERE f_event_id = ? AND f_seq = ?
`)

const insertGroup = db.prepare(`
  INSERT INTO t_entries_group (f_event_id, f_seq, f_place, f_gather_time)
  VALUES (?, ?, ?, ?)
`)

const updateGroup = db.prepare(`
  UPDATE t_entries_group
  SET f_place = ?, f_gather_time = ?
  WHERE f_event_id = ? AND f_seq = ?
`)

const insertLog = db.prepare(`
  INSERT INTO t_update (f_event_id, f_updated_item, f_before, f_after, f_reason)
  VALUES (?, ?, ?, ?, ?)
`)

// === トランザクション ===
const upsertMany = db.transaction((rows: any[]) => {
  for (const row of rows) {
    const eventName = row[COLUMN_EVENT_NAME]
    const groupSeq = parseInt(row[COLUMN_GROUP_SEQ], 10)
    const placeRaw = row[COLUMN_PLACE]
    const timeRaw = row[COLUMN_GATHER_TIME]

    const place = normalizePlace(placeRaw)
    const time = normalizeTime(timeRaw)

    if (!eventName || isNaN(groupSeq)) {
      console.log(`⚠️ スキップ: イベント名またはグループ番号が不正 → ${JSON.stringify(row)}`)
      continue
    }

    // === イベントID取得 ===
    const event = db
      .prepare('SELECT f_event_id FROM t_events WHERE f_event_name = ?')
      .get(eventName) as { f_event_id: number } | undefined

    if (!event) {
      console.log(`⚠️ イベントが存在しません: ${eventName}`)
      continue
    }

    // === 既存データ取得 ===
    const existing = selectGroup.get(event.f_event_id, groupSeq) as
      | { f_place: string | null; f_gather_time: string | null }
      | undefined

    // === 差分チェック ===
    if (existing) {
      const dbPlace = normalizePlace(existing.f_place)
      const dbTime = normalizeTime(existing.f_gather_time)

      const isSame = dbPlace === place && dbTime === time
      if (isSame) {
        console.log(`⏩ スキップ: ${eventName}（グループ${groupSeq}）変更なし`)
        continue
      }

      const changedItems: string[] = []
      if (dbPlace !== place) changedItems.push('集合場所')
      if (dbTime !== time) changedItems.push('集合時刻')

      updateGroup.run(place, time, event.f_event_id, groupSeq)
      console.log(`🔁 更新: ${eventName}（グループ${groupSeq}） → ${changedItems.join(', ')}`)

      for (const item of changedItems) {
        insertLog.run(
          event.f_event_id,
          item,
          String(item === '集合場所' ? existing.f_place : existing.f_gather_time),
          String(item === '集合場所' ? place : time),
          `CSV取込により自動更新（グループ${groupSeq}）`
        )
      }
    } else {
      insertGroup.run(event.f_event_id, groupSeq, place, time)
      console.log(`🆕 追加: ${eventName}（グループ${groupSeq}） → ${place} / ${time}`)
    }
  }
})

// === 実行 ===
if (records.length > 0) {
  upsertMany(records)
  console.log(`\n🏁 全${records.length}件の集合情報を登録・更新しました！`)
} else {
  console.log('⚠️ CSVに有効なデータがありません（空または形式が違う可能性）')
}
