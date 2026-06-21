import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Item, Dump, ProcessResponse, ParsedItem, ItemCategory, Timeline } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isMock = !supabaseUrl || supabaseUrl.includes("your-project.supabase.co");

export const supabase: SupabaseClient = !isMock && supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null!;

const SUPABASE_URL = supabaseUrl;
const SUPABASE_ANON_KEY = supabaseKey;

// LocalStorage mock keys
const ITEMS_KEY = "brainflow_mock_items";
const DUMPS_KEY = "brainflow_mock_dumps";

function getLocalItems(): Item[] {
  const data = localStorage.getItem(ITEMS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLocalItems(items: Item[]) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export async function processThought(text: string): Promise<ProcessResponse> {
  if (isMock) {
    // Basic local text parsing heuristics to mock the Edge function
    const parts = text.split(/[,.;\n]/).map(p => p.trim()).filter(Boolean);
    const parsedItems: ParsedItem[] = parts.map(part => {
      let type: ItemCategory = "task";
      let timeline: Timeline = null;
      
      const lower = part.toLowerCase();
      if (lower.includes("goal") || lower.includes("цель") || lower.includes("mrr") || lower.includes("достичь")) {
        type = "goal";
      } else if (lower.includes("idea") || lower.includes("мысль") || lower.includes("write") || lower.includes("пост") || lower.includes("стать")) {
        type = "idea";
      }
      
      if (lower.includes("today") || lower.includes("сегодня")) {
        timeline = "today";
      } else if (lower.includes("tomorrow") || lower.includes("завтра")) {
        timeline = "tomorrow";
      }
      
      // Clean up the text a bit for the title/description
      const title = part.split(/\s+/).slice(0, 5).join(" ");
      const description = part;

      return {
        type,
        timeline,
        title,
        description
      };
    });
    
    // Save mock dump
    const dumps = JSON.parse(localStorage.getItem(DUMPS_KEY) || "[]");
    const newDump: Dump = {
      id: Math.random().toString(36).substring(2, 11),
      raw_text: text,
      created_at: new Date().toISOString()
    };
    dumps.push(newDump);
    localStorage.setItem(DUMPS_KEY, JSON.stringify(dumps));
    
    // Save mock items
    const items = getLocalItems();
    const newItems: Item[] = parsedItems.map(pi => ({
      id: Math.random().toString(36).substring(2, 11),
      dump_id: newDump.id,
      text: pi.description,
      category: pi.type,
      timeline: pi.timeline,
      completed: false,
      created_at: new Date().toISOString()
    }));
    
    saveLocalItems([...newItems, ...items]);
    
    // Artificial small delay for the spinner effect
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      items: parsedItems
    };
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/process-thought`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Failed to process thought");
  }

  return res.json();
}

export async function getItems(): Promise<Item[]> {
  if (isMock) {
    let items = getLocalItems();
    if (items.length === 0) {
      items = [
        {
          id: "1",
          dump_id: "mock",
          text: "Финализировать дизайн сайта BrainFlow",
          category: "task",
          timeline: "today",
          completed: false,
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          dump_id: "mock",
          text: "Запустить продукт на Product Hunt",
          category: "goal",
          timeline: null,
          completed: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "3",
          dump_id: "mock",
          text: "Идея: написать статью о концепции Brain Dump",
          category: "idea",
          timeline: null,
          completed: false,
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: "4",
          dump_id: "mock",
          text: "Сделать дизайн завершенных целей",
          category: "task",
          timeline: "today",
          completed: true,
          created_at: new Date(Date.now() - 10800000).toISOString()
        }
      ];
      saveLocalItems(items);
    }
    return items;
  }

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getCurrentTask(): Promise<Item | null> {
  if (isMock) {
    const items = getLocalItems();
    const activeTasks = items.filter(i => i.category === "task" && !i.completed);
    activeTasks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return activeTasks[0] || null;
  }

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("category", "task")
    .eq("completed", false)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function completeItem(id: string, completed: boolean = true): Promise<void> {
  if (isMock) {
    const items = getLocalItems();
    const updated = items.map(i => i.id === id ? { ...i, completed } : i);
    saveLocalItems(updated);
    return;
  }

  const { error } = await supabase
    .from("items")
    .update({ completed })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  if (isMock) {
    const items = getLocalItems();
    const filtered = items.filter(i => i.id !== id);
    saveLocalItems(filtered);
    return;
  }

  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

export async function getWeeklyStats(): Promise<{ date: string; count: number }[]> {
  if (isMock) {
    const items = getLocalItems();
    const dayMap: Record<string, number> = {};
    const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dayMap[key] = 0;
    }

    for (const item of items) {
      const key = item.created_at.split("T")[0];
      if (key in dayMap) dayMap[key]++;
    }

    return Object.entries(dayMap).map(([date, count]) => ({
      date: days[new Date(date).getDay()],
      count,
    }));
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("items")
    .select("created_at")
    .gte("created_at", weekAgo.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw error;

  const dayMap: Record<string, number> = {};
  const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dayMap[key] = 0;
  }

  for (const item of data ?? []) {
    const key = item.created_at.split("T")[0];
    if (key in dayMap) dayMap[key]++;
  }

  return Object.entries(dayMap).map(([date, count]) => ({
    date: days[new Date(date).getDay()],
    count,
  }));
}
