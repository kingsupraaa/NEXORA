import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectById, getActionItemsForProject } from '@/lib/db/store';
import { calculateHealthScore } from '@/lib/calculations/health-score';
import { detectBottleneck } from '@/lib/calculations/dependency-graph';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HealthGauge } from '@/components/ui/HealthGauge';
import { GanttTimeline } from '@/components/project/GanttTimeline';
import { DependencyGraphView } from '@/components/project/DependencyGraphView';
import { WhatIfSimulator } from '@/components/project/WhatIfSimulator';
import { ProjectActionCenter } from '@/components/project/ProjectActionCenter';
import { ProjectAIEngine } from '@/components/project/ProjectAIEngine';
import { formatINR, formatPercent } from '@/lib/calculations/currency';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  IndianRupee, 
  Calendar, 
  TrendingDown, 
  AlertOctagon, 
  ShieldAlert, 
  Layers,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  Building,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const revalidate = 0;

export default async function ProjectDetailPage({
  params
}: {
  params: { id: string }
}) {
  const project = getProjectById(params.id);
  if (!project) {
    notFound();
  }

  const health = calculateHealthScore(project);
  const bottleneck = detectBottleneck(project);
  const initialActions = getActionItemsForProject(project.id);

  const remainingBudget = Math.max(0, project.budget - project.spent);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-coral-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href="#actions"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-50 hover:bg-coral-100 text-coral-700 text-xs font-bold border border-coral-200 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks & Actions ({initialActions.length})</span>
          </a>
          {project.id === 'proj-001' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-extrabold uppercase">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Demo Flagship Project
            </span>
          )}
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {project.code}
          </span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                {project.sector}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Manager: <strong className="text-slate-700">{project.manager}</strong></span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl font-medium leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 self-start lg:self-center">
            <HealthGauge
              score={health.overallHealth}
              size="lg"
              statusText={health.status}
              label="Overall Health"
            />
          </div>
        </div>

        {/* Header Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 pt-6 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Total Budget</span>
            <span className="text-sm font-extrabold text-slate-900">{formatINR(project.budget)}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Spent / Utilization</span>
            <span className="text-sm font-extrabold text-teal-800">
              {formatINR(project.spent)} ({health.budgetUtilizationPercentage}%)
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Physical Progress</span>
            <span className="text-sm font-extrabold text-slate-900">{project.progress}%</span>
            <span className="text-[10px] text-slate-400 block">(Target: {project.plannedProgress}%)</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Schedule Variance</span>
            <span className={cn(
              'text-sm font-extrabold',
              health.scheduleVarianceDays > 0 ? 'text-rose-700' : 'text-emerald-700'
            )}>
              {health.scheduleVarianceDays > 0 ? `+${health.scheduleVarianceDays}d delay` : 'On track'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Start Date</span>
            <span className="text-xs font-bold text-slate-700">{project.startDate}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Target End Date</span>
            <span className="text-xs font-bold text-slate-700">{project.expectedEndDate}</span>
          </div>
        </div>
      </div>

      {/* Grid: Health Breakdown + Schedule/Budget Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Health Score Formula Breakdown Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Health Score Algorithm
            </h3>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              Score: {health.overallHealth}/100
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 mb-4">
            Overall = (Schedule × 0.30) + (Budget × 0.20) + (Milestone × 0.20) + (Dependency × 0.15) + (Risk × 0.15)
          </div>

          <div className="space-y-3.5">
            {[
              { name: 'Schedule Health', weight: '30%', score: health.scheduleHealth, desc: `${health.scheduleVariancePercentage}% progress variance` },
              { name: 'Budget Health', weight: '20%', score: health.budgetHealth, desc: `${health.budgetUtilizationPercentage}% spend vs ${project.progress}% progress` },
              { name: 'Milestone Health', weight: '20%', score: health.milestoneHealth, desc: `${project.milestones.filter(m => m.status === 'Delayed').length} delayed milestones` },
              { name: 'Dependency Health', weight: '15%', score: health.dependencyHealth, desc: `${bottleneck.blockedActivityCount} downstream blocked tasks` },
              { name: 'Risk Health', weight: '15%', score: health.riskHealth, desc: `${project.risks.filter(r => r.severity === 'Critical').length} critical risks open` },
            ].map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">
                    {item.name} <span className="text-[10px] text-slate-400 font-normal">({item.weight})</span>
                  </span>
                  <span className={cn(
                    'font-black',
                    item.score >= 80 ? 'text-emerald-700' : item.score >= 60 ? 'text-amber-700' : 'text-rose-700'
                  )}>
                    {item.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    )}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule & Budget Analysis Dual Cards (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Schedule Analysis */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-700" />
                Schedule Variance Analysis
              </h3>
              <StatusBadge status={health.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Actual Progress</span>
                <span className="text-xl font-extrabold text-slate-900">{project.progress}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Planned Target</span>
                <span className="text-xl font-extrabold text-slate-900">{project.plannedProgress}%</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium bg-rose-50/60 p-3 rounded-xl border border-rose-100">
              {health.scheduleVariancePercentage < 0
                ? `Physical delivery is lagging by ${Math.abs(health.scheduleVariancePercentage)}% behind baseline schedule. Project is estimated to slip by ${health.scheduleVarianceDays} calendar days past planned completion date (${project.plannedEndDate}).`
                : `Project is executing within scheduled timeline tolerances.`}
            </p>
          </div>

          {/* Budget Analysis */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-teal-700" />
                Financial & Budget Analysis
              </h3>
              <span className={cn(
                'text-xs font-bold px-2.5 py-0.5 rounded-full border',
                health.budgetOverrunFlag === 'Critical Overrun' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              )}>
                {health.budgetOverrunFlag}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sanctioned Budget</span>
                <span className="text-sm font-extrabold text-slate-900">{formatINR(project.budget)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Actual Spent</span>
                <span className="text-sm font-extrabold text-teal-800">{formatINR(project.spent)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining Funds</span>
                <span className="text-sm font-extrabold text-slate-700">{formatINR(remainingBudget)}</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-700 h-full rounded-full"
                style={{ width: `${Math.min(100, health.budgetUtilizationPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-semibold mt-1">
              <span>Utilization: {health.budgetUtilizationPercentage}%</span>
              <span>Physical Completion: {project.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deterministic AI Intelligence Engine */}
      <ProjectAIEngine
        project={project}
        health={health}
        bottleneck={bottleneck}
      />

      {/* Project Action Center & Task Assignment */}
      <ProjectActionCenter project={project} initialActions={initialActions} />

      {/* What-If Simulation Engine */}
      <div className="mb-8">
        <WhatIfSimulator project={project} bottleneck={bottleneck} />
      </div>

      {/* Dependency Intelligence DAG Graph View */}
      <div className="mb-8">
        <DependencyGraphView dependencies={project.dependencies} bottleneck={bottleneck} />
      </div>

      {/* Gantt Timeline & Milestone Phases */}
      <div className="mb-8">
        <GanttTimeline
          milestones={project.milestones}
          dependencies={project.dependencies}
          startDate={project.startDate}
          plannedEndDate={project.plannedEndDate}
          expectedEndDate={project.expectedEndDate}
        />
      </div>
    </div>
  );
}
