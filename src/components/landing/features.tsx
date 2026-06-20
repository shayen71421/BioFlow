'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Binary,
  Layers,
  Search,
  Scissors,
  Thermometer,
  Hash,
  Table,
  FileInput,
  GitCommit,
  Workflow,
  Eye,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const algorithms = [
  {
    icon: Binary,
    title: 'Needleman-Wunsch Alignment',
    desc: 'Performs global sequence alignment using dynamic programming, with customizable match, mismatch, and affine gap scoring matrices.',
    accent: 'border-l-[#3B82F6] text-[#3B82F6]',
    chip: 'BG_BLUE',
  },
  {
    icon: Search,
    title: '6-Frame ORF Finder',
    desc: 'Scans forward and reverse complements across all six possible reading frames to map translation initiation and termination sites.',
    accent: 'border-l-[#8B5CF6] text-[#8B5CF6]',
    chip: 'BG_PURPLE',
  },
  {
    icon: Thermometer,
    title: 'PCR Primer Design (Tm)',
    desc: 'Determines forward/reverse primer pairs, computing primer-dimer risk and melting temperatures ($T_m$) via nearest-neighbor thermodynamics.',
    accent: 'border-l-[#22C55E] text-[#22C55E]',
    chip: 'BG_GREEN',
  },
  {
    icon: Scissors,
    title: 'Restriction Enzyme Digest',
    desc: 'Digests sequence strands using a database of 200+ restriction endonucleases, indexing cut coordinates and fragment weight distribution.',
    accent: 'border-l-[#EF4444] text-[#EF4444]',
    chip: 'BG_RED',
  },
  {
    icon: Hash,
    title: 'GC Content Sliding Window',
    desc: 'Applies sliding window calculations to chart local G+C density ratios, highlighting CpG islands and genomic stability regions.',
    accent: 'border-l-[#F59E0B] text-[#F59E0B]',
    chip: 'BG_AMBER',
  },
  {
    icon: Table,
    title: 'Codon Usage Bias & RSCU',
    desc: 'Calculates codon frequencies and Relative Synonymous Codon Usage index values to analyze host organism expression profile compatibility.',
    accent: 'border-l-[#EC4899] text-[#EC4899]',
    chip: 'BG_PINK',
  },
];

const pipelineSteps = [
  {
    code: 'IN_01',
    name: 'SEQUENCE_INGESTION',
    icon: FileInput,
    title: 'Sequence Ingestion & Parsing',
    desc: 'Extract sequence payloads directly from standard FASTA text, FASTQ read streams, or annotated GenBank files without server-side processing.',
  },
  {
    code: 'SR_02',
    name: 'DAG_SORT_RESOLVER',
    icon: Workflow,
    title: 'Topological Sort Resolution',
    desc: 'Sorts analysis nodes into a Directed Acyclic Graph (DAG). Validates connections to prevent loops and structures execution flow.',
  },
  {
    code: 'RC_03',
    name: 'REACTIVE_PROPAGATION',
    icon: GitCommit,
    title: 'Reactive Execution Engine',
    desc: 'Triggers pure-TypeScript executors sequentially. Changes to upstream outputs (like DNA mutations) prompt downstream recalculations.',
  },
  {
    code: 'EV_04',
    name: 'PROVENANCE_EVIDENCE',
    icon: Eye,
    title: 'Interactive Trace Visualization',
    desc: 'Binds calculated values back to sequences. Highlights translation tracks, maps restriction cut lines, and projects alignments with overlay graphics.',
  },
];

export function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate algorithm cards
      gsap.fromTo(
        '.algo-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Animate pipeline steps
      gsap.fromTo(
        '.step-item',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: stepsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-32">
      {/* WHAT IT DOES - ALGORITHMS REGISTRY */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#8B5CF6]/20 bg-[#8B5CF6]/5">
            <Layers size={12} className="text-[#8B5CF6]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8B5CF6]">
              Analytical_Capability
            </span>
          </div>
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            [ALGORITHMIC_CORE]
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto font-sans leading-relaxed">
            Execute professional sequence operations inside standard browser runtimes. Built on pure TypeScript algorithms—zero remote API lag.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {algorithms.map((algo) => {
            const Icon = algo.icon;
            return (
              <div
                key={algo.title}
                className={`flex flex-col border border-border bg-[#0B0F19] rounded-lg p-5 border-l-[3px] ${algo.accent} hover:bg-surface-hover/30 transition-all duration-300 algo-card`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-background border border-border/50">
                    <Icon size={16} />
                  </div>
                  <span className="font-mono text-[8px] text-muted-foreground border border-border/40 px-1.5 py-0.5 rounded uppercase">
                    {algo.chip}
                  </span>
                </div>
                <h3 className="font-mono text-xs font-bold text-foreground mb-2 uppercase tracking-wide">
                  {algo.title}
                </h3>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                  {algo.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* HOW IT WORKS - DAG PIPELINE DIAGRAM */}
      <div ref={stepsRef} className="space-y-12 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#F59E0B]/20 bg-[#F59E0B]/5">
            <Workflow size={12} className="text-[#F59E0B]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#F59E0B]">
              Execution_Model
            </span>
          </div>
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            [DATAFLOW_PIPELINE]
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto font-sans leading-relaxed">
            BioFlow organizes calculations into structured topological pipelines, maintaining downstream consistency in real-time.
          </p>
        </div>

        <div className="relative border-l border-border/60 pl-6 md:pl-10 space-y-10 ml-4 max-w-3xl mx-auto">
          {/* Animated node dots flowing down timeline */}
          <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-[#22C55E] via-[#F59E0B] to-[#EF4444]" />

          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.name} className="relative step-item">
                {/* SVG handle point indicator */}
                <div className="absolute -left-[31px] md:-left-[47px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-[#0B0F19]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-ping duration-1000" />
                </div>

                <div className="border border-border bg-[#0B0F19] rounded-lg p-5 hover:border-border-hover/80 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/20 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-[#22C55E]" />
                      <h3 className="font-mono text-xs font-bold text-foreground tracking-wide uppercase">
                        {step.title}
                      </h3>
                    </div>
                    <span className="font-mono text-[9px] text-[#22C55E] bg-[#22C55E]/5 px-2 py-0.5 border border-[#22C55E]/20 rounded w-fit">
                      {step.code}:{step.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
