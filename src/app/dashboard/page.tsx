'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  RefreshCw, 
  RotateCw, 
  ArrowRight, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  IndianRupee,
  Layers,
  ChevronRight,
  TrendingUp,
  Search,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Intervention Queue data representing high-priority infrastructure projects
interface InterventionProject {
  id: string;
  rank: number;
  name: string;
  code?: string;
  sector: string;
  riskScore: number;
  costOverrun: string;
  delayDays: number;
  progress: string;
  targetId?: string;
}

const INITIAL_QUEUE: InterventionProject[] = [
  {
    id: 'q-1',
    rank: 1,
    name: 'BELAPUR-SEAWOOD-URAN ELECTRIFIED DOUBLE LINE(MTP) (-) (-) (2,484.97)',
    code: 'PP-026',
    sector: 'Bimanbander (Mtp) -',
    riskScore: 99.8,
    costOverrun: '263.5%',
    delayDays: 7401,
    progress: 'Not reported',
    targetId: 'proj-026'
  },
  {
    id: 'q-2',
    rank: 2,
    name: 'THIRUMAILA - VELACHERY : MASS RAPID TRANSIT SYSTEM (PHASE II)',
    code: 'PP-003',
    sector: 'Line Gc Alonwith Electrif -',
    riskScore: 99.5,
    costOverrun: '309.6%',
    delayDays: 6770,
    progress: 'Not reported',
    targetId: 'proj-003'
  },
  {
    id: 'q-3',
    rank: 3,
    name: 'TOLLYGANJ-GARIA WITH EXTENSION TO DUM DUM- NOAPARA AND NOAPARA-NSCB AIRPORT(MTP)',
    code: 'PP-001',
    sector: 'Dharmavaram Of South Central Railway - - -',
    riskScore: 99.5,
    costOverrun: '301.7%',
    delayDays: 3017,
    progress: 'Not reported',
    targetId: 'proj-001'
  },
  {
    id: 'q-4',
    rank: 4,
    name: 'TRICHY - KARUR ELEVATED HIGH SPEED VIADUCT LINK',
    code: 'PP-004',
    sector: 'Southern Railway -',
    riskScore: 99.2,
    costOverrun: '70.6%',
    delayDays: 5726,
    progress: 'Not reported',
    targetId: 'proj-004'
  },
  {
    id: 'q-5',
    rank: 5,
    name: 'EAST-WEST HIGHWAY CORRIDOR 4-LANE EXPANSION',
    code: 'PP-001',
    sector: 'Roads & Highways Dept',
    riskScore: 98.4,
    costOverrun: '141.7%',
    delayDays: 28,
    progress: '42%',
    targetId: 'proj-001'
  },
  {
    id: 'q-6',
    rank: 6,
    name: 'CENTRAL MULTI-SPECIALTY HOSPITAL MEDICAL SUPERSTRUCTURE',
    code: 'PP-002',
    sector: 'Healthcare & Public Health',
    riskScore: 94.2,
    costOverrun: '64.6%',
    delayDays: 14,
    progress: '70%',
    targetId: 'proj-002'
  },
  {
    id: 'q-7',
    rank: 7,
    name: 'WESTERN WIND ENERGY SCADA TRANSMISSION INTEGRATION',
    code: 'PP-005',
    sector: 'Renewable Energy Grid',
    riskScore: 91.8,
    costOverrun: '48.2%',
    delayDays: 45,
    progress: '55%',
    targetId: 'proj-005'
  }
];

export default function DashboardPage() {
  const [sector, setSector] = useState<string>('All Sectors');
  const [riskLevel, setRiskLevel] = useState<string>('All Levels');
  const [trainingFrom, setTrainingFrom] = useState<number>(2001);
  const [trainingTo, setTrainingTo] = useState<number>(2021);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRangeLoaded, setIsRangeLoaded] = useState<boolean>(false);

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return INITIAL_QUEUE.filter(item => {
      const matchSector = sector === 'All Sectors' || item.sector.toLowerCase().includes(sector.toLowerCase()) || sector.toLowerCase().includes(item.sector.toLowerCase());
      const matchRisk = riskLevel === 'All Levels' || 
        (riskLevel === 'Critical' && item.riskScore >= 98) ||
        (riskLevel === 'High' && item.riskScore >= 92 && item.riskScore < 98) ||
        (riskLevel === 'Medium' && item.riskScore >= 75 && item.riskScore < 92) ||
        (riskLevel === 'Low' && item.riskScore < 75);
      return matchSector && matchRisk;
    });
  }, [sector, riskLevel]);

  // Handle Refresh button
  function handleRefresh() {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  }

  function handleLoadRange() {
    setIsRangeLoaded(true);
    setTimeout(() => {
      setIsRangeLoaded(false);
    }, 1200);
  }

  // Donut chart calculations
  const totalProjectsCount = 728;
  const criticalCount = 374;
  const highCount = 211;
  const mediumCount = 110;
  const lowCount = 33;

  // SVG Donut circumference calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const strokeWidth = 24;

  const criticalLength = (criticalCount / totalProjectsCount) * circumference;
  const highLength = (highCount / totalProjectsCount) * circumference;
  const mediumLength = (mediumCount / totalProjectsCount) * circumference;
  const lowLength = (lowCount / totalProjectsCount) * circumference;

  const criticalOffset = 0;
  const highOffset = -criticalLength;
  const mediumOffset = -(criticalLength + highLength);
  const lowOffset = -(criticalLength + highLength + mediumLength);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      {/* Top Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium flex-wrap">
            <span><strong className="text-slate-700">Data Range:</strong> 2022–2025</span>
            <span className="text-slate-300">|</span>
            <span><strong className="text-slate-700">Data Source:</strong> official PAIMANA public-project subset</span>
          </div>
        </div>

        {/* Live Badge & Refresh Button */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </div>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3.5">
          {/* Sector Filter */}
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Sector
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow"
            >
              <option value="All Sectors">All Sectors</option>
              <option value="Railways">Railways (MTP / Line Gc)</option>
              <option value="Roads">Roads & Highways</option>
              <option value="Metro">Mass Rapid Transit (Metro)</option>
              <option value="Healthcare">Healthcare & Superstructure</option>
              <option value="Renewable Energy">Renewable Energy & Power</option>
              <option value="Water">Water Supply & Sanitation</option>
              <option value="Urban Development">Urban Development</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="w-full sm:w-44">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Risk Level
            </label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow"
            >
              <option value="All Levels">All Levels</option>
              <option value="Critical">Critical Risk (98+)</option>
              <option value="High">High Risk (92 - 97)</option>
              <option value="Medium">Medium Risk (75 - 91)</option>
              <option value="Low">Low Risk (&lt; 75)</option>
            </select>
          </div>

          {/* Training From */}
          <div className="w-full sm:w-28">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Training From
            </label>
            <input
              type="number"
              value={trainingFrom}
              onChange={(e) => setTrainingFrom(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Training To */}
          <div className="w-full sm:w-28">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Training To
            </label>
            <input
              type="number"
              value={trainingTo}
              onChange={(e) => setTrainingTo(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Load saved range button */}
          <div className="shrink-0">
            <button
              onClick={handleLoadRange}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1c2938] hover:bg-[#141e29] text-white text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              {isRangeLoaded ? 'Loaded!' : 'Load saved range'}
            </button>
          </div>
        </div>

        {/* Filter subcaption */}
        <p className="text-[11px] text-slate-400 font-medium mt-3 pt-3 border-t border-slate-100">
          Training {trainingFrom}–{trainingTo} → Data Range 2022–2025 · frozen production evaluation, no retraining
        </p>
      </div>

      {/* Grid: 4 Metric Cards (Left) + Portfolio Risk Distribution Donut (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Side: 4 KPI Cards in a 2x2 grid (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: TOTAL PROJECTS */}
          <Link
            href="/projects?status=ALL"
            className="group block bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Total Projects
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
              728
            </div>
            <p className="text-xs font-bold text-emerald-600">
              217 reported sectors
            </p>
          </Link>

          {/* Card 2: HIGH / CRITICAL PROJECTS */}
          <Link
            href="/projects?risk=Critical"
            className="group block bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              High / Critical Projects
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
              585
            </div>
            <p className="text-xs font-bold text-rose-600">
              Production risk classification
            </p>
          </Link>

          {/* Card 3: PREDICTED COST EXPOSURE */}
          <Link
            href="/projects?sort=budget"
            className="group block bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Predicted Cost Exposure
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              ₹1,41,862.9 Cr
            </div>
            <p className="text-xs font-bold text-rose-600">
              Positive predicted overruns only
            </p>
          </Link>

          {/* Card 4: CURRENT EXPENDITURE */}
          <Link
            href="/projects"
            className="group block bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Current Expenditure
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              ₹6,36,919.8 Cr
            </div>
            <p className="text-xs font-bold text-emerald-600">
              Data Range 2022–2025
            </p>
          </Link>
        </div>

        {/* Right Side: Portfolio Risk Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
            Portfolio Risk Distribution
          </span>

          {/* Donut Chart SVG */}
          <div className="relative py-4 flex items-center justify-center">
            <svg
              width="200"
              height="200"
              viewBox="0 0 160 160"
              className="transform -rotate-90 overflow-visible"
            >
              {/* Background track circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />

              {/* Segment 1: Critical (Red) */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#dc2626"
                strokeWidth={strokeWidth}
                strokeDasharray={`${criticalLength} ${circumference}`}
                strokeDashoffset={criticalOffset}
                className="transition-all duration-700 hover:opacity-90"
              />

              {/* Segment 2: High (Orange) */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#ea580c"
                strokeWidth={strokeWidth}
                strokeDasharray={`${highLength} ${circumference}`}
                strokeDashoffset={highOffset}
                className="transition-all duration-700 hover:opacity-90"
              />

              {/* Segment 3: Medium (Amber) */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#d97706"
                strokeWidth={strokeWidth}
                strokeDasharray={`${mediumLength} ${circumference}`}
                strokeDashoffset={mediumOffset}
                className="transition-all duration-700 hover:opacity-90"
              />

              {/* Segment 4: Low (Green) */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#16a34a"
                strokeWidth={strokeWidth}
                strokeDasharray={`${lowLength} ${circumference}`}
                strokeDashoffset={lowOffset}
                className="transition-all duration-700 hover:opacity-90"
              />
            </svg>

            {/* Donut Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                728
              </span>
              <span className="text-xs font-semibold text-slate-400 -mt-0.5">
                Projects
              </span>
            </div>
          </div>

          {/* 4-Item Legend below Donut */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2 border-t border-slate-100 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
              <span className="text-slate-700">Critical 374</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" />
              <span className="text-slate-700">High 211</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
              <span className="text-slate-700">Medium 110</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
              <span className="text-slate-700">Low 33</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: TOP PRIORITY: INTERVENTION QUEUE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Header Title */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Top Priority: Intervention Queue
          </h2>
          <span className="text-[11px] text-slate-400 font-semibold">
            Showing {filteredQueue.length} prioritized projects
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Cost Overrun</th>
                <th className="py-3 px-4 text-center">Delay</th>
                <th className="py-3 px-4 text-center">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredQueue.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  {/* # Rank */}
                  <td className="py-4 px-4 text-center text-slate-400 font-mono text-xs">
                    {item.rank}
                  </td>

                  {/* Project Name */}
                  <td className="py-4 px-4">
                    <Link
                      href={item.targetId ? `/projects/${item.targetId}` : `/projects`}
                      className="block"
                    >
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase leading-snug">
                        {item.name}
                      </span>
                    </Link>
                  </td>

                  {/* Sector */}
                  <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                    {item.sector}
                  </td>

                  {/* Risk Score */}
                  <td className="py-4 px-4 text-center">
                    <span className="font-black text-rose-600 text-sm">
                      {item.riskScore}
                    </span>
                  </td>

                  {/* Cost Overrun */}
                  <td className="py-4 px-4 text-center font-bold text-slate-700">
                    {item.costOverrun}
                  </td>

                  {/* Delay */}
                  <td className="py-4 px-4 text-center font-bold text-slate-800 whitespace-nowrap">
                    {item.delayDays} days
                  </td>

                  {/* Progress */}
                  <td className="py-4 px-4 text-center text-slate-500 whitespace-nowrap">
                    {item.progress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
