'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Project, ProjectStatus, RiskSeverity } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatINR, formatPercent } from '@/lib/calculations/currency';
import { NewProjectModal } from '@/components/project/NewProjectModal';
import { 
  Search, 
  Filter, 
  MapPin, 
  ArrowUpRight, 
  AlertCircle, 
  AlertTriangle,
  Clock, 
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  CheckSquare,
  Building2,
  SlidersHorizontal,
  PlusCircle,
  FolderKanban,
  ArrowRight,
  Flame,
  Layers,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to calculate project-level risk classification
function getProjectRiskInfo(project: any): { 
  level: 'Critical' | 'High' | 'Medium' | 'Low'; 
  activeCount: number; 
  criticalCount: number;
} {
  const activeRisks = (project.risks || []).filter((r: any) => r.status !== 'Resolved');
  const criticalCount = activeRisks.filter((r: any) => r.severity === 'Critical').length;
  const highCount = activeRisks.filter((r: any) => r.severity === 'High').length;
  const mediumCount = activeRisks.filter((r: any) => r.severity === 'Medium').length;

  let level: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
  if (criticalCount > 0 || (project.health && project.health.overallHealth < 60)) {
    level = 'Critical';
  } else if (highCount > 0 || (project.health && (project.health.overallHealth < 80 || project.health.riskHealth < 65))) {
    level = 'High';
  } else if (mediumCount > 0 || activeRisks.length > 0) {
    level = 'Medium';
  }

  return { level, activeCount: activeRisks.length, criticalCount };
}

function ProjectsContent() {
  const searchParams = useSearchParams();
  const initialStatusParam = searchParams.get('status')?.toUpperCase() || 'ALL';
  const initialRiskParam = searchParams.get('risk') || 'ALL';
  const initialViewParam = searchParams.get('view') === 'risks' ? 'RISKS' : 'PORTFOLIO';
  const initialHighValueParam = searchParams.get('highValue') === 'true';

  const [projects, setProjects] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'PORTFOLIO' | 'RISKS'>(initialViewParam);
  const [statusFilter, setStatusFilter] = useState<string>(
    ['ALL', 'ON TRACK', 'AT RISK', 'DELAYED'].includes(initialStatusParam) ? initialStatusParam : 'ALL'
  );
  const [riskFilter, setRiskFilter] = useState<string>(initialRiskParam);
  const [highValueOnly, setHighValueOnly] = useState<boolean>(initialHighValueParam);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync state if URL query params change
  useEffect(() => {
    const status = searchParams.get('status')?.toUpperCase();
    if (status && ['ALL', 'ON TRACK', 'AT RISK', 'DELAYED'].includes(status)) {
      setStatusFilter(status);
    }
    const risk = searchParams.get('risk');
    if (risk) {
      setRiskFilter(risk);
    }
    const highVal = searchParams.get('highValue');
    if (highVal !== null) {
      setHighValueOnly(highVal === 'true');
    }
    const view = searchParams.get('view');
    if (view === 'risks') {
      setActiveView('RISKS');
    } else if (view === 'projects') {
      setActiveView('PORTFOLIO');
    }
  }, [searchParams]);

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

  // Projects with calculated risk metrics
  const projectsWithRisk = useMemo(() => {
    return projects.map(p => ({
      ...p,
      riskInfo: getProjectRiskInfo(p)
    }));
  }, [projects]);

  // Filtered projects list
  const filteredProjects = useMemo(() => {
    return projectsWithRisk.filter(p => {
      const matchesStatus = statusFilter === 'ALL' || p.health.status === statusFilter;
      const matchesRisk = riskFilter === 'ALL' || p.riskInfo.level.toLowerCase() === riskFilter.toLowerCase();
      const matchesSector = sectorFilter === 'ALL' || p.sector === sectorFilter;
      const matchesHighValue = !highValueOnly || (p.budget && p.budget >= 1000);
      const matchesSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase()) ||
        p.sector.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesRisk && matchesSector && matchesHighValue && matchesSearch;
    });
  }, [projectsWithRisk, statusFilter, riskFilter, sectorFilter, highValueOnly, search]);

  // Aggregate all portfolio risks for the integrated Risk Registry view
  const allPortfolioRisks = useMemo(() => {
    const list: any[] = [];
    projects.forEach(p => {
      (p.risks || []).forEach((r: any) => {
        list.push({
          ...r,
          projectId: p.id,
          projectName: p.name,
          projectCode: p.code,
          projectSector: p.sector
        });
      });
    });
    return list;
  }, [projects]);

  const filteredRisks = useMemo(() => {
    return allPortfolioRisks.filter(r => {
      const matchesRiskLevel = riskFilter === 'ALL' || r.severity.toLowerCase() === riskFilter.toLowerCase();
      const matchesSearch = 
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.projectName.toLowerCase().includes(search.toLowerCase()) ||
        r.projectCode.toLowerCase().includes(search.toLowerCase()) ||
        r.owner.toLowerCase().includes(search.toLowerCase());
      return matchesRiskLevel && matchesSearch;
    });
  }, [allPortfolioRisks, riskFilter, search]);

  const counts = useMemo(() => {
    return {
      ALL: projects.length,
      'ON TRACK': projects.filter(p => p.health?.status === 'ON TRACK').length,
      'AT RISK': projects.filter(p => p.health?.status === 'AT RISK').length,
      'DELAYED': projects.filter(p => p.health?.status === 'DELAYED').length,
      criticalRisks: allPortfolioRisks.filter(r => r.severity === 'Critical').length,
      highRisks: allPortfolioRisks.filter(r => r.severity === 'High').length,
      mediumRisks: allPortfolioRisks.filter(r => r.severity === 'Medium').length,
      lowRisks: allPortfolioRisks.filter(r => r.severity === 'Low').length,
    };
  }, [projects, allPortfolioRisks]);

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

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-coral-600" />
            <span>Projects & Risk Intelligence</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Unified management hub for active projects, risk levels, and direct task delegation.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Add / Assign Project Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-coral-600 hover:bg-coral-700 text-white text-xs font-bold shadow-md shadow-coral-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add / Assign Project</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Portfolio Overview vs. Risk Intelligence Registry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 self-start">
          <button
            onClick={() => setActiveView('PORTFOLIO')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
              activeView === 'PORTFOLIO'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Layers className="w-4 h-4 text-coral-600" />
            <span>Project Portfolio</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveView('RISKS')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
              activeView === 'RISKS'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Risk Intelligence Registry</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
              {allPortfolioRisks.length}
            </span>
          </button>
        </div>

        {/* Status / Scope Indicators */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>Active Risk Profile:</span>
          <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            {counts.criticalRisks} Critical
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            {counts.highRisks} High
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeView === 'PORTFOLIO' 
              ? "Search by project name, code (e.g. PP-001), sector, or city..."
              : "Search risks by title, project code, or mitigation owner..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
          {/* Status Filter (Portfolio View) */}
          {activeView === 'PORTFOLIO' && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto">
              {(['ALL', 'ON TRACK', 'AT RISK', 'DELAYED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                    statusFilter === tab
                      ? 'bg-coral-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  )}
                >
                  {tab === 'ALL' ? 'All Status' : tab} ({counts[tab] || 0})
                </button>
              ))}
            </div>
          )}

          {/* Risk Level Filter Dropdown */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className={cn(
              'px-3 py-2.5 rounded-xl border text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-coral-500',
              riskFilter !== 'ALL' ? 'border-coral-400 text-coral-700 bg-coral-50/30' : 'border-slate-200 text-slate-700'
            )}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Critical">Critical Risk ({counts.criticalRisks})</option>
            <option value="High">High Risk ({counts.highRisks})</option>
            <option value="Medium">Medium Risk ({counts.mediumRisks})</option>
            <option value="Low">Low Risk ({counts.lowRisks})</option>
          </select>

          {/* Sector Filter */}
          {activeView === 'PORTFOLIO' && (
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500"
            >
              {sectors.map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Sectors' : s}</option>
              ))}
            </select>
          )}

          {/* High Value Filter Button */}
          {activeView === 'PORTFOLIO' && (
            <button
              onClick={() => setHighValueOnly(!highValueOnly)}
              className={cn(
                'px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5',
                highValueOnly
                  ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              )}
            >
              <Zap className={cn('w-3.5 h-3.5', highValueOnly ? 'text-amber-200 fill-amber-200' : 'text-amber-500')} />
              <span>High Value (≥ ₹1,000 Cr)</span>
            </button>
          )}

          {(statusFilter !== 'ALL' || riskFilter !== 'ALL' || sectorFilter !== 'ALL' || highValueOnly || search) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setRiskFilter('ALL');
                setSectorFilter('ALL');
                setHighValueOnly(false);
                setSearch('');
              }}
              className="px-2.5 py-1.5 text-xs font-bold text-coral-600 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-medium">
          Loading project telemetry and risk registry...
        </div>
      ) : activeView === 'PORTFOLIO' ? (
        /* ======================== TAB 1: PROJECT PORTFOLIO VIEW ======================== */
        filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-sm font-bold text-slate-700">No projects match your filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the status or risk level filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-3">Sector</th>
                    <th className="py-3.5 px-3">Location</th>
                    <th className="py-3.5 px-3">Risk Level</th>
                    <th className="py-3.5 px-4">Progress (Act / Pln)</th>
                    <th className="py-3.5 px-3">Budget</th>
                    <th className="py-3.5 px-3">Schedule Variance</th>
                    <th className="py-3.5 px-3 text-center">Health</th>
                    <th className="py-3.5 px-3 text-right">Status</th>
                    <th className="py-3.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredProjects.map((p) => {
                    const health = p.health;
                    const riskInfo = p.riskInfo;
                    const isFlagship = p.id === 'proj-001';

                    return (
                      <tr
                        key={p.id}
                        className={cn(
                          'hover:bg-slate-50/80 transition-colors group',
                          isFlagship && 'bg-coral-50/15'
                        )}
                      >
                        {/* Project Name & Code */}
                        <td className="py-4 px-4">
                          <Link href={`/projects/${p.id}`} className="block">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 group-hover:text-coral-600 transition-colors">
                                {p.name}
                              </span>
                              {isFlagship && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-coral-100 text-coral-800 border border-coral-200">
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
                        <td className="py-4 px-3">
                          <span className="text-slate-700">{p.sector}</span>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{p.location}</span>
                          </div>
                        </td>

                        {/* NEW: RISK LEVEL COLUMN */}
                        <td className="py-4 px-3">
                          <div className="flex flex-col gap-0.5">
                            <span className={cn(
                              'inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full w-fit',
                              riskInfo.level === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                              riskInfo.level === 'High' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                              riskInfo.level === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            )}>
                              {riskInfo.level === 'Critical' && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                              {riskInfo.level === 'High' && <AlertTriangle className="w-3 h-3 text-orange-600" />}
                              {riskInfo.level === 'Medium' && <AlertCircle className="w-3 h-3 text-amber-600" />}
                              {riskInfo.level === 'Low' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              <span>{riskInfo.level} Risk</span>
                            </span>
                            <span className="text-[10px] text-slate-400 pl-0.5">
                              {riskInfo.activeCount} active {riskInfo.activeCount === 1 ? 'risk' : 'risks'}
                            </span>
                          </div>
                        </td>

                        {/* Progress bar */}
                        <td className="py-4 px-4 min-w-[130px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-slate-900">{p.progress}%</span>
                            <span className="text-slate-400">Target: {p.plannedProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                p.progress >= p.plannedProgress ? 'bg-emerald-500' : 'bg-coral-600'
                              )}
                              style={{ width: `${Math.min(100, p.progress)}%` }}
                            />
                          </div>
                        </td>

                        {/* Budget */}
                        <td className="py-4 px-3">
                          <div className="font-bold text-slate-900">{formatINR(p.spent)}</div>
                          <span className="text-[10px] text-slate-400 font-normal">of {formatINR(p.budget)}</span>
                        </td>

                        {/* Schedule Variance */}
                        <td className="py-4 px-3">
                          {health.scheduleVarianceDays > 0 ? (
                            <div className="flex items-center gap-1 text-rose-700 font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              <span>+{health.scheduleVarianceDays}d delay</span>
                            </div>
                          ) : (
                            <span className="text-emerald-700 font-semibold">On Schedule</span>
                          )}
                        </td>

                        {/* Health Score */}
                        <td className="py-4 px-3 text-center">
                          <span className={cn(
                            'inline-flex items-center justify-center font-extrabold px-2 py-0.5 rounded-lg text-xs',
                            health.overallHealth >= 80 ? 'bg-emerald-100 text-emerald-800' : 
                            health.overallHealth >= 60 ? 'bg-amber-100 text-amber-800' : 
                            'bg-rose-100 text-rose-800'
                          )}>
                            {health.overallHealth}%
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-3 text-right">
                          <StatusBadge status={health.status} size="sm" />
                        </td>

                        {/* Direct Assign & Open Actions Button */}
                        <td className="py-4 px-3 text-center">
                          <Link
                            href={`/projects/${p.id}#actions`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-coral-50 hover:bg-coral-100 text-coral-700 text-[11px] font-bold border border-coral-200 transition-colors"
                            title="Assign tasks & manage action items inside this project"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Tasks</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* ======================== TAB 2: COMBINED RISK REGISTRY VIEW ======================== */
        <div className="space-y-8">
          {[
            { level: 'Critical', title: 'Critical Severity Risks', badgeBg: 'bg-rose-600', border: 'border-rose-300' },
            { level: 'High', title: 'High Severity Risks', badgeBg: 'bg-orange-500', border: 'border-orange-200' },
            { level: 'Medium', title: 'Medium Severity Risks', badgeBg: 'bg-amber-500', border: 'border-amber-200' },
            { level: 'Low', title: 'Low Severity Risks', badgeBg: 'bg-emerald-500', border: 'border-emerald-200' }
          ].map(grp => {
            const groupRisks = filteredRisks.filter(r => r.severity.toLowerCase() === grp.level.toLowerCase());
            if (groupRisks.length === 0) return null;

            return (
              <div key={grp.level} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-black px-2.5 py-0.5 rounded-full text-white uppercase', grp.badgeBg)}>
                      {grp.level}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{grp.title}</h2>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {groupRisks.length} {groupRisks.length === 1 ? 'Risk Item' : 'Risk Items'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupRisks.map(risk => (
                    <div
                      key={risk.id}
                      className={cn(
                        'bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between',
                        grp.border
                      )}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <Link
                            href={`/projects/${risk.projectId}`}
                            className="text-xs font-bold text-coral-600 hover:underline flex items-center gap-1"
                          >
                            <span>{risk.projectName}</span>
                            <span className="text-slate-400 font-mono">({risk.projectCode})</span>
                          </Link>
                          <StatusBadge status={risk.status} size="sm" />
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                          {risk.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
                          <span>Owner: <strong className="text-slate-700">{risk.owner}</strong></span>
                          <span>Probability: <strong className="text-slate-700">{risk.probability}</strong></span>
                          <span>Impact: <strong className="text-slate-700">{risk.impact}</strong></span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                            Mitigation Directive:
                          </span>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed">
                            {risk.recommendedAction}
                          </p>
                        </div>

                        <Link
                          href={`/projects/${risk.projectId}#actions`}
                          className="shrink-0 px-3 py-1.5 rounded-xl bg-coral-600 hover:bg-coral-700 text-white text-xs font-bold shadow-sm transition-colors inline-flex items-center gap-1"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Assign Task</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500 font-medium">
        Loading Projects Portfolio & Risk Telemetry...
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}
