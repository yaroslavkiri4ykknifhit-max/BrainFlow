import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Delete } from "lucide-react";
import { SparkLoader } from "./SparkLoader";

const CORRECT_PIN = "nwo2026";
const CODE_LENGTH = CORRECT_PIN.length;
const STORAGE_KEY = "brainflow_unlocked";

export function PinLock({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleChar(ch: string) {
    if (code.length >= CODE_LENGTH) return;
    const next = code + ch.toLowerCase();
    setCode(next);
    setError(false);

    if (next.length === CODE_LENGTH) {
      if (next === CORRECT_PIN) {
        localStorage.setItem(STORAGE_KEY, "1");
        setTimeout(onUnlock, 200);
      } else {
        setShaking(true);
        setError(true);
        setTimeout(() => {
          setCode("");
          setShaking(false);
        }, 400);
      }
    }
  }

  function handleDelete() {
    setCode((c) => c.slice(0, -1));
    setError(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Backspace") {
      handleDelete();
    } else if (e.key.length === 1) {
      handleChar(e.key);
    }
  }

  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  return (
    <div
      className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[200]"
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type="text"
        autoFocus
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none"
        value={code}
        onChange={() => {}}
      />

      <motion.div
        className="flex flex-col items-center gap-6"
        animate={shaking ? { x: [0, -12, 12, -8, 8, -4, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-2">
            <SparkLoader size={28} animated={false} className="text-[#E0664C]" />
          </div>
          <h2 className="text-lg font-serif text-[#222]">BrainFlow</h2>
          <p className="text-sm text-[#888]">Enter access code</p>
        </div>

        <div className="flex items-center gap-2">
          {Array.from({ length: CODE_LENGTH }, (_, i) => (
            <motion.div
              key={i}
              className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-150 ${
                i < code.length
                  ? error
                    ? "bg-red-400 border-red-400"
                    : "bg-[#E0664C] border-[#E0664C]"
                  : "bg-transparent border-zinc-300"
              }`}
              animate={i < code.length ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400"
          >
            Wrong code
          </motion.p>
        )}

        <div className="flex flex-col items-center gap-2 w-full max-w-[320px]">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-1.5 justify-center">
              {row.map((ch) => (
                <button
                  key={ch}
                  onClick={() => handleChar(ch)}
                  className="w-8 h-10 rounded-lg bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 text-[13px] font-medium text-[#222] transition-colors duration-75 flex items-center justify-center"
                >
                  {ch}
                </button>
              ))}
              {ri === 2 && (
                <>
                  <button
                    onClick={handleDelete}
                    className="w-10 h-10 rounded-lg hover:bg-zinc-50 active:bg-zinc-100 text-[#888] transition-colors duration-75 flex items-center justify-center"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function isUnlocked(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function lock() {
  localStorage.removeItem(STORAGE_KEY);
}
