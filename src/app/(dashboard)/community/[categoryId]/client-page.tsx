"use client";

import { useState, useTransition } from "react";
import { createPost, getCategories, getPosts } from "@/actions/forum";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Plus, Loader2, Pin, Clock, User, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type ForumPost = Awaited<ReturnType<typeof getPosts>>[number];
type ForumCategory = Awaited<ReturnType<typeof getCategories>>[number];

export default function CategoryClientPage({
  initialPosts,
  category,
}: {
  initialPosts: ForumPost[];
  category: ForumCategory;
}) {
  const posts = initialPosts;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleAddPost(formData: FormData) {
    const data = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      categoryId: category.id
    };

    startTransition(async () => {
      const res = await createPost(data);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Post published!");
        setIsAddOpen(false);
      }
    });
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px]">
            <Link href="/community" className="hover:text-cyan-600 transition-colors">Community</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-cyan-600">{category.name}</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">{category.name}</h1>
          <p className="text-slate-500 font-medium">{category.description}</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-14 px-8 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Plus className="h-5 w-5 mr-2" /> Start Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-8 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">New Discussion</DialogTitle>
            </DialogHeader>
            <form action={handleAddPost} className="space-y-6 mt-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Title</label>
                <Input name="title" placeholder="What's on your mind?" className="h-14 rounded-2xl border-2 border-slate-100 focus:border-cyan-500/50 transition-all font-bold" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Content</label>
                <Textarea name="content" placeholder="Share your thoughts, questions, or ideas..." className="min-h-[200px] rounded-[1.5rem] border-2 border-slate-100 focus:border-cyan-500/50 transition-all font-medium leading-relaxed" required />
              </div>
              <Button type="submit" disabled={isPending} className="w-full h-14 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-black text-lg shadow-2xl shadow-cyan-600/20 transition-all">
                {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <MessageSquare className="h-5 w-5 mr-2" />}
                Publish Post
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {posts.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed rounded-[3rem] bg-white dark:bg-slate-950 border-slate-100">
             <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-bold italic text-lg">Be the first to start a conversation in {category.name}!</p>
          </div>
        ) : (
          posts.map((post) => (
            <Link href={`/community/post/${post.id}`} key={post.id}>
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden bg-white dark:bg-slate-950 group">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center gap-2">
                        {post.isPinned && <Pin className="h-4 w-4 text-emerald-500 fill-emerald-500 shrink-0" />}
                        <h3 className="text-xl font-black tracking-tight group-hover:text-cyan-600 transition-colors uppercase leading-tight">{post.title}</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                        <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8 border-2 border-white shadow-sm shrink-0">
                                <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name ?? ""} />
                                <AvatarFallback>
                                  {post.author.name?.charAt(0).toUpperCase() ?? <User className="h-4 w-4 text-slate-400" />}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{post.author.name}</span>
                            <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest h-5 px-1.5 border-slate-200">{post.author.role}</Badge>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                        </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto md:border-l border-slate-100 dark:border-slate-800 md:pl-6 shrink-0">
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-slate-900 dark:text-white">{post._count.comments}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Replies</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-slate-900 dark:text-white">{post.viewCount}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Views</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
