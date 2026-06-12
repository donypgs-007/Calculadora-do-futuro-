/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, ChevronRight, X, CreditCard, ShieldCheck, Lock, Unlock, Cpu } from 'lucide-react';
import { Plan } from '../types';
import { evaluateExpression } from '../utils/calcEvaluator';

interface ModalPlansProps {
  isOpen: boolean;
  onClose: () => void;
  expression: string;
  onUnlock: (result: string, formula: string) => void;
}

export default function ModalPlans({ isOpen, onClose, expression, onUnlock }: ModalPlansProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [unlockedResult, setUnlockedResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [animateHeader, setAnimateHeader] = useState<boolean>(false);

  const plans: Plan[] = [
    {
      id: 'daily',
      name: 'Plano Diário',
      price: '10 MT',
      period: '24 horas',
      benefits: ['Resultados ilimitados por 24 horas', 'Cálculos de alta precisão', 'Sem anúncios ou barreiras'],
      color: 'from-cyan-500/10 to-teal-500/10 border-cyan-500/30 text-cyan-400 font-display',
    },
    {
      id: 'weekly',
      name: 'Plano Semanal',
      price: '100 MT',
      period: '7 dias',
      benefits: ['Resultados ilimitados por 7 dias', 'Acesso completo ao histórico', 'Suporte prioritário e alta precisão'],
      color: 'from-pink-500/10 to-rose-500/10 border-pink-500/40 text-pink-400 font-display relative overflow-hidden',
    },
    {
      id: 'monthly',
      name: 'Plano Mensal',
      price: '500 MT',
      period: '30 dias',
      benefits: ['Resultados ilimitados por 30 dias', 'Melhor custo-benefício', 'Todos os recursos premium inclusos'],
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-400 font-display',
    },
  ];

  const handleSelectPlan = (plan: Plan) => {
    setIsProcessing(true);
    setSelectedPlanId(plan.id);
    
    // Simulate anime-styled processing/authorization sound / delay
    setTimeout(() => {
      setIsProcessing(false);
      // Now evaluate the calculation on selection
      const result = evaluateExpression(expression);
      setUnlockedResult(result);
      setAnimateHeader(true);
      // Trigger callback to propagate state back to the app and save history item
      onUnlock(result, expression);
    }, 1200);
  };

  const handleCloseAndReset = () => {
    setSelectedPlanId(null);
    setUnlockedResult(null);
    setAnimateHeader(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950" id="fullscreen-payment-view">
        {/* Subtle Sci-fi scanning lines overlaying full-screen */}
        <div className="absolute inset-0 anime-grid-bg opacity-[0.15] pointer-events-none" />
        <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/30 to-transparent top-1/3 animate-scanline pointer-events-none" />

        {/* Outer ambient soft glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

        {/* Header decoration */}
        <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest pointer-events-none select-none">
          <span>SECURE_GATEWAY // PRO</span>
          <span>STABLE CONNECT</span>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-md h-full px-6 flex flex-col justify-between py-10 relative z-10 overflow-y-auto no-scrollbar" id="payment-stage">
          
          {/* Top segment */}
          <div className="text-center mt-6">
            <div className="mb-4 flex justify-center">
              <motion.div 
                initial={{ rotate: -10, scale: 0.9 }}
                animate={unlockedResult ? { rotate: 360, scale: 1.1 } : { rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                  unlockedResult 
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                {unlockedResult ? <Unlock size={24} /> : <Lock size={24} className="animate-pulse" />}
              </motion.div>
            </div>

            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-xl md:text-2xl font-bold text-neutral-100 tracking-tight leading-snug"
            >
              Escolha um plano para desbloquear o resultado
            </motion.h2>

            <p className="text-xs text-neutral-400 mt-2 max-w-xs mx-auto leading-relaxed">
              O resultado da sua operação <code className="font-mono text-rose-400 font-bold px-1 py-0.5 bg-neutral-900 border border-neutral-800 rounded">{expression}</code> está calculado e aguardando ativação.
            </p>
          </div>

          {/* Center Section: Dynamic Locked Screen / Result Reveal */}
          <div className="my-6">
            <AnimatePresence mode="wait">
              {unlockedResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-center"
                  id="result-unlocked-card"
                >
                  <div className="inline-flex items-center gap-1 bg-teal-500/10 text-teal-300 font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full mb-2">
                    <Sparkles size={11} className="animate-spin" />
                    <span>Concluído</span>
                  </div>
                  <h3 className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Resultado Desbloqueado:</h3>
                  <div className="font-display font-medium text-4xl text-neutral-100 tracking-tight mt-1 animate-pulse">
                    {unlockedResult}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-900 text-center text-xs font-mono text-neutral-500 flex items-center justify-center gap-2"
                >
                  <Cpu size={14} className="animate-spin text-rose-500/60" />
                  <span>AGUARDANDO AUTORIZAÇÃO DE PLANO</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Premium Plans Group */}
          <div className="flex flex-col gap-3.5 mb-6" id="plans-card-list">
            {plans.map((p) => {
              const isSelected = selectedPlanId === p.id;
              const hasThisSelected = isSelected && unlockedResult;
              const isWeekly = p.id === 'weekly';

              return (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !unlockedResult && handleSelectPlan(p)}
                  disabled={isProcessing || !!unlockedResult}
                  key={p.id}
                  className={`w-full text-left bg-gradient-to-b border rounded-2.5xl p-4.5 transition-all duration-300 relative ${p.color} ${
                    isSelected ? 'ring-2 ring-emerald-500 border-emerald-500/40' : 'hover:border-neutral-800'
                  } ${unlockedResult && !isSelected ? 'opacity-40' : ''}`}
                  id={`btn-plan-${p.id}`}
                >
                  {isWeekly && (
                    <div className="absolute top-0 right-0 bg-rose-500 text-[8px] font-mono tracking-wider text-white font-semibold uppercase px-2.5 py-0.5 rounded-bl-lg rounded-tr-lg">
                      RECOMENDADO
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-bold text-base text-neutral-100 flex items-center gap-1.5">
                        {p.name}
                        {hasThisSelected && <Check size={14} className="text-emerald-400" />}
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Resultados ilimitados por {p.period}.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg font-bold text-neutral-100">{p.price}</div>
                      <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Pagar</div>
                    </div>
                  </div>

                  {/* Micro list of item benefits */}
                  <div className="mt-3 flex items-center gap-3 text-[10px] text-neutral-400/80">
                    {p.benefits.slice(0, 1).map((b, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-rose-500" />
                        <span>{b}</span>
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Bottom Actions Frame */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCloseAndReset}
              className={`w-full font-semibold py-4 px-6 rounded-2.5xl text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
                unlockedResult 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-900/30'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
              id="confirm-checkout-btn"
            >
              <span>{unlockedResult ? 'Acessar Calculadora' : 'Voltar e Editar'}</span>
              <ChevronRight size={14} />
            </button>

            <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-neutral-500 tracking-wider">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Conexão Encriptada Segura MT</span>
            </div>
          </div>

        </div>
      </div>
    </AnimatePresence>
  );
}
