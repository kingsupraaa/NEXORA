import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'NEXORA × Intelligent Project Monitoring Platform',
  description: 'See the delay before it becomes a crisis. Integrated project monitoring for large infrastructure with deterministic analytics, DAG bottleneck detection, and AI recommendations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full flex flex-col antialiased text-slate-900 selection:bg-teal-100 selection:text-teal-900">
        <Navbar />
        <main className="flex-1 pb-16">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-medium text-slate-600">
              NEXORA &copy; 2026 × Intelligent Infrastructure Monitor
            </p>
            <p className="text-[11px] text-slate-500">
              Prototype using synthetic demo project data. NEXORA is not connected to live government project systems.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
