'use client';

import React from 'react';
import { ActivityDependency, BottleneckAnalysis } from '@/types';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GitFork, AlertOctagon, ArrowDown, ShieldAlert } from 'lucide-react';

interface DependencyGraphViewProps {
  dependencies: ActivityDependency[];
  bottleneck: BottleneckAnalysis;
}

export function DependencyGraphView({ dependencies, bottleneck }: DependencyGraphViewProps) {
  const delayedNodes = dependencies.filter(d => d.status === 'Delayed' || d.delayDays > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-teal-700" />
            Dependency Intelligence & DAG Traversal
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Graph traversal identifies blocked downstream paths from delays
          </p>
        </div>

        {bottleneck.bottleneckActivity && (
          <div className="flex items-center gap-2 bg-rose-50 text-rose-800 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-bold">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{bottleneck.plainStatement}</span>
          </div>
        )}
      </div>

      {/* DAG Flow Visualizer */}
      <div className="mt-6 space-y-3">
        {dependencies.map((act, index) => {
          const isBottleneck = act.id === bottleneck.bottleneckActivity?.id;
          const isBlockedByBottleneck = bottleneck.blockedActivities.some(b => b.id === act.id);
          const hasPredecessors = act.dependsOn && act.dependsOn.length > 0;

          return (
            <div key={act.id} className="relative">
              {hasPredecessors && index > 0 && (
                <div className="flex items-center justify-center my-1 text-slate-300">
                  <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}

              <div
                className={cn(
                  'rounded-xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                  isBottleneck
                    ? 'border-rose-300 bg-rose-50/80 shadow-md ring-2 ring-rose-500/20'
                    : isBlockedByBottleneck
                    ? 'border-amber-300 bg-amber-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                      isBottleneck
                        ? 'bg-rose-600 text-white'
                        : isBlockedByBottleneck
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    {act.id.replace('act-', '')}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{act.name}</span>
                      {isBottleneck && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-600 text-white tracking-wider">
                          PRIMARY BOTTLENECK
                        </span>
                      )}
                      {isBlockedByBottleneck && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-600 text-white tracking-wider">
                          BLOCKED DOWNSTREAM
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span>Owner: <strong className="text-slate-700">{act.owner}</strong></span>
                      {hasPredecessors && (
                        <span>Depends on: <strong className="text-slate-700">{act.dependsOn.join(', ')}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center">
                  {act.delayDays > 0 && (
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-700">+{act.delayDays} days delay</span>
                    </div>
                  )}
                  <StatusBadge status={act.status} size="sm" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
