import React from 'react';
import Link from 'next/link';
import { getAllProjects } from '@/lib/db/store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProjectRisk } from '@/types';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const revalidate = 0;

export default async function RisksPage() {
  const projects = getAllProjects();

  // Aggregate all risks with project info
  const allRisks: (ProjectRisk & { projectId: string; projectName: string; projectCode: string })[] = [];

  for (const p of projects) {
    for (const r of p.risks) {
      allRisks.push({
        ...r,
        projectId: p.id,
        projectName: p.name,
        projectCode: p.code
      });
    }
  }

  const criticalRisks = allRisks.filter(r => r.severity === 'Critical');
  const highRisks = allRisks.filter(r => r.severity === 'High');
  const mediumRisks = allRisks.filter(r => r.severity === 'Medium');
  const lowRisks = allRisks.filter(r => r.severity === 'Low');

  const groups = [
    { title: 'Critical Severity Risks', severity: 'Critical', items: criticalRisks, badgeBg: 'bg-rose-600', border: 'border-rose-200' },
    { title: 'High Severity Risks', severity: 'High', items: highRisks, badgeBg: 'bg-rose-500', border: 'border-rose-100' },
    { title: 'Medium Severity Risks', severity: 'Medium', items: mediumRisks, badgeBg: 'bg-amber-500', border: 'border-amber-100' },
    { title: 'Low Severity Risks', severity: 'Low', items: lowRisks, badgeBg: 'bg-emerald-500', border: 'border-emerald-100' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-600" />
            Risk Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Active risk log categorized by severity, probability, impact, and mitigation actions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/actions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <span>Take Action on Risks</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Risk Severity Groups */}
      <div className="space-y-10">
        {groups.map((grp) => {
          if (grp.items.length === 0) return null;
          return (
            <div key={grp.severity} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <span className={cn('text-xs font-black px-2.5 py-0.5 rounded-full text-white uppercase', grp.badgeBg)}>
                    {grp.severity}
                  </span>
                  <h2 className="text-base font-bold text-slate-900">{grp.title}</h2>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {grp.items.length} {grp.items.length === 1 ? 'Risk' : 'Risks'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grp.items.map((risk) => (
                  <div
                    key={risk.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <Link
                          href={`/projects/${risk.projectId}`}
                          className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                        >
                          <span>{risk.projectName}</span>
                          <span className="text-slate-400 font-mono">({risk.projectCode})</span>
                        </Link>
                        <StatusBadge status={risk.status} size="sm" />
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                        {risk.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 flex-wrap">
                        <span>Owner: <strong className="text-slate-700">{risk.owner}</strong></span>
                        <span>Probability: <strong className="text-slate-700">{risk.probability}</strong></span>
                        <span>Impact: <strong className="text-slate-700">{risk.impact}</strong></span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Recommended Action:
                      </span>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {risk.recommendedAction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
