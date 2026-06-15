import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { processThought } from "../../lib/supabase";
import { SparkLoader } from "../components/SparkLoader";

export function BrainDumpView() {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText((prev) => {
        const base = prev.replace(/\s*$/, "");
        return base + (base ? " " : "") + transcript;
      });
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, []);

  function toggleRecording() {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }

  const handleProcess = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      const result = await processThought(text);
      setSavedCount(result.items.length);
      setTimeout(() => navigate("/backlog"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process");
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleProcess();
  };

  return (
    <div className="flex flex-col h-full p-6 md:p-10 max-w-4xl mx-auto w-full relative">
      <header className="mb-8 md:mb-16">
        <h1 className="text-2xl font-serif text-[#222] mb-2">Brain Dump</h1>
        <p className="text-sm text-[#888]">
          Empty your mind. AI will sort it into actionable items automatically.
        </p>
      </header>

      <div className="flex-1 flex flex-col relative min-h-[50vh]">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I need to fix the database bug, also maybe write a post about scaling, oh and buy coffee beans..."
            className="w-full bg-transparent border-0 outline-none resize-none text-xl md:text-3xl font-serif leading-snug md:leading-relaxed text-[#222] placeholder:text-zinc-300 min-h-[200px] pr-12"
            autoFocus
            disabled={isProcessing}
          />
          <button
            onClick={toggleRecording}
            className={`absolute bottom-2 right-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 transform-gpu will-change-transform ${
              isRecording
                ? "text-[#ff4d4f] animate-pulse bg-red-50"
                : "text-[#aaa] hover:text-[#666]"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed md:absolute bottom-36 md:bottom-16 right-6 md:right-0 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm max-w-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {text.trim() && !isProcessing && !savedCount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed md:absolute bottom-20 md:bottom-0 right-6 md:right-0"
            >
              <button
                onClick={handleProcess}
                className="group flex items-center gap-3 px-6 py-3.5 bg-[#E0664C] text-white font-medium rounded-full shadow-lg shadow-[#E0664C]/20 hover:bg-[#c95a42] hover:shadow-xl hover:shadow-[#E0664C]/30 transition-all duration-200 transform-gpu will-change-transform active:scale-95"
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                <SparkLoader size={16} className="brightness-0 invert" />
                <span>Process</span>
                <div className="hidden md:flex items-center gap-1 text-[10px] font-sans ml-2 bg-white/20 px-2 py-0.5 rounded-full">
                  <span className="font-mono">⌘</span>
                  <span className="font-mono">↵</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed md:absolute bottom-20 md:bottom-0 right-6 md:right-0"
            >
              <div className="flex items-center gap-3 px-6 py-3.5 bg-white border border-zinc-200 text-[#222] font-medium rounded-full shadow-sm">
                <SparkLoader size={18} />
                <span>Sorting chaos...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {savedCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed md:absolute bottom-20 md:bottom-0 right-6 md:right-0"
            >
              <div className="flex items-center gap-3 px-6 py-3.5 bg-emerald-50 text-emerald-700 font-medium rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>{savedCount} items saved</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
