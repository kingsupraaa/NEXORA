'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ActionItem } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  CheckSquare, 
  UserPlus, 
  ArrowUpRight, 
  CheckCircle2, 
  ShieldAlert, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  Send,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActionsPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'OPEN' | 'RESOLVED'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadActions() {
    try {
      const res = await fetch('/api/actions');
      const data = await res.json();
      setActions(data.actions || []);
    } catch (err) {
      console.error('Failed to load actions', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadActions();
  }, []);

  async function handleUpdateStatus(
    actionId: string, 
    newStatus: 'Open' | 'Assigned' | 'Escalated' | 'Resolved',
    meta?: { assignedTo?: string; escalatedTo?: string }
  ) {
    setUpdatingId(actionId);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId,
          status: newStatus,
          assignedTo: meta?.assignedTo || (newStatus === 'Assigned' ? 'Senior Project Officer' : undefined),
          escalatedTo: meta?.escalatedTo || (newStatus === 'Escalated' ? 'Department Secretary' : undefined)
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state with the returned updated action
        setActions(prev => prev.map(a => a.id === actionId ? data.action : a));
      }
    } catch (err) {
      console.error('Failed to mutate action', err);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredActions = actions.filter(a => {
    if (filter === 'CRITICAL') return a.severity === 'Critical';
    if (filter === 'HIGH') return a.severity === 'High';
    if (filter === 'OPEN') return a.status === 'Open';
    if (filter === 'RESOLVED') return a.status === 'Resolved';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-teal-700" />
            Action Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Prioritized operational escalations and bottleneck interventions with live state mutation
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto overflow-x-auto max-w-full">
          {(['ALL', 'CRITICAL', 'HIGH', 'OPEN', 'RESOLVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                filter === tab
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-medium">
          Loading active action items...
        </div>
      ) : filteredActions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-sm font-bold text-slate-700">No action items found.</p>
          <p className="text-xs text-slate-400 mt-1">All prioritized risks are currently mitigated.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredActions.map((action) => {
            const isUpdating = updatingId === action.id;
            const isResolved = action.status === 'Resolved';
            const isEscalated = action.status === 'Escalated';
            const isAssigned = action.status === 'Assigned';

            return (
              <div
                key={action.id}
                className={cn(
                  'bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between',
                  action.severity === 'Critical' ? 'border-rose-200/80' : 'border-slate-200',
                  isResolved && 'opacity-70 bg-slate-50/50'
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span className={cn(
                      'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
                      action.severity === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    )}>
                      {action.severity}
                    </span>
                    <StatusBadge status={action.status} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                    {action.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 flex-wrap">
                    <Link
                      href={`/projects/${action.projectId}`}
                      className="font-semibold text-teal-700 hover:underline"
                    >
                      {action.projectName}
                    </Link>
                    <span>×</span>
                    <span>Owner: <strong className="text-slate-700">{action.departmentOrOwner}</strong></span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium leading-relaxed mb-4">
                    {action.impact}
                  </p>

                  {(action.assignedTo || action.escalatedTo) && (
                    <div className="mb-4 text-[11px] font-medium text-slate-500 flex items-center gap-2 bg-teal-50/60 p-2 rounded-lg border border-teal-100">
                      {action.assignedTo && <span>Assigned to: <strong className="text-teal-900">{action.assignedTo}</strong></span>}
                      {action.escalatedTo && <span>Escalated to: <strong className="text-rose-900">{action.escalatedTo}</strong></span>}
                    </div>
                  )}
                </div>

                {/* Action Buttons with Real State Mutation */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(action.id, 'Assigned')}
                      disabled={isUpdating || isAssigned}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors inline-flex items-center gap-1.5',
                        isAssigned
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      )}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isAssigned ? 'Assigned' : 'Assign'}</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(action.id, 'Escalated')}
                      disabled={isUpdating || isEscalated}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors inline-flex items-center gap-1.5',
                        isEscalated
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      )}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isEscalated ? 'Escalated' : 'Escalate'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(action.id, isResolved ? 'Open' : 'Resolved')}
                    disabled={isUpdating}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 ml-auto',
                      isResolved
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-teal-700 hover:bg-teal-800 text-white shadow-sm'
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isResolved ? 'Re-open' : 'Mark Resolved'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
