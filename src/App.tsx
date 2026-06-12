/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Coffee, Landmark, HelpCircle, Smartphone, Info, Terminal, RefreshCw, MessageSquare } from 'lucide-react';
import { CalculationHistoryItem } from './types';
import Calculator from './components/Calculator';
import ModalPlans from './components/ModalPlans';
import HistoryPanel from './components/HistoryPanel';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [lastResult, setLastResult] = useState<string>('0');
  const [pendingExpression, setPendingExpression] = useState<string>('');
  const [importedValue, setImportedValue] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Trigger modal on user clicking the calculate button "="
  const handleCalculationComplete = (formula: string) => {
    setPendingExpression(formula);
    setIsModalOpen(true);
  };

  const handleUnlockResult = (result: string, formula: string) => {
    setLastResult(result);
    
    // Create new item for history and update list state
    const newItem: CalculationHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      formula: formula,
      result: result,
      timestamp: new Date(),
    };
    setHistory((prev) => [newItem, ...prev]);

    // Feed the unlocked result into the calculator screen
    setImportedValue(result);
  };

  const handleSelectItem = (val: string) => {
    setImportedValue(val);
    setIsHistoryOpen(false);
  };

  const handleCopyItem = (val: string) => {
    try {
      navigator.clipboard.writeText(val);
      setFeedbackMessage('Resultado copiado para a área de transferência!');
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (e) {
      setFeedbackMessage(`Val: ${val}`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row relative overflow-hidden font-sans select-none">
      {/* Structural ambient details */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Decorative fine blueprints logic grid in background */}
      <div className="absolute inset-0 anime-grid-bg opacity-[0.2] pointer-events-none" />

      {/* LEFT HAND PANEL (Desktop View only: Informational sidebar focusing on Anime minimalist design description) */}
      <div className="flex-1 hidden md:flex flex-col justify-between p-8 xl:p-12 z-10 max-w-lg lg:max-w-xl border-r border-neutral-900 bg-neutral-950/40 backdrop-blur-sm relative" id="desktop-sidebar-pane">
        <div className="absolute inset-0 anime-grid-fine opacity-[0.05] pointer-events-none" />
        
        {/* Header Branding */}
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-5 h-5 rounded bg-rose-500 flex items-center justify-center text-white">
              <span className="font-display font-black text-xs">C</span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-rose-500 font-bold">
              SYS // NEON CALCULATOR
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-100 leading-tight">
            Estética Minimalista <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">
              Inspirada em Animes
            </span>
          </h1>
          <p className="text-sm text-neutral-400 mt-3 leading-relaxed max-w-sm">
            Um design limpo que equilibra ficção científica clássica e usabilidade moderna de smartphones em uma única interface elegante.
          </p>

          {/* Quick Shortcuts info */}
          <div className="mt-8 space-y-4" id="sidebar-tips-list">
            <div className="p-4 rounded-2xl bg-neutral-900/30 border border-neutral-900/40 relative overflow-hidden group hover:border-neutral-800 transition duration-300">
              <div className="flex items-start gap-3">
                <div className="rounded-xl p-2 bg-rose-500/10 text-rose-400 mt-0.5">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Simulação de Compras</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Pressione o botão de cálculo <strong className="text-rose-400">=</strong > para abrir o portal de assinaturas simulado com 3 opções detalhadas de planos premium.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/30 border border-neutral-900/40 relative overflow-hidden group hover:border-neutral-800 transition duration-300">
              <div className="flex items-start gap-3">
                <div className="rounded-xl p-2 bg-teal-500/10 text-teal-400 mt-0.5">
                  <Terminal size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Suporte a Teclado Físico</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Digite diretamente números, operadores normais (<kbd className="font-mono px-1 bg-neutral-900 border border-neutral-800 text-[10px] rounded">C</kbd>, <kbd className="font-mono px-1 bg-neutral-900 border border-neutral-800 text-[10px] rounded">+</kbd>, <kbd className="font-mono px-1 bg-neutral-900 border border-neutral-800 text-[10px] rounded">-</kbd>) e <kbd className="font-mono px-1 bg-neutral-900 border border-neutral-800 text-[10px] rounded">Enter</kbd> para computar.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/30 border border-neutral-900/40 relative overflow-hidden group hover:border-neutral-800 transition duration-300">
              <div className="flex items-start gap-3">
                <div className="rounded-xl p-2 bg-amber-500/10 text-amber-400 mt-0.5">
                  <RefreshCw size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Histórico Dinâmico</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    O histórico de cálculos recentes pode ser selecionado e carregado de volta à tela da calculadora ou copiado diretamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Details */}
        <div className="border-t border-neutral-900 pt-6 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[9px] text-neutral-500 tracking-widest uppercase">
              STATUS CORE SERVER: OPERATIONAL
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
            Desenvolvido sob diretrizes minimalistas. Toque nos botões na tela para acender os micro-leds digitais.
          </p>
        </div>
      </div>

      {/* MAIN FRAME WORKSPACE (Centered layout for mobile and desktop previewing) */}
      <div className="flex-1 flex flex-col items-center justify-center p-0 md:p-8 z-10 w-full" id="main-workspace-frame">
        {/* Soft floating dynamic message if any */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 max-w-xs p-3 px-4 rounded-xl bg-neutral-900 border border-rose-500/30 text-rose-300 text-xs text-center shadow-lg shadow-neutral-950/80 z-40"
              id="clipboard-toast"
            >
              <div className="flex items-center gap-2">
                <Info size={14} className="text-rose-400" />
                <span>{feedbackMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The beautiful responsive smartphone element wrapper */}
        <div className="relative group transition-all duration-500 w-full md:w-auto" id="calculator-viewport-mount">
          {/* Subtle outer neon ring behind container to match premium vibe */}
          <div className="absolute inset-x-0 -inset-y-2 rounded-[50px] bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-cyan-500/10 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <Calculator
            onCalculate={handleCalculationComplete}
            onOpenHistory={() => setIsHistoryOpen(true)}
            history={history}
            setHistory={setHistory}
            importedValue={importedValue}
            clearImportedValue={() => setImportedValue(null)}
          />
        </div>
        
        {/* Under-smartphone utility description visible on small phones */}
        <div className="md:hidden mt-4 text-[11px] font-mono text-neutral-500 uppercase tracking-widest text-center">
          Pressione <span className="text-rose-400 font-bold">=</span> para abrir opções de planos
        </div>
      </div>

      {/* PERSISTENT SIDEBAR DRAWERS & MODALS */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClear={() => {
          setHistory([]);
          setIsHistoryOpen(false);
          setFeedbackMessage('Histórico completamente limpo.');
          setTimeout(() => setFeedbackMessage(null), 2500);
        }}
        onSelectItem={handleSelectItem}
        onCopyItem={handleCopyItem}
      />

      <ModalPlans
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expression={pendingExpression}
        onUnlock={handleUnlockResult}
      />
    </div>
  );
}

