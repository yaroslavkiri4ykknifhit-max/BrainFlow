import { useNavigate, useLocation } from "react-router";
import { useRef, useEffect, useCallback } from "react";

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Фокус", path: "/" },
  { label: "Поток мыслей", path: "/dump" },
  { label: "Бэклог", path: "/backlog" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    isDragging: false,
    startX: 0,
    currentX: 0,
    maxDrag: 0,
    pillWidth: 0,
  });

  const activeIndex = navItems.findIndex((item) => location.pathname === item.path);

  const getIndexFromPath = useCallback((path: string) => {
    return navItems.findIndex((item) => item.path === path);
  }, []);

  const getPillOffset = useCallback((index: number, maxDrag: number) => {
    return index === 0 ? 0 : index * (maxDrag / (navItems.length - 1));
  }, []);

  const updatePillPosition = useCallback((x: number, animate = true) => {
    const pill = pillRef.current;
    if (!pill) return;
    if (animate) {
      pill.style.transition = "transform 300ms cubic-bezier(0.165, 0.84, 0.44, 1)";
    } else {
      pill.style.transition = "none";
    }
    pill.style.transform = `translateX(${x}px)`;
  }, []);

  const snapToNearest = useCallback((x: number) => {
    const state = stateRef.current;
    const segmentWidth = state.maxDrag / (navItems.length - 1);
    const nearestIndex = Math.round(x / segmentWidth);
    const clampedIndex = Math.max(0, Math.min(navItems.length - 1, nearestIndex));
    const snapX = getPillOffset(clampedIndex, state.maxDrag);

    updatePillPosition(snapX, true);

    if (clampedIndex !== activeIndex) {
      navigate(navItems[clampedIndex].path);
    }

    requestAnimationFrame(() => {
      const pill = pillRef.current;
      if (pill) {
        pill.style.transform = "";
        pill.style.transition = "";
      }
    });
  }, [activeIndex, navigate, getPillOffset, updatePillPosition]);

  useEffect(() => {
    const container = containerRef.current;
    const pill = pillRef.current;
    if (!container || !pill) return;

    const calcDimensions = () => {
      const state = stateRef.current;
      const containerRect = container.getBoundingClientRect();
      const pillRect = pill.getBoundingClientRect();
      const p = parseFloat(getComputedStyle(container).paddingLeft) * 2;
      state.pillWidth = pillRect.width;
      state.maxDrag = containerRect.width - p - state.pillWidth;
    };

    const onPointerDown = (e: PointerEvent) => {
      const state = stateRef.current;
      calcDimensions();
      state.isDragging = true;
      state.startX = e.clientX;
      state.currentX = e.clientX;
      pill.style.transition = "none";
      pill.style.cursor = "grabbing";
      (pill as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const state = stateRef.current;
      if (!state.isDragging) return;

      const delta = e.clientX - state.startX;
      let newX = getPillOffset(activeIndex, state.maxDrag) + delta;
      newX = Math.max(0, Math.min(state.maxDrag, newX));
      state.currentX = newX;

      pill.style.transform = `translateX(${newX}px)`;
    };

    const onPointerUp = (e: PointerEvent) => {
      const state = stateRef.current;
      if (!state.isDragging) return;
      state.isDragging = false;
      pill.style.cursor = "";
      snapToNearest(state.currentX);
    };

    pill.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    calcDimensions();
    window.addEventListener("resize", calcDimensions);

    return () => {
      pill.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", calcDimensions);
    };
  }, [activeIndex, getPillOffset, snapToNearest]);

  useEffect(() => {
    if (pillRef.current) {
      pillRef.current.style.transform = "";
    }
  }, [activeIndex]);

  const handleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div
        className="flex justify-center pointer-events-auto"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div
          ref={containerRef}
          id="segmented-container"
          className="relative flex w-full max-w-[360px] mx-4 p-1.5 bg-[#F2F2F7] rounded-full touch-none"
          style={{ touchAction: "none" }}
        >
          <div
            ref={pillRef}
            id="active-pill"
            className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(33.333%-0.25rem)] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.12)] cursor-grab z-0"
            style={{
              transform: `translateX(calc(${activeIndex} * (100% + 0.125rem)))`,
              transition: "transform 300ms cubic-bezier(0.165, 0.84, 0.44, 1)",
            }}
          />
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleSelect(item.path)}
                className={`relative z-10 flex-1 py-3 text-[14px] font-medium transition-colors duration-300 focus:outline-none select-none ${
                  isActive ? "text-black" : "text-[#888888]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}