import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Lock, Delete } from "lucide-react";
import { SparkLoader } from "./SparkLoader";

const CORRECT_PIN = "1234";
const STORAGE_KEY = "brainflow_unlocked";

export function PinLock({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleDigit(d: string) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);

    if (next.length === 4) {
      if (next === CORRECT_PIN) {
        localStorage.setItem(STORAGE_KEY, "1");
        setTimeout(onUnlock, 200);
      } else {
        setShaking(true);
        setError(true);
        setTimeout(() => {
          setPin("");
          setShaking(false);
        }, 400);
      }
    }
  }

  function handleDelete() {
    setPin((p) => p.slice(0, -1));
    setError(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key >= "0" && e.key <= "9") {
      handleDigit(e.key);
    } else if (e.key === "Backspace") {
      handleDelete();
    }
  }

  const dots = Array.from({ length: 4 }, (_, i) => i < pin.length);

  return (
    <div
      className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[200]"
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        maxLength={4}
        autoFocus
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none"
        value={pin}
        onChange={() => {}}
      />

      <motion.div
        className="flex flex-col items-center gap-8"
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

        <div className="flex items-center gap-4">
          {dots.map((filled, i) => (
            <motion.div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                filled
                  ? error
                    ? "bg-red-400 border-red-400"
                    : "bg-[#E0664C] border-[#E0664C]"
                  : "bg-transparent border-zinc-300"
              }`}
              animate={filled ? { scale: [1, 1.2, 1] } : {}}
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

        <div className="grid grid-cols-3 gap-4 w-[240px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="w-16 h-16 rounded-2xl bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 text-lg font-medium text-[#222] transition-colors duration-100 flex items-center justify-center"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit("0")}
            className="w-16 h-16 rounded-2xl bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200 text-lg font-medium text-[#222] transition-colors duration-100 flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-2xl hover:bg-zinc-50 active:bg-zinc-100 text-[#888] transition-colors duration-100 flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
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
