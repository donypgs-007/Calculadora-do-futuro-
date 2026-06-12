/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, History, X, Copy, CornerDownLeft } from 'lucide-react';
import { CalculationHistoryItem } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  onClear: () => void;
  onSelectItem: (value: string) => void;
  onCopyItem: (text: string) => void;
}

export default function HistoryPanel({
  isOpen,
  onClose,
  history,
  onClear,
  onSelectItem,
  onCopyItem,
}: HistoryPanelProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex justify-end">
        {/* Backdrop filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
          id="history-backdrop"
        />

        {/* Panel container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-sm h-full bg-neutral-950 border-l border-neutral-900 shadow-2xl flex flex-col z-10 p-5 pt-7"
          id="history-drawer"
        >
          {/* Top title bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-900">
            <div className="flex items-center gap-2">
              <History size={16} className="text-rose-500" />
              <h3 className="font-display font-semibold text-neutral-200 text-sm tracking-wide">
                Histórico de Operações
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-neutral-900 border border-neutral-800 p-1 text-neutral-400 hover:text-white hover:border-neutral-700 transition cursor-pointer"
              aria-label="Filter"
              id="history-close-btn"
            >
              <X size={15} />
            </button>
          </div>

          {/* List area */}
          <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-4" id="history-items-list">
            {history.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center px-4">
                <div className="p-3 rounded-2xl bg-neutral-900/40 border border-neutral-900 mb-3 text-neutral-600">
                  <History size={20} />
                </div>
                <p className="text-xs text-neutral-500 font-sans">Nenhuma operação registrada ainda</p>
                <p className="text-[10px] text-neutral-600 mt-1 max-w-[200px]">
                  Calcule resultados pressionando o botão "=" para guardar históricos aqui.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-neutral-900/30 border border-neutral-900/60 hover:border-rose-500/20 transition-all duration-300 group relative overflow-hidden"
                  id={`history-item-${item.id}`}
                >
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-xs text-neutral-400 truncate tracking-wide">
                        {item.formula}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-600 block shrink-0">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="font-display font-semibold text-lg text-rose-400 tracking-tight mt-1 flex items-center justify-between">
                      <span className="truncate">{item.result}</span>
                      
                      {/* Hover action buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onCopyItem(item.result)}
                          className="p-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                          title="Copiar resultado"
                          id={`copy-history-${item.id}`}
                        >
                          <Copy size={11} />
                        </button>
                        <button
                          onClick={() => onSelectItem(item.result)}
                          className="p-1 rounded-md bg-neutral-900 border border-neutral-800 text-rose-500 hover:bg-rose-500 hover:text-white transition flex items-center justify-center cursor-pointer"
                          title="Usar na calculadora"
                          id={`use-history-${item.id}`}
                        >
                          <CornerDownLeft size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer containing delete history option */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-neutral-900 mt-4">
              <button
                onClick={onClear}
                className="w-full bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/25 text-rose-400 font-mono text-xs py-3 rounded-xl transition duration-250 flex items-center justify-center gap-1.5 cursor-pointer"
                id="clear-all-history-btn"
              >
                <Trash2 size={13} />
                <span>Limpar Histórico</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
