import { useState, useEffect } from "react";
import { Check, Flame, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { format } from "date-fns";
import { getCurrentTask, completeItem, getItems } from "../../lib/supabase";
import type { Item } from "../../types";

export function FocusView() {
  const [currentTask, setCurrentTask] = useState<Item | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const todayDate = format(new Date(), "dd.MM.yyyy");
  const dayName = format(new Date(), "EEEE");

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
      <div className="flex flex-col h-full bg-black text-white items-center justify-center">
        <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <header className="px-6 py-6 border-b border-[#333] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-bold uppercase tracking-widest">Focus</h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            {dayName} — {todayDate}
          </p>
        </div>
        <Link
          to="/stats"
          className="text-xs font-mono text-zinc-500 border border-[#333] px-3 py-1.5 hover:text-white hover:border-white transition-colors uppercase tracking-wider"
        >
          Stats
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto px-6">
        <AnimatePresence mode="wait">
          {!currentTask && !completed ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-sm font-mono text-zinc-500 mb-6">No tasks in backlog.</p>
              <Link
                to="/dump"
                className="inline-block px-6 py-3 border border-white text-white font-mono text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
              >
                Brain Dump →
              </Link>
            </motion.div>
          ) : !completed ? (
            <motion.div
              key="task"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">
                  Current Focus
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-mono font-bold tracking-tight leading-tight">
                {currentTask.text}
              </h2>

              {currentTask.timeline && (
                <span className="inline-block text-xs font-mono text-zinc-500 border border-[#333] px-2 py-1 uppercase">
                  {currentTask.timeline}
                </span>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-3 px-6 py-3 bg-white text-black font-mono text-sm font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Done
                </button>
                <Link
                  to="/dump"
                  className="px-6 py-3 border border-[#333] text-zinc-500 font-mono text-sm uppercase tracking-wider hover:text-white hover:border-white transition-colors"
                >
                  Skip
                </Link>
              </div>

              <div className="mt-8 border border-[#333] p-6 relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-white/50 to-transparent" />
                <div className="flex gap-4">
                  <div className="w-8 h-8 border border-[#333] flex items-center justify-center flex-shrink-0">
                    <Flame className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500 mb-2">
                      Mentor
                    </h3>
                    <p className="text-sm font-mono text-zinc-400 leading-relaxed">
                      This task has been waiting. Stop browsing your backlog and start building.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-12"
            >
              <div className="w-16 h-16 border border-white flex items-center justify-center mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-mono font-bold uppercase tracking-widest mb-3">Done.</h2>
              <p className="text-zinc-500 font-mono text-sm mb-8">Next one.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleNextTask}
                  className="px-6 py-3 bg-white text-black font-mono text-sm font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  Next Task
                </button>
                <Link
                  to="/dump"
                  className="px-6 py-3 border border-[#333] text-zinc-500 font-mono text-sm uppercase tracking-wider hover:text-white hover:border-white transition-colors"
                >
                  Brain Dump
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
