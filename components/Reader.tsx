
import React from 'react';
import { WordInfo } from '../types';

interface ReaderProps {
  word: WordInfo | null;
}

const Reader: React.FC<ReaderProps> = ({ word }) => {
  if (!word) {
    return (
      <div className="flex items-center justify-center h-64 w-full border-y border-slate-800 bg-slate-950/50 rounded-xl">
        <span className="text-slate-600 italic font-medium tracking-wide">Select text or upload a book to begin...</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-80 w-full border-y border-slate-800 bg-[#0a0f1d] overflow-hidden shadow-2xl">
      {/* Central Guide Line */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-rose-500/30 pointer-events-none -translate-x-1/2">
        {/* Top Marker */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-rose-500/60"></div>
        {/* Bottom Marker */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-rose-500/60"></div>
      </div>

      <div className="relative z-10 flex items-baseline justify-center w-full text-6xl md:text-8xl mono font-bold tracking-tight select-none">
        {/* Left Side: Right-aligned relative to the pivot */}
        <div className="flex-1 text-right text-slate-300 opacity-90 pr-[0.05em]">
          {word.prefix}
        </div>
        
        {/* Pivot Letter: Exactly centered on the vertical line */}
        <div className="text-rose-500 flex-none text-center min-w-[0.6em] relative">
          <span className="relative z-10">{word.pivot}</span>
          {/* Subtle glow for the pivot */}
          <div className="absolute inset-0 bg-rose-500/5 blur-xl rounded-full"></div>
        </div>
        
        {/* Right Side: Left-aligned relative to the pivot */}
        <div className="flex-1 text-left text-slate-300 opacity-90 pl-[0.05em]">
          {word.suffix}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold">
        Focus on the red character
      </div>
    </div>
  );
};

export default Reader;
