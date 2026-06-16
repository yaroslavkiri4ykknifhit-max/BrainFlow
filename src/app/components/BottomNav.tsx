import { useNavigate, useLocation } from "react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { CircleDot, Plus, Layers } from "lucide-react";

const icons = [CircleDot, Plus, Layers];
const routes = ["/", "/dump", "/backlog"];
const labels = ["Фокус", "Поток", "Бэклог"];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(() => {
    const i = routes.indexOf(location.pathname);
    return i >= 0 ? i : 0;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const movePill = useCallback((index: number) => {
    const pill = pillRef.current;
    const container = containerRef.current;
    if (!pill || !container) return;
    const tabs = container.querySelectorAll(".tab-btn");
    if (!tabs[index]) return;
    const target = tabs[index] as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offset = targetRect.left - containerRect.left - 4;
    pill.style.transform = `translateX(${offset}px)`;
  }, []);

  useEffect(() => {
    const i = routes.indexOf(location.pathname);
    const idx = i >= 0 ? i : 0;
    setActiveIndex(idx);
    requestAnimationFrame(() => movePill(idx));
  }, [location.pathname, movePill]);

  useEffect(() => {
    const pill = pillRef.current;
    const container = containerRef.current;
    if (!pill || !container) return;

    function onPointerDown(e: PointerEvent) {
      isDragging.current = true;
      startX.current = e.clientX;
      pill.style.transition = "none";
      pill.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
      if (!isDragging.current) return;
      const tabs = container.querySelectorAll(".tab-btn");
      const tabWidth = tabs[0]?.getBoundingClientRect().width || 0;
      const dx = e.clientX - startX.current;
      const base = activeIndex * tabWidth;
      const max = 2 * tabWidth;
      const x = Math.max(0, Math.min(max, base + dx));
      pill.style.transform = `translateX(${x}px)`;
    }

    function onPointerUp() {
      if (!isDragging.current) return;
      isDragging.current = false;
      pill.style.transition = "transform 300ms cubic-bezier(0.165,0.84,0.44,1)";
      const tabs = container.querySelectorAll(".tab-btn");
      const tabWidth = tabs[0]?.getBoundingClientRect().width || 0;
      const matrix = new DOMMatrix(getComputedStyle(pill).transform);
      const closest = Math.round(matrix.m41 / tabWidth);
      const idx = Math.max(0, Math.min(2, closest));
      setActiveIndex(idx);
      navigate(routes[idx]);
    }

    function onPointerCancel() {
      if (isDragging.current) {
        isDragging.current = false;
        pill.style.transition = "transform 300ms cubic-bezier(0.165,0.84,0.44,1)";
        movePill(activeIndex);
      }
    }

    pill.addEventListener("pointerdown", onPointerDown);
    pill.addEventListener("pointermove", onPointerMove);
    pill.addEventListener("pointerup", onPointerUp);
    pill.addEventListener("pointercancel", onPointerCancel);

    return () => {
      pill.removeEventListener("pointerdown", onPointerDown);
      pill.removeEventListener("pointermove", onPointerMove);
      pill.removeEventListener("pointerup", onPointerUp);
      pill.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [activeIndex, navigate, movePill]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div
        className="flex justify-center pointer-events-auto"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div
          ref={containerRef}
          className="relative flex items-center w-full max-w-[380px] mx-4 p-1 bg-white border border-zinc-200 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] touch-none select-none"
        >
          <div
            ref={pillRef}
            className="absolute top-1 bottom-1 left-1 w-[calc(33.333%-0.25rem)] bg-[#E0664C] rounded-xl cursor-grab z-0 shadow-[0_2px_8px_rgba(224,102,76,0.3)]"
            style={{ willChange: "transform", transition: "transform 300ms cubic-bezier(0.165,0.84,0.44,1)" }}
          />
          {icons.map((Icon, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveIndex(i);
                navigate(routes[i]);
              }}
              className="tab-btn relative z-10 flex-1 flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-[#222] focus:outline-none select-none"
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{labels[i]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
