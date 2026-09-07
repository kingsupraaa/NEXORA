'use client';

import React, { useState } from 'react';
import { Project, AIExplanationResult } from '@/types';
import { Sparkles, HelpCircle, ArrowRight, CheckCircle2, ShieldAlert, Cpu, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface WhyAtRiskCardProps {
  project: Project;
  initialExplanation: AIExplanationResult;
}

export function WhyAtRiskCard({ project, initialExplanation }: WhyAtRiskCardProps) {
  const [explanation, setExplanation] = useState<AIExplanationResult>(initialExplanation);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id })
      });
      if (res.ok) {
        const data = await res.json();
        setExplanation(data);
      }
    } catch (err) {
      console.error('Failed to refresh explanation', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              Why is this project at risk?
            </span>
            <span className={cn(
              'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border',
              explanation.isAI
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-teal-50 text-teal-700 border-teal-200'
            )}>
              {explanation.isAI ? 'LLM Powered' : 'Deterministic Engine'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synthesizes physical progress variance, milestone slippage, and DAG dependencies
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors self-start sm:self-auto disabled:opacity-60"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          <span>{isLoading ? 'Re-analyzing...' : 'Re-analyze Risk'}</span>
        </button>
      </div>

      {/* Summary Narrative */}
      <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-medium">
        {explanation.projectSummary}
      </div>

      {/* Numbered Reasons */}
      <div className="mt-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Root Causes & Distress Factors
        </h4>
        <div className="space-y-2.5">
          {explanation.reasons.map((reason, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/60 transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                {index + 1}
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Action Box */}
      <div className="mt-6 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/90">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Recommended Immediate Action
          </span>
          <StatusBadge status={explanation.recommendedPriority} size="sm" />
        </div>
        <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
          {explanation.recommendedAction}
        </p>
      </div>
    </div>
  );
}
