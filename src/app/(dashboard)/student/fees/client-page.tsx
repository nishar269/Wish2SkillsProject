"use client";

import { useTransition } from "react";
import { payFee } from "@/actions/fees";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, Calendar, Wallet, CheckCircle2, 
  AlertCircle, Loader2, ArrowRight, Banknote 
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function StudentFeesClientPage({ initialFees }: { initialFees: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handlePay = (feeId: string) => {
    // In a real app, integrate Stripe/Razorpay here
    startTransition(async () => {
        const res = await payFee(feeId);
        if (res?.error) toast.error(res.error);
        else toast.success("Payment successful! Your record has been updated.");
    });
  };

  const totalPending = initialFees
    .filter(f => f.status === 'UNPAID')
    .reduce((acc, current) => acc + current.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Finances & Fees</h1>
          <p className="text-muted-foreground">Manage your tuition payments and financial clearance.</p>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 rounded-2xl flex items-center gap-4">
            <div className="p-2 bg-orange-500 rounded-xl text-white">
                <Wallet className="h-5 w-5" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">Total Outstanding</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">₹{totalPending.toLocaleString()}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {initialFees.length === 0 ? (
          <p className="text-muted-foreground italic col-span-full">No fee records found for your account.</p>
        ) : (
          initialFees.map((fee) => (
            <Card key={fee.id} className={`border-0 shadow-lg overflow-hidden ${fee.status === 'PAID' ? 'bg-emerald-50/30' : ''}`}>
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                         <div className={`p-2 rounded-lg ${fee.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            <Banknote className="h-5 w-5" />
                         </div>
                         <Badge 
                            variant={fee.status === 'PAID' ? 'default' : 'destructive'}
                            className={`${fee.status === 'PAID' ? 'bg-emerald-500' : 'bg-red-500'} text-white border-0`}
                         >
                            {fee.status}
                         </Badge>
                    </div>
                    <CardTitle className="text-xl">{fee.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Due by {format(new Date(fee.dueDate), "PPP")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black">₹{fee.amount.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground font-medium">inclusive of taxes</span>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 p-6 flex justify-between items-center">
                    {fee.status === 'PAID' ? (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                            <CheckCircle2 className="h-4 w-4" /> Paid on {format(new Date(fee.paidAt), "MMM dd, yyyy")}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase">
                                <AlertCircle className="h-3.5 w-3.5" /> Action Required
                            </div>
                            <Button 
                                onClick={() => handlePay(fee.id)}
                                disabled={isPending}
                                className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 shadow-xl shadow-slate-900/10"
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                                Pay Now
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>
          ))
        )}
      </div>

      <div className="p-8 bg-blue-600 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-500/20">
         <div className="space-y-2">
            <h3 className="text-2xl font-bold">Financial Scholarship Support</h3>
            <p className="text-blue-100 text-sm max-w-md">Need assistance? Our financial aid office is here to help with installments and scholarships.</p>
         </div>
         <Button variant="secondary" className="h-12 px-8 font-bold">
            Contact Support <ArrowRight className="ml-2 h-4 w-4" />
         </Button>
      </div>
    </div>
  );
}
