'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type {
  AlignmentResult, ORF, MotifResult, RestrictionEnzymeResult,
  PrimerDesignResult,
} from '@/types/sequence';

const BASE_COLORS: Record<string, string> = {
  A: 'text-[#22C55E]', T: 'text-[#EF4444]',
  G: 'text-[#F59E0B]', C: 'text-[#3B82F6]',
};

const BLOCK = 60;

export function EvidencePanel({ children, label }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1.5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {label || 'Show Evidence'}
      </button>
      {open && <div className="mt-2 rounded-lg bg-background p-2 font-mono text-[9px] leading-relaxed">{children}</div>}
    </div>
  );
}

export function AlignmentEvidence({ result }: { result: AlignmentResult }) {
  const { aligned1, aligned2 } = result;
  const blocks: { seq1: string; mid: string; seq2: string }[] = [];
  for (let i = 0; i < aligned1.length; i += BLOCK) {
    const s1 = aligned1.slice(i, i + BLOCK);
    const s2 = aligned2.slice(i, i + BLOCK);
    let mid = '';
    for (let j = 0; j < s1.length; j++) {
      if (s1[j] === '-' || s2[j] === '-') mid += ' ';
      else if (s1[j] === s2[j]) mid += '|';
      else mid += ' ';
    }
    blocks.push({ seq1: s1, mid, seq2: s2 });
  }

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto">
      {blocks.map((block, bi) => (
        <div key={bi} className="space-y-0.5">
          <div className="flex flex-wrap">
            {block.seq1.split('').map((ch, i) => {
              const matched = block.mid[i] === '|';
              return (
                <span
                  key={i}
                  className={cn(
                    'leading-tight',
                    ch === '-' ? 'text-[#6366F1]' : matched ? 'text-success' : 'text-danger',
                  )}
                >
                  {ch}
                </span>
              );
            })}
          </div>
          <div className="flex flex-wrap text-[7px] text-muted-foreground">
            {block.mid.split('').map((ch, i) => (
              <span key={i}>{ch}</span>
            ))}
          </div>
          <div className="flex flex-wrap">
            {block.seq2.split('').map((ch, i) => {
              const matched = block.mid[i] === '|';
              return (
                <span
                  key={i}
                  className={cn(
                    'leading-tight',
                    ch === '-' ? 'text-[#6366F1]' : matched ? 'text-success' : 'text-danger',
                  )}
                >
                  {ch}
                </span>
              );
            })}
          </div>
          {bi < blocks.length - 1 && <div className="border-t border-border/30 my-1" />}
        </div>
      ))}
    </div>
  );
}

export function ORFEvidence({ orf, sequence }: { orf: ORF; sequence?: string }) {
  if (!sequence) {
    return (
      <div className="space-y-1.5">
        <div className="grid grid-cols-4 gap-1 text-[10px]">
          <div><span className="text-muted-foreground">Start:</span> {orf.start + 1}</div>
          <div><span className="text-muted-foreground">Stop:</span> {orf.end}</div>
          <div><span className="text-muted-foreground">Length:</span> {orf.lengthBp} bp</div>
          <div><span className="text-muted-foreground">Frame:</span> {orf.frame > 2 ? `-${orf.frame - 3}` : `+${orf.frame}`}</div>
        </div>
        <div className="text-[10px] text-muted-foreground">{orf.protein}</div>
      </div>
    );
  }

  const contextSeq = sequence.slice(
    Math.max(0, orf.start - 10),
    Math.min(sequence.length, orf.end + 10),
  );
  const localStart = orf.start - Math.max(0, orf.start - 10);
  const localEnd = orf.end - Math.max(0, orf.start - 10);

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-4 gap-1 text-[10px]">
        <div><span className="text-muted-foreground">Start:</span> {orf.start + 1}</div>
        <div><span className="text-muted-foreground">Stop:</span> {orf.end}</div>
        <div><span className="text-muted-foreground">Length:</span> {orf.lengthBp} bp</div>
        <div><span className="text-muted-foreground">Frame:</span> {orf.frame > 2 ? `-${orf.frame - 3}` : `+${orf.frame}`}</div>
      </div>
      <div className="relative">
        <div className="flex flex-wrap gap-[1px]">
          {contextSeq.split('').map((base, i) => {
            const inOrf = i >= localStart && i < localEnd;
            const isStart = inOrf && (i - localStart) % 3 === 0 && (i - localStart) < 3;
            const isStop = inOrf && (i - localStart) >= orf.lengthBp - 3;
            return (
              <span
                key={i}
                className={cn(
                  'text-[9px] font-mono leading-tight relative',
                  BASE_COLORS[base] || 'text-muted-foreground',
                  inOrf && 'bg-success/10 rounded-sm px-[0.5px]',
                  isStart && 'bg-success/30 font-bold',
                  isStop && 'bg-danger/30 font-bold',
                )}
              >
                {base}
              </span>
            );
          })}
        </div>
        <div className="flex mt-0.5 h-1 rounded-full bg-surface overflow-hidden">
          <div className="h-full rounded-full bg-success transition-all" style={{
            marginLeft: `${(localStart / contextSeq.length) * 100}%`,
            width: `${((localEnd - localStart) / contextSeq.length) * 100}%`,
          }} />
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground break-all">
        {orf.protein}
      </div>
    </div>
  );
}

export function MotifEvidence({ result, sequence }: { result: MotifResult; sequence?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px]"><span className="text-muted-foreground">Motif:</span> {result.motif}</div>
      {result.matches.slice(0, 10).map((m, i) => {
        const contextSize = 15;
        const ctxStart = Math.max(0, m.start - contextSize);
        const ctxEnd = Math.min(sequence?.length || m.end + contextSize, m.end + contextSize);
        const prefix = sequence ? sequence.slice(ctxStart, m.start) : '';
        const match = m.sequence;
        const suffix = sequence ? sequence.slice(m.end, ctxEnd) : '';

        return (
          <div key={i} className="rounded bg-background/50 p-1.5">
            <div className="text-[10px] text-muted-foreground mb-0.5">Match {i + 1} — position {m.start + 1}</div>
            <div className="flex flex-wrap gap-[1px]">
              {prefix.split('').map((b, j) => (
                <span key={`p${j}`} className={cn('text-[9px] font-mono', BASE_COLORS[b] || 'text-muted-foreground')}>{b}</span>
              ))}
              {match.split('').map((b, j) => (
                <span key={`m${j}`} className={cn('text-[9px] font-mono bg-warning/20 rounded-sm font-bold', BASE_COLORS[b] || 'text-muted-foreground')}>{b}</span>
              ))}
              {suffix.split('').map((b, j) => (
                <span key={`s${j}`} className={cn('text-[9px] font-mono', BASE_COLORS[b] || 'text-muted-foreground')}>{b}</span>
              ))}
            </div>
            <div className="text-[9px] text-muted-foreground mt-0.5">Strand: {m.strand}</div>
          </div>
        );
      })}
    </div>
  );
}

export function RestrictionEvidence({ result, sequence }: { result: RestrictionEnzymeResult; sequence?: string }) {
  return (
    <div className="space-y-1.5">
      {result.cuts.slice(0, 20).map((cut, i) => {
        const ctxSize = 10;
        const ctxStart = Math.max(0, cut.cutPosition - ctxSize);
        const ctxEnd = Math.min(sequence?.length || cut.cutPosition + ctxSize, cut.cutPosition + ctxSize);
        const prefix = sequence ? sequence.slice(ctxStart, cut.cutPosition) : '';
        const suffix = sequence ? sequence.slice(cut.cutPosition, ctxEnd) : '';

        return (
          <div key={i} className="rounded bg-background/50 p-1.5">
            <div className="text-[10px] text-muted-foreground mb-0.5">{cut.enzyme} @ position {cut.cutPosition}</div>
            <div className="flex flex-wrap gap-[1px] items-center">
              {prefix.split('').map((b, j) => (
                <span key={`p${j}`} className={cn('text-[9px] font-mono', BASE_COLORS[b] || 'text-muted-foreground')}>{b}</span>
              ))}
              <span className="text-[9px] font-mono text-danger font-bold">|</span>
              {suffix.split('').map((b, j) => (
                <span key={`s${j}`} className={cn('text-[9px] font-mono', BASE_COLORS[b] || 'text-muted-foreground')}>{b}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PrimerEvidence({ pair, sequence }: { pair: PrimerDesignResult['pairs'][0]; sequence?: string }) {
  const f = pair.forward;
  const r = pair.reverse;

  if (!sequence) {
    return (
      <div className="space-y-1.5">
        <div className="rounded bg-background/50 p-1.5">
          <div className="text-[10px]">
            <span className="text-success font-semibold">Forward:</span> {f.seq}
          </div>
          <div className="text-[9px] text-muted-foreground">{f.start + 1}–{f.end} | Tm: {f.tm.toFixed(1)}°C | GC: {f.gcPercent.toFixed(0)}%</div>
        </div>
        <div className="rounded bg-background/50 p-1.5">
          <div className="text-[10px]">
            <span className="text-danger font-semibold">Reverse:</span> {r.seq}
          </div>
          <div className="text-[9px] text-muted-foreground">{r.start + 1}–{r.end} | Tm: {r.tm.toFixed(1)}°C | GC: {r.gcPercent.toFixed(0)}%</div>
        </div>
        <div className="text-[10px] text-muted-foreground">Product: {pair.productSize} bp | ΔTm: {pair.tmDiff.toFixed(1)}°C</div>
      </div>
    );
  }

  const ctxStart = Math.max(0, f.start - 5);
  const ctxEnd = Math.min(sequence.length, r.end + 5);
  const displaySeq = sequence.slice(ctxStart, ctxEnd);

  return (
    <div className="space-y-1.5">
      <div className="rounded bg-background/50 p-1.5">
        <div className="flex flex-wrap gap-[1px] items-center mb-1">
          {displaySeq.split('').map((b, i) => {
            const absPos = ctxStart + i;
            const inFwd = absPos >= f.start && absPos < f.end;
            const inRev = absPos >= r.start && absPos < r.end;
            const isProduct = absPos >= f.start && absPos < r.end;
            return (
              <span
                key={i}
                className={cn(
                  'text-[9px] font-mono leading-tight transition-all',
                  BASE_COLORS[b] || 'text-muted-foreground',
                  inFwd && 'bg-success/20 rounded-sm px-[0.5px]',
                  inRev && 'bg-danger/20 rounded-sm px-[0.5px]',
                  isProduct && !inFwd && !inRev && 'opacity-50',
                )}
              >
                {b}
              </span>
            );
          })}
        </div>
        <div className="relative h-4 mt-1">
          <div className="absolute top-0 left-0 right-0 flex items-center">
            <div className="h-0.5 flex-1 bg-success/30 relative">
              <div className="absolute -top-1.5 left-0 text-[8px] text-success">►</div>
              <span className="absolute -top-2.5 left-1 text-[7px] text-success whitespace-nowrap">{f.seq.slice(0, 10)}...</span>
            </div>
            <div className="h-0.5 flex-1 bg-muted-foreground/20 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[7px] text-muted-foreground whitespace-nowrap">{pair.productSize} bp</span>
            </div>
            <div className="h-0.5 flex-1 bg-danger/30 relative">
              <div className="absolute -top-1.5 right-0 text-[8px] text-danger">◄</div>
              <span className="absolute -top-2.5 right-1 text-[7px] text-danger whitespace-nowrap">...{r.seq.slice(-10)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground">Product: {pair.productSize} bp | ΔTm: {pair.tmDiff.toFixed(1)}°C</div>
    </div>
  );
}
