import { useNavigate, useLocation } from "react-router";
import { useEffect, useRef } from "react";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const initRef = useRef(false);

  useEffect(() => {
    const pill = document.getElementById("active-pill");
    const btnFocus = document.getElementById("btn-focus");
    const btnBacklog = document.getElementById("btn-backlog");

    if (!pill || !btnFocus || !btnBacklog) return;

    if (!initRef.current) {
      initRef.current = true;

      let activeTab = 0;
      let isDragging = false;
      let startX = 0;

      function setTab(index: number) {
        activeTab = index;

        pill.style.transform = "";
        pill.style.transition = "";

        if (index === 0) {
          pill.classList.remove("translate-x-full");
          pill.classList.add("translate-x-0");
          btnFocus.classList.replace("text-[#888888]", "text-black");
          btnBacklog.classList.replace("text-black", "text-[#888888]");
        } else {
          pill.classList.remove("translate-x-0");
          pill.classList.add("translate-x-full");
          btnBacklog.classList.replace("text-[#888888]", "text-black");
          btnFocus.classList.replace("text-black", "text-[#888888]");
        }
      }

      const initIndex = location.pathname === "/backlog" ? 1 : 0;
      setTab(initIndex);

      btnFocus.addEventListener("click", () => {
        setTab(0);
        navigate("/");
      });
      btnBacklog.addEventListener("click", () => {
        setTab(1);
        navigate("/backlog");
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

        let baseTranslate = activeTab === 0 ? 0 : pillWidth;
        let newTranslate = baseTranslate + deltaX;

        if (newTranslate < 0) newTranslate = 0;
        if (newTranslate > pillWidth) newTranslate = pillWidth;

        pill.style.transform = `translateX(${newTranslate}px)`;
      });

      pill.addEventListener("pointerup", (e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;

        const deltaX = e.clientX - startX;
        const threshold = pill.offsetWidth / 3;

        if (activeTab === 0 && deltaX > threshold) {
          setTab(1);
          navigate("/backlog");
        } else if (activeTab === 1 && deltaX < -threshold) {
          setTab(0);
          navigate("/");
        } else {
          setTab(activeTab);
        }
      });

      pill.addEventListener("pointercancel", () => {
        if (isDragging) {
          isDragging = false;
          setTab(activeTab);
        }
      });
    }
  }, [navigate, location.pathname]);

  const activeIndex = location.pathname === "/backlog" ? 1 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div
        className="flex justify-center pointer-events-auto"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div
          id="segmented-container"
          className="relative flex w-full max-w-[360px] mx-4 p-1.5 bg-[#F2F2F7] rounded-full touch-none select-none"
        >
          <div
            id="active-pill"
            className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-0.375rem)] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.12)] cursor-grab z-0 transition-transform duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] ${
              activeIndex === 1 ? "translate-x-[calc(100%+0.75rem)]" : "translate-x-0"
            }`}
          />
          <button
            id="btn-focus"
            className={`relative z-10 flex-1 py-3 text-[14px] font-medium transition-colors duration-300 focus:outline-none select-none ${
              activeIndex === 0 ? "text-black" : "text-[#888888]"
            }`}
          >
            Поток мыслей
          </button>
          <button
            id="btn-backlog"
            className={`relative z-10 flex-1 py-3 text-[14px] font-medium transition-colors duration-300 focus:outline-none select-none ${
              activeIndex === 1 ? "text-black" : "text-[#888888]"
            }`}
          >
            Бэклог
          </button>
        </div>
      </div>
    </div>
  );
}