export type ItemCategory = "task" | "goal" | "idea";
export type Timeline = "today" | "tomorrow" | null;

export interface Item {
  id: string;
  dump_id: string;
  text: string;
  category: ItemCategory;
  timeline: Timeline;
  completed: boolean;
  created_at: string;
  parent_id?: string | null;
  tier?: number;
}

export interface Dump {
  id: string;
  raw_text: string;
  created_at: string;
}

export interface ParsedItem {
  type: ItemCategory;
  timeline: Timeline;
  title: string;
  description: string;
}

export interface ProcessResponse {
  success: boolean;
  items: ParsedItem[];
}
