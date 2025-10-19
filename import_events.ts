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

// === 正規化関数 ===
function normalizeTime(v: string | null): string {
  if (!v) return ''
  const s = v.toString().trim()
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    return s.replace(/^(\d{1,2}):(\d{2})$/, (_, h, m) => `${h.padStart(2, '0')}${m}`)
  } else if (/^\d{3,4}$/.test(s)) {
    return s.padStart(4, '0')
  }
  return s
}

function normalizeText(v: string | null): string {
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

// === CSV読み込み ===
let csvText = fs.readFileSync('./events.csv', 'utf-8')
if (csvText.charCodeAt(0) === 0xfeff) {
  csvText = csvText.slice(1)
  console.log('⚙️ BOMを検出したので削除しました')
}

const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
  trim: true
}).filter((row: any) => row['イベント種別'] && row['イベント名'])

console.log(`📄 CSVから ${records.length} 件のデータを読み込みました`)

// === SQLite接続 ===
const db = new Database('./mydb.sqlite')
db.pragma('foreign_keys = OFF')

// === 既存データバックアップ ===
const BACKUP_DIR = './backup'
const TABLE = 't_events'
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

  const content = [header, body].join('\n')
  const backupPath = `${BACKUP_DIR}/${makeTimestampedFilename('t_events_backup')}`
  fs.writeFileSync(backupPath, content, 'utf-8')
  console.log(`✅ バックアップ作成: ${backupPath}`)
} else {
  console.log('ℹ️ 既存データが0件のためバックアップをスキップしました')
}

// === 全削除＋AUTOINCREMENTリセット ===
db.prepare(`DELETE FROM ${TABLE}`).run()
db.prepare(`DELETE FROM sqlite_sequence WHERE name = '${TABLE}'`).run()
console.log('🧹 既存データ削除 & AUTOINCREMENTリセット完了')

// === SQL定義 ===
const selectEvent = db.prepare(`
  SELECT f_event_id, f_event_code, f_event_name, f_time, f_duration, f_summary
  FROM t_events
  WHERE f_event_name = ?
`)

const insertEvent = db.prepare(`
  INSERT INTO t_events (f_event_code, f_event_name, f_time, f_duration, f_summary)
  VALUES (?, ?, ?, ?, ?)
`)

const updateEvent = db.prepare(`
  UPDATE t_events
  SET f_event_code = ?, f_time = ?, f_duration = ?, f_summary = ?
  WHERE f_event_id = ?
`)

const insertLog = db.prepare(`
  INSERT INTO t_update (f_event_id, f_updated_item, f_before, f_after, f_reason)
  VALUES (?, ?, ?, ?, ?)
`)

// === 登録・更新処理 ===
const upsertMany = db.transaction((rows: any[]) => {
  for (const row of rows) {
    const code = normalizeText(row['イベント種別'])
    const name = normalizeText(row['イベント名'])
    const time = normalizeTime(row['開始時刻'])
    const duration = Number(row['所要時間'] || 0)
    const summary = normalizeText(row['イベント概要'])

    if (!name) {
      console.log(`⚠️ スキップ: イベント名が空です → ${JSON.stringify(row)}`)
      continue
    }

    const existing = selectEvent.get(name) as
      | { f_event_id: number; f_event_code: string; f_time: string | null; f_duration: number | null; f_summary: string | null }
      | undefined

    if (!existing) {
      insertEvent.run(code, name, time, duration, summary)
      console.log(`🆕 追加: ${name} → ${time} (${duration}分)`)
      continue
    }

    // 差分チェック
    const changes: { field: string; before: any; after: any }[] = []
    if (existing.f_event_code !== code) changes.push({ field: 'イベント種別', before: existing.f_event_code, after: code })
    if (normalizeTime(existing.f_time) !== time) changes.push({ field: '開始時刻', before: existing.f_time, after: time })
    if ((existing.f_duration || 0) !== duration) changes.push({ field: '所要時間', before: existing.f_duration, after: duration })
    if ((existing.f_summary || '') !== summary) changes.push({ field: 'イベント概要', before: existing.f_summary, after: summary })

    if (changes.length === 0) {
      console.log(`⏩ スキップ: ${name} 変更なし`)
      continue
    }

    // 更新
    updateEvent.run(code, time, duration, summary, existing.f_event_id)
    console.log(`🔁 更新: ${name} → ${changes.map(c => c.field).join(', ')}`)

    // ログ挿入
    for (const c of changes) {
      insertLog.run(
        existing.f_event_id,
        c.field,
        String(c.before ?? ''),
        String(c.after ?? ''),
        'CSV取込により自動更新'
      )
    }
  }
})

// === 実行 ===
if (records.length > 0) {
  upsertMany(records)
  console.log(`🏁 全${records.length}件のイベント情報を登録・更新しました！`)
} else {
  console.log('⚠️ CSVに有効なデータがありません（空または形式が違う可能性）')
}
