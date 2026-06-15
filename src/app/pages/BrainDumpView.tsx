import { useState, useRef, useEffect } from "react";
import { Loader2, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { processThought } from "../../lib/supabase";

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

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
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

      setTimeout(() => {
        navigate("/backlog");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process");
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleProcess();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <header className="px-6 py-6 border-b border-[#333]">
        <h1 className="text-lg font-mono font-bold uppercase tracking-widest">Brain Dump</h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono">
          Dump your thoughts. AI will parse and categorize them.
        </p>
      </header>

      <div className="flex-1 flex flex-col relative p-6">
        <div className="relative flex-1 min-h-[50vh]">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I need to fix the database bug, also maybe write a post about scaling, oh and buy coffee beans..."
            className="w-full bg-transparent border border-[#333] p-4 outline-none resize-none text-lg font-mono leading-relaxed text-white placeholder:text-zinc-700 min-h-[300px] focus:border-white transition-colors"
            autoFocus
            disabled={isProcessing}
          />

          <button
            onClick={toggleRecording}
            className={`absolute bottom-4 right-4 w-10 h-10 flex items-center justify-center border transition-all ${
              isRecording
                ? "border-[#ff4d4f] text-[#ff4d4f] animate-pulse"
                : "border-[#333] text-zinc-500 hover:text-white hover:border-white"
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 px-4 py-3 bg-[#1a0000] border border-[#ff4d4f] text-[#ff4d4f] font-mono text-xs"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs font-mono text-zinc-600">
            {text.trim() ? `${text.split(/\s+/).length} words` : ""}
          </div>

          <AnimatePresence mode="wait">
            {savedCount > 0 ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 py-3 border border-white text-white font-mono text-sm"
              >
                {savedCount} items saved
              </motion.div>
            ) : isProcessing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 py-3 border border-[#333] text-zinc-500 font-mono text-sm flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </motion.div>
            ) : text.trim() ? (
              <motion.button
                key="process"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleProcess}
                className="px-6 py-3 bg-white text-black font-mono text-sm font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Process ↵
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
