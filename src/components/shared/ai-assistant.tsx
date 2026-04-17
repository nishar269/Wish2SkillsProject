"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2, Orbit, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { chatWithCampusAI } from "@/actions/ai";
import { motion, AnimatePresence } from "framer-motion";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setIsOfflineMode] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot", content: string }[]>([
    { role: "bot", content: "Protocol active. System ready for intelligence query. How can I assist your workflow today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
        const history = messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
        }));

        const res = await chatWithCampusAI(userMessage, history);
        if (res.isOffline) setIsOfflineMode(true);
        setMessages(prev => [...prev, { role: "bot", content: res.text }]);
    } catch {
        setMessages(prev => [...prev, { role: "bot", content: "Signal breakdown. Neural connection interrupted." }]);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
            className="absolute bottom-24 right-0 w-[420px] h-[600px] glass rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/20 rounded-2xl subtle-glow">
                  <Orbit className="h-5 w-5 text-cyan-400 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-sm font-black italic uppercase tracking-tighter text-white leading-none">Scout Node</h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-500 mt-1">Intelligence Active</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stream */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-slate-950/20">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div className={cn(
                    "max-w-[85%] p-6 text-[13px] font-bold italic tracking-wide leading-relaxed shadow-2xl relative overflow-hidden",
                    m.role === "user" 
                      ? "bg-cyan-500 text-slate-950 rounded-[2rem] rounded-tr-none" 
                      : "bg-white/5 border border-white/10 text-white rounded-[2rem] rounded-tl-none backdrop-blur-xl"
                  )}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] rounded-tl-none">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                   </div>
                </div>
              )}
            </div>

            {/* Input Node */}
            <div className="p-8 bg-white/5 border-t border-white/5 backdrop-blur-3xl">
              <div className="flex items-center gap-3 bg-slate-950/40 p-2 pl-6 rounded-[2rem] border border-white/10 focus-within:border-cyan-500/50 transition-all shadow-inner">
                <Input
                  placeholder="INPUT SYSTEM OVERRIDE..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="border-0 bg-transparent h-12 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-700 focus-visible:ring-0"
                />
                <motion.button 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={isLoading}
                  className="w-12 h-12 bg-cyan-500 text-slate-950 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-cyan-500/20"
                >
                  <Zap className="h-5 w-5" />
                </motion.button>
              </div>
              <p className="text-[8px] text-center text-slate-600 font-black uppercase tracking-[0.4em] mt-6">Protocol v2.0-Alpha Neural Link</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 bg-slate-950 text-cyan-400 rounded-[2rem] border border-cyan-500/30 flex items-center justify-center relative group overflow-hidden shadow-[0_32px_64px_-10px_rgba(0,0,0,0.5)] subtle-glow"
        >
          <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Orbit className="h-8 w-8 relative z-10 animate-spin-slow" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full border-4 border-slate-950 shadow-2xl" />
        </motion.button>
      )}
    </div>
  );
}
