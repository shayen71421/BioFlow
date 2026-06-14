'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Workflow, Dna, LayoutTemplate, Terminal, ShieldCheck,
  Scissors, Search, ArrowRightToLine,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Workflow,
    title: 'Visual Pipeline Builder',
    description: 'Build complex bioinformatics workflows by dragging and connecting nodes on an interactive canvas. Execute DAG-based pipelines with topological sort and selective recalculation.',
    color: 'text-primary',
  },
  {
    icon: Dna,
    title: '16 Analysis Nodes',
    description: 'From FASTA input to protein properties — 16 specialized nodes covering GC content, ORF detection, translation, alignment, primer design, restriction analysis, and more.',
    color: 'text-accent',
  },
  {
    icon: LayoutTemplate,
    title: '15 Starter Templates',
    description: 'Jump-start your analysis with pre-built workflows for genome exploration, primer design, cloning prep, codon usage, and comprehensive multi-node pipelines.',
    color: 'text-secondary',
  },
  {
    icon: ShieldCheck,
    title: 'Validated Results',
    description: 'Every bioinformatics function is backed by 42+ benchmark tests with independently verified expected values. Metadata verification catches data entry errors before they reach you.',
    color: 'text-success',
  },
  {
    icon: Search,
    title: 'Provenance Evidence',
    description: 'Every result includes an interactive evidence view — colored alignment traces, ORF start/stop highlights, primer overlays with directional arrows, and restriction cut site markers on the sequence.',
    color: 'text-warning',
  },
  {
    icon: Scissors,
    title: 'Clone & Restrict',
    description: 'Digest sequences with 200+ restriction enzymes, design PCR primers with Tm/GC scoring, and visualize cut sites and fragment sizes on an interactive genome map.',
    color: 'text-danger',
  },
  {
    icon: ArrowRightToLine,
    title: 'Multiple Export Formats',
    description: 'Export results as CSV, generate summary reports, or share workflows as portable .bioflow.json files. All analysis runs in-browser — nothing leaves your machine.',
    color: 'text-info',
  },
  {
    icon: Terminal,
    title: 'Zero Backend Required',
    description: 'Every bioinformatics function is pure TypeScript running in your browser. Deploy as static assets to Vercel, Netlify, or any CDN. No server, no API keys, no setup.',
    color: 'text-warning',
  },
];

const categories = [
  { name: 'Input', color: 'border-l-success', nodes: 'FASTA Input, FASTQ Input, GenBank Input' },
  { name: 'Analysis', color: 'border-l-accent', nodes: 'GC Content, ORF Finder, Translation, Reverse Complement, Alignment, Motif Search' },
  { name: 'Advanced', color: 'border-l-[#EC4899]', nodes: 'Restriction Enzymes, Primer Design, Codon Usage, Protein Properties' },
  { name: 'Output', color: 'border-l-danger', nodes: 'Report, CSV Export, Sequence Viewer' },
];

export function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.feature-card', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
    }, ref);

    const catCtx = gsap.context(() => {
      gsap.fromTo('.cat-card', { opacity: 0, x: -20 }, {
        opacity: 1, x: 0, duration: 0.5, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: catRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
    }, catRef);

    return () => { ctx.revert(); catCtx.revert(); };
  }, []);

  return (
    <div className="space-y-24">
      <div ref={catRef}>
        <div className="mb-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">16 Node Types, 4 Categories</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Everything you need for comprehensive sequence analysis
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`cat-card rounded-xl border border-border bg-surface p-5 ${cat.color} border-l-[3px] transition-all duration-300 hover:border-primary/30 hover:shadow-lg`}
            >
              <h3 className="text-sm font-semibold text-foreground mb-2">{cat.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{cat.nodes}</p>
            </div>
          ))}
        </div>
      </div>

      <div ref={ref}>
        <div className="mb-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">Why BioFlow?</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Built for biologists who want results, not command-line syntax
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="feature-card rounded-xl border border-border bg-surface p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                <feat.icon size={20} className={feat.color} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{feat.title}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
