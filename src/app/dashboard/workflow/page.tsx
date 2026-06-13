'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FlowCanvas } from '@/components/workflow/flow-canvas';
import { WorkflowToolbar } from '@/components/workflow/workflow-toolbar';
import { useWorkflowStore } from '@/store/workflow-store';
import { useSequenceStore } from '@/store/sequence-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { Dna, Workflow, FlaskConical, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

function WorkflowEmptyState() {
  const router = useRouter();
  const addNode = useWorkflowStore((s) => s.addNode);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const sequences = useSequenceStore((s) => s.sequences);
  const setActiveSidebarItem = useUIStore((s) => s.setActiveSidebarItem);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center text-center max-w-sm pointer-events-auto">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Workflow size={24} className="text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Build a Workflow</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Press <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px]">Space</kbd> or{' '}
          <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px]">A</kbd> to add nodes
        </p>

        {sequences.length === 0 && (
          <div className="mt-4 rounded-lg border border-warning/20 bg-warning/5 p-3 text-left">
            <div className="flex items-center gap-2 text-xs font-medium text-warning mb-1">
              <FlaskConical size={12} />
              No sequence loaded
            </div>
            <p className="text-[11px] text-muted-foreground">
              Load a FASTA file into a{' '}
              <span className="text-primary">FASTA Input node</span> (click it
              after adding), or use{' '}
              <button
                onClick={() => {
                  setActiveSidebarItem('biodrop');
                  router.push('/dashboard/biodrop');
                }}
                className="text-primary hover:underline"
              >
                BioDrop Explorer
              </button>
            </p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => addNode('fasta-input')}
          >
            <Dna size={14} /> Add FASTA Input
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCommandPaletteOpen(true)}
          >
            Browse Nodes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const savedWorkflows = useWorkflowStore((s) => s.savedWorkflows);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });

  const hasInput = useMemo(
    () => nodes.some((n) => {
      const d = n.data as Record<string, unknown>;
      return d.config && typeof d.config === 'object' && !!(d.config as Record<string, unknown>).sequenceData;
    }),
    [nodes],
  );

  const label = nodes.length === 0
    ? 'BioFlow - Workflow Builder'
    : `BioFlow - ${nodes.length} node${nodes.length > 1 ? 's' : ''}${hasInput ? ' • sequence loaded' : ''}`;

  useEffect(() => {
    document.title = label;
  }, [label]);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.origX = pos.x;
    dragRef.current.origY = pos.y;
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPos({
        x: Math.max(0, dragRef.current.origX + dx),
        y: Math.max(0, dragRef.current.origY + dy),
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative overflow-hidden">
        <FlowCanvas />
        {nodes.length === 0 && <WorkflowEmptyState />}
        <div
          ref={toolbarRef}
          className={cn(
            'absolute z-10 transition-shadow',
            dragging ? 'shadow-2xl shadow-primary/20 scale-[1.02]' : 'shadow-lg',
          )}
          style={{ left: pos.x, top: pos.y }}
        >
          <div className="flex items-stretch rounded-xl border border-border bg-surface">
            <button
              onMouseDown={onDragStart}
              className="flex items-center justify-center rounded-l-xl px-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors border-r border-border"
            >
              <GripVertical size={14} />
            </button>
            <WorkflowToolbar />
          </div>
        </div>
      </div>
    </div>
  );
}
