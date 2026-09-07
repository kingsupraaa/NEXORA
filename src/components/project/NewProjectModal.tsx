'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  X, 
  Building2, 
  MapPin, 
  UserCheck, 
  IndianRupee, 
  Calendar, 
  Sparkles,
  ShieldAlert,
  Clock,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectSector, ProjectLocation, RiskSeverity } from '@/types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (newProject: any) => void;
}

const SECTORS: ProjectSector[] = [
  'Roads', 'Railways', 'Metro', 'Healthcare', 'Water', 
  'Energy', 'Education', 'Urban Development', 'Manufacturing', 'IT'
];

const LOCATIONS: ProjectLocation[] = [
  'Kolkata', 'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 
  'Hyderabad', 'Pune', 'Bhubaneswar', 'Guwahati', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

export function NewProjectModal({ isOpen, onClose, onProjectCreated }: NewProjectModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sector: 'Roads' as ProjectSector,
    location: 'Kolkata' as ProjectLocation,
    manager: '',
    budget: 500,
    spent: 50,
    progress: 10,
    plannedProgress: 15,
    startDate: new Date().toISOString().split('T')[0],
    plannedEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    milestoneName: 'Site Survey & Statutory Approvals',
    riskTitle: 'Right-of-way utility shifting clearance',
    riskSeverity: 'Medium' as RiskSeverity,
    riskAction: 'Convene joint site inspection with municipal authorities'
  });

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.manager || formData.budget <= 0) {
      alert('Please fill out Project Name, Manager, and a valid Budget.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          sector: formData.sector,
          location: formData.location,
          manager: formData.manager,
          budget: Number(formData.budget),
          spent: Number(formData.spent),
          progress: Number(formData.progress),
          plannedProgress: Number(formData.plannedProgress),
          startDate: formData.startDate,
          plannedEndDate: formData.plannedEndDate,
          expectedEndDate: formData.plannedEndDate,
          description: formData.description,
          initialMilestone: {
            name: formData.milestoneName,
            plannedDate: formData.plannedEndDate,
            owner: formData.manager,
            status: 'In Progress',
            delayDays: 0
          },
          initialRisk: {
            title: formData.riskTitle,
            severity: formData.riskSeverity,
            owner: formData.manager,
            recommendedAction: formData.riskAction
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (onProjectCreated) onProjectCreated(data.project);
        onClose();
        router.push(`/projects/${data.project.id}`);
      } else {
        const err = await res.json();
        alert(`Failed to assign project: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('Error assigning project:', err);
      alert('Network error while assigning project.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-sm">
            <PlusCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Onboard & Assign New Project
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Initialize project telemetry, financial allocations, and assign leadership
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold text-slate-700">
          {/* Project Name */}
          <div>
            <label className="block mb-1 font-bold text-slate-900">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. South Ring Expressway Corridor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
            />
          </div>

          {/* Sector & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-bold text-slate-900">Infrastructure Sector</label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value as ProjectSector })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
              >
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Project Location / City</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value as ProjectLocation })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
              >
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Manager & Assignee */}
          <div>
            <label className="block mb-1 font-bold text-slate-900">
              Assigned Nodal Officer / Project Manager <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Smt. Radhika Verma (Executive Engineer)"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Budget & Spend */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-bold text-slate-900">Sanctioned Budget (₹ Crores)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Initial Spent (₹ Crores)</label>
              <input
                type="number"
                min="0"
                value={formData.spent}
                onChange={(e) => setFormData({ ...formData, spent: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Dates & Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-bold text-slate-900">Physical Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Planned Target Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.plannedProgress}
                onChange={(e) => setFormData({ ...formData, plannedProgress: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-bold text-slate-900">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Planned Completion Date</label>
              <input
                type="date"
                value={formData.plannedEndDate}
                onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Initial Risk Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Initial Critical Path Risk Item
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Risk Description"
                  value={formData.riskTitle}
                  onChange={(e) => setFormData({ ...formData, riskTitle: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
              <div>
                <select
                  value={formData.riskSeverity}
                  onChange={(e) => setFormData({ ...formData, riskSeverity: e.target.value as RiskSeverity })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-bold"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <input
              type="text"
              placeholder="Recommended Mitigation Action"
              value={formData.riskAction}
              onChange={(e) => setFormData({ ...formData, riskAction: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-md shadow-teal-700/20 transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Onboarding Project...' : 'Assign & Initialize Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
