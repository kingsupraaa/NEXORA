import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(crores: number): string {
  if (crores === undefined || crores === null || isNaN(crores)) return '₹0 Cr';
  if (crores >= 1000) {
    const formatted = (crores / 1000).toFixed(2);
    return `₹${crores.toLocaleString('en-IN')} Cr`;
  }
  return `₹${crores.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return '0%';
  return `${Math.round(value * 10) / 10}%`;
}

export function getStatusColor(status: 'ON TRACK' | 'AT RISK' | 'DELAYED' | string): {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  hex: string;
} {
  switch (status) {
    case 'ON TRACK':
    case 'Completed':
    case 'Low':
    case 'Resolved':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badgeBg: 'bg-emerald-600',
        hex: '#059669'
      };
    case 'AT RISK':
    case 'In Progress':
    case 'Medium':
    case 'Mitigating':
    case 'Assigned':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badgeBg: 'bg-amber-500',
        hex: '#D97706'
      };
    case 'DELAYED':
    case 'Delayed':
    case 'Critical':
    case 'High':
    case 'Escalated':
    case 'Open':
    default:
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        badgeBg: 'bg-rose-600',
        hex: '#E11D48'
      };
  }
}
