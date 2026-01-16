
import React from 'react';
import { WordInfo } from '../types';

interface ReaderProps {
  word: WordInfo | null;
  isPlaying?: boolean;
}

const Reader: React.FC<ReaderProps> = ({ word, isPlaying }) => {
  if (!word) {
    return (
      <div className="flex items-center justify-center h-64 w-full border-y border-slate-800 bg-slate-950/50 rounded-xl transition-all duration-500">
        <span className="text-slate-600 italic font-medium tracking-wide">Select text or upload a book to begin...</span>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center justify-center h-80 w-full border-y transition-all duration-500 bg-[#0a0f1d] overflow-hidden rounded-2xl ${isPlaying ? 'border-rose-500/50 shadow-2xl' : 'border-slate-800 shadow-xl'}`}>
      {/* Central Guide Line */}
      <div className={`absolute top-0 bottom-0 left-1/2 w-[1px] transition-colors duration-500 pointer-events-none -translate-x-1/2 ${isPlaying ? 'bg-rose-500/40' : 'bg-rose-500/20'}`}>
        {/* Top Marker */}
        <div className={`absolute top-12 left-1/2 -translate-x-1/2 w-5 h-[2px] transition-all duration-500 ${isPlaying ? 'bg-rose-500 scale-x-125' : 'bg-rose-500/40'}`}></div>
        {/* Bottom Marker */}
        <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 w-5 h-[2px] transition-all duration-500 ${isPlaying ? 'bg-rose-500 scale-x-125' : 'bg-rose-500/40'}`}></div>
      </div>

      <div className="relative z-10 flex items-baseline justify-center w-full text-6xl md:text-8xl mono font-bold tracking-tight select-none">
        {/* Left Side: Right-aligned relative to the pivot */}
        <div className={`flex-1 text-right transition-opacity duration-500 pr-[0.05em] ${isPlaying ? 'text-slate-100 opacity-100' : 'text-slate-400 opacity-80'}`}>
          {word.prefix}
        </div>
        
        {/* Pivot Letter: Exactly centered on the vertical line */}
        <div className="text-rose-500 flex-none text-center min-w-[0.6em] relative">
          <span className="relative z-10">{word.pivot}</span>
          {/* Subtle glow for the pivot */}
          <div className={`absolute inset-0 bg-rose-500/10 blur-2xl rounded-full transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
        
        {/* Right Side: Left-aligned relative to the pivot */}
        <div className={`flex-1 text-left transition-opacity duration-500 pl-[0.05em] ${isPlaying ? 'text-slate-100 opacity-100' : 'text-slate-400 opacity-80'}`}>
          {word.suffix}
        </div>
      </div>

      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-500 ${isPlaying ? 'text-rose-500/60 blur-[1px] opacity-40' : 'text-slate-600'}`}>
        Focus on the red character
      </div>
    </div>
  );
};

export default Reader;
