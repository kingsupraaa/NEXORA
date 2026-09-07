import React from 'react';
import Link from 'next/link';
import { 
  Activity, 
  ShieldAlert, 
  GitFork, 
  CheckSquare, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  SlidersHorizontal,
  Compass,
  Building2,
  TrendingDown
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-200/80 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#0F766E_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              Next-Gen Infrastructure Intelligence
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              See the delay before it becomes a <span className="text-rose-600 underline decoration-rose-200 decoration-wavy">crisis</span>.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              An intelligent project-monitoring platform that detects risks, explains bottlenecks across complex dependency chains, and recommends the precise next action.
            </p>

            {/* CTA Group */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/projects/proj-001"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md shadow-teal-800/20 transition-all hover:scale-[1.02]"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Try Live Demo (East-West Highway)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-300 transition-colors"
              >
                <Activity className="w-4 h-4 text-teal-700" />
                <span>Open Portfolio Dashboard</span>
              </Link>
            </div>

            {/* Loop statement */}
            <div className="mt-12 flex items-center justify-center gap-2 sm:gap-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">MONITOR</span>
              <span>&rarr;</span>
              <span className="px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700">DETECT</span>
              <span>&rarr;</span>
              <span className="px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-teal-700">EXPLAIN</span>
              <span>&rarr;</span>
              <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">ACT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for high-stakes capital projects
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Deterministic mathematics and DAG traversal deliver infallible visibility into project health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Early Warning */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              AI Early Warning Engine
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Surfaces distress long before milestone collapse. Computes composite weighted health scores (Schedule 30%, Budget 20%, Milestones 20%, Dependencies 15%, Risk 15%) without black-box magic.
            </p>
          </div>

          {/* Card 2: Dependency Intelligence */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <GitFork className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Dependency DAG Traversal
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Graph traversal isolates the single upstream bottleneck blocking the largest chain of downstream work packages, pinpointing exact departmental accountability.
            </p>
          </div>

          {/* Card 3: Action Recommendations & What-If */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <SlidersHorizontal className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              What-If Simulation & Actions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Interactive scenario sliders recompute schedule recovery, health scores, and projected delivery dates live. Trigger one-click escalation and assignment with real state mutations.
            </p>
          </div>
        </div>

        {/* Flagship Callout Banner */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white p-8 sm:p-10 shadow-lg border border-teal-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Featured Flagship Demo Asset
            </span>
            <h4 className="text-2xl font-black mt-1">East-West Highway Expansion (Kolkata)</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Explore how a 28-day land acquisition approval delay by the Revenue Department creates a ripple effect blocking 4 downstream activities and ballooning project delay to 90 days.
            </p>
          </div>

          <Link
            href="/projects/proj-001"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md transition-colors"
          >
            <span>Open Flagship Control Room</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
