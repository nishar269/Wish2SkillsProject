import { getCategories } from "@/actions/forum";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, Users, Code, HelpCircle, Lightbulb, BookOpen, Bell } from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, any> = {
    Code: Code,
    HelpCircle: HelpCircle,
    Lightbulb: Lightbulb,
    BookOpen: BookOpen,
    MessageSquare: MessageSquare,
    Users: Users,
    Bell: Bell
};

export default async function CommunityPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">Campus Community</h1>
        <p className="text-muted-foreground font-medium text-lg">Connect, collaborate, and grow with your peers and faculty.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] border-slate-200">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-bold italic">The forums are being polished. Check back soon!</p>
            </div>
        ) : (
            categories.map((category) => {
                const Icon = iconMap[category.icon || "MessageSquare"] || MessageSquare;
                return (
                    <Link href={`/community/${category.id}`} key={category.id}>
                        <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] group overflow-hidden bg-white dark:bg-slate-950">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors" />
                            <CardHeader className="p-8">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                    <Icon className="h-7 w-7 text-cyan-600" />
                                </div>
                                <CardTitle className="text-2xl font-black tracking-tight mb-2 group-hover:text-cyan-600 transition-colors">
                                    {category.name}
                                </CardTitle>
                                <CardDescription className="text-slate-500 font-medium leading-relaxed">
                                    {category.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 flex items-center justify-between border-t border-slate-50 dark:border-slate-900 mt-4">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter text-slate-400">
                                    <MessageSquare className="h-3 w-3" />
                                    {category._count.posts} Discussions
                                </div>
                                <div className="text-xs font-black text-cyan-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    Explore &rarr;
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })
        )}
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
                <h2 className="text-3xl font-black italic tracking-tighter">Guidelines for a healthy community</h2>
                <p className="text-slate-400 max-w-xl">Be respectful, stay on topic, and help each other grow. Our community is built on knowledge sharing and mutual respect.</p>
            </div>
            <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all shadow-xl shadow-cyan-500/20">
                View Rules
            </button>
        </div>
      </div>
    </div>
  );
}
