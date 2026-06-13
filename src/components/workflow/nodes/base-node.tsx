'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  FileInput, ScanSearch, Percent, ArrowRightToLine, ArrowLeftRight,
  AlignStartVertical, Search, FileText, Table, Eye,
} from 'lucide-react';
import type { BioNodeData } from '@/types/workflow';
import type { ORF, GCResult, TranslationResult, BioSequence } from '@/types/sequence';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const iconMap: Record<string, React.FC<{ size?: number }>> = {
  FileInput, ScanSearch, Percent, ArrowRightToLine, ArrowLeftRight,
  AlignStartVertical, Search, FileText, Table, Eye,
};

const categoryBorder: Record<string, string> = {
  input: 'border-l-[3px] border-l-success',
  analysis: 'border-l-[3px] border-l-accent',
  output: 'border-l-[3px] border-l-danger',
};

function BaseNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as BioNodeData;
  const Icon = iconMap[nodeData.icon];

  return (
    <div
      className={cn(
        'min-w-[220px] rounded-xl border border-border bg-surface shadow-lg transition-all duration-200',
        selected && 'ring-2 ring-ring shadow-xl shadow-primary/10',
        categoryBorder[nodeData.category] || 'border-l-[3px] border-l-border',
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-primary" />

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background">
              {Icon && <Icon size={16} />}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{nodeData.label}</div>
              <div className="text-[11px] text-muted-foreground">{nodeData.description}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant={
                nodeData.status === 'complete' ? 'success' :
                nodeData.status === 'running' ? 'info' :
                nodeData.status === 'error' ? 'danger' : 'default'
              }
              className="text-[10px] px-1.5 py-0"
            >
              {nodeData.status === 'idle' ? 'Ready' :
               nodeData.status === 'running' ? 'Running' :
               nodeData.status === 'complete' ? 'Done' : 'Error'}
            </Badge>
          </div>
        </div>

        {(nodeData.results != null || !!nodeData.config?.sequenceData) && (
          <div className="mt-2 rounded-lg bg-background/50 p-2 text-[11px] font-mono space-y-1">
            {(() => {
              const r = nodeData.results;
              if (nodeData.type === 'fasta-input') {
                const seqs = (nodeData.config?.sequenceData as BioSequence[] | undefined) || (r as BioSequence[] | undefined);
                if (seqs && seqs.length > 0) {
                  return (
                    <>
                      <div className="text-success">{seqs[0].header}</div>
                      <div className="text-muted-foreground">{seqs[0].length.toLocaleString()} bp</div>
                    </>
                  );
                }
                return <div className="text-muted-foreground">No sequence loaded</div>;
              }
              if (Array.isArray(r) && r.length > 0 && typeof r[0] === 'object' && 'start' in r[0]) {
                const orfs = r as ORF[];
                return (
                  <>
                    <div className="text-success">{orfs.length} ORF{orfs.length !== 1 ? 's' : ''} found</div>
                    <div className="text-muted-foreground">
                      Longest: {(Math.max(...orfs.map((o) => o.length))).toLocaleString()} aa
                    </div>
                  </>
                );
              }
              if (typeof r === 'object' && r !== null && 'overall' in r) {
                const gc = r as GCResult;
                return (
                  <>
                    <div className="text-success">GC: {gc.overall.toFixed(1)}%</div>
                    <div className="text-muted-foreground">AT: {gc.at.toFixed(1)}%</div>
                  </>
                );
              }
              if (typeof r === 'object' && r !== null && 'frames' in r) {
                const tr = r as TranslationResult;
                return (
                  <>
                    <div className="text-success">{tr.frames.length} frames translated</div>
                    {tr.frames.slice(0, 2).map((f) => (
                      <div key={f.frame} className="text-muted-foreground">
                        +{f.frame}: {f.aa.slice(0, 40)}...
                      </div>
                    ))}
                  </>
                );
              }
              if (typeof r === 'object' && r !== null && 'upstream' in r) {
                return <div className="text-warning">Results from {((r as { upstream: unknown[] }).upstream?.length || 0)} upstream nodes</div>;
              }
              if (Array.isArray(r) && r.length > 0 && typeof r[0] === 'object' && 'header' in r[0]) {
                const seqs = r as BioSequence[];
                return <div className="text-success">{seqs[0].length.toLocaleString()} bp loaded</div>;
              }
              return <div className="text-muted-foreground">Execution complete</div>;
            })()}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </div>
  );
}

export default memo(BaseNode);
