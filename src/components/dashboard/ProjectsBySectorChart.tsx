'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

interface ProjectsBySectorChartProps {
  data: { sector: string; count: number }[];
}

export function ProjectsBySectorChart({ data }: ProjectsBySectorChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Projects by Sector
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Active capital works distributed across infrastructure domains
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="sector" 
              tick={{ fontSize: 11, fill: '#64748B' }} 
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis 
              allowDecimals={false} 
              tick={{ fontSize: 11, fill: '#64748B' }} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '12px'
              }}
              cursor={{ fill: 'rgba(15, 118, 110, 0.08)' }}
            />
            <Bar dataKey="count" name="Projects" fill="#0F766E" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
