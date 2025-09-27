export interface Entry_groupEntity {
  f_event_id: number;
  f_seq: number;
  f_place: string;
  f_gather_time: string | null;
}

export interface Entry_groupDTO {
  f_event_id: string;
  f_seq: string;
  f_place: string;
  f_gather_time: string | null;
}