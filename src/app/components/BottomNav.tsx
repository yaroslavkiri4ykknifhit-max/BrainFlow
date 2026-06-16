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

  const activeIndex = navItems.findIndex((item) => location.pathname === item.path);
  const isSecondActive = activeIndex === 1;

  const handleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="relative w-full">
      <div
        className="relative flex w-full p-1 bg-[#E0664C] rounded-full"
      >
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-white rounded-full shadow-md z-0"
          style={{
            left: isSecondActive ? "calc(50% + 0.25rem)" : "0.25rem",
            transition: "left 400ms cubic-bezier(0.165, 0.84, 0.44, 1.0)",
          }}
        />
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleSelect(item.path)}
              className={`relative z-10 w-1/2 text-center py-3 text-sm rounded-full font-medium transition-colors duration-400 ${
                isActive ? "text-[#E0664C]" : "text-white/70"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}