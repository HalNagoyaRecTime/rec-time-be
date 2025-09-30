export interface ChangeLogEntity {
  f_update_id: number;
  f_event_id: number;
  f_updated_item: string;
  f_before: string | null;
  f_after: string | null;
  f_updated_at: string;
  f_reason: string | null;
}
