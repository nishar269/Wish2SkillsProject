"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithCampusAI } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sparkles, X, MessageCircle, Send, Loader2, Bot, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot", content: string }[]>([
    { role: "bot", content: "Hi! I'm Campus Scout. How can I help you today?" }
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

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
        // Convert history for Gemini
        const history = messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
        }));

        const res = await chatWithCampusAI(userMessage, history);
        setMessages(prev => [...prev, { role: "bot", content: res.text }]);
    } catch (error) {
        setMessages(prev => [...prev, { role: "bot", content: "Oops! Something went wrong. Try again later." }]);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-80 sm:w-96"
          >
            <Card className="shadow-2xl border-cyan-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
              <CardHeader className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-t-xl text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">Campus Scout</CardTitle>
                      <p className="text-[10px] text-cyan-100">AI Campus Assistant</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] flex items-start gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`p-1.5 rounded-full ${m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            {m.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            m.role === "user" 
                            ? "bg-blue-600 text-white rounded-tr-none" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm"
                        }`}>
                            {m.content}
                        </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none animate-pulse flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin text-cyan-600" />
                        <span className="text-[10px] text-muted-foreground">Scout is thinking...</span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-3 border-t bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl">
                 <div className="flex w-full gap-2">
                    <Input 
                      placeholder="Ask anything..." 
                      className="text-xs h-9 bg-white dark:bg-slate-950" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <Button size="icon" className="h-9 w-9 bg-cyan-600 hover:bg-cyan-700 shrink-0" onClick={handleSend} disabled={isLoading}>
                      <Send className="h-4 w-4" />
                    </Button>
                 </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full shadow-2xl shadow-cyan-500/40 relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <MessageCircle className="h-6 w-6 relative z-10" />
        </motion.button>
      )}
    </div>
  );
}
