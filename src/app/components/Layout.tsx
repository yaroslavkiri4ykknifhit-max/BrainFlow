import { Outlet, NavLink, useLocation } from "react-router";
import { CircleDot, Plus, Layers, BarChart3 } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

function BrainFlowLogo({ size = 24, animate = false }: { size?: number; animate?: boolean }) {
  const Wrapper = animate ? motion.div : "div";
  const wrapperProps = animate
    ? {
        initial: { rotate: 0 },
        animate: { rotate: 360 },
        transition: { duration: 4, repeat: Infinity, ease: "linear" as const },
      }
    : {};

  return (
    <Wrapper
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      {...wrapperProps}
    >
      <div
        className="absolute inset-0 border-[2px] border-white opacity-80"
        style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
      />
      <div
        className="absolute inset-[3px] border-[2px] border-white opacity-50"
        style={{ borderRadius: "60% 40% 30% 70% / 50% 60% 40% 50%" }}
      />
      <div
        className="absolute inset-[6px] border-[2px] border-white opacity-30"
        style={{ borderRadius: "30% 70% 50% 50% / 60% 40% 50% 60%" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>
    </Wrapper>
  );
}

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center z-[100]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16">
          <BrainFlowLogo size={64} animate />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white font-mono font-bold tracking-[0.3em] text-xs uppercase"
        >
          BrainFlow
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Layout() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  const navItems = [
    { to: "/", icon: CircleDot, label: "Focus" },
    { to: "/dump", icon: Plus, label: "Dump" },
    { to: "/backlog", icon: Layers, label: "Backlog" },
    { to: "/stats", icon: BarChart3, label: "Stats" },
  ];

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <div className="flex h-screen bg-black text-white font-mono overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 border-r border-[#333] bg-black">
          <div className="flex items-center gap-3 px-5 py-5">
            <BrainFlowLogo size={20} />
            <span className="font-bold tracking-[0.2em] text-xs uppercase">BrainFlow</span>
          </div>

          <nav className="px-3 py-2 space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={clsx(
                    "relative flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider transition-colors",
                    isActive
                      ? "text-white"
                      : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 border border-[#333] bg-[#111]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className={clsx("w-4 h-4 relative z-10", isActive ? "text-white" : "")} />
                  <span className="relative z-10 font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto p-4 border-t border-[#333]">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-7 h-7 border border-[#333] flex items-center justify-center">
                <span className="text-[10px] font-bold">A</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium truncate">Alex D.</p>
                <p className="text-[10px] text-zinc-600 truncate">Founder</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-black relative pb-14 md:pb-0">
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[#333] bg-black z-50">
          <div className="flex items-stretch justify-around px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={clsx(
                    "relative flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors flex-1",
                    isActive ? "text-white" : "text-zinc-600"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active"
                      className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-white"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
