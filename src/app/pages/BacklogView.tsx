import { useEffect, useState } from "react";
import { CheckCircle2, Target, Lightbulb, MoreHorizontal, Loader2 } from "lucide-react";
import { getItems, deleteItem, completeItem } from "../../lib/supabase";
import type { Item, ItemCategory } from "../../types";

const columns: { key: ItemCategory; label: string; icon: typeof CheckCircle2; emptyText: string }[] = [
  { key: "task", label: "Actionable", icon: CheckCircle2, emptyText: "No tasks yet" },
  { key: "goal", label: "Goals", icon: Target, emptyText: "No goals yet" },
  { key: "idea", label: "Someday / Ideas", icon: Lightbulb, emptyText: "No ideas yet" },
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
      <div className="flex flex-col h-full p-6 md:p-10 items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#D97757] animate-spin" />
        <p className="text-sm text-zinc-500 mt-3">Loading backlog...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 md:p-10">
      <header className="mb-10">
        <h1 className="text-2xl font-serif text-zinc-800 mb-2">Backlog</h1>
        <p className="text-sm text-zinc-500">
          Sorted by AI. Pick a task or return to Focus.
        </p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">
        {columns.map((col) => {
          const colItems = items.filter((i) => i.category === col.key && !i.completed);
          return (
            <div key={col.key} className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <div className="flex items-center gap-2 text-zinc-800">
                  <col.icon className="w-4 h-4 text-[#D97757]" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider">{col.label}</h2>
                </div>
                <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                  {colItems.length}
                </span>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto py-1">
                {colItems.length === 0 && (
                  <p className="text-sm text-zinc-400 italic py-4 text-center">{col.emptyText}</p>
                )}
                {colItems.map((item) => (
                  <div
                    key={item.id}
                    className="group p-4 bg-white border border-zinc-200 rounded-xl hover:border-[#E5987A]/50 hover:shadow-md transition-all cursor-pointer flex items-start gap-3"
                  >
                    {col.key === "task" && (
                      <button
                        onClick={() => handleComplete(item.id)}
                        className="mt-1 w-4 h-4 rounded-full border-2 border-zinc-300 group-hover:border-[#D97757] transition-colors hover:bg-[#D97757] flex-shrink-0"
                      />
                    )}
                    <p
                      className={`text-sm leading-snug flex-1 font-medium ${
                        col.key === "idea"
                          ? "text-zinc-500 italic font-serif"
                          : "text-zinc-700 group-hover:text-zinc-900"
                      }`}
                    >
                      {col.key === "idea" ? `"${item.text}"` : item.text}
                    </p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500 flex-shrink-0"
                    >
                      <MoreHorizontal className="w-4 h-4" />
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
