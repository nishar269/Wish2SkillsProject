"use client";

import { useState, useTransition } from "react";
import { submitFeedback } from "@/actions/feedback";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, MessageSquareQuote, Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type FacultyOption = {
  id: string;
  user: {
    name: string;
  };
};

export default function FeedbackClientPage({ faculty }: { faculty: FacultyOption[] }) {
  const [rating, setRating] = useState(5);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const data = {
        message: formData.get("content") as string,
        rating: rating,
        category: formData.get("category") as string,
        facultyId: (formData.get("facultyId") as string) || undefined
    };

    startTransition(async () => {
        const res = await submitFeedback(data);
        if (res?.error) toast.error(res.error);
        else {
            toast.success("Thank you for your valuable feedback!");
            (document.getElementById("feedback-form") as HTMLFormElement).reset();
            setRating(5);
        }
    });
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card className="border-0 shadow-2xl shadow-cyan-100 dark:shadow-none bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-cyan-50 dark:bg-cyan-950/50 rounded-2xl flex items-center justify-center text-cyan-600 mb-4">
                <MessageSquareQuote className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-black">Your Voice Matters</CardTitle>
            <CardDescription>Share your thoughts to help us improve your experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="feedback-form" action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button 
                            key={s} 
                            type="button" 
                            onClick={() => setRating(s)}
                            className={`p-2 rounded-xl transition-all ${rating >= s ? "text-amber-500 scale-110" : "text-slate-300 dark:text-slate-700"}`}
                        >
                            <Star className={`h-8 w-8 ${rating >= s ? "fill-current" : ""}`} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label>Category</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select name="category" required className="w-full bg-transparent outline-none text-sm">
                        <option value="GENERAL">General Experience</option>
                        <option value="ACADEMIC">Academic Quality</option>
                        <option value="FACILITY">Infrastructure / Facilities</option>
                        <option value="FACULTY">Faculty Performance</option>
                    </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Specific Faculty (Optional)</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select name="facultyId" className="w-full bg-transparent outline-none text-sm">
                        <option value="">None / General</option>
                        {faculty.map(f => <option key={f.id} value={f.id}>{f.user.name}</option>)}
                    </select>
                </div>
              </div>
            </div>

            <div className="space-y-2 relative">
                <Label htmlFor="content">Your Feedback</Label>
                <Textarea id="content" name="content" placeholder="Tell us what you loved or what we can fix..." rows={5} required className="bg-white dark:bg-slate-950 border-slate-200 rounded-2xl" />
                <div className="absolute right-3 bottom-3 flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                    <Sparkles className="h-3 w-3 text-cyan-500" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">AI Sentiment Active</span>
                </div>
            </div>

            <Button type="submit" disabled={isPending} className="w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-cyan-500/20">
                {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
