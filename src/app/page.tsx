import React from 'react';
import Link from 'next/link';
import { 
  Activity, 
  ShieldAlert, 
  GitFork, 
  CheckSquare, 
  ArrowRight, 
  Zap, 
  ChevronRight,
  ChevronLeft,
  Download,
  Power,
  Settings,
  Sliders,
  Layers,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden selection:bg-coral-100 selection:text-coral-900">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Graphic with Curved Frame matching reference */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 shadow-2xl p-1 border-4 border-white ring-1 ring-gray-200">
              {/* Decorative dynamic curve overlay */}
              <div className="relative h-[380px] sm:h-[440px] rounded-[36px] overflow-hidden bg-slate-900 flex flex-col justify-end p-8 text-white">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent z-10" />
                
                {/* Background high-tech infrastructure graphic */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#EE4326_1px,transparent_1px)] [background-size:20px_20px]" />

                {/* Left curve border accent */}
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full border-[12px] border-coral-600/30 blur-sm pointer-events-none" />
                <div className="absolute top-1/2 -right-8 w-24 h-48 bg-coral-600 rounded-l-full opacity-90 z-0" />

                <div className="relative z-20 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                    <Activity className="w-3.5 h-3.5" />
                    Live Project Telemetry
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                    East-West Highway Expansion
                  </h3>
                  <p className="text-xs text-gray-300 font-medium max-w-md">
                    28-day land acquisition clearance delay detected · 4 downstream activities blocked.
                  </p>
                </div>
              </div>
            </div>

            {/* Background Decorative Diagonal Accent Strip */}
            <div className="absolute -bottom-6 -left-6 w-32 h-4 bg-coral-600/80 rounded-full transform -rotate-12 pointer-events-none" />
          </div>

          {/* Right Content Section matching reference typography & layout */}
          <div className="lg:col-span-6 relative lg:pl-6">
            {/* Circular Dotted Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 dot-pattern opacity-30 rounded-full pointer-events-none" />
            <div className="absolute bottom-4 right-12 w-40 h-40 dot-pattern opacity-25 rounded-full pointer-events-none" />

            <div className="relative z-10">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-coral-600 block mb-3">
                INTELLIGENT INFRASTRUCTURE MONITOR
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12]">
                See the delay before it becomes a <span className="text-coral-600">crisis</span>.
              </h1>

              <p className="mt-6 text-sm sm:text-base text-gray-600 font-medium leading-relaxed max-w-lg">
                An integrated capital project platform that continuously calculates health scores, traces dependency chains, and recommends the precise next mitigation action.
              </p>

              {/* Pill Button with underline accent matching reference */}
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative inline-block group">
                  <Link
                    href="/projects/proj-001"
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-coral-600 hover:bg-coral-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-coral-600/30 transition-all hover:scale-105"
                  >
                    <span>Explore Flagship Demo</span>
                  </Link>
                  <div className="w-8 h-1 bg-gray-900 rounded-full mx-auto mt-1.5" />
                </div>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs uppercase tracking-wider transition-colors"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-coral-600" />
                </Link>
              </div>

              {/* Loop Progress Indicators */}
              <div className="mt-10 pt-6 border-t border-gray-100 flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                <span className="text-gray-900">MONITOR</span>
                <span className="text-coral-600">&rarr;</span>
                <span className="text-gray-900">DETECT</span>
                <span className="text-coral-600">&rarr;</span>
                <span className="text-gray-900">EXPLAIN</span>
                <span className="text-coral-600">&rarr;</span>
                <span className="text-coral-600">ACT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section ("What we're offering") matching 3-card reference layout */}
      <section className="py-20 bg-gray-50/70 border-t border-gray-100 relative">
        {/* Angled decorative pink/coral accent bars matching reference */}
        <div className="absolute top-12 left-10 w-28 h-4 bg-coral-200/80 rounded-full transform -rotate-45 pointer-events-none" />
        <div className="absolute top-16 right-10 w-32 h-4 bg-coral-200/80 rounded-full transform -rotate-45 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-coral-600 mb-2">
              <span className="w-2 h-2 rounded-full bg-coral-600" />
              <span>Core Platform Modules</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              What we&apos;re offering
            </h2>
          </div>

          {/* 3 Elevated Feature Cards matching reference */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Early Warning (Highlighted Coral Circle) */}
            <div className="bg-white rounded-3xl p-8 pt-12 text-center shadow-lg shadow-gray-200/50 border border-gray-100 hover:-translate-y-1.5 transition-all duration-300 relative flex flex-col items-center justify-between">
              {/* Floating Top Circular Badge (Coral) */}
              <div className="w-16 h-16 rounded-full bg-coral-600 text-white flex items-center justify-center shadow-lg shadow-coral-600/30 -mt-20 mb-4 border-4 border-white">
                <Download className="w-7 h-7 stroke-[2.2]" />
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-900 mb-3">
                  Early Warning Engine
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs mb-8">
                  Deterministic weighted health score computation across schedule, budget, milestone, dependency, and active project risks.
                </p>
              </div>

              {/* Bottom Circle Arrow Button */}
              <Link
                href="/dashboard"
                className="w-10 h-10 rounded-full bg-coral-600 text-white flex items-center justify-center hover:bg-coral-700 shadow-md transition-transform hover:scale-110"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>

            {/* Card 2: Dependency Intelligence (White Circle) */}
            <div className="bg-white rounded-3xl p-8 pt-12 text-center shadow-lg shadow-gray-200/50 border border-gray-100 hover:-translate-y-1.5 transition-all duration-300 relative flex flex-col items-center justify-between">
              {/* Floating Top Circular Badge (White with dark icon) */}
              <div className="w-16 h-16 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-md border-4 border-gray-50 -mt-20 mb-4">
                <Power className="w-7 h-7 stroke-[2.2]" />
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-900 mb-3">
                  Dependency Intelligence
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs mb-8">
                  Recursive DAG traversal identifies upstream bottleneck nodes and traces cascading downstream impact before milestones fail.
                </p>
              </div>

              {/* Bottom Circle Arrow Button */}
              <Link
                href="/projects/proj-001"
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-coral-600 hover:text-white shadow-sm transition-all hover:scale-110"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>

            {/* Card 3: Action Recommendations (White Circle) */}
            <div className="bg-white rounded-3xl p-8 pt-12 text-center shadow-lg shadow-gray-200/50 border border-gray-100 hover:-translate-y-1.5 transition-all duration-300 relative flex flex-col items-center justify-between">
              {/* Floating Top Circular Badge (White with dark icon) */}
              <div className="w-16 h-16 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-md border-4 border-gray-50 -mt-20 mb-4">
                <Settings className="w-7 h-7 stroke-[2.2]" />
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-900 mb-3">
                  Action & What-If Simulation
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs mb-8">
                  Live scenario sliders recalculate delivery schedules and execute one-click nodal assignments, escalations, and automated alerts.
                </p>
              </div>

              {/* Bottom Circle Arrow Button */}
              <Link
                href="/actions"
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-coral-600 hover:text-white shadow-sm transition-all hover:scale-110"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
