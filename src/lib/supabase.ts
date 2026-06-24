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

const METADATA_KEY = "brainflow_roadmap_metadata";

interface RoadmapMetadata {
  parent_id?: string | null;
  tier?: number;
  position_x?: number;
  position_y?: number;
  locked?: boolean;
}

function getLocalMetadata(): Record<string, RoadmapMetadata> {
  const data = localStorage.getItem(METADATA_KEY);
  return data ? JSON.parse(data) : {};
}

function saveLocalMetadata(metadata: Record<string, RoadmapMetadata>) {
  localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
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
        },
        {
          id: "g1",
          dump_id: "mock",
          text: "Закрыть 3 чека по $1500",
          category: "goal",
          timeline: null,
          completed: true,
          created_at: new Date(Date.now() - 20000000).toISOString(),
          parent_id: null,
          tier: 1,
          position_x: 200,
          position_y: 120,
          locked: false
        },
        {
          id: "g2",
          dump_id: "mock",
          text: "Нанять первого ассистента",
          category: "goal",
          timeline: null,
          completed: false,
          created_at: new Date(Date.now() - 18000000).toISOString(),
          parent_id: null,
          tier: 1,
          position_x: 600,
          position_y: 120,
          locked: false
        },
        {
          id: "g3",
          dump_id: "mock",
          text: "Выйти на стабильные $5000/мес",
          category: "goal",
          timeline: null,
          completed: false,
          created_at: new Date(Date.now() - 16000000).toISOString(),
          parent_id: "g1",
          tier: 2,
          position_x: 200,
          position_y: 320,
          locked: false
        },
        {
          id: "g4",
          dump_id: "mock",
          text: "Автоматизировать продажи",
          category: "goal",
          timeline: null,
          completed: false,
          created_at: new Date(Date.now() - 14000000).toISOString(),
          parent_id: "g2",
          tier: 2,
          position_x: 600,
          position_y: 320,
          locked: false
        },
        {
          id: "g5",
          dump_id: "mock",
          text: "Запустить синдикат / инвест-клуб",
          category: "goal",
          timeline: null,
          completed: false,
          created_at: new Date(Date.now() - 12000000).toISOString(),
          parent_id: "g3",
          tier: 3,
          position_x: 400,
          position_y: 520,
          locked: false
        }
      ];
      saveLocalItems(items);
    }
    const localMeta = getLocalMetadata();
    return items.map((item) => {
      const meta = localMeta[item.id] || {};
      return {
        ...item,
        parent_id: meta.parent_id !== undefined ? meta.parent_id : (item.parent_id || null),
        tier: meta.tier !== undefined ? meta.tier : (item.tier || 1),
        position_x: meta.position_x !== undefined ? meta.position_x : (item.position_x || 100),
        position_y: meta.position_y !== undefined ? meta.position_y : (item.position_y || 100),
        locked: meta.locked !== undefined ? meta.locked : (item.locked || false),
      };
    });
  }

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const localMeta = getLocalMetadata();
  const mergedItems = (data ?? []).map((item: any) => {
    const meta = localMeta[item.id] || {};
    return {
      ...item,
      parent_id: item.parent_id !== undefined && item.parent_id !== null ? item.parent_id : (meta.parent_id !== undefined ? meta.parent_id : null),
      tier: item.tier !== undefined && item.tier !== null ? item.tier : (meta.tier !== undefined ? meta.tier : 1),
      position_x: item.position_x !== undefined && item.position_x !== null ? item.position_x : (meta.position_x !== undefined ? meta.position_x : 100),
      position_y: item.position_y !== undefined && item.position_y !== null ? item.position_y : (meta.position_y !== undefined ? meta.position_y : 100),
      locked: item.locked !== undefined && item.locked !== null ? item.locked : (meta.locked !== undefined ? meta.locked : false),
    };
  });

  return mergedItems;
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

// Helper to recursively uncomplete descendant items in real-time
async function recursiveUncomplete(parentId: string, allItems: Item[]): Promise<Item[]> {
  const children = allItems.filter((i) => i.parent_id === parentId);
  let updatedItems = [...allItems];
  
  for (const child of children) {
    if (child.completed) {
      updatedItems = updatedItems.map((i) => i.id === child.id ? { ...i, completed: false } : i);
      
      if (!isMock) {
        try {
          await supabase.from("items").update({ completed: false }).eq("id", child.id);
        } catch (err) {
          console.warn("Could not recursively uncomplete child in DB:", err);
        }
      } else {
        saveLocalItems(updatedItems);
      }
      
      updatedItems = await recursiveUncomplete(child.id, updatedItems);
    }
  }
  return updatedItems;
}

export async function completeItem(id: string, completed: boolean = true): Promise<void> {
  if (isMock) {
    let items = getLocalItems();
    items = items.map(i => i.id === id ? { ...i, completed } : i);
    if (!completed) {
      items = await recursiveUncomplete(id, items);
    }
    saveLocalItems(items);
    return;
  }

  const { error } = await supabase
    .from("items")
    .update({ completed })
    .eq("id", id);

  if (error) throw error;

  if (!completed) {
    const allItems = await getItems();
    await recursiveUncomplete(id, allItems);
  }
}

export async function createRoadmapNode(
  text: string,
  tier: number,
  parentId: string | null,
  x: number = 100,
  y: number = 100,
  locked: boolean = false
): Promise<Item> {
  const newItem = {
    dump_id: isMock ? "mock" : "00000000-0000-0000-0000-000000000000",
    text,
    category: "goal" as const,
    timeline: null,
    completed: false,
    parent_id: parentId,
    tier,
    position_x: x,
    position_y: y,
    locked
  };

  if (isMock) {
    const createdItem: Item = {
      ...newItem,
      id: Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString()
    };
    const items = getLocalItems();
    saveLocalItems([createdItem, ...items]);

    // Save local metadata too so it's consistent
    const localMeta = getLocalMetadata();
    localMeta[createdItem.id] = {
      parent_id: parentId,
      tier,
      position_x: x,
      position_y: y,
      locked
    };
    saveLocalMetadata(localMeta);

    return createdItem;
  }

  // Get first dump or insert a dummy dump to avoid reference constraint
  let dumpId: string;
  const { data: dumps, error: dumpsError } = await supabase.from("dumps").select("id").limit(1);
  if (dumpsError) throw dumpsError;
  
  if (dumps && dumps.length > 0) {
    dumpId = dumps[0].id;
  } else {
    const { data: newDump, error: newDumpError } = await supabase
      .from("dumps")
      .insert([{ raw_text: "Roadmap Node Creation" }])
      .select()
      .single();
    if (newDumpError) throw newDumpError;
    dumpId = newDump.id;
  }

  // Try to insert with custom columns first
  try {
    const { data, error } = await supabase
      .from("items")
      .insert([{
        ...newItem,
        dump_id: dumpId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.warn("Inserting custom columns failed (schema might not be updated). Falling back to localStorage metadata:", err);
    
    // Fallback: insert with standard columns
    const fallbackNewItem = {
      dump_id: dumpId,
      text,
      category: "goal" as const,
      timeline: null,
      completed: false
    };

    const { data, error } = await supabase
      .from("items")
      .insert([fallbackNewItem])
      .select()
      .single();

    if (error) throw error;

    // Save custom attributes locally
    const localMeta = getLocalMetadata();
    localMeta[data.id] = {
      parent_id: parentId,
      tier,
      position_x: x,
      position_y: y,
      locked
    };
    saveLocalMetadata(localMeta);

    return {
      ...data,
      parent_id: parentId,
      tier,
      position_x: x,
      position_y: y,
      locked
    };
  }
}

export async function updateNodePosition(id: string, x: number, y: number): Promise<void> {
  const localMeta = getLocalMetadata();
  localMeta[id] = { ...localMeta[id], position_x: x, position_y: y };
  saveLocalMetadata(localMeta);

  if (isMock) {
    const items = getLocalItems();
    const updated = items.map(i => i.id === id ? { ...i, position_x: x, position_y: y } : i);
    saveLocalItems(updated);
    return;
  }

  try {
    const { error } = await supabase
      .from("items")
      .update({ position_x: x, position_y: y })
      .eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.warn("Could not save position to database, using local settings fallback:", err);
  }
}

export async function updateNodeLockState(id: string, locked: boolean): Promise<void> {
  const localMeta = getLocalMetadata();
  localMeta[id] = { ...localMeta[id], locked };
  saveLocalMetadata(localMeta);

  if (isMock) {
    const items = getLocalItems();
    const updated = items.map(i => i.id === id ? { ...i, locked } : i);
    saveLocalItems(updated);
    return;
  }

  try {
    const { error } = await supabase
      .from("items")
      .update({ locked })
      .eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.warn("Could not save lock state to database, using local settings fallback:", err);
  }
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
