import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Share, Plus } from "lucide-react";

const DISMISSED_KEY = "brainflow_install_dismissed";

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (window.navigator as any).standalone === true;
}

export function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed && isIOS() && !isStandalone()) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[300] bg-black/40 flex items-end md:items-center justify-center p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 text-[#aaa] hover:text-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-[#222] mb-2 pr-8">
              Установить BrainFlow
            </h3>
            <p className="text-sm text-[#888] mb-6 leading-relaxed">
              Добавьте приложение на рабочий стол для быстрого доступа.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                  <Share className="w-4 h-4 text-[#222]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#222]">
                    1. Нажмите «Поделиться»
                  </p>
                  <p className="text-xs text-[#888] mt-0.5">
                    Кнопка внизу Safari
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-[#222]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#222]">
                    2. «На экран Домой»
                  </p>
                  <p className="text-xs text-[#888] mt-0.5">
                    Добавить на рабочий стол
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={dismiss}
              className="w-full py-3 bg-[#222] text-white text-sm font-medium rounded-xl hover:bg-[#333] active:scale-[0.98] transition-all duration-200"
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              Понятно
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
