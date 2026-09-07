'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface HealthGaugeProps {
  score: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  label?: string;
  statusText?: string;
  className?: string;
}

export function HealthGauge({
  score,
  size = 'md',
  showLabel = true,
  label = 'Health Score',
  statusText,
  className
}: HealthGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  let color = '#059669'; // Green
  let textClass = 'text-emerald-700';
  let bgFill = 'bg-emerald-50';
  let strokeColor = '#059669';
  let defaultStatus = 'ON TRACK';

  if (clampedScore < 60) {
    color = '#E11D48'; // Red
    textClass = 'text-rose-700';
    bgFill = 'bg-rose-50';
    strokeColor = '#E11D48';
    defaultStatus = 'DELAYED';
  } else if (clampedScore < 80) {
    color = '#D97706'; // Amber
    textClass = 'text-amber-700';
    bgFill = 'bg-amber-50';
    strokeColor = '#D97706';
    defaultStatus = 'AT RISK';
  }

  const dimensions = {
    sm: { width: 64, stroke: 6, text: 'text-base', subtext: 'text-[9px]' },
    md: { width: 96, stroke: 8, text: 'text-2xl', subtext: 'text-xs' },
    lg: { width: 140, stroke: 12, text: 'text-4xl', subtext: 'text-sm' },
    xl: { width: 180, stroke: 16, text: 'text-5xl', subtext: 'text-base' }
  }[size];

  const radius = (dimensions.width - dimensions.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', className)}>
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimensions.width}
          height={dimensions.width}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={cn('font-black tracking-tight', dimensions.text, textClass)}>
            {clampedScore}%
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {statusText || defaultStatus}
            </span>
          )}
        </div>
      </div>

      {showLabel && (
        <div className="mt-2 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</p>
          {statusText && (
            <p className={cn('text-xs font-bold uppercase tracking-wider mt-0.5', textClass)}>
              Status: {statusText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
