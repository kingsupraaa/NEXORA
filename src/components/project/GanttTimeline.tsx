'use client';

import React from 'react';
import { Milestone, ActivityDependency } from '@/types';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Calendar, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface GanttTimelineProps {
  milestones: Milestone[];
  dependencies: ActivityDependency[];
  startDate: string;
  plannedEndDate: string;
  expectedEndDate: string;
}

export function GanttTimeline({
  milestones,
  dependencies,
  startDate,
  plannedEndDate,
  expectedEndDate
}: GanttTimelineProps) {
  // Major phases derived from activities and milestones
  const phases = [
    { id: 'p1', name: 'Land Acquisition & Clearances', progress: 40, status: 'Delayed', delayDays: 28, owner: 'Revenue Dept', dates: 'Q1 2024 � Q2 2024' },
    { id: 'p2', name: 'Utility Shifting & Civil Earthwork', progress: 30, status: 'Delayed', delayDays: 14, owner: 'Electricity Board / PWD', dates: 'Q2 2024 � Q4 2024' },
    { id: 'p3', name: 'Superstructure & Pier Construction', progress: 20, status: 'In Progress', delayDays: 0, owner: 'L&T Infra', dates: 'Q4 2024 � Q2 2025' },
    { id: 'p4', name: 'Pavement Laying & Surfacing', progress: 0, status: 'Upcoming', delayDays: 0, owner: 'HCC', dates: 'Q2 2025 � Q4 2025' },
    { id: 'p5', name: 'Signalling, Toll & Commissioning', progress: 0, status: 'Upcoming', delayDays: 0, owner: 'NHAI', dates: 'Q4 2025 � Q1 2026' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-700" />
            Project Phase & Milestone Timeline (Gantt)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential phase progression and critical milestone timeline
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-400 font-medium">Planned: </span>
            <span className="font-semibold text-slate-700">{plannedEndDate}</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <div>
            <span className="text-slate-400 font-medium">Expected: </span>
            <span className="font-bold text-rose-700">{expectedEndDate}</span>
          </div>
        </div>
      </div>

      {/* Gantt Phase Bars */}
      <div className="mt-6 space-y-4">
        {phases.map((phase, idx) => {
          const isDelayed = phase.status === 'Delayed';
          const isCompleted = phase.status === 'Completed';
          const isInProgress = phase.status === 'In Progress';

          return (
            <div key={phase.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{phase.name}</span>
                  <span className="text-xs text-slate-500">({phase.owner})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">{phase.dates}</span>
                  <StatusBadge status={phase.status} size="sm" />
                </div>
              </div>

              {/* Progress track */}
              <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isDelayed ? 'bg-rose-500' : isInProgress ? 'bg-teal-600' : isCompleted ? 'bg-emerald-500' : 'bg-slate-300'
                  )}
                  style={{ width: `${Math.max(5, phase.progress)}%` }}
                />
              </div>

              {isDelayed && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Phase is delayed by {phase.delayDays} days on critical path</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Milestones list */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
          Milestones Detail & Status
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Milestone</th>
                <th className="py-2.5 px-3">Owner</th>
                <th className="py-2.5 px-3">Planned Date</th>
                <th className="py-2.5 px-3">Actual / Target</th>
                <th className="py-2.5 px-3">Delay</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {milestones.map((m) => {
                const isOverdue = m.status === 'Delayed' || m.delayDays > 0;
                return (
                  <tr key={m.id} className={cn('hover:bg-slate-50/80 transition-colors', isOverdue && 'bg-rose-50/30')}>
                    <td className="py-3 px-3 font-semibold text-slate-900">{m.name}</td>
                    <td className="py-3 px-3">{m.owner}</td>
                    <td className="py-3 px-3">{m.plannedDate}</td>
                    <td className="py-3 px-3">{m.actualDate || 'Pending'}</td>
                    <td className="py-3 px-3 font-medium">
                      {m.delayDays > 0 ? (
                        <span className="text-rose-700 font-bold">+{m.delayDays} days</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">0 days</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <StatusBadge status={m.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
