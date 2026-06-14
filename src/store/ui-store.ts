'use client';

import { create } from 'zustand';

export type SidebarItem = 'workflow' | 'biodrop' | 'playground' | 'templates' | 'docs' | 'validation';

interface UIState {
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelView: 'properties' | 'results' | 'info';
  commandPaletteOpen: boolean;
  scientificDashboardOpen: boolean;
  activeSidebarItem: SidebarItem;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleRightPanel: () => void;
  setRightPanelOpen: (open: boolean) => void;
  setRightPanelView: (view: 'properties' | 'results' | 'info') => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setScientificDashboardOpen: (open: boolean) => void;
  setActiveSidebarItem: (item: SidebarItem) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  rightPanelOpen: false,
  rightPanelView: 'properties',
  commandPaletteOpen: false,
  scientificDashboardOpen: false,
  activeSidebarItem: 'workflow',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setRightPanelView: (view) => set({ rightPanelView: view }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setScientificDashboardOpen: (open) => set({ scientificDashboardOpen: open }),
  setActiveSidebarItem: (item) => set({ activeSidebarItem: item }),
}));
