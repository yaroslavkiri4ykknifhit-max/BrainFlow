export type ItemCategory = "task" | "goal" | "idea";

export interface Item {
  id: string;
  text: string;
  category: ItemCategory;
  completed: boolean;
  created_at: string;
}

export interface Dump {
  id: string;
  raw_text: string;
  created_at: string;
}

export interface ParsedDump {
  tasks: string[];
  goals: string[];
  ideas: string[];
}
