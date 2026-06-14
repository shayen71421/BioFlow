'use client';

import { useMemo, useState } from 'react';
import BENCHMARK_SEQUENCES from '@/lib/validation/benchmark-data';
import { runBenchmark } from '@/lib/validation/benchmark-runner';
import type { BenchmarkResult } from '@/lib/validation/benchmark-runner';
import { cn } from '@/lib/utils';

const categoryOrder = ['GC Content', 'Translation', 'ORF Finder', 'Motif Search', 'Restriction Enzymes', 'Reverse Complement', 'Alignment', 'FASTA Parser', 'Primer Design', 'Protein Properties'];

export default function ValidationPage() {
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  const results = useMemo(() => {
    return BENCHMARK_SEQUENCES.map((tc) => runBenchmark(tc));
  }, []);

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  const grouped = useMemo(() => {
    const map: Record<string, BenchmarkResult[]> = {};
    for (const r of results) {
      if (filter === 'passed' && !r.passed) continue;
      if (filter === 'failed' && r.passed) continue;
      if (!map[r.category]) map[r.category] = [];
      map[r.category].push(r);
    }
    return map;
  }, [results, filter]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold text-foreground">Benchmark Validation Suite</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="text-success font-medium">{passedCount} passed</span>
            {failedCount > 0 && <span className="text-danger font-medium">{failedCount} failed</span>}
            <span className="text-muted-foreground">{results.length} total</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Known biological test sequences with expected vs actual results.
          <span className="ml-2 text-[10px] opacity-60">Jest for biology</span>
        </p>

        <div className="flex gap-2 mt-3">
          {(['all', 'passed', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                filter === f
                  ? 'bg-accent/10 text-accent border border-accent/30'
                  : 'bg-muted text-muted-foreground border border-border hover:border-accent/30',
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6">
        {categoryOrder.map((cat) => {
          const items = grouped[cat];
          if (!items || items.length === 0) return null;
          const catPassed = items.filter((r) => r.passed).length;
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground">{cat}</h2>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded font-medium',
                  catPassed === items.length ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
                )}>
                  {catPassed}/{items.length}
                </span>
              </div>
              <div className="space-y-1">
                {items.map((r) => (
                  <div
                    key={r.id}
                    className={cn(
                      'rounded-lg px-4 py-2 text-xs',
                      r.passed ? 'bg-background' : 'bg-danger/5 border border-danger/20',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        r.passed ? 'bg-success' : 'bg-danger',
                      )} />
                      <span className="text-foreground font-medium w-48 shrink-0 truncate" title={r.name}>
                        {r.name}
                      </span>
                      <span className="text-muted-foreground shrink-0 truncate max-w-[200px]" title={r.description}>
                        {r.description}
                      </span>
                      <span className={cn(
                        'font-mono shrink-0 ml-auto',
                        r.passed ? 'text-success' : 'text-danger',
                      )}>
                        {r.actual}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-5">
                      <span className="text-[10px] text-muted-foreground/50 font-mono truncate" title={Object.values(r.input).join(' | ')}>
                        input: {Object.values(r.input).filter(Boolean).join(' | ') || '(none)'}
                      </span>
                      {!r.passed && (
                        <span className="text-muted-foreground font-mono text-[10px] truncate">
                          expected: {r.expected}
                        </span>
                      )}
                      {r.detail && !r.passed && (
                        <span className="text-danger/70 font-mono text-[10px] truncate" title={r.detail}>
                          {r.detail}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
