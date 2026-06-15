import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getItems, deleteItem, completeItem } from "../../lib/supabase";
import type { Item, ItemCategory } from "../../types";

const columns: { key: ItemCategory; label: string; emptyText: string }[] = [
  { key: "task", label: "TASKS", emptyText: "No tasks" },
  { key: "goal", label: "GOALS", emptyText: "No goals" },
  { key: "idea", label: "IDEAS", emptyText: "No ideas" },
];

export function BacklogView() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await getItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to load items:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(id: string) {
    await completeItem(id);
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, completed: true } : item)));
  }

  async function handleDelete(id: string) {
    await deleteItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-black text-white items-center justify-center">
        <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <header className="px-6 py-6 border-b border-[#333]">
        <h1 className="text-lg font-mono font-bold uppercase tracking-widest">Backlog</h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono">
          AI-sorted items. {items.filter((i) => !i.completed).length} active.
        </p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-y-auto lg:overflow-hidden">
        {columns.map((col, colIdx) => {
          const colItems = items.filter((i) => i.category === col.key && !i.completed);
          return (
            <div
              key={col.key}
              className={`flex flex-col border-b lg:border-b-0 ${
                colIdx < 2 ? "lg:border-r" : ""
              } border-[#333]`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest">{col.label}</h2>
                <span className="text-xs font-mono text-zinc-600">{colItems.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {colItems.length === 0 && (
                  <p className="text-xs text-zinc-700 font-mono py-8 text-center">{col.emptyText}</p>
                )}
                {colItems.map((item) => (
                  <div
                    key={item.id}
                    className="group px-6 py-4 border-b border-[#222] hover:bg-[#111] transition-colors flex items-start gap-3"
                  >
                    {col.key === "task" && (
                      <button
                        onClick={() => handleComplete(item.id)}
                        className="mt-0.5 w-3.5 h-3.5 border border-[#555] group-hover:border-white transition-colors flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-mono leading-snug ${col.key === "idea" ? "text-zinc-500 italic" : "text-zinc-300"}`}>
                        {item.text}
                      </p>
                      {item.timeline && (
                        <span className="inline-block mt-1 text-[10px] font-mono text-zinc-600 border border-[#333] px-1.5 py-0.5 uppercase">
                          {item.timeline}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-white text-xs font-mono"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
