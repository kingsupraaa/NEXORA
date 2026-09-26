import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'teal' | 'coral';
  badge?: string;
  className?: string;
  href?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  badge,
  className,
  href
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

  const cardContent = (
    <div
      className={cn(
        'rounded-3xl border p-5 shadow-sm transition-all bg-white relative overflow-hidden h-full flex flex-col justify-between',
        variantStyles.border,
        href
          ? 'hover:shadow-lg hover:-translate-y-1 hover:border-coral-400 group cursor-pointer'
          : 'hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
          <div className="flex items-center gap-1.5">
            {href && (
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-coral-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            )}
            <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105', variantStyles.iconBg)}>
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>
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
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-gray-500 font-semibold group-hover:text-gray-700 transition-colors">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 rounded-3xl">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
