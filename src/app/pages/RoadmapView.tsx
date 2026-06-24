import { useEffect, useState, useRef } from "react";
import { Check, Lock, Unlock, Plus, X, Trash2, ZoomIn, ZoomOut, RotateCcw, LayoutGrid, List, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { getItems, completeItem, createRoadmapNode, deleteItem, updateNodePosition, updateNodeLockState } from "../../lib/supabase";
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
  const [panOffset, setPanOffset] = useState({ x: 100, y: 50 });
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"canvas" | "list">("canvas");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [newTitle, setNewTitle] = useState("");
  const [newParentId, setNewParentId] = useState<string>("none");
  const [newNodeCoords, setNewNodeCoords] = useState({ x: 300, y: 150 });
  const [formError, setFormError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasDragStart = useRef({ x: 0, y: 0 });
  const nodeDragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    loadRoadmap();
  }, []);

  // Detect mobile screen to auto-set list view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("list");
      } else {
        setViewMode("canvas");
      }
    };
    handleResize(); // run on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function loadRoadmap() {
    setLoading(true);
    try {
      const allItems = await getItems();
      const goals = allItems.filter((i) => i.category === "goal");
      setItems(goals);
    } catch (err) {
      console.error("Failed to load roadmap goals:", err);
    } finally {
      setLoading(false);
    }
  }

  // Check if a node is locked (recursive dependency lock OR manual lock)
  const isNodeLocked = (node: Item): boolean => {
    if (node.locked) return true;
    if (!node.parent_id) return false;
    const parent = items.find((i) => i.id === node.parent_id);
    if (!parent) return false;
    return !parent.completed || isNodeLocked(parent);
  };

  // Toggle node completion status
  async function handleToggleComplete(node: Item, isLocked: boolean) {
    if (isLocked) return;

    const nextStatus = !node.completed;
    try {
      await completeItem(node.id, nextStatus);

      if (nextStatus) {
        confetti({
          particleCount: 80,
          spread: 50,
          origin: { y: 0.8 },
          colors: ["#E0664C", "#222222", "#F3F3F5"],
        });
      }

      // Reload roadmap data to update recursive children states in real-time
      const allItems = await getItems();
      setItems(allItems.filter((i) => i.category === "goal"));
    } catch (err) {
      console.error("Failed to toggle node completion:", err);
    }
  }

  // Toggle manual lock state
  async function handleToggleLock(node: Item) {
    const nextLock = !node.locked;
    try {
      await updateNodeLockState(node.id, nextLock);
      // Update local state immediately
      setItems((prev) =>
        prev.map((i) => (i.id === node.id ? { ...i, locked: nextLock } : i))
      );
      // Reload is required to update recursive child lock states
      const allItems = await getItems();
      setItems(allItems.filter((i) => i.category === "goal"));
    } catch (err) {
      console.error("Failed to toggle lock state:", err);
    }
  }

  // Delete node
  async function handleDeleteNode(id: string) {
    if (!confirm("Вы уверены, что хотите удалить эту цель?")) return;
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      // Reload is required to update recursive child states
      const allItems = await getItems();
      setItems(allItems.filter((i) => i.category === "goal"));
    } catch (err) {
      console.error("Failed to delete node:", err);
    }
  }

  // Canvas Panning Handlers (dragging the background)
  function handleCanvasPointerDown(e: React.PointerEvent) {
    const target = e.target as HTMLElement;
    if (target.closest(".roadmap-node") || target.closest(".modal-container") || target.closest("button")) {
      return;
    }
    setIsDraggingCanvas(true);
    canvasDragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    if (canvasRef.current) {
      canvasRef.current.setPointerCapture(e.pointerId);
    }
  }

  function handleCanvasPointerMove(e: React.PointerEvent) {
    if (!isDraggingCanvas) return;
    setPanOffset({
      x: e.clientX - canvasDragStart.current.x,
      y: e.clientY - canvasDragStart.current.y,
    });
  }

  function handleCanvasPointerUp() {
    setIsDraggingCanvas(false);
  }

  // Node Dragging Handlers (mindmap style coordinates shifting)
  function handleNodePointerDown(e: React.PointerEvent, node: Item) {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const rect = canvasRef.current?.getBoundingClientRect();
    const canvasLeft = rect?.left || 0;
    const canvasTop = rect?.top || 0;

    const nodeX = node.position_x || 100;
    const nodeY = node.position_y || 100;

    const nodeScreenX = nodeX * zoomLevel + panOffset.x + canvasLeft;
    const nodeScreenY = nodeY * zoomLevel + panOffset.y + canvasTop;

    nodeDragOffset.current = {
      x: e.clientX - nodeScreenX,
      y: e.clientY - nodeScreenY,
    };

    setDraggedNodeId(node.id);
  }

  function handleNodePointerMove(e: React.PointerEvent, nodeId: string) {
    if (draggedNodeId !== nodeId) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    const canvasLeft = rect?.left || 0;
    const canvasTop = rect?.top || 0;

    const desiredScreenX = e.clientX - nodeDragOffset.current.x;
    const desiredScreenY = e.clientY - nodeDragOffset.current.y;

    const newX = Math.round((desiredScreenX - panOffset.x - canvasLeft) / zoomLevel);
    const newY = Math.round((desiredScreenY - panOffset.y - canvasTop) / zoomLevel);

    setItems((prev) =>
      prev.map((item) => (item.id === nodeId ? { ...item, position_x: newX, position_y: newY } : item))
    );
  }

  function handleNodePointerUp(e: React.PointerEvent, node: Item) {
    if (draggedNodeId !== node.id) return;
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    setDraggedNodeId(null);

    const finalItem = items.find((i) => i.id === node.id);
    if (finalItem && finalItem.position_x !== undefined && finalItem.position_y !== undefined) {
      updateNodePosition(node.id, finalItem.position_x, finalItem.position_y);
    }
  }

  // Double Click Canvas to Create Node
  function handleCanvasDoubleClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest(".roadmap-node") || target.closest(".modal-container") || target.closest("button")) {
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    const canvasLeft = rect?.left || 0;
    const canvasTop = rect?.top || 0;

    const clickX = Math.round((e.clientX - canvasLeft - panOffset.x) / zoomLevel);
    const clickY = Math.round((e.clientY - canvasTop - panOffset.y) / zoomLevel);

    // Automatically determine tier based on double-click Y coordinates
    let tier = 1;
    if (clickY > 400) tier = 3;
    else if (clickY > 220) tier = 2;

    setSelectedTier(tier);
    setNewNodeCoords({ x: clickX, y: clickY });
    setNewTitle("");
    setNewParentId("none");
    setFormError(null);
    setIsModalOpen(true);
  }

  // Button Triggered Creation
  function handleOpenCreateModal(tierLevel: number) {
    setSelectedTier(tierLevel);
    // Position it roughly centered in the tier band
    setNewNodeCoords({
      x: 300 + Math.random() * 200,
      y: tierLevel * 180 - 70,
    });
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
      await createRoadmapNode(
        newTitle.trim(),
        selectedTier,
        parentId,
        newNodeCoords.x,
        newNodeCoords.y,
        false
      );
      setIsModalOpen(false);
      loadRoadmap();
    } catch (err) {
      console.error("Failed to create roadmap node:", err);
      setFormError("Не удалось создать цель в базе данных");
    }
  }

  // Zoom helpers
  const zoomIn = () => setZoomLevel((z) => Math.min(2.0, z + 0.1));
  const zoomOut = () => setZoomLevel((z) => Math.max(0.5, z - 0.1));
  const resetZoom = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 100, y: 50 });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] md:h-full items-center justify-center">
        <SparkLoader size={40} />
        <p className="text-sm text-[#888] mt-4">Загрузка роадмапа...</p>
      </div>
    );
  }

  const canvasWidth = 1200;
  const canvasHeight = 700;
  const nodeWidth = 190;
  const nodeHeight = 70;

  // Candidate parents: nodes in lower tiers
  const candidateParents = items.filter((item) => (item.tier || 1) < selectedTier);

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] md:min-h-0 py-6 md:py-10 select-none">
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-serif text-[#222] mb-1">Интерактивный Роадмап</h1>
          <p className="text-xs text-[#888]">
            Двигайте карточки как на майндкарте. Дважды кликните по холсту для добавления узла.
          </p>
        </div>

        {/* View Mode & Zoom controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* List View Toggle */}
          <div className="flex bg-zinc-50 border border-zinc-200 rounded-lg p-0.5 text-[#888]">
            <button
              onClick={() => setViewMode("canvas")}
              className={`p-1.5 rounded-md hover:text-[#222] transition-colors duration-200 ${
                viewMode === "canvas" ? "bg-white text-[#E0664C] shadow-sm border border-zinc-100" : ""
              }`}
              title="Mindmap холст"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md hover:text-[#222] transition-colors duration-200 ${
                viewMode === "list" ? "bg-white text-[#E0664C] shadow-sm border border-zinc-100" : ""
              }`}
              title="Список задач"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {viewMode === "canvas" && (
            <div className="flex bg-zinc-50 border border-zinc-200 rounded-lg p-0.5 text-[#888] items-center">
              <button onClick={zoomOut} className="p-1.5 hover:text-[#222] rounded-md transition-colors" title="Zoom Out">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono font-bold px-1.5 min-w-[36px] text-center select-none text-zinc-500">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button onClick={zoomIn} className="p-1.5 hover:text-[#222] rounded-md transition-colors" title="Zoom In">
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-zinc-200 mx-1" />
              <button onClick={resetZoom} className="p-1.5 hover:text-[#222] rounded-md transition-colors" title="Reset View">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {viewMode === "canvas" ? (
        /* CANVAS MINDMAP WORKSPACE */
        <div
          ref={canvasRef}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onDoubleClick={handleCanvasDoubleClick}
          className={`relative w-full h-[550px] bg-white border border-zinc-200 rounded-2xl overflow-hidden cursor-grab shadow-sm touch-none ${
            isDraggingCanvas ? "cursor-grabbing" : ""
          }`}
        >
          {/* Inner Drag/Zoom Canvas container */}
          <div
            className="absolute origin-top-left transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              width: canvasWidth,
              height: canvasHeight,
            }}
          >
            {/* 1. Tier Level Background Guides (Pure White styled tiers) */}
            {TIERS.map((tier) => {
              const y = tier.level * 180 - 70;
              return (
                <div
                  key={tier.level}
                  className="absolute left-4 right-4 pointer-events-none flex items-center justify-between border-b border-zinc-100 pb-2"
                  style={{ top: y - 80, width: canvasWidth - 32 }}
                >
                  <div className="flex flex-col">
                    <span className="font-serif text-xs font-semibold text-[#888] uppercase tracking-wider">
                      {tier.name}
                    </span>
                    <span className="text-[9px] text-[#ccc]">
                      {tier.description}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenCreateModal(tier.level)}
                    className="pointer-events-auto flex items-center gap-1 text-[10px] font-semibold text-[#888] hover:text-[#E0664C] bg-white hover:bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-lg transition-all duration-200 shadow-sm"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Создать</span>
                  </button>
                </div>
              );
            })}

            {/* 2. SVG Mindmap Connections Layer */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: canvasWidth, height: canvasHeight }}
            >
              {items.map((node) => {
                if (!node.parent_id) return null;
                const parent = items.find((i) => i.id === node.parent_id);
                if (!parent) return null;

                const parentX = parent.position_x || 100;
                const parentY = parent.position_y || 100;
                const childX = node.position_x || 100;
                const childY = node.position_y || 100;

                // Render connections: parent bottom-center to child top-center
                const startX = parentX;
                const startY = parentY + nodeHeight / 2;
                const endX = childX;
                const endY = childY - nodeHeight / 2;

                const cp1y = startY + (endY - startY) / 2;
                const cp2y = startY + (endY - startY) / 2;

                const parentLocked = isNodeLocked(parent);
                const isConnectionActive = parent.completed && !parentLocked;

                return (
                  <path
                    key={`line-${node.id}`}
                    d={`M ${startX} ${startY} C ${startX} ${cp1y}, ${endX} ${cp2y}, ${endX} ${endY}`}
                    fill="none"
                    stroke={isConnectionActive ? "#E0664C" : "#E5E5E5"}
                    strokeWidth={isConnectionActive ? 2 : 1.2}
                    strokeDasharray={isConnectionActive ? "none" : "3 3"}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* 3. Render HTML Interactive Mindmap Cards */}
            {items.map((node) => {
              const nodeX = node.position_x || 100;
              const nodeY = node.position_y || 100;

              const isLocked = isNodeLocked(node);
              const isCompleted = node.completed;

              return (
                <div
                  key={node.id}
                  onPointerMove={(e) => handleNodePointerMove(e, node.id)}
                  onPointerUp={(e) => handleNodePointerUp(e, node)}
                  className={`roadmap-node absolute flex items-center justify-center select-none ${
                    draggedNodeId === node.id ? "z-40 scale-102" : "z-10"
                  }`}
                  style={{
                    left: nodeX - nodeWidth / 2,
                    top: nodeY - nodeHeight / 2,
                    width: nodeWidth,
                    height: nodeHeight,
                  }}
                >
                  <div
                    onPointerDown={(e) => handleNodePointerDown(e, node)}
                    className={`w-full h-full p-3 rounded-xl border transition-all duration-200 select-none text-left flex flex-col justify-between shadow-sm ${
                      isCompleted
                        ? "bg-[#E0664C] border-[#E0664C] text-white cursor-grab active:cursor-grabbing"
                        : !isLocked
                        ? "bg-white border-[#E0664C]/50 text-[#222] hover:border-[#E0664C] hover:shadow-md cursor-grab active:cursor-grabbing"
                        : "bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60 cursor-grab active:cursor-grabbing"
                    }`}
                  >
                    {/* Node Text & Controls */}
                    <div className="flex justify-between items-start w-full gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComplete(node, isLocked);
                        }}
                        disabled={isLocked}
                        className={`flex-1 text-left font-serif text-[11px] font-semibold leading-tight line-clamp-2 focus:outline-none ${
                          isLocked ? "cursor-not-allowed text-zinc-400" : "cursor-pointer"
                        }`}
                      >
                        {node.text}
                      </button>

                      {/* Header controls (Lock state button, delete button) */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLock(node);
                          }}
                          className={`p-0.5 rounded hover:bg-black/5 focus:outline-none ${
                            isCompleted ? "text-white/60 hover:text-white" : "text-zinc-400 hover:text-zinc-600"
                          }`}
                          title={node.locked ? "Разблокировать вручную" : "Заблокировать вручную"}
                        >
                          {node.locked ? (
                            <Lock className="w-3 h-3 text-red-400 stroke-[2.5]" />
                          ) : (
                            <Unlock className="w-3 h-3 stroke-[2.5]" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNode(node.id);
                          }}
                          className={`p-0.5 rounded hover:bg-black/5 focus:outline-none ${
                            isCompleted ? "text-white/60 hover:text-white" : "text-zinc-400 hover:text-red-500"
                          }`}
                          title="Удалить узел"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata indicators */}
                    <div className="flex justify-between items-end w-full">
                      <span className={`text-[8px] font-mono tracking-widest ${isCompleted ? "text-white/70" : "text-zinc-400"}`}>
                        T{node.tier}
                      </span>
                      {isCompleted ? (
                        <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center">
                          <Check className="w-2 h-2 text-white stroke-[3.5]" />
                        </div>
                      ) : isLocked ? (
                        <Lock className="w-3 h-3 text-zinc-400" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#E0664C] animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* HIERARCHICAL LIST OUTLINE VIEW (optimized for mobile) */
        <div className="flex flex-col gap-6 bg-white border border-zinc-200 rounded-2xl p-4 md:p-6 shadow-sm">
          {TIERS.map((tier) => {
            const tierNodesInList = items.filter((n) => (n.tier || 1) === tier.level);
            return (
              <div key={tier.level} className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex flex-col">
                    <h3 className="font-serif text-sm font-semibold text-[#222]">{tier.name}</h3>
                    <span className="text-[10px] text-zinc-400">{tier.description}</span>
                  </div>
                  <button
                    onClick={() => handleOpenCreateModal(tier.level)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#888] hover:text-[#E0664C] bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-lg transition-colors duration-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить</span>
                  </button>
                </div>

                {/* Nodes List */}
                {tierNodesInList.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic py-2">Нет целей в этом тире. Нажмите кнопку "+", чтобы добавить.</p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {tierNodesInList.map((node) => {
                      const isLocked = isNodeLocked(node);
                      const isCompleted = node.completed;

                      return (
                        <div
                          key={node.id}
                          className={`p-3 bg-white border rounded-xl flex items-center justify-between gap-3 shadow-inner ${
                            isCompleted
                              ? "border-[#E0664C]/35 bg-[#E0664C]/3"
                              : !isLocked
                              ? "border-zinc-200 hover:border-zinc-300"
                              : "border-zinc-100 bg-zinc-50/50 opacity-65"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Checkbox Complete */}
                            <button
                              onClick={() => handleToggleComplete(node, isLocked)}
                              disabled={isLocked}
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isCompleted
                                  ? "bg-[#E0664C] border-[#E0664C] text-white"
                                  : isLocked
                                  ? "border-zinc-200 bg-zinc-100 cursor-not-allowed"
                                  : "border-zinc-300 hover:border-[#E0664C] cursor-pointer"
                              }`}
                            >
                              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </button>

                            {/* Node Text Info */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold truncate ${isCompleted ? "line-through text-zinc-400 font-serif" : "text-[#222]"}`}>
                                {node.text}
                              </p>
                              {node.parent_id && (
                                <span className="text-[9px] text-zinc-400 font-mono">
                                  Зависит от: {items.find((p) => p.id === node.parent_id)?.text || "неизвестно"}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Manual Lock/Unlock button */}
                            <button
                              onClick={() => handleToggleLock(node)}
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                              title={node.locked ? "Разблокировать вручную" : "Заблокировать вручную"}
                            >
                              {node.locked ? (
                                <Lock className="w-3.5 h-3.5 text-red-400 stroke-[2.5]" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteNode(node.id)}
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-red-500 focus:outline-none"
                              title="Удалить узел"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Add FAB Button on Mobile List View */}
      {viewMode === "list" && (
        <button
          onClick={() => handleOpenCreateModal(1)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#E0664C] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-[#c95a42] md:hidden"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[1px] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="modal-container bg-white w-full max-w-[380px] border border-zinc-200 rounded-2xl shadow-xl p-5 relative overflow-hidden"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-serif text-base font-semibold text-[#222] mb-1">
                Добавить узел роадмапа
              </h3>
              <p className="text-[11px] text-[#888] mb-5">
                Заполните параметры и свяжите узел с другими целями.
              </p>

              <form onSubmit={handleCreateNode} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aaa] mb-1">
                    Название цели
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Например: Собрать команду"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E0664C] focus:bg-white text-xs text-[#222]"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aaa] mb-1">
                      Уровень (Tier)
                    </label>
                    <select
                      value={selectedTier}
                      onChange={(e) => {
                        const tierVal = Number(e.target.value);
                        setSelectedTier(tierVal);
                        // Reset Y coord accordingly
                        setNewNodeCoords((prev) => ({ ...prev, y: tierVal * 180 - 70 }));
                      }}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-xs text-[#222]"
                    >
                      <option value={1}>Tier 1: Cashflow</option>
                      <option value={2}>Tier 2: Scale</option>
                      <option value={3}>Tier 3: Capital</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#aaa] mb-1">
                      Связь (Предок)
                    </label>
                    <select
                      value={newParentId}
                      onChange={(e) => setNewParentId(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-xs text-[#222]"
                    >
                      <option value="none">Без связи</option>
                      {candidateParents.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.text} (T{node.tier})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formError && (
                  <div className="flex items-center gap-1.5 p-2.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 mt-5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 text-xs font-semibold text-white bg-[#E0664C] hover:bg-[#c95a42] rounded-xl active:scale-95 transition-transform"
                  >
                    Создать
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
