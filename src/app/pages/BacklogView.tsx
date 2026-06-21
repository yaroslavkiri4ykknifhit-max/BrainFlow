import { useEffect, useState } from "react";
import { CheckCircle2, Target, Lightbulb, MoreHorizontal, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
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
  const [expandedCols, setExpandedCols] = useState<Record<ItemCategory, boolean>>({
    task: false,
    goal: false,
    idea: false,
  });

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

  async function handleToggleComplete(id: string, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    try {
      await completeItem(id, nextStatus);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, completed: nextStatus } : item)));
    } catch (err) {
      console.error("Failed to toggle complete:", err);
    }
  }

  async function handleDelete(id: string) {
    await deleteItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] md:h-full items-center justify-center">
        <SparkLoader size={40} />
        <p className="text-sm text-[#888] mt-4">Loading backlog...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] md:min-h-0 py-6 md:py-10">
      <header className="mb-10">
        <h1 className="text-2xl font-serif text-[#222] mb-2">Backlog</h1>
        <p className="text-sm text-[#888]">
          Sorted by AI. Pick a task or return to Focus.
        </p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">
        {columns.map((col) => {
          const activeColItems = items.filter((i) => i.category === col.key && !i.completed);
          const completedColItems = items.filter((i) => i.category === col.key && i.completed);

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
                  {activeColItems.length}
                </span>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto py-1">
                {activeColItems.length === 0 && (
                  <p className="text-sm text-[#aaa] italic py-4 text-center">{col.emptyText}</p>
                )}
                {activeColItems.map((item) => (
                  <div
                    key={item.id}
                    className="group p-4 bg-white border border-zinc-200 rounded-xl hover:border-[#E0664C]/30 hover:shadow-md transition-all duration-200 flex items-start gap-3"
                    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  >
                    {(col.key === "task" || col.key === "goal") && (
                      <button
                        onClick={() => handleToggleComplete(item.id, false)}
                        className="mt-1 w-4 h-4 rounded-full border-2 border-zinc-300 group-hover:border-[#E0664C] transition-colors duration-200 hover:bg-[#E0664C] flex-shrink-0"
                      />
                    )}
                    {col.key === "idea" && (
                      <button
                        onClick={() => handleToggleComplete(item.id, false)}
                        className="mt-1 w-4 h-4 rounded-full border-2 border-zinc-200 group-hover:border-[#E0664C] transition-colors duration-200 hover:bg-[#E0664C] flex-shrink-0"
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

                {/* Collapsible Completed Section */}
                {completedColItems.length > 0 && (
                  <div className="mt-4 border-t border-zinc-100 pt-4">
                    <button
                      onClick={() =>
                        setExpandedCols((prev) => ({ ...prev, [col.key]: !prev[col.key] }))
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#888] hover:text-[#444] transition-colors duration-200 py-1"
                    >
                      <ChevronDown
                        className={clsx(
                          "w-3.5 h-3.5 transition-transform duration-200",
                          expandedCols[col.key] && "rotate-180"
                        )}
                      />
                      <span>Выполненные ({completedColItems.length})</span>
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedCols[col.key] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden flex flex-col gap-3 mt-3"
                        >
                          {completedColItems.map((item) => (
                            <div
                              key={item.id}
                              className="group p-4 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-xl hover:border-zinc-300 transition-all duration-200 flex items-start gap-3 opacity-75"
                              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                            >
                              <button
                                onClick={() => handleToggleComplete(item.id, true)}
                                className="mt-1 w-4 h-4 rounded-full bg-[#E0664C] border-2 border-[#E0664C] flex items-center justify-center flex-shrink-0 text-white transition-colors duration-200 hover:bg-[#c95a42] hover:border-[#c95a42]"
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </button>
                              <p
                                className={`text-sm leading-snug flex-1 font-medium line-through text-zinc-400 ${
                                  col.key === "idea" ? "italic font-serif" : ""
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
