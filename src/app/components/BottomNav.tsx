import { useNavigate, useLocation } from "react-router";
import { useEffect, useRef } from "react";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const initRef = useRef(false);

  useEffect(() => {
    const pill = document.getElementById("active-pill");
    const buttons = document.querySelectorAll(".tab-btn");

    if (!pill || buttons.length === 0) return;

    if (!initRef.current) {
      initRef.current = true;

      let activeTab = 0;
      let isDragging = false;
      let startX = 0;
      const maxTabs = buttons.length - 1;

      function setTab(index: number) {
        activeTab = index;

        pill.style.transform = "";
        pill.style.transition = "";

        pill.classList.remove("translate-x-0", "translate-x-full", "translate-x-[200%]");

        if (index === 0) pill.classList.add("translate-x-0");
        if (index === 1) pill.classList.add("translate-x-full");
        if (index === 2) pill.classList.add("translate-x-[200%]");

        buttons.forEach((btn, i) => {
          if (i === index) {
            btn.classList.replace("text-[#888888]", "text-black");
          } else {
            btn.classList.replace("text-black", "text-[#888888]");
          }
        });
      }

      const routes = ["/", "/dump", "/backlog"];
      const initIndex = routes.indexOf(location.pathname);
      setTab(initIndex >= 0 ? initIndex : 0);

      buttons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const index = parseInt((e.currentTarget as HTMLElement).dataset.index || "0");
          setTab(index);
          navigate(routes[index]);
        });
      });

      pill.addEventListener("pointerdown", (e: PointerEvent) => {
        isDragging = true;
        startX = e.clientX;
        pill.style.transition = "none";
        pill.setPointerCapture(e.pointerId);
      });

      pill.addEventListener("pointermove", (e: PointerEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const pillWidth = pill.offsetWidth;
        const baseTranslate = activeTab * pillWidth;
        let newTranslate = baseTranslate + deltaX;

        const maxTranslate = maxTabs * pillWidth;
        if (newTranslate < 0) newTranslate = 0;
        if (newTranslate > maxTranslate) newTranslate = maxTranslate;

        pill.style.transform = `translateX(${newTranslate}px)`;
      });

      pill.addEventListener("pointerup", () => {
        if (!isDragging) return;
        isDragging = false;

        const pillWidth = pill.offsetWidth;
        const matrix = new DOMMatrix(window.getComputedStyle(pill).transform);
        const currentX = matrix.m41;
        const closestTab = Math.round(currentX / pillWidth);
        setTab(closestTab);
        navigate(routes[closestTab]);
      });

      pill.addEventListener("pointercancel", () => {
        if (isDragging) {
          isDragging = false;
          setTab(activeTab);
        }
      });
    }
  }, [navigate, location.pathname]);

  const routes = ["/", "/dump", "/backlog"];
  const activeIndex = routes.indexOf(location.pathname);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div
        className="flex justify-center pointer-events-auto"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div
          id="segmented-container"
          className="relative flex w-full max-w-[380px] mx-4 p-1 bg-[#F2F2F7] rounded-full touch-none select-none"
        >
          <div
            id="active-pill"
            className={`absolute top-1 bottom-1 left-1 w-[calc(33.333%-0.25rem)] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] cursor-grab z-0 ${
              safeIndex === 1
                ? "translate-x-full"
                : safeIndex === 2
                ? "translate-x-[200%]"
                : "translate-x-0"
            }`}
          />
          <button
            className={`tab-btn relative z-10 flex-1 py-2 text-[13px] font-medium transition-colors duration-300 focus:outline-none select-none ${
              safeIndex === 0 ? "text-black" : "text-[#888888]"
            }`}
            data-index="0"
          >
            Фокус
          </button>
          <button
            className={`tab-btn relative z-10 flex-1 py-2 text-[13px] font-medium transition-colors duration-300 focus:outline-none select-none ${
              safeIndex === 1 ? "text-black" : "text-[#888888]"
            }`}
            data-index="1"
          >
            Поток
          </button>
          <button
            className={`tab-btn relative z-10 flex-1 py-2 text-[13px] font-medium transition-colors duration-300 focus:outline-none select-none ${
              safeIndex === 2 ? "text-black" : "text-[#888888]"
            }`}
            data-index="2"
          >
            Бэклог
          </button>
        </div>
      </div>
    </div>
  );
}