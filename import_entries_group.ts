import fs from 'fs'
import Database from 'better-sqlite3'
import { parse } from 'csv-parse/sync'

// === CSVファイルを読み込む ===
let csvText = fs.readFileSync('./entries_group.csv', 'utf-8')

// BOM除去
if (csvText.charCodeAt(0) === 0xfeff) {
  csvText = csvText.slice(1)
  console.log('⚙️ BOMを検出したので削除しました')
}

// === カラム名 ===
const COLUMN_EVENT_NAME = 'イベント名'
const COLUMN_PLACE = '集合場所'
const COLUMN_GATHER_TIME = '集合時刻'

// === 正規化関数 ===
function normalizePlace(v: string | null): string {
  if (!v) return ''
  return v
    .toString()
    .replace(/\r?\n/g, '') // 改行除去
    .replace(/[\u200B-\u200D\uFEFF\u00A0\u202A-\u202C]/g, '') // ゼロ幅/BOM/ノーブレーク/RTL除去
    .replace(/\u3000/g, ' ') // 全角スペース→半角
    .replace(/\s+/g, ' ') // 連続スペース統一
    .normalize('NFKC') // 全角半角統一
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
}).filter((row: any) => row[COLUMN_EVENT_NAME] && row[COLUMN_PLACE])

console.log(`📄 CSVから ${records.length} 件のデータを読み込みました`)

// === DB接続 ===
const db = new Database('./mydb.sqlite')
db.pragma('foreign_keys = OFF')

// === SQL定義 ===
const selectGroup = db.prepare(`
  SELECT f_place, f_gather_time FROM t_entries_group WHERE f_event_id = ?
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
const insertLog = db.prepare(`
  INSERT INTO t_update (f_event_id, f_updated_item, f_before, f_after, f_reason)
  VALUES (?, ?, ?, ?, ?)
`)

// === トランザクション ===
const upsertMany = db.transaction((rows: any[]) => {
  for (const row of rows) {
    const eventName = row[COLUMN_EVENT_NAME]
    const placeRaw = row[COLUMN_PLACE]
    const timeRaw = row[COLUMN_GATHER_TIME]
    const place = normalizePlace(placeRaw)
    const time = normalizeTime(timeRaw)

    // === イベントID取得 ===
    const event = db
      .prepare('SELECT f_event_id FROM t_events WHERE f_event_name = ?')
      .get(eventName) as { f_event_id: number } | undefined

    if (!event) {
      console.log(`⚠️ イベントが存在しません: ${eventName}`)
      continue
    }

    // === 既存データを取得 ===
    const existing = selectGroup.get(event.f_event_id) as
      | { f_place: string | null; f_gather_time: string | null }
      | undefined

    // === 比較処理 ===
    if (existing) {
      const dbPlace = normalizePlace(existing.f_place)
      const dbTime = normalizeTime(existing.f_gather_time)

      // === 🔍 デバッグログ ===
      console.log('\n==============================')
      console.log(`🔎 差分チェック開始: ${eventName}`)
      console.log('🗃 DB Raw:', existing)
      console.log('📄 CSV Raw:', row)
      console.log('🧩 Normalize結果:')
      console.table({
        'DB_集合場所': dbPlace,
        'CSV_集合場所': place,
        'DB_集合時刻': dbTime,
        'CSV_集合時刻': time
      })

      const isSame = dbPlace === place && dbTime === time
      console.log(`✅ 判定: ${isSame ? '完全一致 → スキップ' : '差分あり → 更新'}`)

      if (isSame) {
        console.log(`⏩ スキップ: ${eventName}（変更なし）`)
        continue
      }

      // === 差分特定 ===
      const changedItems: string[] = []
      if (dbPlace !== place) changedItems.push('集合場所')
      if (dbTime !== time) changedItems.push('集合時刻')

      // === 更新処理 ===
      updateGroup.run(place, time, event.f_event_id)
      console.log(`🔁 更新: ${eventName} → ${changedItems.join(', ')}`)

      // === 履歴登録 ===
      for (const item of changedItems) {
        insertLog.run(
          event.f_event_id,
          item,
          item === '集合場所' ? existing.f_place : existing.f_gather_time,
          item === '集合場所' ? place : time,
          'CSV取込により自動更新'
        )
      }
    } else {
      // === 新規登録 ===
      insertGroup.run(event.f_event_id, place, time)
      console.log(`🆕 追加: ${eventName} → ${place} / ${time}`)
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
