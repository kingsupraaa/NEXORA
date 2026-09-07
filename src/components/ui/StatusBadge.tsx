import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';
import { CheckCircle2, AlertCircle, AlertTriangle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'ON TRACK' | 'AT RISK' | 'DELAYED' | 'Completed' | 'In Progress' | 'Delayed' | 'Upcoming' | 'Critical' | 'High' | 'Medium' | 'Low' | 'Open' | 'Assigned' | 'Escalated' | 'Resolved' | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, size = 'md', showIcon = true, className }: StatusBadgeProps) {
  const colors = getStatusColor(status);

  const getIcon = () => {
    switch (status) {
      case 'ON TRACK':
      case 'Completed':
      case 'Resolved':
        return <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />;
      case 'AT RISK':
      case 'Medium':
      case 'Mitigating':
      case 'In Progress':
        return <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />;
      case 'DELAYED':
      case 'Delayed':
      case 'Critical':
      case 'High':
      case 'Escalated':
      case 'Open':
        return <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />;
      default:
        return <Clock className="w-3.5 h-3.5 stroke-[2.5]" />;
    }
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold rounded-full border shadow-sm transition-all',
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && getIcon()}
      <span className="uppercase tracking-wider">{status}</span>
    </span>
  );
}
