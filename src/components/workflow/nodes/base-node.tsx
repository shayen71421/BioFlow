'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  FileInput, ScanSearch, Percent, ArrowRightToLine, ArrowLeftRight,
  AlignStartVertical, Search, FileText, Table, Eye, Scissors, Dna, FlaskConical,
} from 'lucide-react';
import type { BioNodeData } from '@/types/workflow';
import type {
  ORF, GCResult, TranslationResult, BioSequence, AlignmentResult,
  MotifResult, RestrictionEnzymeResult, PrimerDesignResult,
  CodonUsageResult, ProteinPropertiesResult, FASTQResult, GenBankResult,
} from '@/types/sequence';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const iconMap: Record<string, React.FC<{ size?: number }>> = {
  FileInput, ScanSearch, Percent, ArrowRightToLine, ArrowLeftRight,
  AlignStartVertical, Search, FileText, Table, Eye, Scissors, Dna, FlaskConical,
};

const categoryBorder: Record<string, string> = {
  input: 'border-l-[3px] border-l-success',
  analysis: 'border-l-[3px] border-l-accent',
  'advanced-analysis': 'border-l-[3px] border-l-[#EC4899]',
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
            {renderResults(nodeData)}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </div>
  );
}

function renderResults(nodeData: BioNodeData) {
  const r = nodeData.results;

  if (nodeData.type === 'fasta-input') {
    const seqs = (nodeData.config?.sequenceData as BioSequence[] | undefined) || (r as BioSequence[] | undefined);
    if (seqs && seqs.length > 0) {
      return (
        <>
          <div className="text-success truncate">{seqs[0].header}</div>
          <div className="text-muted-foreground">{seqs[0].length.toLocaleString()} bp</div>
        </>
      );
    }
    return <div className="text-muted-foreground">No sequence loaded</div>;
  }

  if (nodeData.type === 'fastq-input' && r && typeof r === 'object' && 'totalReads' in r) {
    const fq = r as FASTQResult;
    return (
      <>
        <div className="text-success">{fq.totalReads.toLocaleString()} reads</div>
        <div className="text-muted-foreground">Avg qual: {fq.avgQuality.toFixed(1)}</div>
      </>
    );
  }

  if (nodeData.type === 'genbank-input' && r && typeof r === 'object' && 'accession' in r) {
    const gb = r as GenBankResult;
    return (
      <>
        <div className="text-success truncate">{gb.accession}</div>
        <div className="text-muted-foreground">{gb.length.toLocaleString()} bp, {gb.features.length} features</div>
      </>
    );
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
          <div key={f.frame} className="text-muted-foreground truncate">
            +{f.frame}: {f.aa.slice(0, 30)}...
          </div>
        ))}
      </>
    );
  }

  if (typeof r === 'object' && r !== null && 'aligned1' in r) {
    const al = r as AlignmentResult;
    return (
      <>
        <div className="text-success">Score: {al.score}</div>
        <div className="text-muted-foreground">Identity: {al.identityPercent.toFixed(1)}%</div>
      </>
    );
  }

  if (typeof r === 'object' && r !== null && 'totalMatches' in r && 'matches' in r) {
    const m = r as MotifResult;
    return (
      <>
        <div className="text-success">{m.totalMatches} match{m.totalMatches !== 1 ? 'es' : ''}</div>
        <div className="text-muted-foreground truncate">Motif: {m.motif}</div>
      </>
    );
  }

  if (typeof r === 'object' && r !== null && 'totalCuts' in r) {
    const re = r as RestrictionEnzymeResult;
    return (
      <>
        <div className="text-success">{re.totalCuts} cut{re.totalCuts !== 1 ? 's' : ''}</div>
        <div className="text-muted-foreground">{Object.keys(re.enzymeCounts).length} enzymes</div>
      </>
    );
  }

  if (typeof r === 'object' && r !== null && 'forward' in r && 'pairs' in r) {
    const pd = r as PrimerDesignResult;
    return (
      <>
        <div className="text-success">{pd.pairs.length} primer pair{pd.pairs.length !== 1 ? 's' : ''}</div>
        {pd.pairs.length > 0 && (
          <div className="text-muted-foreground">Best Tm: {pd.pairs[0].forward.tm.toFixed(1)}°C</div>
        )}
      </>
    );
  }

  if (typeof r === 'object' && r !== null && 'preferredCodons' in r) {
    const cu = r as CodonUsageResult;
    return (
      <>
        <div className="text-success">{cu.codons.length} codons</div>
        <div className="text-muted-foreground">{cu.preferredCodons.length} preferred, {cu.rareCodons.length} rare</div>
      </>
    );
  }

  if (typeof r === 'object' && r !== null && 'molecularWeight' in r) {
    const pp = r as ProteinPropertiesResult;
    return (
      <>
        <div className="text-success">{pp.molecularWeight.toFixed(0)} Da</div>
        <div className="text-muted-foreground">pI: {pp.isoelectricPoint.toFixed(2)}</div>
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
}

export default memo(BaseNode);
