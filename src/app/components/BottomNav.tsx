import { useNavigate, useLocation } from "react-router";
import { clsx } from "clsx";

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: "FOCUS", path: "/" },
  { label: "DUMP", path: "/dump" },
  { label: "BACKLOG", path: "/backlog" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-center px-4">
        <svg
          width="100%"
          height="76"
          viewBox="0 0 501 124"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="max-w-[500px]"
          style={{ filter: "drop-shadow(0 8px 40px rgba(0,0,0,0.12))" }}
        >
          {/* Background pill */}
          <g filter="url(#filter0_d_1_55)">
            <path
              d="M40 54C40 41.8497 49.8497 32 62 32H439C451.15 32 461 41.8497 461 54V54C461 66.1503 451.15 76 439 76H62C49.8497 76 40 66.1503 40 54V54Z"
              fill="#262626"
              style={{ mixBlendMode: "color-dodge" }}
              shapeRendering="crispEdges"
            />
            <path
              d="M40 54C40 41.8497 49.8497 32 62 32H439C451.15 32 461 41.8497 461 54V54C461 66.1503 451.15 76 439 76H62C49.8497 76 40 66.1503 40 54V54Z"
              fill="#F5F5F5"
              fillOpacity="0.6"
              shapeRendering="crispEdges"
            />
          </g>
          <path
            d="M40 54C40 41.8497 49.8497 32 62 32H439C451.15 32 461 41.8497 461 54V54C461 66.1503 451.15 76 439 76H62C49.8497 76 40 66.1503 40 54V54Z"
            fill="black"
            fillOpacity="0.01"
          />

          {/* Navigation text items */}
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const xPositions = [61.3477, 124.348, 187.348, 250.348];
            const x = xPositions[index];

            return (
              <g key={item.path}>
                {/* Clickable area */}
                <rect
                  x={x - 10}
                  y={36}
                  width={65}
                  height={36}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => navigate(item.path)}
                />
                {/* Text - we'll use foreignObject for proper text rendering */}
              </g>
            );
          })}

          {/* FOCUS text */}
          <text
            x="93"
            y="59"
            fontFamily="monospace"
            fontSize="14"
            fontWeight="600"
            letterSpacing="0.05em"
            fill={location.pathname === "/" ? "#E0664C" : "#1A1A1A"}
            className="cursor-pointer"
            onClick={() => navigate("/")}
          >
            FOCUS
          </text>

          {/* Separator 1 */}
          <rect x="106" y="45" width="1" height="18" fill="#CCCCCC" />

          {/* DUMP text */}
          <text
            x="147"
            y="59"
            fontFamily="monospace"
            fontSize="14"
            fontWeight="600"
            letterSpacing="0.05em"
            fill={location.pathname === "/dump" ? "#E0664C" : "#1A1A1A"}
            className="cursor-pointer"
            onClick={() => navigate("/dump")}
          >
            DUMP
          </text>

          {/* Separator 2 */}
          <rect x="169" y="45" width="1" height="18" fill="#CCCCCC" />

          {/* BACKLOG text */}
          <text
            x="210"
            y="59"
            fontFamily="monospace"
            fontSize="14"
            fontWeight="600"
            letterSpacing="0.05em"
            fill={location.pathname === "/backlog" ? "#E0664C" : "#1A1A1A"}
            className="cursor-pointer"
            onClick={() => navigate("/backlog")}
          >
            BACKLOG
          </text>

          {/* Separator 3 */}
          <rect x="295" y="45" width="1" height="18" fill="#CCCCCC" />

          {/* STATS text (placeholder - no route yet) */}
          <text
            x="336"
            y="59"
            fontFamily="monospace"
            fontSize="14"
            fontWeight="600"
            letterSpacing="0.05em"
            fill="#1A1A1A"
            opacity="0.4"
          >
            STATS
          </text>

          {/* Separator 4 */}
          <rect x="358" y="45" width="1" height="18" fill="#CCCCCC" />

          {/* Back button */}
          <g
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <rect x="421" y="36" width="36" height="36" rx="18" fill="#EDEDED" />
            <path
              d="M443.819 53.7119C443.819 53.8584 443.79 53.9976 443.731 54.1294C443.678 54.2563 443.59 54.3784 443.468 54.4956L437.835 60.0107C437.645 60.1963 437.413 60.2891 437.14 60.2891C436.964 60.2891 436.8 60.2451 436.649 60.1572C436.498 60.0693 436.375 59.9521 436.283 59.8057C436.195 59.6592 436.151 59.4932 436.151 59.3076C436.151 59.0391 436.253 58.7998 436.458 58.5898L441.476 53.7119L436.458 48.834C436.253 48.6289 436.151 48.3896 436.151 48.1162C436.151 47.9355 436.195 47.772 436.283 47.6255C436.375 47.4741 436.498 47.3545 436.649 47.2666C436.8 47.1787 436.964 47.1348 437.14 47.1348C437.413 47.1348 437.645 47.2275 437.835 47.4131L443.468 52.9282C443.585 53.0454 443.673 53.1675 443.731 53.2944C443.79 53.4214 443.819 53.5605 443.819 53.7119Z"
              fill="#1A1A1A"
            />
          </g>

          {/* Drop shadow filter */}
          <defs>
            <filter id="filter0_d_1_55" x="0" y="0" width="501" height="124" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="8" />
              <feGaussianBlur stdDeviation="20" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_55" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_55" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}
