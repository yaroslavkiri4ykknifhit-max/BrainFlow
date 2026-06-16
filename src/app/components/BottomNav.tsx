import { useNavigate, useLocation } from "react-router";

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

  const activeIndex = navItems.findIndex((item) => location.pathname === item.path);

  const handleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div
        className="flex justify-center pointer-events-auto"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="relative flex w-full max-w-[360px] mx-4 p-1.5 bg-[#F2F2F7] rounded-full">
          <div
            className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(33.333%-0.25rem)] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] transform"
            style={{
              transform: `translateX(calc(${activeIndex} * (100% + 0.125rem)))`,
            }}
          />
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleSelect(item.path)}
                className={`relative z-10 flex-1 py-3 text-[14px] font-medium transition-colors duration-300 focus:outline-none ${
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