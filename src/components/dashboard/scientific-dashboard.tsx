'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useScientificValidation } from '@/hooks/use-scientific-validation';
import { cn } from '@/lib/utils';

export function ScientificDashboard() {
  const open = useUIStore((s) => s.scientificDashboardOpen);
  const setOpen = useUIStore((s) => s.setScientificDashboardOpen);
  const { nodeResults, seqStats } = useScientificValidation();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  const totalChecks = nodeResults.reduce((sum: number, n: { checks: unknown[] }) => sum + n.checks.length, 0);
  const passedChecks = nodeResults.reduce((sum: number, n: { checks: { passed: boolean }[] }) => sum + n.checks.filter((c: { passed: boolean }) => c.passed).length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[80vh] rounded-xl border border-border bg-surface p-6 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Scientific Accuracy Dashboard</h2>
          </div>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
          <span className={cn('flex items-center gap-1', passedChecks === totalChecks ? 'text-success' : 'text-warning')}>
            <CheckCircle size={14} /> {passedChecks}/{totalChecks} checks passed
          </span>
          <span>{nodeResults.length} nodes</span>
          <span>{seqStats.length} sequences</span>
        </div>

        {seqStats.length > 0 && (
          <div className="mb-4 rounded-lg bg-background p-3">
            <div className="text-xs font-medium text-foreground mb-2">Loaded Sequences</div>
            <div className="space-y-1">
              {seqStats.map((s, i) => (
                <div key={i} className="flex justify-between text-[11px] font-mono text-muted-foreground">
                  <span className="truncate">{s.header}</span>
                  <span className="shrink-0 ml-2">{s.length.toLocaleString()} bp</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {nodeResults.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No node results yet. Run a workflow to see validation data.
          </div>
        )}

        <div className="space-y-3">
          {nodeResults.map((node) => (
            <div key={node.nodeId} className="rounded-lg bg-background p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs font-medium px-1.5 py-0.5 rounded',
                    node.status === 'complete' ? 'bg-success/10 text-success' :
                    node.status === 'error' ? 'bg-danger/10 text-danger' :
                    'bg-muted text-muted-foreground',
                  )}>{node.status}</span>
                  <span className="text-sm font-medium text-foreground">{node.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{node.type}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">#{node.nodeId}</span>
              </div>
              <div className="space-y-1">
                {node.checks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    {check.passed ? (
                      <CheckCircle size={12} className="text-success shrink-0" />
                    ) : (
                      <AlertCircle size={12} className="text-danger shrink-0" />
                    )}
                    <span className="text-muted-foreground">{check.name}:</span>
                    <span className={check.passed ? 'text-foreground' : 'text-danger'}>{check.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
