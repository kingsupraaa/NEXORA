'use client';

import React, { useState, useEffect } from 'react';
import { PortfolioMetrics, Project } from '@/types';
import { calculateHealthScore } from '@/lib/calculations/health-score';
import { formatINR } from '@/lib/calculations/currency';
import { 
  BarChart3, 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  CheckCircle2, 
  PieChart as PieIcon, 
  Layers,
  FileText,
  X
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        setProjects(data.projects || []);
        setMetrics(data.metrics || null);
      } catch (err) {
        console.error('Failed to load analytics data', err);
      }
    }
    load();
  }, []);

  // Compute status distribution for Donut chart
  const statusData = [
    { name: 'On Track', value: metrics?.onTrackCount || 0, color: '#059669' },
    { name: 'At Risk', value: metrics?.atRiskCount || 0, color: '#D97706' },
    { name: 'Delayed', value: metrics?.delayedCount || 0, color: '#E11D48' },
  ];

  // Compute average health by sector
  const sectorHealthMap: Record<string, { totalHealth: number; count: number; totalBudget: number }> = {};
  projects.forEach(p => {
    const h = calculateHealthScore(p);
    if (!sectorHealthMap[p.sector]) {
      sectorHealthMap[p.sector] = { totalHealth: 0, count: 0, totalBudget: 0 };
    }
    sectorHealthMap[p.sector].totalHealth += h.overallHealth;
    sectorHealthMap[p.sector].count += 1;
    sectorHealthMap[p.sector].totalBudget += p.budget;
  });

  const avgHealthBySector = Object.entries(sectorHealthMap).map(([sector, val]) => ({
    sector,
    avgHealth: Math.round(val.totalHealth / val.count),
    budget: val.totalBudget
  })).sort((a, b) => b.avgHealth - a.avgHealth);

  const budgetBySector = [...avgHealthBySector].sort((a, b) => b.budget - a.budget);

  async function handleGenerateSummary() {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/summary', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Failed to generate summary', err);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-teal-700" />
            Portfolio Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Cross-sector health distributions, budget allocations, and executive intelligence
          </p>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md shadow-teal-800/20 transition-all hover:scale-[1.02] disabled:opacity-60 self-start sm:self-auto"
        >
          <Sparkles className={cn('w-4 h-4 text-amber-300', isGenerating && 'animate-spin')} />
          <span>{isGenerating ? 'Generating Summary...' : 'Generate Executive Summary'}</span>
        </button>
      </div>

      {/* Grid: Donut + Sector Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Status Distribution Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Portfolio Status Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Proportion of projects across delivery health bands
            </p>
          </div>

          <div className="h-64 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around pt-3 border-t border-slate-100 text-xs font-bold">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-700">{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Average Health by Sector Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Average Health by Sector
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative health index (0×100) computed across infrastructure categories
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={avgHealthBySector} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="sector" 
                  tick={{ fontSize: 10, fill: '#64748B' }} 
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val}%`, 'Avg Health']}
                />
                <Bar 
                  dataKey="avgHealth" 
                  name="Health Score" 
                  fill="#0F766E" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget Allocation by Sector Horizontal Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <div className="pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Budget Allocation by Sector (? Crores)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Total sanctioned capital expenditure distributed across sectors
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={budgetBySector}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis 
                dataKey="sector" 
                type="category" 
                tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`?${val.toLocaleString('en-IN')} Cr`, 'Sanctioned Budget']}
              />
              <Bar dataKey="budget" fill="#0F766E" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Executive Summary Modal / Card */}
      {showModal && summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900">Executive Portfolio Briefing</h3>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {summary.isAI ? 'AI Synthesized Brief' : 'Deterministic Intelligence'} × {new Date(summary.generatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-950 leading-relaxed mb-5">
              {summary.headline}
            </div>

            {/* Key Insights */}
            <div className="mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Key Analytical Insights
              </h4>
              <div className="space-y-2">
                {summary.keyInsights.map((insight: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                    <p>{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Strategic Next Actions
              </h4>
              <div className="space-y-2">
                {summary.strategicRecommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/70 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Briefing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
