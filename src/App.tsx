import React, { useState } from 'react';
import { StudioHeader } from './components/StudioHeader';
import { Workspace } from './components/Workspace';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ChevronDown } from 'lucide-react';
import { KayaaLogo } from './components/KayaaLogo';

export default function App() {
  const [showStudio, setShowStudio] = useState(false);

  return (
    <main className="min-h-screen bg-ink text-white selection:bg-gold selection:text-ink">
      <AnimatePresence mode="wait">
        {!showStudio ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="h-screen w-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
          >
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 space-y-12 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <KayaaLogo className="mb-8" />
              </motion.div>

              <div className="space-y-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-6xl md:text-8xl font-serif leading-[1.1] tracking-tight"
                >
                  The Digital <br /> 
                  <span className="italic font-normal">Diamond Atelier</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-[12px] uppercase tracking-[8px] text-white/40 font-bold max-w-lg mx-auto leading-loose"
                >
                  Elevating raw captures into world-class <br /> 8K marketing assets through Gemini AI.
                </motion.p>
              </div>

              <motion.button 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={() => setShowStudio(true)}
                className="group relative px-12 py-5 bg-gold text-ink rounded-full text-[12px] font-black uppercase tracking-[4px] hover:scale-105 active:scale-95 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Enter The Studio <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
              </motion.button>
            </div>

            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1.2 }}
               className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-20"
            >
              <span className="text-[9px] uppercase tracking-[4px] font-bold">Scroll to Explore</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="studio"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <StudioHeader />
            <Workspace />
            
            {/* Footer */}
            <footer className="max-w-[1800px] mx-auto px-12 py-12 border-t border-white/5 mt-20 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
              <div className="flex items-center gap-8">
                <KayaaLogo className="scale-50 origin-left" />
                <p className="text-[10px] uppercase tracking-[3px] font-black font-mono">EST. 2024 / ATELIER SYSTEM 4.0</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[8px] uppercase tracking-[2px] font-bold">Privacy</span>
                <span className="text-[8px] uppercase tracking-[2px] font-bold">Terms</span>
                <span className="text-[8px] uppercase tracking-[2px] font-bold">API Status</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
