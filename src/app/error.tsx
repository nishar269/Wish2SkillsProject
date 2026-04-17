'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for tracking
    console.error("Application Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800 font-sans selection:bg-blue-100">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 max-w-lg w-full p-10 text-center space-y-8">
        
        {/* Icon Header */}
        <div className="flex justify-center">
            <div className="p-4 bg-orange-50 rounded-full">
               <AlertCircle className="h-10 w-10 text-orange-400" />
            </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Oops! Something went wrong
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed px-4">
            We encountered an unexpected issue while loading this page. 
            Do not worry, our team has been notified.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button 
            onClick={() => reset()}
            className="w-full sm:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button 
            asChild
            variant="outline"
            className="w-full sm:w-auto h-12 px-8 rounded-xl font-semibold text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
        </div>

        {/* Error Trace (Optional for developers) */}
        {error.digest && (
          <div className="pt-6 mt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-medium">Error Code: {error.digest}</p>
          </div>
        )}
      </div>
    </div>
  );
}
