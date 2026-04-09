"use client";

import { useState } from "react";
import { markAsRead } from "@/actions/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Check, Megaphone, Info, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function NotificationsClientPage({ initialNotifications, userId }: { initialNotifications: any[], userId: string }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkRead = async (id: string) => {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, readBy: [...n.readBy, userId] } : n
      ));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Inbox</h1>
          <p className="text-muted-foreground">Stay updated with the latest campus announcements.</p>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-600" />
            <span className="text-sm font-bold">{notifications.filter(n => !n.readBy.includes(userId)).length} New</span>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="border-0 shadow-md p-12 text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-slate-300" />
             </div>
             <p className="text-muted-foreground italic">No notifications found.</p>
          </Card>
        ) : (
          notifications.map((n) => {
            const isRead = n.readBy.includes(userId);
            
            return (
              <Card 
                key={n.id} 
                className={`border-0 shadow-md overflow-hidden relative transition-all ${
                    isRead ? 'opacity-60 grayscale-[0.5]' : 'ring-2 ring-cyan-500/10'
                }`}
              >
                {!isRead && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                )}
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl shrink-0 ${
                            n.type === 'URGENT' ? 'bg-red-50 text-red-600' :
                            n.type === 'ACADEMIC' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                        }`}>
                            {n.type === 'URGENT' ? <AlertTriangle className="h-5 w-5" /> : 
                             n.type === 'ACADEMIC' ? <Megaphone className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                    {n.title}
                                </p>
                                {!isRead && (
                                    <Badge className="bg-cyan-500 text-white border-0 font-black text-[8px] uppercase">New</Badge>
                                )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {n.message}
                            </p>
                            <div className="flex items-center gap-4 pt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {format(new Date(n.createdAt), "PPP p")}
                                </span>
                                <span>Sent by {n.creator.name}</span>
                            </div>
                        </div>

                        {!isRead && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-cyan-600 hover:bg-cyan-50"
                                onClick={() => handleMarkRead(n.id)}
                            >
                                <Check className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
