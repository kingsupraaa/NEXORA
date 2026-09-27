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
  Check,
  Zap,
  UploadCloud,
  Database,
  Building2,
  Sparkles,
  Filter,
  SlidersHorizontal,
  PlusCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataImportModal } from '@/components/dashboard/DataImportModal';

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
  budgetCr: number;
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
    targetId: 'proj-026',
    budgetCr: 2484.97
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
    targetId: 'proj-003',
    budgetCr: 1850.00
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
    targetId: 'proj-001',
    budgetCr: 3240.50
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
    targetId: 'proj-004',
    budgetCr: 920.00
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
    targetId: 'proj-001',
    budgetCr: 1200.00
  },
  {
    id: 'q-6',
    rank: 6,
    name: 'BENGALURU PERIPHERAL METRO RING (PHASE III)',
    code: 'PP-025',
    sector: 'Mass Rapid Transit (Metro)',
    riskScore: 96.1,
    costOverrun: '52.3%',
    delayDays: 42,
    progress: '38%',
    targetId: 'proj-025',
    budgetCr: 1850.00
  },
  {
    id: 'q-7',
    rank: 7,
    name: 'NORTH METRO EXTENSION & DEPOT COMPLEX',
    code: 'PP-004',
    sector: 'Mass Rapid Transit (Metro)',
    riskScore: 95.5,
    costOverrun: '41.5%',
    delayDays: 35,
    progress: '48%',
    targetId: 'proj-004',
    budgetCr: 2450.00
  },
  {
    id: 'q-8',
    rank: 8,
    name: 'CENTRAL MULTI-SPECIALTY HOSPITAL MEDICAL SUPERSTRUCTURE',
    code: 'PP-002',
    sector: 'Healthcare & Public Health',
    riskScore: 94.2,
    costOverrun: '64.6%',
    delayDays: 14,
    progress: '70%',
    targetId: 'proj-002',
    budgetCr: 480.00
  },
  {
    id: 'q-9',
    rank: 9,
    name: 'WESTERN WIND ENERGY SCADA TRANSMISSION INTEGRATION',
    code: 'PP-005',
    sector: 'Renewable Energy Grid',
    riskScore: 91.8,
    costOverrun: '48.2%',
    delayDays: 45,
    progress: '55%',
    targetId: 'proj-005',
    budgetCr: 350.00
  }
];

export default function DashboardPage() {
  const [sector, setSector] = useState<string>('All Sectors');
  const [riskLevel, setRiskLevel] = useState<string>('All Levels');
  const [valueFilter, setValueFilter] = useState<'ALL' | 'HIGH_VALUE' | 'MEGA' | 'STANDARD'>('ALL');
  const [trainingFrom, setTrainingFrom] = useState<number>(2001);
  const [trainingTo, setTrainingTo] = useState<number>(2021);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRangeLoaded, setIsRangeLoaded] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeFilterCount = (sector !== 'All Sectors' ? 1 : 0) + 
    (riskLevel !== 'All Levels' ? 1 : 0) + 
    (valueFilter !== 'ALL' ? 1 : 0) + 
    (searchQuery ? 1 : 0);

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return INITIAL_QUEUE.filter(item => {
      const matchSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) || 
        item.sector.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSector = sector === 'All Sectors' || 
        item.sector.toLowerCase().includes(sector.toLowerCase()) || 
        sector.toLowerCase().includes(item.sector.toLowerCase());
      
      const matchRisk = riskLevel === 'All Levels' || 
        (riskLevel === 'Critical' && item.riskScore >= 98) ||
        (riskLevel === 'High' && item.riskScore >= 92 && item.riskScore < 98) ||
        (riskLevel === 'Medium' && item.riskScore >= 75 && item.riskScore < 92) ||
        (riskLevel === 'Low' && item.riskScore < 75);

      const matchValue = 
        valueFilter === 'ALL' ||
        (valueFilter === 'HIGH_VALUE' && item.budgetCr >= 1000) ||
        (valueFilter === 'MEGA' && item.budgetCr >= 2500) ||
        (valueFilter === 'STANDARD' && item.budgetCr < 1000);

      return matchSearch && matchSector && matchRisk && matchValue;
    });
  }, [sector, riskLevel, valueFilter, searchQuery]);

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

  function handleDataImported(count: number, source: string) {
    setImportNotification(`Successfully connected to ${source} and synchronized ${count} project telemetry records.`);
    setTimeout(() => {
      setImportNotification(null);
    }, 4500);
  }

  // Dynamic calculations based on value filter
  const metricsData = useMemo(() => {
    if (valueFilter === 'HIGH_VALUE') {
      return {
        total: 142,
        totalLabel: 'High Value Projects (≥ ₹1,000 Cr)',
        totalSub: '19.5% of total capital portfolio',
        highCritical: 118,
        highCriticalSub: 'High-value projects in distress',
        costExposure: '₹1,12,480.0 Cr',
        costExposureSub: '79.3% of total portfolio exposure',
        expenditure: '₹5,08,312.4 Cr',
        expenditureSub: 'High-value capital allocated',
        criticalCount: 82,
        highCount: 36,
        mediumCount: 18,
        lowCount: 6,
        donutCenter: '142',
        donutLabel: 'High Value'
      };
    }
    if (valueFilter === 'MEGA') {
      return {
        total: 48,
        totalLabel: 'Mega Projects (≥ ₹2,500 Cr)',
        totalSub: '6.6% of national infrastructure works',
        highCritical: 41,
        highCriticalSub: 'Mega capital projects in distress',
        costExposure: '₹68,910.4 Cr',
        costExposureSub: 'Cabinet-priority risk exposure',
        expenditure: '₹2,94,150.0 Cr',
        expenditureSub: 'Mega capital outlay',
        criticalCount: 28,
        highCount: 13,
        mediumCount: 5,
        lowCount: 2,
        donutCenter: '48',
        donutLabel: 'Mega Works'
      };
    }
    if (valueFilter === 'STANDARD') {
      return {
        total: 586,
        totalLabel: 'Standard Capital Projects (< ₹1,000 Cr)',
        totalSub: '80.5% of monitored assets',
        highCritical: 467,
        highCriticalSub: 'Standard projects in distress',
        costExposure: '₹29,382.9 Cr',
        costExposureSub: '20.7% of total cost exposure',
        expenditure: '₹1,28,607.4 Cr',
        expenditureSub: 'Standard capital outlay',
        criticalCount: 292,
        highCount: 175,
        mediumCount: 92,
        lowCount: 27,
        donutCenter: '586',
        donutLabel: 'Standard'
      };
    }
    // Default ALL
    return {
      total: 728,
      totalLabel: 'Total Projects',
      totalSub: '217 reported sectors',
      highCritical: 585,
      highCriticalSub: 'Production risk classification',
      costExposure: '₹1,41,862.9 Cr',
      costExposureSub: 'Positive predicted overruns only',
      expenditure: '₹6,36,919.8 Cr',
      expenditureSub: 'Data Range 2022–2025',
      criticalCount: 374,
      highCount: 211,
      mediumCount: 110,
      lowCount: 33,
      donutCenter: '728',
      donutLabel: 'Projects'
    };
  }, [valueFilter]);

  // Donut chart calculations
  const totalProjectsCount = metricsData.total;
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const strokeWidth = 24;

  const criticalLength = (metricsData.criticalCount / totalProjectsCount) * circumference;
  const highLength = (metricsData.highCount / totalProjectsCount) * circumference;
  const mediumLength = (metricsData.mediumCount / totalProjectsCount) * circumference;
  const lowLength = (metricsData.lowCount / totalProjectsCount) * circumference;

  const criticalOffset = 0;
  const highOffset = -criticalLength;
  const mediumOffset = -(criticalLength + highLength);
  const lowOffset = -(criticalLength + highLength + mediumLength);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      {/* Universal Data Import Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onDataImported={handleDataImported}
      />

      {/* Top Header & Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Dashboard</span>
            {valueFilter === 'HIGH_VALUE' && (
              <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-xs flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                High Value View
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium flex-wrap">
            <span><strong className="text-slate-700">Data Range:</strong> 2022–2025</span>
            <span className="text-slate-300">|</span>
            <span><strong className="text-slate-700">Data Source:</strong> official PAIMANA public-project subset</span>
          </div>
        </div>

        {/* Right Side Action Controls & Search Option */}
        <div className="flex items-center gap-2.5 self-start md:self-center flex-wrap">
          {/* Simple Search Option on the right side */}
          <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl p-1 shadow-xs hover:border-slate-300 transition-all">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 sm:w-48 pl-8 pr-7 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:w-56 transition-all bg-transparent"
              />
              {/* Clickable Search Icon button */}
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="absolute left-2 text-slate-400 hover:text-blue-600 transition-colors p-0.5"
                title="Click to toggle filter options"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button next to Search */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                'px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                isFilterOpen
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              )}
              title={isFilterOpen ? 'Hide filter options' : 'Click search icon to reveal filter options'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isFilterOpen ? 'Filters' : 'Filters'}</span>
              {activeFilterCount > 0 && (
                <span className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                  isFilterOpen ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
                )}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Universal Import / Connect Option */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Import from Excel/CSV, ERP, MIS, or REST APIs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Live Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Live Import Notification Toast */}
      {importNotification && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importNotification}</span>
          </div>
          <button
            onClick={() => setImportNotification(null)}
            className="text-[11px] font-bold text-emerald-700 hover:underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Collapsible Filter Portion (appears when search icon or filter toggle is clicked) */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-6 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Filter Parameters
              </span>
              {activeFilterCount > 0 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {activeFilterCount} Active
                </span>
              )}
            </div>

            <button
              onClick={() => setIsFilterOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Close filter panel"
            >
              <span className="text-[11px]">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
            {/* Sector Filter */}
            <div className="lg:col-span-3">
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
            <div className="lg:col-span-2">
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

            {/* Project Scope / High Value Filter */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Project Scope / Value</span>
                {valueFilter !== 'ALL' && (
                  <span className="text-amber-600 font-bold text-[10px] uppercase">active</span>
                )}
              </label>
              <select
                value={valueFilter}
                onChange={(e) => setValueFilter(e.target.value as any)}
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all',
                  valueFilter === 'HIGH_VALUE'
                    ? 'border-amber-400 bg-amber-50/50 text-amber-900 font-extrabold ring-1 ring-amber-400'
                    : 'border-slate-200 bg-white text-slate-800'
                )}
              >
                <option value="ALL">All Project Values (728)</option>
                <option value="HIGH_VALUE">⚡ High Value Projects (≥ ₹1,000 Cr) (142)</option>
                <option value="MEGA">💎 Mega Infrastructure (≥ ₹2,500 Cr) (48)</option>
                <option value="STANDARD">Standard Capital (&lt; ₹1,000 Cr) (586)</option>
              </select>
            </div>

            {/* Training From */}
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                From
              </label>
              <input
                type="number"
                value={trainingFrom}
                onChange={(e) => setTrainingFrom(Number(e.target.value))}
                className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Training To */}
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                To
              </label>
              <input
                type="number"
                value={trainingTo}
                onChange={(e) => setTrainingTo(Number(e.target.value))}
                className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Load saved range button */}
            <div className="lg:col-span-2">
              <button
                onClick={handleLoadRange}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2938] hover:bg-[#141e29] text-white text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap text-center"
              >
                {isRangeLoaded ? 'Loaded!' : 'Load saved range'}
              </button>
            </div>
          </div>

          {/* Quick Filter Pills Row */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1">
                Quick Filter:
              </span>

              <button
                onClick={() => setValueFilter('ALL')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                  valueFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                All Projects ({INITIAL_QUEUE.length})
              </button>

              {/* High Value Toggle Pill */}
              <button
                onClick={() => setValueFilter(valueFilter === 'HIGH_VALUE' ? 'ALL' : 'HIGH_VALUE')}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
                  valueFilter === 'HIGH_VALUE'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 ring-2 ring-amber-400/40'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                )}
              >
                <Zap className={cn('w-3 h-3', valueFilter === 'HIGH_VALUE' ? 'text-amber-200 fill-amber-200' : 'text-amber-600')} />
                <span>High Value Projects (≥ ₹1,000 Cr)</span>
                <span className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                  valueFilter === 'HIGH_VALUE' ? 'bg-amber-700 text-white' : 'bg-amber-200/70 text-amber-900'
                )}>
                  {INITIAL_QUEUE.filter(p => p.budgetCr >= 1000).length} in queue
                </span>
              </button>

              {/* Mega Works Toggle Pill */}
              <button
                onClick={() => setValueFilter(valueFilter === 'MEGA' ? 'ALL' : 'MEGA')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1',
                  valueFilter === 'MEGA'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                )}
              >
                <span>Mega (≥ ₹2,500 Cr)</span>
              </button>

              {(sector !== 'All Sectors' || riskLevel !== 'All Levels' || valueFilter !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setSector('All Sectors');
                    setRiskLevel('All Levels');
                    setValueFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="text-[11px] font-bold text-coral-600 hover:underline ml-2"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              Training {trainingFrom}–{trainingTo} → Data Range 2022–2025 · frozen evaluation
            </p>
          </div>
        </div>
      )}

      {/* Active Filter Chips summary when panel is collapsed */}
      {!isFilterOpen && (activeFilterCount > 0) && (
        <div className="mb-5 flex items-center gap-2 flex-wrap text-xs bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 px-3.5 animate-in fade-in">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Active Filters:
          </span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px]">
              Search: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery('')}><X className="w-3 h-3 hover:text-blue-900" /></button>
            </span>
          )}
          {sector !== 'All Sectors' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-[11px]">
              Sector: {sector}
              <button onClick={() => setSector('All Sectors')}><X className="w-3 h-3 hover:text-slate-900" /></button>
            </span>
          )}
          {riskLevel !== 'All Levels' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-[11px]">
              Risk: {riskLevel}
              <button onClick={() => setRiskLevel('All Levels')}><X className="w-3 h-3 hover:text-slate-900" /></button>
            </span>
          )}
          {valueFilter !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-bold text-[11px]">
              Scope: {valueFilter === 'HIGH_VALUE' ? 'High Value (≥ ₹1,000 Cr)' : valueFilter}
              <button onClick={() => setValueFilter('ALL')}><X className="w-3 h-3 hover:text-amber-900" /></button>
            </span>
          )}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="text-[11px] font-bold text-blue-600 hover:underline ml-1"
          >
            Edit Filters
          </button>
          <button
            onClick={() => {
              setSector('All Sectors');
              setRiskLevel('All Levels');
              setValueFilter('ALL');
              setSearchQuery('');
            }}
            className="text-[11px] font-bold text-coral-600 hover:underline ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Grid: 5 Metric Cards (Left) + Portfolio Risk Distribution Donut (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Side: KPI Cards (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 justify-between">
          {/* Row 1: Total Projects & High Value Projects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: TOTAL PROJECTS */}
            <Link
              href="/projects?status=ALL"
              className="group block bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                {metricsData.totalLabel}
              </span>
              <div className="text-3xl font-black text-slate-900 tracking-tight mb-1.5">
                {metricsData.total}
              </div>
              <p className="text-xs font-bold text-emerald-600">
                {metricsData.totalSub}
              </p>
            </Link>

            {/* Card 2: HIGH VALUE PROJECTS OPTION */}
            <div
              onClick={() => setValueFilter(valueFilter === 'HIGH_VALUE' ? 'ALL' : 'HIGH_VALUE')}
              className={cn(
                'group block rounded-2xl border p-5 shadow-sm transition-all cursor-pointer relative overflow-hidden',
                valueFilter === 'HIGH_VALUE'
                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-500/10'
                  : 'bg-white border-slate-200/90 hover:shadow-md hover:border-amber-300'
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                  High Value Projects
                </span>
                <span className={cn(
                  'text-[9px] font-black uppercase px-2 py-0.5 rounded-full',
                  valueFilter === 'HIGH_VALUE'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-800'
                )}>
                  {valueFilter === 'HIGH_VALUE' ? 'Active' : '≥ ₹1,000 Cr'}
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight mb-1.5 flex items-center justify-between">
                <span>142</span>
                <Link
                  href="/projects?highValue=true"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                  title="View High Value Projects Registry"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-xs font-bold text-amber-800">
                ₹5,08,312 Cr capital stake (79.8%)
              </p>
            </div>
          </div>

          {/* Row 2: High/Critical Projects & Predicted Cost Exposure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 3: HIGH / CRITICAL PROJECTS */}
            <Link
              href="/projects?risk=Critical"
              className="group block bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                High / Critical Projects
              </span>
              <div className="text-3xl font-black text-slate-900 tracking-tight mb-1.5">
                {metricsData.highCritical}
              </div>
              <p className="text-xs font-bold text-rose-600">
                {metricsData.highCriticalSub}
              </p>
            </Link>

            {/* Card 4: PREDICTED COST EXPOSURE */}
            <Link
              href="/projects?sort=budget"
              className="group block bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Predicted Cost Exposure
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
                {metricsData.costExposure}
              </div>
              <p className="text-xs font-bold text-rose-600">
                {metricsData.costExposureSub}
              </p>
            </Link>
          </div>

          {/* Row 3: Current Expenditure Card */}
          <Link
            href="/projects"
            className="group block bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Current Expenditure & Cumulative Outlay
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Data Range 2022–2025
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {metricsData.expenditure}
              </div>
              <p className="text-xs font-bold text-emerald-600">
                {metricsData.expenditureSub}
              </p>
            </div>

            {/* High-Value vs Standard distribution bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
              <div className="bg-amber-500 h-full" style={{ width: '79.8%' }} title="High Value (≥ ₹1,000 Cr): 79.8%" />
              <div className="bg-blue-500 h-full" style={{ width: '20.2%' }} title="Standard Capital: 20.2%" />
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mt-1.5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                High Value Share: 79.8% (₹5.08 Lakh Cr)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Standard: 20.2%
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side: Portfolio Risk Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
              Portfolio Risk Distribution
            </span>
            {valueFilter !== 'ALL' && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {valueFilter} SCOPE
              </span>
            )}
          </div>

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
                {metricsData.donutCenter}
              </span>
              <span className="text-xs font-semibold text-slate-400 -mt-0.5">
                {metricsData.donutLabel}
              </span>
            </div>
          </div>

          {/* 4-Item Legend below Donut */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2 border-t border-slate-100 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
              <span className="text-slate-700">Critical {metricsData.criticalCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" />
              <span className="text-slate-700">High {metricsData.highCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
              <span className="text-slate-700">Medium {metricsData.mediumCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
              <span className="text-slate-700">Low {metricsData.lowCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: TOP PRIORITY: INTERVENTION QUEUE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Header Title & Queue Tabs */}
        <div className="p-5 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span>Top Priority: Intervention Queue</span>
              {valueFilter === 'HIGH_VALUE' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-black uppercase">
                  ⚡ High Value Filter Active
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Showing {filteredQueue.length} prioritized capital projects {valueFilter === 'HIGH_VALUE' ? '(Sanctioned Value ≥ ₹1,000 Cr)' : ''}
            </p>
          </div>

          {/* Quick Queue View Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-center overflow-x-auto">
            <button
              onClick={() => setValueFilter('ALL')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                valueFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              All Projects ({INITIAL_QUEUE.length})
            </button>

            <button
              onClick={() => setValueFilter('HIGH_VALUE')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                valueFilter === 'HIGH_VALUE'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Zap className={cn('w-3 h-3', valueFilter === 'HIGH_VALUE' ? 'text-amber-200 fill-amber-200' : 'text-amber-500')} />
              <span>High Value Projects</span>
              <span className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                valueFilter === 'HIGH_VALUE' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-800'
              )}>
                {INITIAL_QUEUE.filter(p => p.budgetCr >= 1000).length}
              </span>
            </button>
          </div>
        </div>

        {/* High Value Filter Alert Banner */}
        {valueFilter === 'HIGH_VALUE' && (
          <div className="mx-5 mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>High Value Projects Filter:</strong> Displaying projects with sanctioned outlay ≥ ₹1,000 Cr. Filtered Capital In-Flight: <strong>₹{filteredQueue.reduce((acc, p) => acc + p.budgetCr, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr</strong>.
              </span>
            </div>
            <button
              onClick={() => setValueFilter('ALL')}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0 ml-3"
            >
              Show All Projects
            </button>
          </div>
        )}

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-center">Project Value</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Cost Overrun</th>
                <th className="py-3 px-4 text-center">Delay</th>
                <th className="py-3 px-4 text-center">Progress</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 text-xs">
                    No projects match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    {/* # Rank */}
                    <td className="py-4 px-4 text-center text-slate-400 font-mono text-xs">
                      {item.rank}
                    </td>

                    {/* Project Name */}
                    <td className="py-4 px-4 max-w-xs sm:max-w-md">
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

                    {/* Project Value / High Value Badge */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-extrabold text-slate-900 text-xs">
                          ₹{item.budgetCr.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Cr
                        </span>
                        {item.budgetCr >= 1000 && (
                          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
                            <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-600" />
                            High Value
                          </span>
                        )}
                      </div>
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

                    {/* Action */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <Link
                        href={item.targetId ? `/projects/${item.targetId}` : `/projects`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-colors"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
