
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Reader from './components/Reader';
import Controls from './components/Controls';
import { WordInfo, SpeedWPM } from './types';
import { refineTextForSpeedReading, summarizeText } from './services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

const DEFAULT_TEXT = "Speed reading is a set of techniques intended to improve a person's ability to read quickly. Rapid Serial Visual Presentation (RSVP) is one such method. It involves displaying words in a single location at a fixed speed, which eliminates the time spent on eye movements between words. By focusing on a single point and highlighting the 'pivot' letter of each word, readers can significantly increase their words-per-minute rate while maintaining or even improving comprehension. This application allows you to practice this skill with varying speeds and AI-powered text refinement.";

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

  // Helper to split word into RSVP parts based on Optimal Recognition Point (ORP)
  const processWord = (word: string): WordInfo => {
    if (!word) return { text: '', prefix: '', pivot: '', suffix: '' };
    
    const length = word.length;
    let pivotIndex = 0;
    
    // Standard RSVP pivot logic for Optimal Recognition Point
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

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleSpeedChange = (newSpeed: SpeedWPM) => {
    setSpeed(newSpeed);
  };

  const handleAiRefine = async () => {
    setIsProcessing(true);
    setStatusMessage("AI is refining your text...");
    const refined = await refineTextForSpeedReading(inputText);
    setInputText(refined);
    prepareWords(refined);
    setIsProcessing(false);
    setStatusMessage(null);
  };

  const handleAiSummarize = async () => {
    setIsProcessing(true);
    setStatusMessage("AI is summarizing your text...");
    const summarized = await summarizeText(inputText);
    setInputText(summarized);
    prepareWords(summarized);
    setIsProcessing(false);
    setStatusMessage(null);
  };

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
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + " ";
          
          if (i % 10 === 0 || i === pdf.numPages) {
            setStatusMessage(`Extracted ${i} of ${pdf.numPages} pages...`);
          }
        }

        const cleanedText = fullText.replace(/\s+/g, ' ').trim();
        setInputText(cleanedText);
        prepareWords(cleanedText);
        setIsProcessing(false);
        setStatusMessage(null);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("PDF Parsing Error:", error);
      setStatusMessage("Error reading PDF. Please try another file.");
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  useEffect(() => {
    if (isPlaying && currentIndex < words.length) {
      const msPerWord = 60000 / speed;
      
      const currentWordText = words[currentIndex].text;
      let delay = msPerWord;
      
      // Delay adjustments for punctuation to help cognitive processing
      if (currentWordText.endsWith('.') || currentWordText.endsWith('!') || currentWordText.endsWith('?')) {
        delay *= 2.2;
      } else if (currentWordText.endsWith(',') || currentWordText.endsWith(';') || currentWordText.endsWith(':')) {
        delay *= 1.6;
      }

      timerRef.current = window.setTimeout(() => {
        setCurrentIndex(prev => {
          if (prev + 1 >= words.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, words, speed]);

  const progress = words.length > 0 ? (currentIndex / (words.length - 1)) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#050912] text-slate-200 p-4 md:p-8">
      <header className="w-full max-w-5xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center justify-center md:justify-start gap-3">
            <span className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center text-lg font-black shadow-lg shadow-rose-900/20">F</span>
            FocusRead <span className="text-rose-500 font-light">RSVP</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-semibold opacity-60">High-Performance Cognitive Reading</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
           <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePdfUpload} 
            accept="application/pdf" 
            className="hidden" 
          />
          <button 
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-white text-slate-950 disabled:opacity-50 rounded-xl text-xs font-bold transition-all shadow-xl active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            UPLOAD PDF
          </button>
           <button 
            disabled={isProcessing}
            onClick={handleAiRefine}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl text-xs font-bold border border-slate-700 transition-all text-rose-400 active:scale-95"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            REFINE
          </button>
          <button 
            disabled={isProcessing}
            onClick={handleAiSummarize}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl text-xs font-bold border border-slate-700 transition-all text-emerald-400 active:scale-95"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
            SUMMARIZE
          </button>
        </div>
      </header>

      {statusMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-rose-600 text-white rounded-2xl text-sm font-bold shadow-[0_20px_50px_rgba(225,29,72,0.4)] animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-4 border border-rose-400/30">
          <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
          {statusMessage}
        </div>
      )}

      <main className="w-full max-w-5xl flex flex-col gap-10">
        <Reader word={words[currentIndex] || null} />
        
        <Controls 
          isPlaying={isPlaying}
          onTogglePlay={handlePlayPause}
          speed={speed}
          onSetSpeed={handleSpeedChange}
          onReset={handleReset}
          progress={progress}
        />

        <section className="mt-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Reading Queue</h2>
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-slate-500 font-mono bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {currentIndex + 1} OF {words.length} WORDS
              </span>
            </div>
          </div>
          <div className="relative group">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste text or drop a book here..."
              className="w-full h-40 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500/30 focus:border-rose-500/30 transition-all resize-none shadow-inner text-sm leading-relaxed scrollbar-hide"
            />
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
               <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Edit content to reload queue</span>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 text-sm text-slate-500 mb-12">
           <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800/40 hover:border-rose-500/20 transition-all group">
              <h3 className="text-slate-400 font-bold mb-2 uppercase tracking-tighter text-xs flex items-center gap-2 group-hover:text-rose-500">
                <div className="w-2 h-2 rounded-sm bg-rose-600"></div>
                ORP Alignment
              </h3>
              <p className="text-slate-500 leading-relaxed">The Optimal Recognition Point (ORP) is usually slightly to the left of the center. Our engine aligns every word to this axis to maximize cognitive processing.</p>
           </div>
           <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800/40 hover:border-emerald-500/20 transition-all group">
              <h3 className="text-slate-400 font-bold mb-2 uppercase tracking-tighter text-xs flex items-center gap-2 group-hover:text-emerald-500">
                <div className="w-2 h-2 rounded-sm bg-emerald-600"></div>
                Eliminate Regression
              </h3>
              <p className="text-slate-500 leading-relaxed">By preventing your eyes from scanning back over text (regression), RSVP forces focus and builds reading stamina at unprecedented rates.</p>
           </div>
           <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800/40 hover:border-blue-500/20 transition-all group">
              <h3 className="text-slate-400 font-bold mb-2 uppercase tracking-tighter text-xs flex items-center gap-2 group-hover:text-blue-500">
                <div className="w-2 h-2 rounded-sm bg-blue-600"></div>
                Large Content
              </h3>
              <p className="text-slate-500 leading-relaxed">The PDF parser extracts thousands of pages in seconds. Perfect for technical manuals, research papers, and full-length novels.</p>
           </div>
        </section>
      </main>

      <footer className="mt-auto text-slate-700 text-[10px] uppercase tracking-[0.4em] py-8 border-t border-slate-900/50 w-full text-center">
        FocusRead RSVP Engine &bull; System Active &bull; Low Latency
      </footer>
    </div>
  );
};

export default App;
