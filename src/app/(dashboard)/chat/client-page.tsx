"use client";

import { useState, useEffect, useRef } from "react";
import { getChatContacts, getChatMessages, sendChatMessage } from "@/actions/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type ChatContact = Awaited<ReturnType<typeof getChatContacts>>[number];
type ChatMessage = Awaited<ReturnType<typeof getChatMessages>>[number];

export function ChatClient({ currentUserId }: { currentUserId: string }) {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getChatContacts().then(setContacts);
  }, []);

  useEffect(() => {
    if (!activeContact) {
      if (pollInterval.current) clearInterval(pollInterval.current);
      return;
    }

    const fetchMsgs = () => {
      getChatMessages(activeContact.id).then(msgs => {
        setMessages(prev => {
           if (prev.length === msgs.length && prev[prev.length - 1]?.id === msgs[msgs.length - 1]?.id) return prev;
           return msgs;
        });
      });
    };

    fetchMsgs(); 
    pollInterval.current = setInterval(fetchMsgs, 3000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [activeContact]);

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
    
    const optimisticMsg: ChatMessage = {
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex h-[700px] w-full max-w-7xl mx-auto my-6 font-sans">
      
      {/* ---------------- CONTACTS SIDEBAR ---------------- */}
      <div className="w-[320px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" /> Messages
            </h2>
            <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <Input 
                    placeholder="Search contacts..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-50 border-slate-200 shadow-none h-9 text-sm focus-visible:ring-blue-500"
                />
            </div>
        </div>

        <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
                {filteredContacts.map(contact => (
                    <button
                        key={contact.id}
                        onClick={() => {
                            setActiveContact(contact);
                            setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unreadCount: 0 } : c));
                        }}
                        className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                            activeContact?.id === contact.id 
                                ? "bg-blue-50 text-blue-900" 
                                : "hover:bg-slate-100/50 text-slate-700"
                        )}
                    >
                        <div className="relative shrink-0">
                            <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                                {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} alt={contact.name} />}
                                <AvatarFallback className="bg-slate-200 text-slate-600 font-bold text-xs uppercase">
                                    {contact.name.substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={cn("text-sm font-semibold truncate", activeContact?.id === contact.id ? "text-blue-900" : "text-slate-900")}>{contact.name}</h3>
                            <p className="text-xs text-slate-500 truncate capitalize">{contact.role.toLowerCase()}</p>
                        </div>
                        {contact.unreadCount > 0 && (
                            <div className="px-2 py-0.5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                {contact.unreadCount}
                            </div>
                        )}
                    </button>
                ))}
                {filteredContacts.length === 0 && (
                     <div className="text-center py-12 px-6">
                        <p className="text-sm text-slate-400 font-medium">No contacts found</p>
                    </div>
                )}
            </div>
        </ScrollArea>
      </div>

      {/* ---------------- CHAT WINDOW ---------------- */}
      <div className="flex-1 flex flex-col bg-white relative">
        
        {/* Empty State */}
        {!activeContact && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-slate-50">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-sm">
                   <MessageSquare className="h-6 w-6 text-slate-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Your Messages</h2>
                <p className="text-sm text-slate-500">Select a contact to start chatting.</p>
            </div>
        )}

        {activeContact && (
            <>
                {/* Chat Header */}
                <div className="h-16 border-b border-slate-200 flex items-center px-6 shrink-0 bg-white">
                    <div className="flex items-center gap-3">
                       <Avatar className="h-8 w-8 border border-slate-200">
                            {activeContact.avatarUrl && <AvatarImage src={activeContact.avatarUrl} alt={activeContact.name} />}
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">{activeContact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 leading-none">{activeContact.name}</h2>
                            <p className="text-xs text-slate-500 mt-1 capitalize">{activeContact.role.toLowerCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4"
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <p className="text-sm text-slate-400">No messages yet.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === currentUserId;
                            return (
                                <div key={msg.id} className={cn("flex flex-col group", isMe ? "items-end" : "items-start")}>
                                    <div className={cn(
                                        "max-w-[75%] px-4 py-2 shadow-sm",
                                        isMe 
                                            ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" 
                                            : "bg-slate-100 text-slate-900 rounded-2xl rounded-tl-sm border border-slate-200/50"
                                    )}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 px-1">
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {format(new Date(msg.createdAt), "h:mm a")}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                    <form onSubmit={handleSend} className="relative flex items-center gap-2">
                        <Input 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message..." 
                            className="flex-1 bg-slate-50 rounded-xl border border-slate-200 h-11 px-4 shadow-sm focus-visible:ring-blue-500 text-sm"
                        />
                        <Button 
                            type="submit" 
                            disabled={!inputText.trim()}
                            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                            Send
                        </Button>
                    </form>
                </div>
            </>
        )}
      </div>
    </div>
  );
}
