
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Reader from './components/Reader';
import Controls from './components/Controls';
import { WordInfo, SpeedWPM } from './types';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

const DEFAULT_TEXT = "Speed reading is a set of techniques intended to improve a person's ability to read quickly. Rapid Serial Visual Presentation (RSVP) is one such method. It involves displaying words in a single location at a fixed speed, which eliminates the time spent on eye movements between words. By focusing on a single point and highlighting the 'pivot' letter of each word, readers can significantly increase their words-per-minute rate while maintaining or even improving comprehension. This application allows you to practice this skill with varying speeds by uploading your own PDFs or pasting text below.";

const App: React.FC = () => {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [words, setWords] = useState<WordInfo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<SpeedWPM>(300);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processWord = (word: string): WordInfo => {
    if (!word) return { text: '', prefix: '', pivot: '', suffix: '' };
    const length = word.length;
    let pivotIndex = 0;
    
    // Optimal Recognition Point (ORP) logic
    if (length === 1) pivotIndex = 0;
    else if (length <= 5) pivotIndex = 1;
    else if (length <= 9) pivotIndex = 2;
    else if (length <= 13) pivotIndex = 3;
    else pivotIndex = 4;

    return {
      text: word,
      prefix: word.substring(0, pivotIndex),
      pivot: word.substring(pivotIndex, pivotIndex + 1),
      suffix: word.substring(pivotIndex + 1)
    };
  };

  const prepareWords = useCallback((text: string) => {
    const splitWords = text.trim().split(/\s+/);
    const processed = splitWords.map(processWord);
    setWords(processed);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    prepareWords(inputText);
  }, [prepareWords]);

  const handlePlayPause = () => setIsPlaying(prev => !prev);
  const handleReset = () => { setIsPlaying(false); setCurrentIndex(0); };
  const handleSpeedChange = (newSpeed: SpeedWPM) => setSpeed(newSpeed);

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setStatusMessage(`Extracting text from ${file.name}...`);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(" ") + " ";
        }
        const cleanedText = fullText.replace(/\s+/g, ' ').trim();
        setInputText(cleanedText);
        prepareWords(cleanedText);
        setIsProcessing(false);
        setStatusMessage(null);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("PDF extraction error:", error);
      setStatusMessage("Error reading PDF.");
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  useEffect(() => {
    if (isPlaying && currentIndex < words.length) {
      const msPerWord = 60000 / speed;
      const currentWordText = words[currentIndex].text;
      let delay = msPerWord;
      
      // Punctuation pauses for better comprehension
      if (/[.!?]$/.test(currentWordText)) delay *= 2.2;
      else if (/[,;:]$/.test(currentWordText)) delay *= 1.6;

      timerRef.current = window.setTimeout(() => {
        setCurrentIndex(prev => (prev + 1 >= words.length ? (setIsPlaying(false), prev) : prev + 1));
      }, delay);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentIndex, words, speed]);

  const progress = words.length > 0 ? (currentIndex / (words.length - 1)) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#050912] text-slate-200 p-4 md:p-8 transition-colors duration-700">
      <header className={`w-full max-w-5xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-700 ${isPlaying ? 'opacity-10 blur-sm translate-y-[-20px] pointer-events-none' : 'opacity-100'}`}>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center justify-center md:justify-start gap-3">
            <span className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center text-lg font-black shadow-lg shadow-rose-900/20">F</span>
            FocusRead <span className="text-rose-500 font-light">RSVP</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-semibold opacity-60">High-Performance Cognitive Reading</p>
        </div>

        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handlePdfUpload} accept="application/pdf" className="hidden" />
          <button 
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()} 
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-white text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            UPLOAD PDF
          </button>
        </div>
      </header>

      {statusMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-rose-600 text-white rounded-2xl text-sm font-bold shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-4 border border-rose-400/30">
          <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
          {statusMessage}
        </div>
      )}

      <main className="w-full max-w-5xl flex flex-col gap-10">
        <div className={`transition-all duration-500 ${isPlaying ? 'scale-[1.02] shadow-[0_0_80px_-20px_rgba(244,63,94,0.3)]' : ''}`}>
          <Reader word={words[currentIndex] || null} isPlaying={isPlaying} />
        </div>
        
        <div className={`transition-all duration-700 ${isPlaying ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}>
          <Controls 
            isPlaying={isPlaying} 
            onTogglePlay={handlePlayPause} 
            speed={speed} 
            onSetSpeed={handleSpeedChange} 
            onReset={handleReset} 
            progress={progress} 
          />
        </div>

        <section className={`mt-4 space-y-4 transition-all duration-700 ${isPlaying ? 'opacity-5 blur-md translate-y-[20px] pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Reading Queue</h2>
            <span className="text-[11px] text-slate-500 font-mono bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {currentIndex + 1} OF {words.length} WORDS
            </span>
          </div>
          <textarea 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            placeholder="Paste text or drop a book here..." 
            className="w-full h-40 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500/30 transition-all resize-none shadow-inner text-sm leading-relaxed" 
          />
        </section>
      </main>
      
      <footer className={`mt-auto text-slate-700 text-[10px] uppercase tracking-[0.4em] py-8 border-t border-slate-900/50 w-full text-center transition-opacity duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
        FocusRead RSVP Engine &bull; System Active &bull; Offline Ready
      </footer>
    </div>
  );
};

export default App;
