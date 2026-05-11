export type JsonObject = Record<string, unknown>;

export interface PageResult<T = unknown> {
  page_size?: number;
  page_index?: number;
  total?: number;
  values?: T[];
}

export interface PingCodeMember {
  id: string;
  type?: string;
  user?: {
    id?: string;
    name?: string;
    display_name?: string;
    email?: string;
  };
  [key: string]: unknown;
}

export interface PingCodeWorkItem {
  id: string;
  identifier?: string;
  title?: string;
  description?: string;
  type?: string | { id?: string; name?: string };
  assignee?: {
    id?: string;
    name?: string;
    display_name?: string;
  } | null;
  state?: {
    id?: string;
    name?: string;
    type?: string;
  } | null;
  priority?: {
    id?: string;
    name?: string;
  } | null;
  start_at?: number | null;
  end_at?: number | null;
  story_points?: number | null;
  estimated_workload?: number | null;
  remaining_workload?: number | null;
  [key: string]: unknown;
}
