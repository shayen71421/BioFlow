'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Workflow, Dna, LayoutTemplate, BookOpen, ChevronLeft,
  PanelRightOpen, TestTube, MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore, type SidebarItem } from '@/store/ui-store';
import { Tooltip } from '@/components/ui/tooltip';

const primaryNav: { id: SidebarItem; icon: React.FC<{ size?: number }>; label: string; path: string }[] = [
  { id: 'workflow', icon: Workflow, label: 'Workflow Builder', path: '/dashboard/workflow' },
  { id: 'biodrop', icon: Dna, label: 'BioDrop Explorer', path: '/dashboard/biodrop' },
];

const secondaryNav: { id: SidebarItem; icon: React.FC<{ size?: number }>; label: string; path: string }[] = [
  { id: 'templates', icon: LayoutTemplate, label: 'Templates', path: '/dashboard/templates' },
  { id: 'validation', icon: TestTube, label: 'Benchmark', path: '/dashboard/validation' },
  { id: 'docs', icon: BookOpen, label: 'Docs', path: '/dashboard/docs' },
];

type NavItem = (typeof primaryNav)[0];

function NavItem({ item, activeItem, pathname, sidebarOpen, onNavigate }: {
  item: NavItem;
  activeItem: string | null;
  pathname: string;
  sidebarOpen: boolean;
  onNavigate: (item: NavItem) => void;
}) {
  const isActive = activeItem === item.id || pathname === item.path;
  return (
    <Tooltip content={item.label} side="right">
      <button
        onClick={() => onNavigate(item)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 max-md:flex-1 max-md:justify-center max-md:px-2',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
        )}
      >
        <item.icon size={18} />
        {sidebarOpen && <span className="sidebar-label font-medium max-md:hidden">{item.label}</span>}
      </button>
    </Tooltip>
  );
}

export function Sidebar() {
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const activeItem = useUIStore((s) => s.activeSidebarItem);
  const setActiveItem = useUIStore((s) => s.setActiveSidebarItem);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);

  const handleNavigate = (item: (typeof primaryNav)[0]) => {
    setActiveItem(item.id);
    setMobileMoreOpen(false);
    router.push(item.path);
  };

  const handleSecondaryNavigate = (item: (typeof secondaryNav)[0]) => {
    setActiveItem(item.id);
    setMobileMoreOpen(false);
    router.push(item.path);
  };

  return (
    <aside
      className={cn(
        'dashboard-sidebar flex flex-col border-r border-border bg-background transition-all duration-300 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:z-50 max-md:h-16 max-md:w-full max-md:flex-row max-md:border-r-0 max-md:border-t',
        sidebarOpen ? 'w-56' : 'w-14 max-md:w-full',
      )}
    >
      <div className="sidebar-header flex h-14 items-center border-b border-border px-3 max-md:hidden">
        {sidebarOpen ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Dna size={14} className="text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-foreground">BioFlow</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={toggleSidebar}
            className="mx-auto rounded-lg p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            <PanelRightOpen size={14} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav flex-1 space-y-1 p-2 max-md:flex max-md:items-center max-md:justify-around max-md:gap-1 max-md:space-y-0 max-md:p-2">
        {primaryNav.map((item) => (
          <NavItem key={item.id} item={item} activeItem={activeItem} pathname={pathname} sidebarOpen={sidebarOpen} onNavigate={handleNavigate} />
        ))}
        <div className="my-2 border-t border-border max-md:hidden" />
        <div className="sidebar-secondary max-md:hidden">
          {secondaryNav.map((item) => (
            <NavItem key={item.id} item={item} activeItem={activeItem} pathname={pathname} sidebarOpen={sidebarOpen} onNavigate={handleNavigate} />
          ))}
        </div>
      </nav>

      <div className={cn(
        'mobile-more absolute bottom-[calc(100%+0.5rem)] right-2 hidden w-48 rounded-xl border border-border bg-surface p-1.5 shadow-2xl',
        mobileMoreOpen && 'mobile-more-open',
      )}>
        {secondaryNav.map((item) => {
          const isActive = activeItem === item.id || pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleSecondaryNavigate(item)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
              )}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setMobileMoreOpen((open) => !open)}
        aria-label="More dashboard pages"
        className={cn(
          'mobile-more-trigger hidden items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground',
          mobileMoreOpen && 'bg-surface-hover text-foreground',
        )}
      >
        <MoreHorizontal size={19} />
      </button>

      <div className="sidebar-properties border-t border-border p-2 max-md:flex max-md:items-center max-md:border-t-0 max-md:p-2">
        <Tooltip content="Toggle Panel" side="right">
          <button
            onClick={toggleRightPanel}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground max-md:w-auto max-md:justify-center max-md:px-3"
          >
            <PanelRightOpen size={18} />
            {sidebarOpen && <span className="sidebar-label font-medium max-md:hidden">Properties</span>}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
