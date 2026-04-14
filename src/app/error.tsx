'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ChevronLeft } from "lucide-react";
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("STABILITY_BREACH:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center space-y-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-5 bg-red-500/10 rounded-3xl border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Node Stability Breach Detected</p>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            Stream<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
              Interrupted
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed px-10">
            The data stream between your terminal and the CampusOS Mainnet has lost synchronization.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Button 
            onClick={() => reset()}
            className="h-14 px-10 bg-white text-slate-950 hover:bg-cyan-400 rounded-2xl font-black italic uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 flex items-center gap-3"
          >
            <RefreshCw className="h-4 w-4" />
            Attempt Resync
          </Button>
          <Button 
            asChild
            variant="ghost"
            className="h-14 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl"
          >
            <Link href="/">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Reset Terminal
            </Link>
          </Button>
        </div>

        <div className="pt-10">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl inline-block">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Error Digest</p>
                <p className="text-[10px] font-mono text-cyan-500/70 lowercase mt-1">{error.digest || 'unknown_node_failure'}</p>
            </div>
        </div>
      </div>
    </div>
  );
}
