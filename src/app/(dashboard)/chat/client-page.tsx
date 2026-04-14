"use client";

import { useState, useEffect, useRef } from "react";
import { getChatContacts, getChatMessages, sendChatMessage } from "@/actions/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, MessagesSquare, Check, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function ChatClient({ currentUserId }: { currentUserId: string }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Polling ref to clear interval
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Load contacts
  useEffect(() => {
    getChatContacts().then(setContacts);
  }, []);

  // Poll messages for active contact
  useEffect(() => {
    if (!activeContact) {
      if (pollInterval.current) clearInterval(pollInterval.current);
      return;
    }

    const fetchMsgs = () => {
      getChatMessages(activeContact.id).then(msgs => {
        setMessages(prev => {
           // Basic optimization: if lengths match and last id matches, do nothing to avoid re-renders
           if (prev.length === msgs.length && prev[prev.length - 1]?.id === msgs[msgs.length - 1]?.id) return prev;
           return msgs;
        });
      });
    };

    fetchMsgs(); // Initial
    pollInterval.current = setInterval(fetchMsgs, 3000); // Poll every 3 seconds

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [activeContact]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeContact) return;
    
    const textToSend = inputText;
    setInputText("");
    
    // Optimistic UI
    const optimisticMsg = {
        id: Math.random().toString(),
        content: textToSend,
        senderId: currentUserId,
        receiverId: activeContact.id,
        createdAt: new Date(),
        readStatus: false
    };
    setMessages(prev => [...prev, optimisticMsg]);

    await sendChatMessage(activeContact.id, textToSend);
  };

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="glass rounded-[3rem] border border-cyan-500/10 shadow-2xl overflow-hidden flex h-[700px] w-full">
      
      {/* ---------------- CONTACTS SIDEBAR ---------------- */}
      <div className="w-[350px] bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex flex-col shrink-0 relative z-10">
        <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950">
            <h2 className="text-xl font-black italic tracking-tighter uppercase mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <MessagesSquare className="h-5 w-5 text-cyan-500" /> Transmissions
            </h2>
            <div className="relative">
                <Search className="h-4 w-4 absolute left-4 top-3 text-slate-400" />
                <Input 
                    placeholder="Search agents..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl h-10 shadow-inner placeholder:text-slate-400 focus-visible:ring-cyan-500"
                />
            </div>
        </div>

        <ScrollArea className="flex-1">
            <div className="p-4 space-y-2 relative h-full">
                {filteredContacts.map(contact => (
                    <button
                        key={contact.id}
                        onClick={() => {
                            setActiveContact(contact);
                            setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unreadCount: 0 } : c));
                        }}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 text-left border border-transparent outline-none group",
                            activeContact?.id === contact.id 
                                ? "bg-white dark:bg-slate-950 border-cyan-500/30 shadow-lg subtle-glow-cyan" 
                                : "hover:bg-white dark:hover:bg-slate-800 hover:shadow-md"
                        )}
                    >
                        <div className="relative shrink-0">
                            <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105">
                                {contact.avatarUrl && <img src={contact.avatarUrl} alt="Avatar" className="object-cover" />}
                                <AvatarFallback className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-sm tracking-widest uppercase">
                                    {contact.name.substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={cn("text-sm font-bold truncate transition-colors", activeContact?.id === contact.id ? "text-cyan-600 dark:text-cyan-400" : "text-slate-900 dark:text-white")}>{contact.name}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate opacity-70">{contact.role}</p>
                        </div>
                        {contact.unreadCount > 0 && (
                            <div className="h-5 w-5 bg-cyan-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 animate-pulse">
                                {contact.unreadCount}
                            </div>
                        )}
                    </button>
                ))}
                {filteredContacts.length === 0 && (
                     <div className="text-center py-20 opacity-50 px-6">
                        <MessagesSquare className="h-8 w-8 mx-auto text-slate-400 mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">No agents found</p>
                    </div>
                )}
            </div>
        </ScrollArea>
      </div>

      {/* ---------------- CHAT WINDOW ---------------- */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 relative overflow-hidden">
        
        {/* Empty State */}
        {!activeContact && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-20 bg-slate-50 dark:bg-slate-900">
                <div className="w-24 h-24 bg-cyan-500/10 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/20 rotate-12">
                   <MessagesSquare className="h-10 w-10 text-cyan-500 -rotate-12" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white mb-2">Signal Matrix</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 max-w-sm leading-relaxed">Select a terminal node from the directory to initiate a secure transmission.</p>
            </div>
        )}

        {activeContact && (
            <>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none z-0" />
                
                {/* Chat Header */}
                <div className="h-20 border-b border-slate-100 dark:border-white/5 flex items-center px-8 z-10 shrink-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                       <Avatar className="h-10 w-10 border border-slate-200 dark:border-white/10">
                            {activeContact.avatarUrl && <img src={activeContact.avatarUrl} alt="Avatar" className="object-cover" />}
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">{activeContact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-lg font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">{activeContact.name}</h2>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-500 mt-1">Encrypted Connection</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-6 z-10 scroll-smooth"
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transmission History Cleared</p>
                            <p className="text-[10px] uppercase text-slate-300 mt-1">Terminal Ready</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.senderId === currentUserId;
                            return (
                                <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                    <div className={cn(
                                        "max-w-[70%] px-6 py-3.5 shadow-sm relative group",
                                        isMe 
                                            ? "bg-cyan-600 text-white rounded-[2rem] rounded-tr-sm" 
                                            : "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-[2rem] rounded-tl-sm border border-slate-200 dark:border-white/5"
                                    )}>
                                        <p className="text-[13px] leading-relaxed font-medium">{msg.content}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2 px-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            {format(new Date(msg.createdAt), "HH:mm")}
                                        </span>
                                        {isMe && (
                                            msg.readStatus ? <CheckCheck className="h-3 w-3 text-cyan-500" /> : <Check className="h-3 w-3 text-slate-300" />
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950 z-10 shrink-0">
                    <form onSubmit={handleSend} className="relative flex items-center gap-4">
                        <Input 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type payload..." 
                            className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-slate-200 dark:border-white/5 h-14 pl-6 pr-16 shadow-inner focus-visible:ring-cyan-500 text-sm font-medium"
                        />
                        <Button 
                            type="submit" 
                            disabled={!inputText.trim()}
                            className="h-14 w-14 rounded-[1.5rem] shrink-0 bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </>
        )}
      </div>
    </div>
  );
}
