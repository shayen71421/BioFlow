'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { RightPanel } from '@/components/dashboard/right-panel';
import { CommandPalette } from '@/components/workflow/command-palette';
import { ScientificDashboard } from '@/components/dashboard/scientific-dashboard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
      <RightPanel />
      <CommandPalette />
      <ScientificDashboard />
    </div>
  );
}
