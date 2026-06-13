'use client';

import { X, Download, FileText } from 'lucide-react';
import type { ORF, GCResult, TranslationResult, BioSequence } from '@/types/sequence';
import { toast } from 'sonner';

interface ReportPreviewProps {
  open: boolean;
  onClose: () => void;
  upstream: unknown[];
}

function formatReport(upstream: unknown[]): string {
  const lines: string[] = [
    '# BioFlow Analysis Report',
    '',
    `Generated: ${new Date().toLocaleString()}`,
    '',
  ];

  for (const result of upstream) {
    if (!result || typeof result !== 'object') continue;

    if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object' && 'header' in result[0]) {
      const seqs = result as BioSequence[];
      lines.push('## Sequence Input', '');
      lines.push(`- Header: ${seqs[0]?.header || 'N/A'}`);
      lines.push(`- Length: ${seqs[0]?.length.toLocaleString() || 0} bp`);
      lines.push(`- Records: ${seqs.length}`);
      lines.push('');
    }

    if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object' && 'start' in result[0]) {
      const orfs = result as ORF[];
      lines.push('## ORF Analysis', '');
      lines.push(`- ORFs found: ${orfs.length}`);
      if (orfs.length > 0) {
        const longest = Math.max(...orfs.map((o) => o.length));
        const avg = Math.round(orfs.reduce((s, o) => s + o.length, 0) / orfs.length);
        lines.push(`- Longest ORF: ${longest.toLocaleString()} aa`);
        lines.push(`- Average length: ${avg.toLocaleString()} aa`);
        lines.push(`- Frames: ${[...new Set(orfs.map((o) => o.frame))].sort().join(', ')}`);
      }
      lines.push('');
    }

    if (typeof result === 'object' && result !== null && 'overall' in result) {
      const gc = result as GCResult;
      lines.push('## GC Content', '');
      lines.push(`- Overall GC: ${gc.overall.toFixed(1)}%`);
      lines.push(`- Overall AT: ${gc.at.toFixed(1)}%`);
      lines.push(`- GC count: ${gc.gcCount.toLocaleString()}`);
      lines.push(`- AT count: ${gc.atCount.toLocaleString()}`);
      lines.push(`- Window points: ${gc.windowData.length}`);
      lines.push('');
    }

    if (typeof result === 'object' && result !== null && 'frames' in result) {
      const tr = result as TranslationResult;
      lines.push('## Translation', '');
      lines.push(`- Frames translated: ${tr.frames.length}`);
      for (const f of tr.frames) {
        lines.push(`- Frame +${f.frame}: ${f.aa.length} aa`);
      }
      lines.push('');
    }

    if (typeof result === 'object' && result !== null && 'length' in result && typeof result === 'object' && !('header' in result)) {
      const rc = result as { length: number; sequence: string };
      if ('sequence' in rc) {
        lines.push('## Reverse Complement', '');
        lines.push(`- Length: ${rc.length.toLocaleString()} bp`);
        lines.push(`- Sequence: ${rc.sequence.slice(0, 80)}...`);
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

export function ReportPreview({ open, onClose, upstream }: ReportPreviewProps) {
  if (!open) return null;

  const report = formatReport(upstream);

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bioflow-report.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[80vh] rounded-xl border border-border bg-background shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Analysis Report</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDownload}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              <Download size={14} />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto p-4 text-xs leading-relaxed font-mono text-foreground whitespace-pre-wrap scrollbar-thin">
          {report}
        </pre>
      </div>
    </div>
  );
}
