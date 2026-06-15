import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getItems, getWeeklyStats } from "../../lib/supabase";
import type { Item } from "../../types";

export function StatsView() {
  const [weeklyData, setWeeklyData] = useState<{ date: string; count: number }[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const [weekly, allItems] = await Promise.all([getWeeklyStats(), getItems()]);
      setWeeklyData(weekly);
      setItems(allItems);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const tasks = items.filter((i) => i.category === "task").length;
  const goals = items.filter((i) => i.category === "goal").length;
  const ideas = items.filter((i) => i.category === "idea").length;
  const thisWeek = weeklyData.reduce((sum, d) => sum + d.count, 0);

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
        <h1 className="text-lg font-mono font-bold uppercase tracking-widest">Statistics</h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono">Weekly activity overview</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {[
            { label: "Total", value: total },
            { label: "Completed", value: completed },
            { label: "This Week", value: thisWeek },
            { label: "Completion", value: total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%" },
          ].map((stat, i) => (
            <div key={stat.label} className={`p-6 border border-[#333] ${i > 0 ? "-ml-px" : ""} ${i >= 2 ? "lg:-mt-px" : ""}`}>
              <p className="text-xs font-mono text-zinc-600 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-mono font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-3 gap-0">
          {[
            { label: "Tasks", value: tasks, color: "#fff" },
            { label: "Goals", value: goals, color: "#888" },
            { label: "Ideas", value: ideas, color: "#555" },
          ].map((cat, i) => (
            <div key={cat.label} className={`p-6 border border-[#333] ${i > 0 ? "-ml-px" : ""}`}>
              <p className="text-xs font-mono text-zinc-600 uppercase tracking-wider">{cat.label}</p>
              <p className="text-3xl font-mono font-bold mt-2" style={{ color: cat.color }}>
                {cat.value}
              </p>
              <div className="mt-3 h-1 bg-[#222] w-full">
                <div
                  className="h-full bg-white"
                  style={{ width: `${total > 0 ? (cat.value / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Activity Chart */}
        <div className="border border-[#333] p-6">
          <h2 className="text-xs font-mono text-zinc-600 uppercase tracking-wider mb-6">
            Activity — Last 7 Days
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#666", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#333" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#666", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid #333",
                    borderRadius: 0,
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "#fff",
                  }}
                  cursor={{ fill: "#1a1a1a" }}
                />
                <Bar dataKey="count" radius={[0, 0, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.count > 0 ? "#fff" : "#222"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="border border-[#333]">
          <div className="px-6 py-4 border-b border-[#333]">
            <h2 className="text-xs font-mono text-zinc-600 uppercase tracking-wider">Daily Breakdown</h2>
          </div>
          {weeklyData.map((day, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-3 border-b border-[#222] last:border-b-0"
            >
              <span className="text-sm font-mono text-zinc-400">{day.date}</span>
              <div className="flex items-center gap-4">
                <div className="w-32 h-1 bg-[#222]">
                  <div
                    className="h-full bg-white"
                    style={{ width: `${thisWeek > 0 ? (day.count / thisWeek) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-mono font-bold w-8 text-right">{day.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
