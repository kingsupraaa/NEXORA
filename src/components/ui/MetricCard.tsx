import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'teal';
  badge?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  badge,
  className
}: MetricCardProps) {
  const variantStyles = {
    default: {
      border: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700',
      valueColor: 'text-slate-900',
      cardBg: 'bg-white'
    },
    success: {
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-800',
      valueColor: 'text-emerald-900',
      cardBg: 'bg-white'
    },
    warning: {
      border: 'border-amber-200',
      iconBg: 'bg-amber-100 text-amber-800',
      valueColor: 'text-amber-900',
      cardBg: 'bg-white'
    },
    danger: {
      border: 'border-rose-200',
      iconBg: 'bg-rose-100 text-rose-800',
      valueColor: 'text-rose-900',
      cardBg: 'bg-white'
    },
    teal: {
      border: 'border-teal-200',
      iconBg: 'bg-teal-100 text-teal-800',
      valueColor: 'text-teal-950',
      cardBg: 'bg-white'
    }
  }[variant];

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md relative overflow-hidden',
        variantStyles.cardBg,
        variantStyles.border,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={cn('p-2.5 rounded-xl flex items-center justify-center', variantStyles.iconBg)}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className={cn('text-3xl font-extrabold tracking-tight', variantStyles.valueColor)}>
          {value}
        </div>
        {badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}
