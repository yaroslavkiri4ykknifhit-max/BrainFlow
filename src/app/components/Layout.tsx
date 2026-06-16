import { Outlet, NavLink, useLocation } from "react-router";
import { CircleDot, Plus, Layers, User, MoreHorizontal } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { SparkLoader } from "./SparkLoader";
import { BottomNav } from "./BottomNav";

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-white flex items-center justify-center z-[100] will-change-opacity"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex flex-col items-center gap-6">
        <SparkLoader size={80} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="text-[#222] font-medium tracking-[0.15em] text-sm uppercase"
        >
          BrainFlow
        </motion.div>
      </div>
    </motion.div>
  );
}

function GlassCircle({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g filter="url(#glass_shadow)">
        <path
          d="M40 56C40 42.7452 50.7452 32 64 32C77.2548 32 88 42.7452 88 56C88 69.2548 77.2548 80 64 80C50.7452 80 40 69.2548 40 56Z"
          fill="white"
          fillOpacity="0.65"
          shapeRendering="crispEdges"
        />
        <path
          d="M40 56C40 42.7452 50.7452 32 64 32C77.2548 32 88 42.7452 88 56C88 69.2548 77.2548 80 64 80C50.7452 80 40 69.2548 40 56Z"
          fill="#DDDDDD"
          style={{ mixBlendMode: "color-burn" }}
          shapeRendering="crispEdges"
        />
        <path
          d="M40 56C40 42.7452 50.7452 32 64 32C77.2548 32 88 42.7452 88 56C88 69.2548 77.2548 80 64 80C50.7452 80 40 69.2548 40 56Z"
          fill="#F7F7F7"
          style={{ mixBlendMode: "darken" }}
          shapeRendering="crispEdges"
        />
      </g>
      <defs>
        <filter id="glass_shadow" x="0" y="0" width="128" height="128" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="8" />
          <feGaussianBlur stdDeviation="20" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4_65" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4_65" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

export function Layout() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  const navItems = [
    { to: "/", icon: CircleDot, label: "Фокус" },
    { to: "/dump", icon: Plus, label: "Brain Dump" },
    { to: "/backlog", icon: Layers, label: "Бэклог" },
  ];

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <div className="flex h-screen bg-white text-[#222] font-sans overflow-hidden antialiased selection:bg-[#E0664C]/20 selection:text-[#222]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-zinc-100 bg-white">
          <div className="flex items-center gap-4 px-6 py-8">
            <div className="relative">
              <GlassCircle size={40} />
              <div className="absolute inset-0 flex items-center justify-center">
                <SparkLoader size={20} animated={false} />
              </div>
            </div>
            <span className="font-semibold tracking-tight text-base text-[#222]">BrainFlow</span>
          </div>

          <div className="px-4 py-2">
            <p className="px-2 text-[10px] font-medium text-[#aaa] mb-3 uppercase tracking-[0.15em]">Menu</p>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={clsx(
                      "relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group",
                      isActive
                        ? "text-[#222] font-medium"
                        : "text-[#888] hover:text-[#444] hover:bg-zinc-50"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl will-change-transform transform-gpu"
                        style={{
                          background: "rgba(255,255,255,0.65)",
                          mixBlendMode: "color-burn",
                          filter: "url(#glass_shadow)",
                        }}
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.8 }}
                      />
                    )}
                    <item.icon className={clsx("w-4 h-4 relative z-10", isActive ? "text-[#E0664C]" : "")} />
                    <span className="relative z-10">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-zinc-100">
            <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-all duration-200 text-left group">
              <div className="relative">
                <GlassCircle size={36} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-[#888]" />
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-[#222] truncate">Alex D.</p>
                <p className="text-[10px] text-[#aaa] truncate">Founder</p>
              </div>
              <MoreHorizontal className="w-4 h-4 text-[#ccc] group-hover:text-[#888]" />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative pb-24 md:pb-0">
          <div className="flex-1 overflow-y-auto">
            <div className="h-full w-full max-w-5xl mx-auto px-4 md:px-8 pt-[max(env(safe-area-inset-top),16px)]">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </>
  );
}
