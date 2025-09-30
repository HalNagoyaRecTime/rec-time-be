export interface EventEntity {
  f_event_id: number;
  f_event_code: string;
  f_event_name: string;
  f_time: string; // HHMM (ex: "0930")
  f_duration: string; // 분 단위 문자열 (ex: "20")
  f_place: string;
  f_gather_time: string;
  f_summary: string | null;

  // ✅ 참가 여부 (백엔드에서 붙여주는 플래그)
  f_is_my_entry?: boolean;
}
