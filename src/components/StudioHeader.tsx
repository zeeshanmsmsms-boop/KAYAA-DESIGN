import React from 'react';
import { KayaaLogo } from './KayaaLogo';
import { Sparkles, ArrowUpRight } from 'lucide-react';

export function StudioHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-ink/80 backdrop-blur-md">
      <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <KayaaLogo className="scale-75 origin-left" />
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-[10px] uppercase tracking-[3px] text-gold font-bold">Studio</span>
            <span className="text-[10px] uppercase tracking-[3px] text-white/40 font-medium hover:text-white transition-colors cursor-pointer">Archive</span>
            <span className="text-[10px] uppercase tracking-[3px] text-white/40 font-medium hover:text-white transition-colors cursor-pointer">Settings</span>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-gold/10 border border-gold/20 rounded-full flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-gold" />
            <span className="text-[9px] uppercase tracking-[2px] text-gold font-bold">8K Ultra Engine</span>
          </div>
          <button className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] font-bold text-white/60 hover:text-white transition-colors">
            Support <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
}
