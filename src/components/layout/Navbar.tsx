'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Globe, 
  LayoutDashboard, 
  FolderKanban, 
  AlertTriangle, 
  CheckSquare, 
  BarChart3, 
  Zap,
  Bell,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/projects', label: 'Projects' },
    { href: '/alerts', label: 'Alerts', badge: 'Live' },
    { href: '/analytics', label: 'Analytics' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo matching image */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-coral-600 flex items-center justify-center text-white shadow-md shadow-coral-600/20 group-hover:scale-105 transition-transform">
              <Globe className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5 font-black text-xl tracking-tight text-gray-900">
                <span>NEXORA</span>
                <span className="text-coral-600">MONITOR</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 -mt-1 hidden sm:block">
                Infrastructure Platform
              </span>
            </div>
          </Link>

          {/* Center Navigation Links matching reference */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-bold transition-all relative py-1 flex items-center gap-1.5',
                    isActive
                      ? 'text-coral-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-coral-600'
                      : 'text-gray-700 hover:text-coral-600'
                  )}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-coral-100 text-coral-700 border border-coral-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA Button matching reference red/orange pill button */}
          <div className="flex items-center space-x-3">
            <Link
              href="/projects/proj-001"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-coral-600 hover:bg-coral-700 text-white text-xs font-extrabold shadow-lg shadow-coral-600/25 transition-all hover:scale-105"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Flagship Demo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden border-t border-gray-100 bg-white px-3 py-2 flex items-center justify-around overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'py-1.5 px-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap',
                isActive ? 'text-coral-600 bg-coral-50' : 'text-gray-600'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
