export interface NotificationEntity {
  f_notif_id: number;
  f_type: string;
  f_target: string;
  f_event_id: number | null;
  f_title: string;
  f_body: string;
  f_sent_at: string; // ISO timestamp
}
