/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Delete, RotateCcw, Volume2, VolumeX, History, Sparkles, AlertCircle, Cpu, Wifi } from 'lucide-react';
import { CalculationHistoryItem } from '../types';
import { evaluateExpression } from '../utils/calcEvaluator';

interface CalculatorProps {
  onCalculate: (result: string) => void;
  onOpenHistory: () => void;
  history: CalculationHistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<CalculationHistoryItem[]>>;
  importedValue?: string | null;
  clearImportedValue?: () => void;
}

export default function Calculator({
  onCalculate,
  onOpenHistory,
  history,
  setHistory,
  importedValue,
  clearImportedValue,
}: CalculatorProps) {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Custom audio synthesizer for clicks (pure JS Web Audio API, guarantees audio plays with zero external resources)
  const playBeep = (freq: number, type: OscillatorType = 'sine', duration: number = 0.08) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio API not supported or user gesture needed', e);
    }
  };

  // Clock simulator for high status bar accuracy
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Listen for imported value clicks from history drawer
  useEffect(() => {
    if (importedValue) {
      setDisplayValue(importedValue);
      setExpression(importedValue);
      setHasCalculated(false);
      if (clearImportedValue) clearImportedValue();
      playBeep(650, 'triangle', 0.15);
    }
  }, [importedValue]);

  // Handle all inputs
  const handleDigit = (digit: string) => {
    playBeep(440, 'sine', 0.05);
    
    if (hasCalculated) {
      setDisplayValue(digit);
      setExpression(digit);
      setHasCalculated(false);
      return;
    }

    if (displayValue === '0' && digit !== '.') {
      setDisplayValue(digit);
      setExpression(expression === '0' ? digit : expression + digit);
    } else {
      // Prevent consecutive dots
      if (digit === '.' && displayValue.includes('.')) return;
      setDisplayValue(displayValue + digit);
      setExpression(expression + digit);
    }
  };

  const handleOperator = (op: string) => {
    playBeep(520, 'sine', 0.06);

    if (expression === '' && displayValue !== '0') {
      // Continue from last calculated value
      setExpression(displayValue + ' ' + op + ' ');
      setDisplayValue('0');
      setHasCalculated(false);
      return;
    }

    if (hasCalculated) {
      setExpression(displayValue + ' ' + op + ' ');
      setDisplayValue('0');
      setHasCalculated(false);
      return;
    }

    // If last token is already an operator, replace it
    const lastChar = expression.trim().slice(-1);
    const operators = ['+', '-', '×', '÷'];
    
    if (operators.includes(lastChar)) {
      const trimmedExpression = expression.trim().slice(0, -1);
      setExpression(trimmedExpression + op + ' ');
    } else {
      setExpression(expression + ' ' + op + ' ');
    }
    
    setDisplayValue('0');
  };

  const handleClear = () => {
    playBeep(330, 'triangle', 0.1);
    setDisplayValue('0');
    setExpression('');
    setHasCalculated(false);
  };

  const handleBackspace = () => {
    playBeep(380, 'sine', 0.05);
    
    if (hasCalculated) {
      handleClear();
      return;
    }

    // If expr ends with operator (has spaces around it)
    const trimmed = expression.trim();
    const lastChar = trimmed.slice(-1);
    const operators = ['+', '-', '×', '÷'];

    if (operators.includes(lastChar)) {
      // Remove the operator slot safely
      const updated = trimmed.slice(0, -1).trim();
      setExpression(updated);
      
      // Determine the last numerical chunk to populate the actual displayValue
      const parts = updated.split(/[\s+\-×÷]+/);
      const lastChunk = parts[parts.length - 1] || '0';
      setDisplayValue(lastChunk);
    } else {
      // Standard character deletion
      if (displayValue.length > 1) {
        setDisplayValue(displayValue.slice(0, -1));
        setExpression(expression.slice(0, -1));
      } else {
        setDisplayValue('0');
        // If expr had chars, trim last
        if (expression.length > 1) {
          setExpression(expression.slice(0, -1));
        } else {
          setExpression('');
        }
      }
    }
  };

  const handleCalculate = () => {
    if (!expression || hasCalculated) return;

    // Remove any trailing operator before calculation
    let exprToCalc = expression.trim();
    const lastChar = exprToCalc.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      exprToCalc = exprToCalc.slice(0, -1).trim();
    }

    if (!exprToCalc) return;

    playBeep(880, 'sine', 0.12);
    
    // We do NOT compute the result here, display still shows the equation or expression,
    // and we immediately trigger the parent callback with the formula to be processed.
    onCalculate(exprToCalc);
  };

  // Keyboard binding support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      // If user typing in modal/inputs skip bindings
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDigit('.');
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('-');
      } else if (e.key === '*' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, displayValue, hasCalculated]);

  return (
    <div className="relative w-full h-[100dvh] md:h-[720px] md:max-w-[360px] rounded-none md:rounded-[42px] md:border-4 md:border-neutral-850 bg-neutral-950 shadow-2xl overflow-hidden flex flex-col glass-panel" id="smartphone-container">
      {/* Decorative Anime Status Lines and Bezel elements */}
      <div className="absolute top-0 inset-x-0 h-6 bg-transparent flex items-center justify-between px-6 z-20 text-[10px] uppercase font-mono tracking-wider text-rose-500/50">
        <div className="flex items-center gap-1.5 leading-none">
          <Cpu size={10} className="text-rose-500/70" />
          <span>SYS_v4.5</span>
        </div>
        {/* Notch container */}
        <div className="w-24 h-4 bg-neutral-950 border border-t-0 border-neutral-900 rounded-b-xl flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-rose-500/20 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wifi size={10} className="text-teal-400" />
          <span>{currentTime || '20:52'}</span>
        </div>
      </div>

      {/* Internal Grid Scanlines common in classic science fiction anime UIs */}
      <div className="absolute inset-0 anime-grid-bg opacity-30 pointer-events-none z-0" />
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/10 to-transparent top-1/4 animate-scanline pointer-events-none z-10" />

      {/* Top Accessory bar featuring sound, statistics & history drawer click */}
      <div className="h-14 lg:h-12 flex items-center justify-between px-6 mt-6 z-10 shrink-0 select-none">
        <span className="font-mono text-[9px] text-teal-400 tracking-[0.2em]">CALC.PREMIUM_SYS</span>
        
        <div className="flex items-center gap-2.5">
          {/* Audio Beep Switch */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playBeep(650, 'sine', 0.05);
            }}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-teal-500/5 border-teal-500/20 text-teal-400'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
            } hover:scale-105 cursor-pointer`}
            title="Toggle som"
            id="btn-toggle-sound"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* History Drawer Toggle */}
          <button
            onClick={() => {
              playBeep(450, 'sine', 0.05);
              onOpenHistory();
            }}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition relative cursor-pointer"
            title="Ver histórico"
            id="btn-open-history-top"
          >
            <History size={13} />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* CALCULATOR DISPLAY MODULE */}
      <div className="flex-1 flex flex-col justify-end px-6 py-4 relative z-10 border-b border-neutral-900/60 min-h-[140px]" id="calc-display-section">
        {/* Grid Background panel decoration */}
        <div className="absolute inset-0 anime-grid-fine opacity-20 pointer-events-none" />

        {/* Previous operation details / Expression */}
        <div className="h-10 text-right overflow-x-auto no-scrollbar scroll-smooth flex items-end justify-end select-all">
          <motion.span
            key={expression}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-sm text-neutral-500 tracking-wide whitespace-nowrap leading-none"
            id="expr-text-history"
          >
            {expression || ' '}
          </motion.span>
        </div>

        {/* Highlighted Results */}
        <div className="h-18 mt-1.5 flex items-center justify-end overflow-x-auto no-scrollbar select-all">
          <motion.span
            key={displayValue}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={`font-display font-medium text-4xl tracking-tight text-right w-full block whitespace-nowrap leading-none ${
              displayValue === 'Erro' || displayValue === 'Divisão por zero'
                ? 'text-rose-500 font-mono text-xl animate-pulse'
                : 'text-neutral-100'
            }`}
            id="result-text-value"
          >
            {displayValue}
          </motion.span>
        </div>

        {/* Operational Status indicators at base of display */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-900/40 text-[9px] font-mono text-neutral-600 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>ESTÁVEL</span>
          </div>
          <span>DEG</span>
          <span>MEM: 0.0B</span>
        </div>
      </div>

      {/* KEYPAD CONTAINER (Smartphone layout) */}
      <div className="p-5 grid grid-cols-4 gap-3 z-10 select-none bg-neutral-950/60 shrink-0" id="calculator-keypad">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="h-14 rounded-2xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 font-display font-bold text-sm tracking-widest transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center shadow-inner"
          id="btn-key-ac"
        >
          AC
        </button>
        <button
          onClick={handleBackspace}
          className="h-14 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 font-display transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-backspace"
          aria-label="Delete last"
        >
          <Delete size={16} />
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="h-14 rounded-2xl bg-neutral-900 hover:bg-teal-400 hover:text-black border border-neutral-800/80 text-teal-400 font-display font-medium text-lg transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-divide"
        >
          ÷
        </button>
        <button
          onClick={() => handleOperator('×')}
          className="h-14 rounded-2xl bg-neutral-900 hover:bg-teal-400 hover:text-black border border-neutral-800/80 text-teal-400 font-display font-medium text-lg transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-multiply"
        >
          ×
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleDigit('7')}
          className="h-14 rounded-2xl bg-neutral-900/40 hover:bg-neutral-850 border border-neutral-850 text-neutral-200 font-display text-lg tracking-wide transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-7"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="h-14 rounded-2xl bg-neutral-900/40 hover:bg-neutral-850 border border-neutral-850 text-neutral-200 font-display text-lg tracking-wide transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-8"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="h-14 rounded-2xl bg-neutral-900/40 hover:bg-neutral-850 border border-neutral-850 text-neutral-200 font-display text-lg tracking-wide transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-9"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('-')}
          className="h-14 rounded-2xl bg-neutral-900 hover:bg-teal-400 hover:text-black border border-neutral-800/80 text-teal-400 font-display font-medium text-xl transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-subtract"
        >
          -
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleDigit('4')}
          className="h-14 rounded-2xl bg-neutral-900/40 hover:bg-neutral-850 border border-neutral-850 text-neutral-200 font-display text-lg tracking-wide transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-4"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="h-14 rounded-2xl bg-neutral-900/40 hover:bg-neutral-850 border border-neutral-850 text-neutral-200 font-display text-lg tracking-wide transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-5"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="h-14 rounded-2xl bg-neutral-900/40 hover:bg-neutral-850 border border-neutral-850 text-neutral-200 font-display text-lg tracking-wide transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-6"
        >
          6
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="h-14 rounded-2xl bg-neutral-900 hover:bg-teal-400 hover:text-black border border-neutral-800/80 text-teal-400 font-display font-medium text-lg transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-plus"
        >
          +
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleDigit('1')}
          className="h-14 rounded-2xl bg-neutral-900/40 hover:bg-neutral-850 border border-neutral-850 text-neutral-200 font-display text-lg tracking-wide transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-1"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="h-14 rounded-2xl bg-neutral-900/40 hover:bg-neutral-850 border border-neutral-850 text-neutral-200 font-display text-lg tracking-wide transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-2"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="h-14 rounded-2xl bg-neutral-900/40 hover:bg-neutral-850 border border-neutral-850 text-neutral-200 font-display text-lg tracking-wide transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-3"
        >
          3
        </button>

        {/* Equals (=) double-height button container */}
        <button
          onClick={handleCalculate}
          className="h-29 rounded-2xl bg-gradient-to-b from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 border border-rose-450 text-white font-display text-2xl transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center row-span-2 shadow-lg shadow-rose-950/20"
          id="btn-key-equals"
        >
          =
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleDigit('0')}
          className="h-14 rounded-2xl bg-neutral-900/40 hover:bg-neutral-850 border border-neutral-850 text-neutral-200 font-display text-lg transition-all duration-150 active:scale-95 cursor-pointer col-span-2 flex items-center justify-center"
          id="btn-key-0"
        >
          0
        </button>
        <button
          onClick={() => handleDigit('.')}
          className="h-14 rounded-2xl bg-neutral-900/40 hover:bg-neutral-850 border border-neutral-850 text-neutral-200 font-display font-medium text-lg transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          id="btn-key-dot"
        >
          .
        </button>
      </div>

      {/* Touch Bar Home Indicator common on modern smartphones */}
      <div className="absolute bottom-1 px-4 inset-x-0 h-4 flex items-center justify-center z-10 pointer-events-none select-none">
        <div className="w-28 h-1 bg-white/20 rounded-full" />
      </div>
    </div>
  );
}
