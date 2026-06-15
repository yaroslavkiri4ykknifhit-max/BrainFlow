import { useEffect, useState } from "react";
import { CheckCircle2, Target, Lightbulb, MoreHorizontal } from "lucide-react";
import { getItems, deleteItem, completeItem } from "../../lib/supabase";
import { SparkLoader } from "../components/SparkLoader";
import type { Item, ItemCategory } from "../../types";

const columns: { key: ItemCategory; label: string; emptyText: string }[] = [
  { key: "task", label: "Actionable", emptyText: "No tasks yet" },
  { key: "goal", label: "Goals", emptyText: "No goals yet" },
  { key: "idea", label: "Someday / Ideas", emptyText: "No ideas yet" },
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
        <SparkLoader size={40} />
        <p className="text-sm text-[#888] mt-4">Loading backlog...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 md:p-10">
      <header className="mb-10">
        <h1 className="text-2xl font-serif text-[#222] mb-2">Backlog</h1>
        <p className="text-sm text-[#888]">
          Sorted by AI. Pick a task or return to Focus.
        </p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">
        {columns.map((col) => {
          const colItems = items.filter((i) => i.category === col.key && !i.completed);
          return (
            <div key={col.key} className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <div className="flex items-center gap-2 text-[#222]">
                  {col.key === "task" && <CheckCircle2 className="w-4 h-4 text-[#E0664C]" />}
                  {col.key === "goal" && <Target className="w-4 h-4 text-[#E0664C]" />}
                  {col.key === "idea" && <Lightbulb className="w-4 h-4 text-[#E0664C]" />}
                  <h2 className="text-sm font-semibold uppercase tracking-wider">{col.label}</h2>
                </div>
                <span className="text-xs font-medium text-[#888] bg-zinc-100 px-2 py-0.5 rounded-full">
                  {colItems.length}
                </span>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto py-1">
                {colItems.length === 0 && (
                  <p className="text-sm text-[#aaa] italic py-4 text-center">{col.emptyText}</p>
                )}
                {colItems.map((item) => (
                  <div
                    key={item.id}
                    className="group p-4 bg-white border border-zinc-200 rounded-xl hover:border-[#E0664C]/30 hover:shadow-md transition-all duration-200 cursor-pointer flex items-start gap-3"
                    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  >
                    {col.key === "task" && (
                      <button
                        onClick={() => handleComplete(item.id)}
                        className="mt-1 w-4 h-4 rounded-full border-2 border-zinc-300 group-hover:border-[#E0664C] transition-colors duration-200 hover:bg-[#E0664C] flex-shrink-0"
                      />
                    )}
                    <p
                      className={`text-sm leading-snug flex-1 font-medium ${
                        col.key === "idea"
                          ? "text-[#888] italic font-serif"
                          : "text-[#444] group-hover:text-[#222]"
                      }`}
                    >
                      {col.key === "idea" ? `"${item.text}"` : item.text}
                    </p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#aaa] hover:text-red-500 flex-shrink-0"
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
