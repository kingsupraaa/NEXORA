'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TriggeredAlert, AlertRule, AlertChannel } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  Bell, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Globe, 
  RefreshCw,
  ExternalLink,
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<TriggeredAlert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WHATSAPP' | 'EMAIL' | 'SMS'>('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function loadAlerts() {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      setAlerts(data.alerts || []);
      setRules(data.rules || []);
    } catch (e) {
      console.error('Failed to load alerts', e);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  async function handleTriggerScan() {
    setIsScanning(true);
    try {
      const res = await fetch('/api/alerts', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        setToastMessage(`Scan complete: ${data.count} alerts dispatched via configured channels.`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (e) {
      console.error('Scan failed', e);
    } finally {
      setIsScanning(false);
    }
  }

  const channelIcon = (ch: AlertChannel) => {
    switch (ch) {
      case 'WHATSAPP':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-sky-600" />;
      case 'SMS':
        return <Smartphone className="w-3.5 h-3.5 text-amber-600" />;
      case 'WEBHOOK':
        return <Globe className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'WHATSAPP') return a.channel === 'WHATSAPP';
    if (filter === 'EMAIL') return a.channel === 'EMAIL';
    if (filter === 'SMS') return a.channel === 'SMS';
    return true;
  });

  const whatsappCount = alerts.filter(a => a.channel === 'WHATSAPP').length;
  const emailCount = alerts.filter(a => a.channel === 'EMAIL').length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-teal-500/50">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-rose-600" />
            Automated Alert Dispatch Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Threshold-triggered early warnings dispatched across WhatsApp, Email, and SMS
          </p>
        </div>

        <button
          onClick={handleTriggerScan}
          disabled={isScanning}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] disabled:opacity-60 self-start sm:self-auto"
        >
          <RefreshCw className={cn('w-4 h-4', isScanning && 'animate-spin')} />
          <span>{isScanning ? 'Scanning Portfolio...' : 'Trigger Alert Scan Now'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Active Alerts</span>
          <span className="text-2xl font-black text-slate-900">{alerts.length}</span>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">Live telemetry scan</span>
        </div>
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-rose-700 block">Critical Alerts</span>
          <span className="text-2xl font-black text-rose-900">{criticalCount}</span>
          <span className="text-[11px] text-rose-700 font-medium block mt-1">Requiring immediate action</span>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">WhatsApp Dispatches</span>
          <span className="text-2xl font-black text-emerald-900">{whatsappCount}</span>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">Instant nodal notifications</span>
        </div>
        <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-sky-700 block">Email Briefings</span>
          <span className="text-2xl font-black text-sky-900">{emailCount}</span>
          <span className="text-[11px] text-sky-700 font-medium block mt-1">Executive summaries</span>
        </div>
      </div>

      {/* Configured Alert Rules */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-700" />
              Automated Alert Rules & Triggers
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous deterministic checks evaluated on every telemetry update
            </p>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
            4 Active Rules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-900">{rule.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
                  {rule.condition}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  {rule.channels.map(ch => (
                    <span key={ch} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-bold text-[10px]">
                      {ch}
                    </span>
                  ))}
                </div>
                <span>Targets: <strong className="text-slate-700">{rule.targetRoles.join(', ')}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs for Alerts Feed */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Live Dispatch Feed ({filteredAlerts.length})
        </h3>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto">
          {(['ALL', 'CRITICAL', 'WHATSAPP', 'EMAIL', 'SMS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                filter === tab
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Dispatch List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';

          return (
            <div
              key={alert.id}
              className={cn(
                'p-5 rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                isCritical ? 'border-rose-200/90' : 'border-slate-200'
              )}
            >
              <div className="flex items-start gap-3.5">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border',
                  isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                )}>
                  {channelIcon(alert.channel)}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={cn(
                      'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
                      isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    )}>
                      {alert.severity}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      via {alert.channel} &rarr; <strong className="text-slate-800">{alert.recipient}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400">· {new Date(alert.dispatchedAt).toLocaleTimeString()}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {alert.title}
                  </h4>

                  <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="mt-2 text-[11px] text-slate-500 font-medium">
                    <span>Project: </span>
                    <Link href={alert.actionUrl} className="font-bold text-teal-700 hover:underline">
                      {alert.projectName} ({alert.projectCode})
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  {alert.status}
                </span>

                <Link
                  href={alert.actionUrl}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  <span>Resolve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
