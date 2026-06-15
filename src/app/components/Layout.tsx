import { Outlet, NavLink, useLocation } from "react-router";
import { CircleDot, Plus, Layers, User, MoreHorizontal, Terminal } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

// Mock Loading Screen with Claude-like logo
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // 2 seconds loading
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-[#FAFAFA] flex items-center justify-center z-[100]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="relative w-16 h-16 flex items-center justify-center"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          {/* A sophisticated abstract logo inspired by Claude/AI aesthetics */}
          <div className="absolute inset-0 rounded-2xl border-4 border-[#D97757] opacity-80" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} />
          <div className="absolute inset-2 rounded-2xl border-4 border-[#E5987A] opacity-60" style={{ borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%' }} />
          <div className="absolute inset-4 rounded-xl border-4 border-[#F0BBAA] opacity-40" style={{ borderRadius: '30% 70% 50% 50% / 60% 40% 50% 60%' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#D97757]" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[#D97757] font-medium tracking-widest text-sm uppercase"
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
    { to: "/", icon: CircleDot, label: "Фокус" },
    { to: "/dump", icon: Plus, label: "Brain Dump" },
    { to: "/backlog", icon: Layers, label: "Бэклог" },
  ];

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <div className="flex h-screen bg-[#FAFAFA] text-zinc-900 font-sans overflow-hidden antialiased selection:bg-[#E5987A]/30 selection:text-zinc-900">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200/80 bg-[#FAFAFA]">
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="w-6 h-6 bg-[#D97757] rounded flex items-center justify-center text-white shadow-sm">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold tracking-tight text-sm text-zinc-800">BrainFlow</span>
          </div>
          
          <div className="px-3 py-2">
            <p className="px-3 text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Меню</p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={clsx(
                      "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-200 group",
                      isActive
                        ? "text-zinc-900 font-medium"
                        : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100/50"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-white border border-zinc-200 shadow-sm rounded-md"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <item.icon className={clsx("w-4 h-4 relative z-10", isActive ? "text-[#D97757]" : "")} />
                    <span className="relative z-10">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-zinc-100">
            <button className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-zinc-100 transition-colors text-left group">
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden border border-zinc-300">
                <User className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-zinc-800 truncate">Alex D.</p>
                <p className="text-xs text-zinc-500 truncate">Founder</p>
              </div>
              <MoreHorizontal className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative pb-16 md:pb-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="flex-1 overflow-y-auto">
            <div className="h-full w-full max-w-5xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white/90 backdrop-blur-md flex justify-around p-2 pb-safe z-50">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={clsx(
                  "relative flex flex-col items-center gap-1 p-2 rounded-lg transition-colors w-16",
                  isActive ? "text-[#D97757]" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-active"
                    className="absolute inset-0 bg-[#D97757]/10 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] font-medium relative z-10">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
}
