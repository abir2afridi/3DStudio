import React from "react";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-glass-panel border border-foreground/10 rounded-2xl shadow-2xl p-8 text-center animate-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertCircle className="h-10 w-10 text-destructive animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-foreground mb-3 tracking-tight italic uppercase">404 - LOST IN SPACE</h1>
        
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          The dimension you are looking for does not exist in this studio. 
          Return to base to continue your 3D journey.
        </p>

        <Link href="/">
          <button className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20">
            <Home size={18} /> BACK TO STUDIO
          </button>
        </Link>
      </div>
    </div>
  );
}

