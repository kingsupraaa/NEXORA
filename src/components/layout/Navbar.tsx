'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  LayoutDashboard, 
  FolderKanban, 
  AlertTriangle, 
  CheckSquare, 
  BarChart3, 
  Zap,
  Bell,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    { href: '/risks', label: 'Risks', icon: AlertTriangle },
    { href: '/actions', label: 'Actions', icon: CheckSquare },
    { href: '/alerts', label: 'Alerts', icon: Bell, badge: 'Live' },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:bg-teal-700 transition-colors">
                <Activity className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">NEXORA</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  See the delay before it becomes a crisis
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all relative',
                      isActive
                        ? 'bg-teal-50 text-teal-800 shadow-sm border border-teal-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-teal-700' : 'text-slate-500')} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-rose-600 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-3">
            <Link
              href="/projects/proj-001"
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Flagship Demo</span>
            </Link>

            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>24 Projects Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden border-t border-slate-200 bg-slate-50 px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center py-1 px-2 rounded text-[11px] font-medium transition-colors',
                isActive ? 'text-teal-800 font-bold' : 'text-slate-600'
              )}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
