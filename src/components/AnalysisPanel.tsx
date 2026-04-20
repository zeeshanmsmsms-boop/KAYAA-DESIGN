import React from 'react';
import { motion } from 'motion/react';
import { Diamond, ShieldCheck, Sparkles, Gem } from 'lucide-react';
import { JewelryDetails } from '../types';

interface AnalysisPanelProps {
  details: JewelryDetails;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ details }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="stats-panel mt-10 border-t border-[#222] pt-8"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center text-[12px] text-text-muted">
          <span>Engine</span>
          <span className="stat-val">Gemini 3.1 Suite</span>
        </div>
        
        <div className="flex justify-between items-center text-[12px] text-text-muted">
          <span>Render Target</span>
          <span className="stat-val">8K Ultra-High Fidelity</span>
        </div>

        <div className="flex justify-between items-center text-[12px] text-text-muted">
          <span>Metal Base</span>
          <span className="stat-val">{details.metal}</span>
        </div>

        <div className="flex justify-between items-center text-[12px] text-text-muted">
          <span>Stones</span>
          <span className="stat-val">{details.stones.join(', ')}</span>
        </div>

        <div className="flex justify-between items-center text-[12px] text-text-muted">
          <span>Style</span>
          <span className="stat-val">{details.style}</span>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-[10px] text-text-muted uppercase tracking-[2px] mb-2 font-semibold">Artist Notes</p>
        <p className="text-[11px] text-[#aaa] italic leading-relaxed">
          "{details.description}"
        </p>
      </div>
    </motion.div>
  );
};
