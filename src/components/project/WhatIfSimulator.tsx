'use client';

import React, { useState, useMemo } from 'react';
import { Project, BottleneckAnalysis } from '@/types';
import { simulateBottleneckResolution } from '@/lib/calculations/what-if-simulator';
import { Sliders, Sparkles, ArrowRight, CheckCircle2, TrendingUp, Calendar, Zap } from 'lucide-react';
import { HealthGauge } from '@/components/ui/HealthGauge';
import { cn } from '@/lib/utils';

interface WhatIfSimulatorProps {
  project: Project;
  bottleneck: BottleneckAnalysis;
}

export function WhatIfSimulator({ project, bottleneck }: WhatIfSimulatorProps) {
  const maxDelay = bottleneck.delayDays > 0 ? bottleneck.delayDays : 30;
  // Slider: target resolution in days (0 = resolve immediately, maxDelay = unmitigated delay)
  const [targetDays, setTargetDays] = useState<number>(Math.max(0, Math.floor(maxDelay / 4)));

  const simulation = useMemo(() => {
    return simulateBottleneckResolution(project, targetDays);
  }, [project, targetDays]);

  const bottleneckName = bottleneck.bottleneckActivity?.name || 'Primary Activity';
  const bottleneckDept = bottleneck.department || 'Operations Dept';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-teal-500/30 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders className="w-3.5 h-3.5" />
            Deterministic Scenario Engine
          </div>
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            What-If Scenario Simulation
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Simulate the exact portfolio impact of accelerating bottleneck resolution. All scores and dates are recomputed dynamically across the full project graph.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-right">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Current Bottleneck</span>
          <span className="text-sm font-bold text-rose-400">{bottleneckName}</span>
          <span className="text-xs text-slate-400 block">({bottleneckDept} × +{bottleneck.delayDays}d delay)</span>
        </div>
      </div>

      {/* Interactive Slider Section */}
      <div className="relative z-10 mt-6 bg-slate-800/60 rounded-xl p-5 border border-slate-700/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <label htmlFor="sim-slider" className="text-sm font-bold text-slate-200">
            Target Resolution Timeline: Resolve within <span className="text-teal-300 font-black text-base">{targetDays} days</span>
          </label>
          <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            Recovers {simulation.delayDelta} days on critical path
          </span>
        </div>

        <input
          id="sim-slider"
          type="range"
          min="0"
          max={maxDelay}
          value={targetDays}
          onChange={(e) => setTargetDays(Number(e.target.value))}
          className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400 hover:accent-teal-300"
        />

        <div className="flex justify-between text-[11px] text-slate-400 font-bold mt-2">
          <span>0 Days (Instant Fast-Track)</span>
          <span>Target: {targetDays} Days</span>
          <span>{maxDelay} Days (No Intervention)</span>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline (Before) */}
        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/60">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-700">
            Current Baseline (Before)
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Overall Health Score:</span>
              <span className="font-extrabold text-base text-rose-400">{simulation.originalOverallHealth}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Schedule Health Sub-score:</span>
              <span className="font-bold text-slate-200">{simulation.originalScheduleHealth}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Bottleneck Delay:</span>
              <span className="font-bold text-rose-400">+{simulation.originalDelayDays} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Expected Completion:</span>
              <span className="font-bold text-slate-300">{simulation.originalExpectedEndDate}</span>
            </div>
          </div>
        </div>

        {/* Simulated Scenario (After) */}
        <div className="bg-teal-950/40 rounded-xl p-5 border border-teal-500/40 relative overflow-hidden">
          <div className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-4 pb-2 border-b border-teal-500/30 flex items-center justify-between">
            <span>Simulated Outcome (After Intervention)</span>
            {simulation.healthDelta > 0 && (
              <span className="text-emerald-400 font-extrabold flex items-center gap-1 text-[11px]">
                <TrendingUp className="w-3.5 h-3.5" />
                +{simulation.healthDelta} pts
              </span>
            )}
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Simulated Overall Health:</span>
              <span className={cn(
                'font-extrabold text-lg',
                simulation.newOverallHealth >= 80 ? 'text-emerald-400' : simulation.newOverallHealth >= 60 ? 'text-amber-300' : 'text-rose-400'
              )}>
                {simulation.newOverallHealth}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Simulated Schedule Health:</span>
              <span className="font-bold text-teal-300">{simulation.newScheduleHealth}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Remaining Delay:</span>
              <span className="font-bold text-emerald-400">+{simulation.newExpectedDelayDays} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">New Projected Completion:</span>
              <span className="font-bold text-teal-200">{simulation.newExpectedEndDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
