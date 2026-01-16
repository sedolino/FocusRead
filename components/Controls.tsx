
import React from 'react';
import { SpeedWPM } from '../types';

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: SpeedWPM;
  onSetSpeed: (speed: SpeedWPM) => void;
  onReset: () => void;
  progress: number;
}

const Controls: React.FC<ControlsProps> = ({ 
  isPlaying, 
  onTogglePlay, 
  speed, 
  onSetSpeed, 
  onReset,
  progress 
}) => {
  const speeds: SpeedWPM[] = [300, 500, 700, 900];

  return (
    <div className="w-full space-y-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
      {/* Progress Bar */}
      <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-rose-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Playback */}
        <div className="flex items-center gap-4">
          <button
            onClick={onTogglePlay}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isPlaying 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-900/20' 
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {isPlaying ? (
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-6 h-6 fill-white ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          
          <button
            onClick={onReset}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium uppercase tracking-wider"
          >
            Reset
          </button>
        </div>

        {/* Speed Selection */}
        <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                speed === s 
                  ? 'bg-slate-100 text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s} <span className="text-[10px] opacity-70">WPM</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Controls;
