'use client';

import { X, Download, FileText } from 'lucide-react';
import type {
  ORF, GCResult, TranslationResult, BioSequence,
  AlignmentResult, MotifResult, RestrictionEnzymeResult,
  PrimerDesignResult, CodonUsageResult, ProteinPropertiesResult,
  FASTQResult, GenBankResult,
} from '@/types/sequence';
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
        const longest = Math.max(...orfs.map((o) => o.lengthAa));
        const avg = Math.round(orfs.reduce((s, o) => s + o.lengthBp, 0) / orfs.length);
        lines.push(`- Longest ORF: ${longest.toLocaleString()} aa`);
        lines.push(`- Average length: ${avg.toLocaleString()} bp`);
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

    if (typeof result === 'object' && result !== null && 'length' in result && !('header' in result)) {
      const rc = result as { length: number; sequence: string };
      if ('sequence' in rc) {
        lines.push('## Reverse Complement', '');
        lines.push(`- Length: ${rc.length.toLocaleString()} bp`);
        lines.push(`- Sequence: ${rc.sequence.slice(0, 80)}...`);
        lines.push('');
      }
    }

    if (typeof result === 'object' && result !== null && 'aligned1' in result) {
      const al = result as AlignmentResult;
      lines.push('## Sequence Alignment', '');
      lines.push(`- Score: ${al.score.toLocaleString()}`);
      lines.push(`- Identity: ${al.identityPercent.toFixed(1)}%`);
      lines.push(`- Gaps: ${al.gaps} (${al.gapOpenings} openings)`);
      lines.push(`- Matches: ${al.matches}`);
      lines.push(`- Mismatches: ${al.mismatches}`);
      lines.push(`- Coverage: ${al.coverage.toFixed(1)}%`);
      lines.push('');
      lines.push('```');
      lines.push(al.aligned1.slice(0, 80));
      lines.push(al.aligned2.slice(0, 80));
      lines.push('```');
      lines.push('');
    }

    if (typeof result === 'object' && result !== null && 'totalMatches' in result && 'matches' in result) {
      const m = result as MotifResult;
      lines.push('## Motif Search', '');
      lines.push(`- Motif: ${m.motif}`);
      lines.push(`- Total matches: ${m.totalMatches}`);
      if (m.matches.length > 0) {
        lines.push(`- Positions: ${m.matches.slice(0, 10).map((x) => x.start + 1).join(', ')}${m.matches.length > 10 ? '...' : ''}`);
      }
      lines.push('');
    }

    if (typeof result === 'object' && result !== null && 'totalCuts' in result) {
      const re = result as RestrictionEnzymeResult;
      lines.push('## Restriction Analysis', '');
      lines.push(`- Total cuts: ${re.totalCuts}`);
      lines.push(`- Enzymes found: ${Object.keys(re.enzymeCounts).join(', ')}`);
      if (re.cuts.length > 0) {
        lines.push(`- Cut positions: ${re.cuts.slice(0, 10).map((c) => `${c.enzyme}@${c.recognitionStart + 1} (cut ${c.cutPosition + 1})`).join(', ')}${re.cuts.length > 10 ? '...' : ''}`);
      }
      lines.push('');
    }

    if (typeof result === 'object' && result !== null && 'forward' in result && 'pairs' in result) {
      const pd = result as PrimerDesignResult;
      lines.push('## Primer Design', '');
      lines.push(`- Primer pairs: ${pd.pairs.length}`);
      if (pd.pairs.length > 0) {
        const best = pd.pairs[0];
        lines.push(`- Best pair Tm: Fwd ${best.forward.tm.toFixed(1)}°C / Rev ${best.reverse.tm.toFixed(1)}°C`);
        lines.push(`- Product size: ${best.productSize} bp`);
        lines.push(`- Tm difference: ${best.tmDiff.toFixed(1)}°C`);
      }
      lines.push('');
    }

    if (typeof result === 'object' && result !== null && 'preferredCodons' in result) {
      const cu = result as CodonUsageResult;
      lines.push('## Codon Usage', '');
      lines.push(`- Total codons: ${cu.codons.length}`);
      lines.push(`- Preferred codons: ${cu.preferredCodons.length}`);
      lines.push(`- Rare codons: ${cu.rareCodons.length}`);
      if (cu.codons.length > 0) {
        const top = cu.codons.sort((a, b) => (b.rscu || 0) - (a.rscu || 0)).slice(0, 5);
        lines.push(`- Top RSCU: ${top.map((c) => `${c.codon}(${(c.rscu || 0).toFixed(2)})`).join(', ')}`);
      }
      lines.push('');
    }

    if (typeof result === 'object' && result !== null && 'molecularWeight' in result) {
      const pp = result as ProteinPropertiesResult;
      lines.push('## Protein Properties', '');
      lines.push(`- Molecular weight: ${(pp.molecularWeight / 1000).toFixed(1)} kDa`);
      lines.push(`- Isoelectric point (pI): ${pp.isoelectricPoint.toFixed(2)}`);
      lines.push(`- Extinction coefficient: ${pp.extinctionCoefficient.toLocaleString()}`);
      lines.push(`- Instability index: ${pp.instabilityIndex.toFixed(1)}${pp.instabilityIndex > 40 ? ' (unstable)' : ' (stable)'}`);
      lines.push(`- Hydrophobicity: ${pp.hydrophobicity.toFixed(3)}`);
      lines.push(`- Aromaticity: ${pp.aromaticity.toFixed(3)}`);
      lines.push('');
    }

    if (typeof result === 'object' && result !== null && 'totalReads' in result) {
      const fq = result as FASTQResult;
      lines.push('## FASTQ Quality', '');
      lines.push(`- Total reads: ${fq.totalReads.toLocaleString()}`);
      lines.push(`- Average quality: ${fq.avgQuality.toFixed(1)}`);
      lines.push(`- Average length: ${fq.avgLength.toFixed(0)} bp`);
      lines.push('');
    }

    if (typeof result === 'object' && result !== null && 'accession' in result) {
      const gb = result as GenBankResult;
      lines.push('## GenBank Entry', '');
      lines.push(`- Accession: ${gb.accession}${gb.version ? '.' + gb.version : ''}`);
      lines.push(`- Organism: ${gb.organism}`);
      lines.push(`- Definition: ${gb.definition}`);
      lines.push(`- Length: ${gb.length.toLocaleString()} bp`);
      lines.push(`- Features: ${gb.features.length}`);
      lines.push('');
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
