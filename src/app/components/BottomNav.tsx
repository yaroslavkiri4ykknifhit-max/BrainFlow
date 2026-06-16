import { useNavigate, useLocation } from "react-router";

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Поток мыслей", path: "/dump" },
  { label: "Бэклог", path: "/backlog" },
];

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isBacklog = location.pathname === "/backlog";

  const handleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="relative flex w-full max-w-[320px] mx-auto mt-4 p-1 bg-[#F2F2F7] rounded-full">
      <div
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] transform"
        style={{
          transform: isBacklog ? "translateX(100%)" : "translateX(0)",
        }}
      />
      <button
        onClick={() => handleSelect("/dump")}
        className={`relative z-10 flex-1 py-2 text-[15px] font-medium transition-colors duration-300 focus:outline-none ${
          !isBacklog ? "text-black" : "text-[#888888]"
        }`}
      >
        Поток мыслей
      </button>
      <button
        onClick={() => handleSelect("/backlog")}
        className={`relative z-10 flex-1 py-2 text-[15px] font-medium transition-colors duration-300 focus:outline-none ${
          isBacklog ? "text-black" : "text-[#888888]"
        }`}
      >
        Бэклог
      </button>
    </div>
  );
}