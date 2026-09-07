'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Project, ProjectStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { calculateHealthScore } from '@/lib/calculations/health-score';
import { detectBottleneck } from '@/lib/calculations/dependency-graph';
import { formatINR, formatPercent } from '@/lib/calculations/currency';
import { NewProjectModal } from '@/components/project/NewProjectModal';
import { 
  Search, 
  Filter, 
  MapPin, 
  ArrowUpRight, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  TrendingDown,
  Building2,
  SlidersHorizontal,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ON TRACK' | 'AT RISK' | 'DELAYED'>('ALL');
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) {
      console.error('Failed to load projects', e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sectors = useMemo(() => {
    const s = new Set<string>();
    projects.forEach(p => s.add(p.sector));
    return ['ALL', ...Array.from(s)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesStatus = filter === 'ALL' || p.health.status === filter;
      const matchesSector = sectorFilter === 'ALL' || p.sector === sectorFilter;
      const matchesSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase()) ||
        p.sector.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSector && matchesSearch;
    });
  }, [projects, filter, sectorFilter, search]);

  const counts = useMemo(() => {
    return {
      ALL: projects.length,
      'ON TRACK': projects.filter(p => p.health?.status === 'ON TRACK').length,
      'AT RISK': projects.filter(p => p.health?.status === 'AT RISK').length,
      'DELAYED': projects.filter(p => p.health?.status === 'DELAYED').length,
    };
  }, [projects]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={(newProj) => {
          setProjects(prev => [newProj, ...prev]);
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Projects Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Search, filter, assign, and drill into live infrastructure health telemetry
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Add / Assign Project Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add / Assign Project</span>
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
            {(['ALL', 'ON TRACK', 'AT RISK', 'DELAYED'] as const).map((tab) => (
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
                {tab === 'ALL' ? 'All' : tab} ({counts[tab] || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Sector Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by project name, code (e.g. PP-001), sector, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
        >
          {sectors.map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Sectors' : s}</option>
          ))}
        </select>
      </div>

      {/* Projects Table / Card View */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-medium">
          Loading project portfolio analytics...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-sm font-bold text-slate-700">No projects match your filter criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the status filter or search term.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Sector</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Progress (Act / Pln)</th>
                  <th className="py-3.5 px-4">Budget (Spent / Tot)</th>
                  <th className="py-3.5 px-4">Schedule Variance</th>
                  <th className="py-3.5 px-4 text-center">Health</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                  <th className="py-3.5 px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProjects.map((p) => {
                  const health = p.health;
                  const isFlagship = p.id === 'proj-001';

                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        'hover:bg-slate-50/80 transition-colors group',
                        isFlagship && 'bg-teal-50/20'
                      )}
                    >
                      {/* Project Name & Code */}
                      <td className="py-4 px-4">
                        <Link href={`/projects/${p.id}`} className="block">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {p.name}
                            </span>
                            {isFlagship && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                                Demo Flagship
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-400 font-mono">{p.code}</span>
                            <span className="text-[11px] text-slate-500 font-medium">· Mgr: {p.manager}</span>
                          </div>
                        </Link>
                      </td>

                      {/* Sector */}
                      <td className="py-4 px-4">
                        <span className="text-slate-700">{p.sector}</span>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{p.location}</span>
                        </div>
                      </td>

                      {/* Progress bar */}
                      <td className="py-4 px-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-900">{p.progress}%</span>
                          <span className="text-slate-400">Target: {p.plannedProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              p.progress >= p.plannedProgress ? 'bg-emerald-500' : 'bg-teal-600'
                            )}
                            style={{ width: `${Math.min(100, p.progress)}%` }}
                          />
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{formatINR(p.spent)}</div>
                        <span className="text-[11px] text-slate-400 font-normal">of {formatINR(p.budget)}</span>
                      </td>

                      {/* Schedule Variance */}
                      <td className="py-4 px-4">
                        {health.scheduleVarianceDays > 0 ? (
                          <div className="flex items-center gap-1 text-rose-700 font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>+{health.scheduleVarianceDays} days delay</span>
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-semibold">On Schedule</span>
                        )}
                      </td>

                      {/* Health Score */}
                      <td className="py-4 px-4 text-center">
                        <span className={cn(
                          'inline-flex items-center justify-center font-extrabold px-2.5 py-1 rounded-lg text-xs',
                          health.overallHealth >= 80 ? 'bg-emerald-100 text-emerald-800' : health.overallHealth >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        )}>
                          {health.overallHealth}%
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-right">
                        <StatusBadge status={health.status} size="sm" />
                      </td>

                      {/* Action Chevron */}
                      <td className="py-4 px-3 text-right">
                        <Link
                          href={`/projects/${p.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100 inline-flex transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
