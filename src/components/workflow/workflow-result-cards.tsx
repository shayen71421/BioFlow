'use client';

import type {
  ORF, GCResult, TranslationResult, AlignmentResult,
  MotifResult, RestrictionEnzymeResult, PrimerDesignResult,
  CodonUsageResult, ProteinPropertiesResult, FASTQResult, GenBankResult,
  BioSequence,
} from '@/types/sequence';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const BASE_COLORS: Record<string, string> = {
  A: 'text-[#22C55E]', T: 'text-[#EF4444]',
  G: 'text-[#F59E0B]', C: 'text-[#3B82F6]',
};

export function WorkflowResultCards({ result }: { result: unknown }) {
  if (!result) return <p className="text-xs text-muted-foreground">No results</p>;

  if (typeof result === 'object' && result !== null && 'overall' in result) {
    return <GCResultCard result={result as GCResult} />;
  }
  if (typeof result === 'object' && result !== null && 'aligned1' in result) {
    return <AlignmentResultCard result={result as AlignmentResult} />;
  }
  if (typeof result === 'object' && result !== null && 'totalMatches' in result && 'matches' in result) {
    return <MotifResultCard result={result as MotifResult} />;
  }
  if (typeof result === 'object' && result !== null && 'totalCuts' in result) {
    return <RestrictionResultCard result={result as RestrictionEnzymeResult} />;
  }
  if (typeof result === 'object' && result !== null && 'forward' in result && 'pairs' in result) {
    return <PrimerResultCard result={result as PrimerDesignResult} />;
  }
  if (typeof result === 'object' && result !== null && 'preferredCodons' in result) {
    return <CodonUsageResultCard result={result as CodonUsageResult} />;
  }
  if (typeof result === 'object' && result !== null && 'molecularWeight' in result) {
    return <ProteinPropertiesResultCard result={result as ProteinPropertiesResult} />;
  }
  if (typeof result === 'object' && result !== null && 'totalReads' in result) {
    return <FASTQResultCard result={result as FASTQResult} />;
  }
  if (typeof result === 'object' && result !== null && 'accession' in result) {
    return <GenBankResultCard result={result as GenBankResult} />;
  }
  if (typeof result === 'object' && result !== null && 'frames' in result) {
    return <TranslationResultCard result={result as TranslationResult} />;
  }
  if (Array.isArray(result) && result.length > 0) {
    if (typeof result[0] === 'object' && 'start' in result[0]) {
      return <ORFResultCard result={result as ORF[]} />;
    }
    if (typeof result[0] === 'object' && 'sequence' in result[0]) {
      return <SequenceResultCard result={result as BioSequence[]} />;
    }
    return <DefaultResultCard result={result} />;
  }
  return <DefaultResultCard result={result} />;
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-background px-3 py-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={cn('text-sm font-bold font-mono', color || 'text-foreground')}>{value}</div>
    </div>
  );
}

function GCResultCard({ result }: { result: GCResult }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="GC Content" value={`${result.overall.toFixed(1)}%`} color="text-success" />
        <StatCard label="AT Content" value={`${result.at.toFixed(1)}%`} color="text-warning" />
        <StatCard label="Total Bases" value={result.total.toLocaleString()} />
      </div>
      <div className="space-y-1">
        {result.distribution.slice(0, 5).map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-8">{d.label}</span>
            <div className="flex-1 h-2 rounded-full bg-background overflow-hidden">
              <div className="h-full rounded-full bg-success" style={{ width: `${d.gc}%` }} />
            </div>
            <span className="text-[10px] font-mono text-success">{d.gc.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ORFResultCard({ result }: { result: ORF[] }) {
  const sorted = [...result].sort((a, b) => b.lengthBp - a.lengthBp);
  const maxLen = sorted[0]?.lengthBp || 1;
  return (
    <div className="space-y-2">
      <Badge variant="success">{result.length} ORF{result.length !== 1 ? 's' : ''} found</Badge>
      {sorted.slice(0, 10).map((orf, i) => (
        <div key={i} className="rounded-lg bg-background p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-warning">{orf.frame > 2 ? `-${orf.frame - 3}` : `+${orf.frame}`}/{orf.strand}</span>
            <span className="text-[10px] text-muted-foreground">{orf.start}–{orf.end}</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface overflow-hidden">
            <div className="h-full rounded-full bg-success" style={{ width: `${(orf.lengthBp / maxLen) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-foreground font-mono">{orf.lengthBp} bp / {orf.lengthAa} aa</span>
            <span className="text-muted-foreground font-mono">{orf.protein.slice(0, 20)}...</span>
          </div>
        </div>
      ))}
      {result.length > 10 && <p className="text-[10px] text-muted-foreground">+{result.length - 10} more</p>}
    </div>
  );
}

function TranslationResultCard({ result }: { result: TranslationResult }) {
  return (
    <div className="space-y-2">
      <Badge variant="info">{result.frames.length} frames translated</Badge>
      {result.frames.slice(0, 3).map((f) => (
        <div key={f.frame} className="rounded-lg bg-background p-2">
          <div className="text-[10px] font-mono text-accent mb-1">Frame +{f.frame}</div>
          <div className="flex flex-wrap gap-[1px]">
            {f.aa.slice(0, 60).split('').map((aa, i) => (
              <span
                key={i}
                className={cn(
                  'text-[9px] font-mono leading-none',
                  aa === '*' ? 'text-danger' : 'text-foreground',
                )}
              >
                {aa}
              </span>
            ))}
            {f.aa.length > 60 && <span className="text-[9px] text-muted-foreground">...</span>}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">{f.aa.length} aa</div>
        </div>
      ))}
    </div>
  );
}

function AlignmentResultCard({ result }: { result: AlignmentResult }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Score" value={result.score.toLocaleString()} color="text-success" />
        <StatCard label="Identity" value={`${result.identityPercent.toFixed(1)}%`} color="text-accent" />
        <StatCard label="Coverage" value={`${result.coverage.toFixed(1)}%`} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="Matches" value={result.matches.toLocaleString()} />
        <StatCard label="Mismatches" value={result.mismatches.toLocaleString()} color="text-danger" />
        <StatCard label="Gaps" value={result.gaps.toLocaleString()} color="text-warning" />
        <StatCard label="Openings" value={result.gapOpenings.toLocaleString()} />
      </div>
      <div className="rounded-lg bg-background p-2 font-mono text-[9px] leading-relaxed break-all max-h-32 overflow-y-auto">
        <div className="text-success text-[10px] font-semibold mb-1">Aligned:</div>
        <div className="text-success">{result.aligned1.slice(0, 200)}</div>
        <div className="text-muted-foreground">{result.aligned2.slice(0, 200)}</div>
        {result.aligned1.length > 200 && <div className="text-[9px] text-muted-foreground mt-1">… truncated ({result.aligned1.length} total positions)</div>}
      </div>
    </div>
  );
}

function MotifResultCard({ result }: { result: MotifResult }) {
  return (
    <div className="space-y-2">
      <Badge variant={result.totalMatches > 0 ? 'success' : 'default'}>
        {result.totalMatches} match{result.totalMatches !== 1 ? 'es' : ''}
      </Badge>
      <div className="text-xs text-muted-foreground font-mono">Motif: {result.motif}</div>
      {result.matches.slice(0, 5).map((m, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg bg-background px-2 py-1">
          <span className="text-[10px] text-muted-foreground">{m.start + 1}</span>
          <span className="text-[10px] font-mono text-success">{m.sequence}</span>
          <span className="text-[10px] text-muted-foreground">strand: {m.strand}</span>
        </div>
      ))}
      {result.matches.length > 5 && <p className="text-[10px] text-muted-foreground">+{result.matches.length - 5} more</p>}
    </div>
  );
}

function RestrictionResultCard({ result }: { result: RestrictionEnzymeResult }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total Cuts" value={result.totalCuts.toLocaleString()} color="text-danger" />
        <StatCard label="Enzymes" value={Object.keys(result.enzymeCounts).length.toLocaleString()} color="text-accent" />
      </div>
      <div className="space-y-1">
        {Object.entries(result.enzymeCounts).slice(0, 6).map(([enz, count]) => (
          <div key={enz} className="flex items-center justify-between rounded-lg bg-background px-2 py-1">
            <span className="text-[10px] font-mono text-foreground">{enz}</span>
            <span className="text-[10px] font-mono text-muted-foreground">{count} cut{count !== 1 ? 's' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrimerResultCard({ result }: { result: PrimerDesignResult }) {
  return (
    <div className="space-y-2">
      <Badge variant="success">{result.pairs.length} primer pair{result.pairs.length !== 1 ? 's' : ''}</Badge>
      <div className="max-h-48 overflow-y-auto space-y-1.5">
        {result.pairs.slice(0, 10).map((p, i) => (
          <div key={i} className="rounded-lg bg-background p-2 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-success">Fwd: {p.forward.tm.toFixed(1)}°C</span>
              <span className="text-muted-foreground font-mono">{p.forward.start + 1}–{p.forward.end}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-danger">Rev: {p.reverse.tm.toFixed(1)}°C</span>
              <span className="text-muted-foreground font-mono">{p.reverse.start + 1}–{p.reverse.end}</span>
            </div>
            <div className="text-[9px] text-muted-foreground">Product: {p.productSize} bp | ΔTm: {p.tmDiff.toFixed(1)}°C</div>
            <div className="text-[9px] text-muted-foreground font-mono break-all leading-relaxed">
              {p.forward.seq}
            </div>
            <div className="text-[9px] text-muted-foreground font-mono break-all leading-relaxed">
              {p.reverse.seq}
            </div>
          </div>
        ))}
      </div>
      {result.pairs.length > 10 && <p className="text-[10px] text-muted-foreground">+{result.pairs.length - 10} more</p>}
    </div>
  );
}

function CodonUsageResultCard({ result }: { result: CodonUsageResult }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total Codons" value={result.codons.length.toLocaleString()} />
        <StatCard label="Preferred" value={result.preferredCodons.length.toLocaleString()} color="text-success" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Rare Codons" value={result.rareCodons.length.toLocaleString()} color="text-danger" />
      </div>
      <div className="max-h-24 overflow-y-auto space-y-1">
        {result.codons.slice(0, 10).map((c, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-background px-2 py-0.5">
            <span className="text-[10px] font-mono text-foreground">
              {c.codon} → {c.aa}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {(c.rscu || 0).toFixed(2)} RSCU
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProteinPropertiesResultCard({ result }: { result: ProteinPropertiesResult }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard label="Molecular Weight" value={`${(result.molecularWeight / 1000).toFixed(1)} kDa`} color="text-success" />
      <StatCard label="Isoelectric Point" value={result.isoelectricPoint.toFixed(2)} color="text-accent" />
      <StatCard label="Ext. Coefficient" value={result.extinctionCoefficient.toLocaleString()} />
      <StatCard label="Instability Index" value={result.instabilityIndex.toFixed(1)} color={result.instabilityIndex > 40 ? 'text-danger' : 'text-success'} />
    </div>
  );
}

function FASTQResultCard({ result }: { result: FASTQResult }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard label="Total Reads" value={result.totalReads.toLocaleString()} color="text-success" />
      <StatCard label="Avg Quality" value={result.avgQuality.toFixed(1)} color="text-accent" />
      <StatCard label="Avg Length" value={`${result.avgLength.toFixed(0)} bp`} color="text-secondary" />
    </div>
  );
}

function GenBankResultCard({ result }: { result: GenBankResult }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-mono text-success truncate">{result.accession}</div>
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Length" value={`${result.length.toLocaleString()} bp`} />
        <StatCard label="Features" value={result.features.length.toLocaleString()} color="text-accent" />
      </div>
      {result.sequence && (
        <div className="rounded-lg bg-background p-2 font-mono text-[10px] break-all leading-relaxed">
          {result.sequence.slice(0, 200)}
          {result.sequence.length > 200 && <span className="text-muted-foreground">...</span>}
        </div>
      )}
    </div>
  );
}

function SequenceResultCard({ result }: { result: BioSequence[] }) {
  return (
    <div className="space-y-2">
      {result.slice(0, 3).map((seq, i) => (
        <div key={i} className="rounded-lg bg-background p-2">
          <div className="text-xs text-success truncate">{seq.header}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground font-mono">{seq.length.toLocaleString()} bp</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {((seq.sequence.match(/[GC]/gi)?.length || 0) / seq.sequence.length * 100).toFixed(0)}% GC
            </span>
          </div>
          <div className="flex flex-wrap gap-[1px] mt-1 max-h-48 overflow-y-auto">
            {seq.sequence.split('').map((base, j) => (
              <span key={j} className={cn('text-[8px] font-mono', BASE_COLORS[base] || 'text-muted-foreground')}>
                {base}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DefaultResultCard({ result }: { result: unknown }) {
  if (result && typeof result === 'object' && 'upstream' in result) {
    return (
      <div className="space-y-2">
        <Badge variant="info">Aggregate</Badge>
        <p className="text-[10px] text-muted-foreground">
          {((result as { upstream: unknown[] }).upstream?.length || 0)} upstream result(s) collected
        </p>
        {((result as { upstream: unknown[] }).upstream || []).slice(0, 3).map((u, i) => (
          <div key={i} className="rounded-lg bg-background p-2">
            <WorkflowResultCards result={u} />
          </div>
        ))}
      </div>
    );
  }
  if (typeof result === 'string') {
    return (
      <div className="rounded-lg bg-background p-2">
        <div className="flex flex-wrap gap-[1px]">
          {result.slice(0, 100).split('').map((base, i) => (
            <span key={i} className={cn('text-[9px] font-mono', BASE_COLORS[base] || 'text-muted-foreground')}>
              {base}
            </span>
          ))}
        </div>
        {result.length > 100 && <p className="text-[10px] text-muted-foreground mt-1">+{result.length - 100} more bp</p>}
      </div>
    );
  }
  return (
    <pre className="text-[10px] text-muted-foreground font-mono whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
      {JSON.stringify(result, null, 2).slice(0, 500)}
    </pre>
  );
}
