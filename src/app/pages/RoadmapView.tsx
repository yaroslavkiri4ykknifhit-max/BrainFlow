import { useEffect, useState, useRef } from "react";
import { Check, Lock, Plus, X, GitBranch, Network, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { getItems, completeItem, createRoadmapNode } from "../../lib/supabase";
import { SparkLoader } from "../components/SparkLoader";
import type { Item } from "../../types";

const TIERS = [
  { level: 1, name: "Tier 1: Cashflow", description: "Фундамент и операционный доход" },
  { level: 2, name: "Tier 2: Scale", description: "Масштабирование и автоматизация" },
  { level: 3, name: "Tier 3: Capital / Lamborghini", description: "Капитал и стратегические активы" },
];

export function RoadmapView() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [panOffset, setPanOffset] = useState({ x: 50, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number>(1);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newParentId, setNewParentId] = useState<string>("none");
  const [formError, setFormError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    loadRoadmap();
  }, []);

  async function loadRoadmap() {
    setLoading(true);
    try {
      const allItems = await getItems();
      // Filter goals (roadmap nodes)
      const goals = allItems.filter((i) => i.category === "goal");
      setItems(goals);
    } catch (err) {
      console.error("Failed to load roadmap goals:", err);
    } finally {
      setLoading(false);
    }
  }

  // Pointer event handlers for dragging/panning the tree canvas
  function handlePointerDown(e: React.PointerEvent) {
    // Only pan if clicking on the background canvas directly
    const target = e.target as HTMLElement;
    if (target.closest(".roadmap-node") || target.closest(".modal-container") || target.closest("button")) {
      return;
    }

    setIsDragging(true);
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    if (canvasRef.current) {
      canvasRef.current.setPointerCapture(e.pointerId);
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }

  function handlePointerUp() {
    setIsDragging(false);
  }

  // Toggle complete state and update dependencies recursively
  async function handleNodeClick(node: Item, isUnlocked: boolean) {
    if (!isUnlocked) return;

    const nextStatus = !node.completed;
    try {
      await completeItem(node.id, nextStatus);

      if (nextStatus) {
        // Trigger confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.8 },
          colors: ["#E0664C", "#222222", "#F3F3F5"],
        });
      }

      // Re-load the items to update states recursively in real-time
      const allItems = await getItems();
      const goals = allItems.filter((i) => i.category === "goal");
      setItems(goals);
    } catch (err) {
      console.error("Failed to toggle roadmap node:", err);
    }
  }

  // Open creation form for a specific tier
  function handleOpenCreateModal(tierLevel: number) {
    setSelectedTier(tierLevel);
    setNewTitle("");
    setNewParentId("none");
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleCreateNode(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError("Пожалуйста, введите название цели");
      return;
    }

    try {
      const parentId = newParentId === "none" ? null : newParentId;
      await createRoadmapNode(newTitle.trim(), selectedTier, parentId);
      setIsModalOpen(false);
      // Reload roadmap data
      loadRoadmap();
    } catch (err) {
      console.error("Failed to create roadmap node:", err);
      setFormError("Не удалось создать цель в базе данных");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] md:h-full items-center justify-center">
        <SparkLoader size={40} />
        <p className="text-sm text-[#888] mt-4">Загрузка роадмапа...</p>
      </div>
    );
  }

  // Layout Canvas measurements and positions
  const canvasWidth = 1000;
  const canvasHeight = 700;

  // Distribute items into tiers
  const tierNodes: Record<number, Item[]> = { 1: [], 2: [], 3: [] };
  items.forEach((item) => {
    const t = item.tier || 1;
    if (tierNodes[t]) {
      tierNodes[t].push(item);
    }
  });

  // Sort nodes in each tier to ensure consistent layout ordering
  [1, 2, 3].forEach((t) => {
    tierNodes[t].sort((a, b) => a.created_at.localeCompare(b.created_at));
  });

  // Calculate coordinates of each node on the canvas grid
  const nodePositions: Record<string, { x: number; y: number }> = {};
  const nodeWidth = 200;
  const nodeHeight = 70;

  [1, 2, 3].forEach((t) => {
    const nodes = tierNodes[t];
    const y = t * 180 - 70; // Tier 1 = 110, Tier 2 = 290, Tier 3 = 470
    nodes.forEach((node, index) => {
      const x = (index + 1) * (canvasWidth / (nodes.length + 1));
      nodePositions[node.id] = { x, y };
    });
  });

  // Check if a node is unlocked (parent is completed or parent is null)
  const isNodeUnlocked = (node: Item) => {
    if (!node.parent_id) return true;
    const parent = items.find((i) => i.id === node.parent_id);
    return parent ? parent.completed : false;
  };

  // Find candidate parents (nodes in lower tiers to avoid loops)
  const candidateParents = items.filter((item) => (item.tier || 1) < selectedTier);

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] md:min-h-0 py-6 md:py-10 select-none">
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#222] mb-2">Ветка прокачки</h1>
          <p className="text-sm text-[#888]">
            Управляйте целями и развивайте свои проекты. Завершенные цели открывают следующие уровни.
          </p>
        </div>
        <div className="text-xs text-[#aaa] font-mono bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg self-start sm:self-auto">
          Drag background to pan tree • Click node to toggle
        </div>
      </header>

      {/* Draggable Viewport */}
      <div
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative w-full h-[550px] bg-white border border-zinc-200 rounded-2xl overflow-hidden cursor-grab select-none shadow-inner touch-none ${
          isDragging ? "cursor-grabbing" : ""
        }`}
      >
        {/* Figma Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            backgroundImage: "radial-gradient(#E5E5E5 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
            width: canvasWidth * 2,
            height: canvasHeight * 2,
            top: -canvasHeight / 2,
            left: -canvasWidth / 2,
          }}
        />

        {/* Tree Canvas content container */}
        <div
          className="absolute origin-top-left transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            width: canvasWidth,
            height: canvasHeight,
          }}
        >
          {/* 1. Render Tier Lane Borders and Titles in Background */}
          {TIERS.map((tier) => {
            const y = tier.level * 180 - 70;
            return (
              <div
                key={tier.level}
                className="absolute left-4 right-4 pointer-events-none flex items-center justify-between border-b border-dashed border-zinc-100 pb-2"
                style={{ top: y - 80, width: canvasWidth - 32 }}
              >
                <div className="flex flex-col">
                  <span className="font-serif text-sm font-semibold text-[#222]">
                    {tier.name}
                  </span>
                  <span className="text-[10px] text-[#aaa]">
                    {tier.description}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenCreateModal(tier.level)}
                  className="pointer-events-auto flex items-center gap-1 text-[11px] font-semibold text-[#888] hover:text-[#E0664C] bg-zinc-50 hover:bg-[#E0664C]/5 border border-zinc-200 hover:border-[#E0664C]/30 px-2.5 py-1 rounded-lg transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить</span>
                </button>
              </div>
            );
          })}

          {/* 2. SVG Connections Layer */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: canvasWidth, height: canvasHeight }}
          >
            {items.map((node) => {
              if (!node.parent_id) return null;
              const parentPos = nodePositions[node.parent_id];
              const childPos = nodePositions[node.id];

              if (!parentPos || !childPos) return null;

              // Connections start at the bottom center of parent, and end at top center of child
              const startX = parentPos.x;
              const startY = parentPos.y + nodeHeight / 2;
              const endX = childPos.x;
              const endY = childPos.y - nodeHeight / 2;

              const cp1y = startY + 50;
              const cp2y = endY - 50;

              const parentNode = items.find((i) => i.id === node.parent_id);
              const isActiveConnection = parentNode?.completed ?? false;

              return (
                <path
                  key={`line-${node.id}`}
                  d={`M ${startX} ${startY} C ${startX} ${cp1y}, ${endX} ${cp2y}, ${endX} ${endY}`}
                  fill="none"
                  stroke={isActiveConnection ? "#E0664C" : "#E5E5E5"}
                  strokeWidth={isActiveConnection ? 2 : 1.5}
                  strokeDasharray={isActiveConnection ? "none" : "4 4"}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* 3. HTML Nodes Layer */}
          {items.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const isUnlocked = isNodeUnlocked(node);
            const isCompleted = node.completed;

            return (
              <div
                key={node.id}
                className="roadmap-node absolute flex items-center justify-center"
                style={{
                  left: pos.x - nodeWidth / 2,
                  top: pos.y - nodeHeight / 2,
                  width: nodeWidth,
                  height: nodeHeight,
                }}
              >
                <button
                  onClick={() => handleNodeClick(node, isUnlocked)}
                  disabled={!isUnlocked}
                  className={`w-full h-full p-3.5 text-left rounded-xl transition-all duration-300 transform-gpu relative flex flex-col justify-between select-none ${
                    isCompleted
                      ? "bg-[#E0664C] border-2 border-[#E0664C] text-white shadow-md hover:bg-[#c95a42] hover:border-[#c95a42] hover:-translate-y-0.5 cursor-pointer active:scale-98"
                      : isUnlocked
                      ? "bg-white border-2 border-[#E0664C] text-[#222] hover:-translate-y-0.5 hover:shadow-md cursor-pointer active:scale-98"
                      : "bg-zinc-50/50 border border-zinc-200 text-[#aaa] cursor-not-allowed"
                  }`}
                  style={{
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div className="w-full pr-6 flex-1">
                    <p
                      className={`text-[12px] font-semibold tracking-tight leading-tight line-clamp-2 ${
                        isCompleted ? "text-white" : isUnlocked ? "text-[#222]" : "text-[#aaa]"
                      }`}
                    >
                      {node.text}
                    </p>
                  </div>

                  <div className="flex items-center justify-between w-full mt-1.5">
                    <span
                      className={`text-[9px] font-mono tracking-wider ${
                        isCompleted ? "text-white/80" : "text-[#aaa]"
                      }`}
                    >
                      TIER {node.tier}
                    </span>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {isCompleted ? (
                        <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : isUnlocked ? (
                        <div className="w-4 h-4 border border-[#E0664C]/30 rounded-full flex items-center justify-center text-[#E0664C]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E0664C] animate-pulse" />
                        </div>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-[#ccc]" />
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Creation Modal (Zero Friction Apple Minimalist Overlay) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[2px] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="modal-container bg-white w-full max-w-[400px] border border-zinc-200 rounded-2xl shadow-xl p-6 relative overflow-hidden"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-serif text-lg font-semibold text-[#222] mb-1">
                Добавить цель в роадмап
              </h3>
              <p className="text-xs text-[#888] mb-6">
                Создайте узел в ветке прокачки с необходимыми зависимостями.
              </p>

              <form onSubmit={handleCreateNode} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#aaa] mb-1.5">
                    Название цели
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Например: Закрыть 3 чека по $1500"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E0664C] focus:bg-white text-sm text-[#222] transition-colors duration-200"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#aaa] mb-1.5">
                      Уровень (Tier)
                    </label>
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E0664C] focus:bg-white text-sm text-[#222] transition-colors duration-200 cursor-pointer"
                    >
                      <option value={1}>Tier 1: Cashflow</option>
                      <option value={2}>Tier 2: Scale</option>
                      <option value={3}>Tier 3: Capital</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#aaa] mb-1.5">
                      Родительская связь
                    </label>
                    <select
                      value={newParentId}
                      onChange={(e) => setNewParentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E0664C] focus:bg-white text-sm text-[#222] transition-colors duration-200 cursor-pointer"
                    >
                      <option value="none">Без предка (Tier 1)</option>
                      {candidateParents.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.text} (T{node.tier})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs mt-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors duration-200"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-sm font-medium text-white bg-[#E0664C] hover:bg-[#c95a42] rounded-xl transition-all duration-200 active:scale-98"
                  >
                    Создать цель
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
