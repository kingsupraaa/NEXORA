'use client';

import React, { useState, useMemo } from 'react';
import { Project, ActionItem, RiskSeverity } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  CheckSquare, 
  UserPlus, 
  User, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Send, 
  Plus, 
  Filter, 
  Calendar,
  X,
  Sparkles,
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectActionCenterProps {
  project: Project;
  initialActions?: ActionItem[];
}

export function ProjectActionCenter({ project, initialActions = [] }: ProjectActionCenterProps) {
  const [actions, setActions] = useState<ActionItem[]>(initialActions);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'ASSIGNED' | 'CRITICAL' | 'RESOLVED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Form states for new task assignment
  const [taskTitle, setTaskTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [customAssignee, setCustomAssignee] = useState('');
  const [severity, setSeverity] = useState<RiskSeverity>('High');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick reassign modal or inline state
  const [reassigningActionId, setReassigningActionId] = useState<string | null>(null);
  const [reassignPerson, setReassignPerson] = useState('');

  // Extract all distinct team members and owners across this project
  const teamMembers = useMemo(() => {
    const set = new Set<string>();
    if (project.manager) set.add(project.manager);
    project.milestones.forEach(m => m.owner && set.add(m.owner));
    project.dependencies.forEach(d => d.owner && set.add(d.owner));
    project.risks.forEach(r => {
      if (r.owner) set.add(r.owner);
      if (r.assignedTo) set.add(r.assignedTo);
    });
    project.departments.forEach(dept => set.add(`${dept} Officer`));
    return Array.from(set);
  }, [project]);

  // Handle task status mutations (Assign, Escalate, Resolve, Re-open)
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
          assignedTo: meta?.assignedTo,
          escalatedTo: meta?.escalatedTo
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActions(prev => prev.map(a => a.id === actionId ? data.action : a));
      }
    } catch (err) {
      console.error('Failed to update action status', err);
    } finally {
      setUpdatingId(null);
      setReassigningActionId(null);
    }
  }

  // Handle submitting new task assignment
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    const finalAssignee = assignedTo === 'CUSTOM' ? customAssignee.trim() : assignedTo.trim();

    if (!taskTitle.trim() || !finalAssignee) {
      alert('Please provide a task title and specify who to assign it to.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          title: taskTitle.trim(),
          assignedTo: finalAssignee,
          severity,
          dueDate: dueDate || undefined,
          departmentOrOwner: project.manager,
          impact: notes.trim() || `Operational action item assigned to ${finalAssignee}`,
          recommendedAction: notes.trim() || taskTitle.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActions(prev => [data.action, ...prev]);
        setIsModalOpen(false);
        // Reset form
        setTaskTitle('');
        setAssignedTo('');
        setCustomAssignee('');
        setSeverity('High');
        setDueDate('');
        setNotes('');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to create task');
      }
    } catch (err) {
      console.error('Failed to create task', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredActions = useMemo(() => {
    return actions.filter(a => {
      if (filter === 'OPEN') return a.status === 'Open';
      if (filter === 'ASSIGNED') return a.status === 'Assigned' || a.status === 'Escalated';
      if (filter === 'CRITICAL') return a.severity === 'Critical';
      if (filter === 'RESOLVED') return a.status === 'Resolved';
      return true;
    });
  }, [actions, filter]);

  const stats = useMemo(() => {
    return {
      total: actions.length,
      open: actions.filter(a => a.status === 'Open').length,
      assigned: actions.filter(a => a.status === 'Assigned' || a.status === 'Escalated').length,
      critical: actions.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length,
      resolved: actions.filter(a => a.status === 'Resolved').length
    };
  }, [actions]);

  return (
    <div id="actions" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-coral-50 border border-coral-200 flex items-center justify-center text-coral-600">
              <CheckSquare className="w-4 h-4 stroke-[2.3]" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Action Items & Assigned Tasks
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {stats.total} {stats.total === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Assign, track, and escalate corrective measures to any stakeholder or contractor inside <span className="font-semibold text-slate-700">{project.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-coral-600 hover:bg-coral-700 text-white text-xs font-bold shadow-md shadow-coral-600/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>
        </div>
      </div>

      {/* Stats and Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 pb-6">
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
          {[
            { id: 'ALL', label: 'All Items', count: stats.total },
            { id: 'OPEN', label: 'Unassigned', count: stats.open },
            { id: 'ASSIGNED', label: 'Assigned / In Progress', count: stats.assigned },
            { id: 'CRITICAL', label: 'Critical Priority', count: stats.critical },
            { id: 'RESOLVED', label: 'Resolved', count: stats.resolved },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5',
                filter === tab.id
                  ? 'bg-coral-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full',
                filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
          <span>Project Team ({teamMembers.length}):</span>
          <span className="text-slate-700 font-bold truncate max-w-xs">
            {project.manager}, {teamMembers.filter(m => m !== project.manager).slice(0, 3).join(', ')}...
          </span>
        </div>
      </div>

      {/* Task Cards List */}
      {filteredActions.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No action items in this filter</p>
          <p className="text-xs text-slate-400 mt-1">
            All operations are on schedule. Click "Assign New Task" to delegate tasks to anyone on this project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActions.map((action) => {
            const isUpdating = updatingId === action.id;
            const isResolved = action.status === 'Resolved';
            const isEscalated = action.status === 'Escalated';
            const isReassigning = reassigningActionId === action.id;

            return (
              <div
                key={action.id}
                className={cn(
                  'rounded-2xl border p-5 transition-all flex flex-col justify-between bg-white relative',
                  action.severity === 'Critical' ? 'border-rose-300 shadow-sm' : 'border-slate-200 shadow-sm',
                  isResolved && 'opacity-65 bg-slate-50/60'
                )}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn(
                        'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
                        action.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                        action.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        action.severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      )}>
                        {action.severity} Priority
                      </span>

                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {action.type}
                      </span>
                    </div>

                    <StatusBadge status={action.status} size="sm" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                    {action.title}
                  </h3>

                  {/* Assignee Strip */}
                  <div className="flex items-center gap-2 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-coral-100 text-coral-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                        Assigned Person
                      </span>
                      <span className="font-bold text-slate-800 truncate block">
                        {action.assignedTo || 'Unassigned (Open for pickup)'}
                      </span>
                    </div>

                    {action.dueDate && (
                      <div className="text-right shrink-0 border-l border-slate-200 pl-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                          Due Date
                        </span>
                        <span className="font-semibold text-slate-700 text-[11px] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {action.dueDate}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Impact & Recommended Action Details */}
                  {action.impact && (
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 font-medium leading-relaxed mb-3">
                      {action.impact}
                    </p>
                  )}

                  {action.escalatedTo && (
                    <div className="mb-3 text-[11px] font-medium text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-200 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Escalated to: <strong>{action.escalatedTo}</strong></span>
                    </div>
                  )}

                  {/* Inline Reassign Box */}
                  {isReassigning && (
                    <div className="mb-3 p-3 bg-coral-50 rounded-xl border border-coral-200">
                      <span className="text-xs font-bold text-coral-900 block mb-1.5">
                        Reassign task to:
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          value={reassignPerson}
                          onChange={(e) => setReassignPerson(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-coral-300 text-xs font-semibold text-slate-800 bg-white"
                        >
                          <option value="">Select person...</option>
                          {teamMembers.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (reassignPerson) {
                              handleUpdateStatus(action.id, 'Assigned', { assignedTo: reassignPerson });
                            }
                          }}
                          disabled={!reassignPerson}
                          className="px-3 py-1.5 rounded-lg bg-coral-600 text-white text-xs font-bold hover:bg-coral-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setReassigningActionId(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setReassigningActionId(action.id);
                        setReassignPerson(action.assignedTo || teamMembers[0] || '');
                      }}
                      disabled={isUpdating}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-coral-600" />
                      <span>{action.assignedTo ? 'Reassign' : 'Assign'}</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(
                        action.id, 
                        'Escalated', 
                        { escalatedTo: `${project.sector} Principal Secretary` }
                      )}
                      disabled={isUpdating || isEscalated}
                      className={cn(
                        'px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors inline-flex items-center gap-1',
                        isEscalated
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      )}
                    >
                      <Send className="w-3.5 h-3.5 text-rose-500" />
                      <span>{isEscalated ? 'Escalated' : 'Escalate'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(action.id, isResolved ? 'Open' : 'Resolved')}
                    disabled={isUpdating}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 ml-auto',
                      isResolved
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isResolved ? 'Re-open Task' : 'Mark Resolved'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Task Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-coral-100 text-coral-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Assign Task in {project.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">{project.code}</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4 text-xs">
              {/* Task Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete soil bearing capacity test for pier foundations"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-coral-500 focus:outline-none"
                />
              </div>

              {/* Assignee Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign To (Person or Stakeholder) *
                </label>
                <select
                  required
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-coral-500 focus:outline-none mb-2"
                >
                  <option value="">Select a person or role...</option>
                  <optgroup label="Project Key Stakeholders">
                    <option value={project.manager}>{project.manager} (Project Manager)</option>
                    {teamMembers.filter(m => m !== project.manager).map(person => (
                      <option key={person} value={person}>{person}</option>
                    ))}
                  </optgroup>
                  <option value="CUSTOM">+ Enter Custom Name / Role</option>
                </select>

                {assignedTo === 'CUSTOM' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter person's name or title (e.g. Chief Structural Engineer)"
                    value={customAssignee}
                    onChange={(e) => setCustomAssignee(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-coral-300 bg-coral-50/30 text-slate-900 font-medium focus:ring-2 focus:ring-coral-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Priority & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority / Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as RiskSeverity)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-coral-500 focus:outline-none"
                  >
                    <option value="Critical">Critical Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-coral-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Task Details / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Instructions / Mitigation Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail instructions, dependencies, required deliverable, or escalation triggers..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-coral-500 focus:outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-bold shadow-md shadow-coral-600/25 transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
