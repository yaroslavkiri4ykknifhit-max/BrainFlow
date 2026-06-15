import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Item, Dump } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase: SupabaseClient = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null!;

export async function saveDump(rawText: string, items: { text: string; category: string }[]): Promise<Dump> {
  const { data: dump, error: dumpError } = await supabase
    .from("dumps")
    .insert({ raw_text: rawText })
    .select()
    .single();

  if (dumpError) throw dumpError;

  const itemsToInsert = items.map((item) => ({
    dump_id: dump.id,
    text: item.text,
    category: item.category,
    completed: false,
  }));

  const { error: itemsError } = await supabase.from("items").insert(itemsToInsert);
  if (itemsError) throw itemsError;

  return dump;
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
