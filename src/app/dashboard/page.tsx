import React from 'react';
import Link from 'next/link';
import { getPortfolioMetrics, getAllProjects } from '@/lib/db/store';
import { calculateHealthScore } from '@/lib/calculations/health-score';
import { detectBottleneck } from '@/lib/calculations/dependency-graph';
import { MetricCard } from '@/components/ui/MetricCard';
import { HealthGauge } from '@/components/ui/HealthGauge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatINR, formatPercent } from '@/lib/calculations/currency';
import { 
  FolderKanban, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  IndianRupee, 
  ShieldAlert, 
  ArrowRight,
  TrendingDown,
  Bell,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectsBySectorChart } from '@/components/dashboard/ProjectsBySectorChart';

export const revalidate = 0;

export default async function DashboardPage() {
  const metrics = getPortfolioMetrics();
  const allProjects = getAllProjects();

  // Sector distribution count
  const sectorMap: Record<string, number> = {};
  allProjects.forEach(p => {
    sectorMap[p.sector] = (sectorMap[p.sector] || 0) + 1;
  });
  const sectorData = Object.entries(sectorMap).map(([sector, count]) => ({
    sector,
    count
  })).sort((a, b) => b.count - a.count);

  const highestRisk = metrics.highestRiskProject;

  // Real state notifications
  const notifications = [
    { id: 1, text: '3 projects flagged with inter-departmental utility delays', time: '10m ago', type: 'danger' },
    { id: 2, text: 'Land acquisition clearance overdue for East-West Highway Expansion', time: '1h ago', type: 'danger' },
    { id: 3, text: 'Central Hospital Construction completed Structural Superstructure', time: '3h ago', type: 'success' },
    { id: 4, text: 'Wind Farm Substation completed SCADA testing on schedule', time: '1d ago', type: 'success' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      {/* Title & Portfolio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Project Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Live health, risk, and dependency view across {metrics.totalProjects} infrastructure projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/actions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <span>Open Action Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <MetricCard
          title="Total Projects"
          value={metrics.totalProjects}
          icon={FolderKanban}
          subtitle="Active Portfolio"
          variant="default"
        />
        <MetricCard
          title="On Track"
          value={metrics.onTrackCount}
          icon={CheckCircle2}
          subtitle={`${Math.round((metrics.onTrackCount / metrics.totalProjects) * 100)}% of total`}
          variant="success"
        />
        <MetricCard
          title="At Risk"
          value={metrics.atRiskCount}
          icon={AlertTriangle}
          subtitle={`${Math.round((metrics.atRiskCount / metrics.totalProjects) * 100)}% of total`}
          variant="warning"
        />
        <MetricCard
          title="Delayed"
          value={metrics.delayedCount}
          icon={AlertOctagon}
          subtitle={`${Math.round((metrics.delayedCount / metrics.totalProjects) * 100)}% of total`}
          variant="danger"
        />
        <MetricCard
          title="Budget Utilization"
          value={`${metrics.averageUtilization}%`}
          icon={IndianRupee}
          subtitle={`${formatINR(metrics.totalSpent)} spent`}
          variant="teal"
        />
        <MetricCard
          title="Critical Risks"
          value={metrics.criticalRisksCount}
          icon={ShieldAlert}
          subtitle="Requiring Action"
          variant="danger"
        />
      </div>

      {/* Main Grid: Overall Health + AI Early Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Overall Portfolio Health Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Overall Portfolio Health
              </span>
              <StatusBadge status={metrics.overallStatus} size="sm" />
            </div>

            <div className="py-6 flex justify-center">
              <HealthGauge
                score={metrics.overallHealthScore}
                size="xl"
                statusText={metrics.overallStatus}
                showLabel={false}
              />
            </div>
          </div>

          {/* Sub-Scores Health Breakdown */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Weighted Health Breakdown
            </span>

            {[
              { label: 'Schedule Health (30%)', score: metrics.healthBreakdown.scheduleHealth },
              { label: 'Budget Health (20%)', score: metrics.healthBreakdown.budgetHealth },
              { label: 'Milestone Health (20%)', score: metrics.healthBreakdown.milestoneHealth },
              { label: 'Dependency Health (15%)', score: metrics.healthBreakdown.dependencyHealth },
              { label: 'Risk Health (15%)', score: metrics.healthBreakdown.riskHealth },
            ].map((sub, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{sub.label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        sub.score >= 80 ? 'bg-emerald-500' : sub.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      )}
                      style={{ width: `${sub.score}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-800 w-8 text-right">{sub.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Early Warning Panel & Notifications (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* AI Early Warning Alert Card */}
          {highestRisk && (
            <div className="rounded-2xl border-2 border-rose-400 bg-rose-50/50 p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  RED ALERT � AI EARLY WARNING
                </div>
                <span className="text-xs font-bold text-rose-800">
                  Health Score: {highestRisk.health.overallHealth}%
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {highestRisk.project.name}
              </h3>
              <p className="text-xs text-rose-900 font-bold mt-1">
                Potential delay: +{highestRisk.bottleneck.delayDays} days on critical path
              </p>

              <div className="mt-4 space-y-2 text-xs text-slate-700 bg-white/80 rounded-xl p-4 border border-rose-100">
                <p>
                  <strong className="text-slate-900">Main cause: </strong>
                  {highestRisk.bottleneck.department} delay of {highestRisk.bottleneck.delayDays} days on "{highestRisk.bottleneck.bottleneckActivity?.name}".
                </p>
                <p>
                  <strong className="text-slate-900">Impact: </strong>
                  {highestRisk.bottleneck.blockedActivityCount} downstream activities are actively blocked.
                </p>
                <p>
                  <strong className="text-slate-900">Recommended action: </strong>
                  Escalate statutory clearance with {highestRisk.bottleneck.department} head immediately.
                </p>
              </div>

              <div className="mt-5 flex items-center justify-end">
                <Link
                  href={`/projects/${highestRisk.project.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <span>Investigate Risk</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Live Event Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-700" />
                Live Portfolio State Notifications
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Real-Time</span>
            </div>

            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div key={n.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full mt-1.5 shrink-0',
                        n.type === 'danger' ? 'bg-rose-500' : 'bg-emerald-500'
                      )}
                    />
                    <span className="text-slate-700 font-medium">{n.text}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{n.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Projects by Sector Chart Component */}
      <ProjectsBySectorChart data={sectorData} />
    </div>
  );
}
