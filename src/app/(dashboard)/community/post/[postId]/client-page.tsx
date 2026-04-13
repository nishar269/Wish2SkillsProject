"use client";

import { useState, useTransition } from "react";
import { createComment } from "@/actions/forum";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, MessageSquare, Send, Loader2, ChevronRight, Lock, CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function PostClientPage({ post }: { post: any }) {
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;

    startTransition(async () => {
      const res = await createComment({ content: comment, postId: post.id });
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Reply posted!");
        setComment("");
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4">
        <Link href="/community" className="hover:text-cyan-600 transition-colors">Community</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/community/${post.categoryId}`} className="hover:text-cyan-600 transition-colors">{post.category.name}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-cyan-600 truncate max-w-[200px]">{post.title}</span>
      </div>

      {/* Main Post */}
      <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-white dark:bg-slate-950 px-4">
        <CardContent className="p-8 md:p-12 space-y-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                            {post.author.image ? <img src={post.author.image} className="w-full h-full object-cover" /> : <User className="h-6 w-6 text-slate-400" />}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 dark:text-white">{post.author.name}</p>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[9px] uppercase font-black tracking-widest h-5 px-1.5 bg-slate-100">{post.author.role}</Badge>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {formatDistanceToNow(new Date(post.createdAt))} ago
                                </span>
                            </div>
                        </div>
                    </div>
                    {post.isLocked && <Lock className="h-5 w-5 text-slate-300" />}
                </div>

                <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-tight uppercase">
                    {post.title}
                </h1>
            </div>

            <div className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                {post.content}
            </div>

            <div className="pt-8 border-t border-slate-50 dark:border-slate-900 flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-cyan-600" />
                    <span className="text-sm font-black uppercase tracking-tighter text-slate-400">{post.comments.length} Replies</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-300" />
                    <span className="text-sm font-black uppercase tracking-tighter text-slate-400">{post.viewCount} Views</span>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Reply Box */}
      {post.isLocked ? (
        <div className="p-8 bg-slate-100 dark:bg-slate-900 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold italic uppercase tracking-widest text-sm">This discussion has been locked by a moderator.</p>
        </div>
      ) : (
        <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white dark:bg-slate-950 overflow-hidden">
            <CardContent className="p-8">
                <form onSubmit={handleAddComment} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-cyan-600" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Post a Reply</h3>
                    </div>
                    <Textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Join the conversation..." 
                        className="min-h-[120px] rounded-2xl border-2 border-slate-100 focus:border-cyan-500/50 transition-all font-medium leading-relaxed bg-slate-50/50" 
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending || !comment.trim()} className="h-12 px-8 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-black shadow-xl shadow-cyan-600/20 transition-all">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Reply
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-4">Discussion ({post.comments.length})</h3>
        {post.comments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold italic">No replies yet. Start the conversation!</div>
        ) : (
          post.comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-4">
                <div className="mt-2 shrink-0">
                    <CornerDownRight className="h-6 w-6 text-slate-200" />
                </div>
                <Card className="flex-1 border-0 shadow-lg rounded-[2rem] bg-white dark:bg-slate-950 overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                     {comment.author.image ? <img src={comment.author.image} className="w-full h-full object-cover" /> : <User className="h-4 w-4 text-slate-400" />}
                                </div>
                                <div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{comment.author.name}</span>
                                    <Badge variant="outline" className="text-[8px] uppercase font-black tracking-widest ml-2 h-4 px-1 border-slate-100">{comment.author.role}</Badge>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {formatDistanceToNow(new Date(comment.createdAt))} ago
                            </span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                            {comment.content}
                        </div>
                    </CardContent>
                </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
