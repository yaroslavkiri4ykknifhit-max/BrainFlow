import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { SparkLoader } from "./SparkLoader";

interface NavItem {
  label: string;
  path: string;
  color: string;
}

const navItems: NavItem[] = [
  { label: "FOCUS", path: "/", color: "#1A1A1A" },
  { label: "DUMP", path: "/dump", color: "#1A1A1A" },
  { label: "BACKLOG", path: "/backlog", color: "#1A1A1A" },
];

export function BottomNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = navItems.find((item) => item.path === location.pathname)?.label || "FOCUS";

  const handleSelect = useCallback((path: string, label: string) => {
    setActiveLabel(label);
    navigate(path);
    setIsOpen(false);

    setTimeout(() => {
      setActiveLabel(null);
    }, 3000);
  }, [navigate]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)]">
      <div className="relative" style={{ width: 146, height: 255 }}>
        <svg
          width="146"
          height="255"
          viewBox="0 0 146 255"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0"
        >
          <defs>
            <clipPath id="clip0_1_296">
              <path d="M22 28C22 12.536 34.536 0 50 0H107C122.464 0 135 12.536 135 28V28C135 43.464 122.464 56 107 56H50C34.536 56 22 43.464 22 28V28Z" fill="white" />
            </clipPath>
            <clipPath id="clip1_1_296">
              <path d="M0 88C0 72.536 12.536 60 28 60H107C122.464 60 135 72.536 135 88V88C135 103.464 122.464 116 107 116H28C12.536 116 0 103.464 0 88V88Z" fill="white" />
            </clipPath>
            <clipPath id="clip2_1_296">
              <path d="M17 148C17 132.536 29.536 120 45 120H107C122.464 120 135 132.536 135 148V148C135 163.464 122.464 176 107 176H45C29.536 176 17 163.464 17 148V148Z" fill="white" />
            </clipPath>
            <clipPath id="clip3_1_296">
              <path d="M79 212C79 196.536 91.536 184 107 184V184C122.464 184 135 196.536 135 212V212C135 227.464 122.464 240 107 240V240C91.536 240 79 227.464 79 212V212Z" fill="white" />
            </clipPath>
            <filter id="filter0_dd_1_296" x="68" y="177" width="78" height="78" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="1.5" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_296" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feMorphology radius="3" operator="dilate" in="SourceAlpha" result="effect2_dropShadow_1_296" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="4" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
              <feBlend mode="normal" in2="effect1_dropShadow_1_296" result="effect2_dropShadow_1_296" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_1_296" result="shape" />
            </filter>
          </defs>

          {/* Menu items */}
          <AnimatePresence>
            {isOpen && navItems.map((item, index) => {
              const y = index * 60;
              const isTop = index === 0;
              const isBottom = index === navItems.length - 1;
              const clipId = `clip${index}_1_296`;
              const isActive = location.pathname === item.path;

              return (
                <motion.g
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="cursor-pointer"
                  onClick={() => handleSelect(item.path, item.label)}
                >
                  <g clipPath={`url(#${clipId})`}>
                    <rect
                      width={isTop ? 113 : isBottom ? 118 : 135}
                      height="56"
                      transform={`translate(${isTop ? 22 : isBottom ? 17 : 0}, ${y})`}
                      fill={isActive ? "#E0664C" : "#EADDFF"}
                    />
                  </g>
                  {/* Text label */}
                  <text
                    x="107"
                    y={y + 34}
                    textAnchor="middle"
                    fontFamily="monospace"
                    fontSize="14"
                    fontWeight="600"
                    fill="#4F378A"
                  >
                    {item.label}
                  </text>
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* FAB Button */}
          <g
            filter="url(#filter0_dd_1_296)"
            className="cursor-pointer"
            onClick={toggleMenu}
          >
            <g clipPath="url(#clip3_1_296)">
              <path
                d="M79 212C79 196.536 91.536 184 107 184V184C122.464 184 135 196.536 135 212V212C135 227.464 122.464 240 107 240V240C91.536 240 79 227.464 79 212V212Z"
                fill="#E0664C"
              />
              {/* X icon when open, SparkLoader when closed */}
              {isOpen ? (
                <g>
                  <line x1="102" y1="207" x2="112" y2="217" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="112" y1="207" x2="102" y2="217" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </g>
              ) : (
                <foreignObject x="95" y="200" width="24" height="24">
                  <SparkLoader size={24} className="brightness-0 invert" />
                </foreignObject>
              )}
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
