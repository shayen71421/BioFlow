'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Dna, Search, BarChart3, ArrowRightToLine, FileText } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { icon: Dna, label: 'FASTA', desc: 'Input Sequence', color: 'text-success' },
  { icon: Search, label: 'ORF Finder', desc: 'Detect Reading Frames', color: 'text-accent' },
  { icon: ArrowRightToLine, label: 'Translation', desc: 'DNA → Protein', color: 'text-warning' },
  { icon: BarChart3, label: 'GC Analysis', desc: 'Calculate Content', color: 'text-secondary' },
  { icon: FileText, label: 'Report', desc: 'Export Results', color: 'text-danger' },
];

export function AnimatedPipeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      nodesRef.current.forEach((node, i) => {
        if (!node) return;
        tl.fromTo(
          node,
          { scale: 0, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.6 },
          i * 0.2,
        );

        if (i < linesRef.current.length) {
          const line = linesRef.current[i];
          if (!line) return;
          tl.fromTo(
            line,
            { scaleY: 0, opacity: 0 },
            { scaleY: 1, opacity: 1, duration: 0.3, transformOrigin: 'top center' },
            i * 0.2 + 0.4,
          );
        }
      });

      tl.fromTo(
        '.pipeline-cta',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 },
        '-=0.2',
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col items-center py-20">
      <div className="flex flex-col items-center gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-col items-center">
            <div
              ref={(el) => { nodesRef.current[i] = el; }}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-5 py-3 shadow-lg hover:border-primary/30 transition-colors"
            >
              <step.icon size={20} className={step.color} />
              <div>
                <div className="text-sm font-semibold text-foreground">{step.label}</div>
                <div className="text-[11px] text-muted-foreground">{step.desc}</div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                ref={(el) => { linesRef.current[i] = el; }}
                className="h-8 w-0.5 bg-gradient-to-b from-primary/50 to-transparent"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
