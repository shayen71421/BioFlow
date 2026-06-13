'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileInput, ScanSearch, Percent, ArrowRightToLine, ArrowLeftRight,
  AlignStartVertical, Search, FileText, Table, Eye, Scissors, Dna, FlaskConical, Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/store/workflow-store';
import { useUIStore } from '@/store/ui-store';
import { NODE_DEFINITIONS } from './node-definitions';
import type { NodeType, NodeCategory } from '@/types/workflow';

const iconMap: Record<string, React.FC<{ size?: number }>> = {
  FileInput, ScanSearch, Percent, ArrowRightToLine, ArrowLeftRight,
  AlignStartVertical, Search, FileText, Table, Eye, Scissors, Dna, FlaskConical,
};

const categoryConfig: Record<NodeCategory, { label: string; color: string }> = {
  input: { label: 'Input', color: 'text-success' },
  analysis: { label: 'Analysis', color: 'text-accent' },
  'advanced-analysis': { label: 'Advanced Analysis', color: 'text-[#EC4899]' },
  output: { label: 'Output', color: 'text-danger' },
};

export function CommandPalette() {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const addNode = useWorkflowStore((s) => s.addNode);
  const pushHistory = useWorkflowStore((s) => s.pushHistory);

  const filtered = query
    ? NODE_DEFINITIONS.filter(
        (d) =>
          d.label.toLowerCase().includes(query.toLowerCase()) ||
          d.description.toLowerCase().includes(query.toLowerCase()),
      )
    : NODE_DEFINITIONS;

  const grouped = filtered.reduce(
    (acc, item) => {
      const cat = item.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<NodeCategory, typeof NODE_DEFINITIONS>,
  );

  const allItems = filtered;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const openPalette = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    setOpen(true);
  }, [setOpen]);

  const closePalette = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleSelect = useCallback(
    (type: NodeType) => {
      pushHistory();
      addNode(type);
      closePalette();
    },
    [addNode, closePalette, pushHistory],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePalette();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex].type);
      }
    }
  };

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      const child = el.children[selectedIndex] as HTMLElement;
      if (child) child.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' || e.key === 'a') {
        e.preventDefault();
        if (open) closePalette();
        else openPalette();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [open, openPalette, closePalette]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={closePalette}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Command size={16} className="text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search nodes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <div ref={listRef} className="max-h-[300px] overflow-y-auto scrollbar-thin p-2">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className={cn('px-2 py-1.5 text-[11px] font-semibold', categoryConfig[category as NodeCategory]?.color)}>
                {categoryConfig[category as NodeCategory]?.label}
              </div>
              {items.map((def) => {
                const globalIdx = allItems.indexOf(def);
                const Icon = iconMap[def.icon as keyof typeof iconMap];
                return (
                  <button
                    key={def.type}
                    onClick={() => handleSelect(def.type)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                      globalIdx === selectedIndex ? 'bg-surface-hover' : 'hover:bg-surface-hover',
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background">
                      {Icon && <Icon size={14} />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{def.label}</div>
                      <div className="text-xs text-muted-foreground">{def.description}</div>
                    </div>
                    <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      ↵
                    </kbd>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
