import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'teal' | 'coral';
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
      border: 'border-gray-200',
      iconBg: 'bg-gray-100 text-gray-800',
      valueColor: 'text-gray-900',
      cardBg: 'bg-white'
    },
    coral: {
      border: 'border-coral-200',
      iconBg: 'bg-coral-100 text-coral-700',
      valueColor: 'text-gray-900',
      cardBg: 'bg-white'
    },
    success: {
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-800',
      valueColor: 'text-gray-900',
      cardBg: 'bg-white'
    },
    warning: {
      border: 'border-amber-200',
      iconBg: 'bg-amber-100 text-amber-800',
      valueColor: 'text-gray-900',
      cardBg: 'bg-white'
    },
    danger: {
      border: 'border-rose-200',
      iconBg: 'bg-rose-100 text-coral-600',
      valueColor: 'text-coral-600',
      cardBg: 'bg-white'
    },
    teal: {
      border: 'border-coral-200',
      iconBg: 'bg-coral-50 text-coral-600',
      valueColor: 'text-gray-900',
      cardBg: 'bg-white'
    }
  }[variant];

  return (
    <div
      className={cn(
        'rounded-3xl border p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 bg-white relative overflow-hidden',
        variantStyles.border,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
        <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', variantStyles.iconBg)}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className={cn('text-3xl font-black tracking-tight', variantStyles.valueColor)}>
          {value}
        </div>
        {badge && (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-gray-500 font-semibold">
          {subtitle}
        </p>
      )}
    </div>
  );
}
