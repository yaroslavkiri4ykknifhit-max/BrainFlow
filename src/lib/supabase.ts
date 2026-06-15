import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Item, Dump, ProcessResponse } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase: SupabaseClient = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null!;

const SUPABASE_URL = supabaseUrl;
const SUPABASE_ANON_KEY = supabaseKey;

export async function processThought(text: string): Promise<ProcessResponse> {
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
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getCurrentTask(): Promise<Item | null> {
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

export async function completeItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("items")
    .update({ completed: true })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

export async function getWeeklyStats(): Promise<{ date: string; count: number }[]> {
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
