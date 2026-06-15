import { useState, useEffect } from "react";
import { Check, Flame, Calendar, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { getCurrentTask, completeItem } from "../../lib/supabase";
import { SparkLoader } from "../components/SparkLoader";
import type { Item } from "../../types";

export function FocusView() {
  const [currentTask, setCurrentTask] = useState<Item | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const todayDate = format(new Date(), "EEEE, d MMM", { locale: enUS });
  const currentWeek = format(new Date(), "w");

  useEffect(() => {
    loadCurrentTask();
  }, []);

  async function loadCurrentTask() {
    setLoading(true);
    try {
      const task = await getCurrentTask();
      setCurrentTask(task);
    } catch (err) {
      console.error("Failed to load task:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!currentTask) return;
    await completeItem(currentTask.id);
    setCompleted(true);
  }

  function handleNextTask() {
    setCompleted(false);
    loadCurrentTask();
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full p-6 md:p-10 items-center justify-center">
        <SparkLoader size={40} />
        <p className="text-sm text-[#888] mt-4">Loading focus...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 md:p-10">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-2xl font-serif text-[#222]">Hello, Alex.</h1>
          <p className="text-sm text-[#888] mt-1 flex items-center gap-2 font-mono">
            <Calendar className="w-3.5 h-3.5 text-[#E0664C]" />
            {todayDate} <span className="text-zinc-300">•</span> Week {currentWeek}
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto">
        <AnimatePresence mode="wait">
          {!currentTask && !completed ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="text-center py-12"
            >
              <p className="text-lg text-[#888] font-serif mb-4">
                No tasks in the backlog.
              </p>
              <Link
                to="/dump"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E0664C] text-white font-medium rounded-lg hover:bg-[#c95a42] transition-all duration-200 active:scale-95 transform-gpu"
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                Brain Dump <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : !completed ? (
            <motion.div
              key="task"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#E0664C] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E0664C]" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#E0664C]">
                  Current Focus
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-serif text-[#222] tracking-tight leading-[1.1]">
                {currentTask.text}
              </h2>

              {currentTask.timeline && (
                <span className="inline-block text-xs font-mono text-[#888] border border-zinc-200 px-2 py-1 rounded-full">
                  {currentTask.timeline}
                </span>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={handleComplete}
                  className="group relative flex items-center gap-3 px-6 py-3.5 bg-[#222] text-white font-medium rounded-lg overflow-hidden transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 transform-gpu will-change-transform"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
                  <div className="flex items-center justify-center w-5 h-5 rounded-sm border border-white/30 group-hover:bg-white group-hover:border-white transition-all duration-200">
                    <Check className="w-3.5 h-3.5 text-[#222] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  Mark as Done
                </button>
                <Link
                  to="/dump"
                  className="px-6 py-3.5 text-sm font-medium text-[#888] hover:text-[#222] transition-colors duration-200"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  Skip / Delegate
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="mt-12 bg-white border border-zinc-200 rounded-2xl p-6 relative overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#E0664C]" />
                <div className="flex gap-4">
                  <div className="mt-0.5 w-8 h-8 rounded-full bg-[#E0664C]/10 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-4 h-4 text-[#E0664C]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#222] mb-1">Mentor AI</h3>
                    <p className="text-sm text-[#666] leading-relaxed font-serif">
                      Stop browsing your backlog and start building. This task has been waiting.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center text-center py-12"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center mb-6 shadow-sm">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-serif text-[#222] mb-3">Task completed.</h2>
              <p className="text-[#888] mb-8 max-w-sm">
                Memory freed. You're building momentum. Ready for the next one?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={handleNextTask}
                  className="px-6 py-3 bg-[#222] hover:bg-[#333] text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  Next Task
                </button>
                <Link
                  to="/dump"
                  className="px-6 py-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-[#222] font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  Brain Dump <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
