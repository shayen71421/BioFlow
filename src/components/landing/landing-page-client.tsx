'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from 'next/navigation';
import { Hero } from './hero';
import { Features } from './features';
import { Footer } from './footer';
import { TemplatesShowcase } from './templates-showcase';
import { DnaTicker } from './dna-ticker';
import { PlaygroundCards } from '@/components/genome-playground/playground-cards';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Dna, Search, BarChart3, ArrowRightToLine, Scissors, FlaskConical } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const capabilityNodes = [
  { icon: Dna, label: 'FASTA Input', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/30' },
  { icon: Search, label: 'ORF Finder', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30' },
  { icon: ArrowRightToLine, label: 'Translation', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30' },
  { icon: BarChart3, label: 'GC Content', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/30' },
  { icon: Scissors, label: 'Restriction', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/30' },
  { icon: FlaskConical, label: 'Primer Design', color: 'text-[#EC4899]', bg: 'bg-[#EC4899]/10', border: 'border-[#EC4899]/30' },
];

export function LandingPageClient() {
  const router = useRouter();
  const pipelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cap-node',
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: pipelineRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
    }, pipelineRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0E17] text-foreground font-sans relative overflow-x-hidden selection:bg-[#22C55E]/30 selection:text-white">
      <DnaTicker className="border-t-0" />
      <Hero />

      {/* Capability Pipeline — replaces stats row */}
      <section ref={pipelineRef} className="px-4 py-10 border-y border-border/60 bg-[#0B0F19]/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Core_Capability_Pipeline
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {capabilityNodes.map((node, i) => (
              <div key={node.label} className="flex items-center gap-0">
                <div className={`cap-node flex items-center gap-2 rounded-lg border ${node.border} ${node.bg} px-3 py-2`}>
                  <node.icon size={14} className={node.color} />
                  <span className="font-mono text-[11px] font-semibold text-foreground tracking-wide">{node.label}</span>
                </div>
                {i < capabilityNodes.length - 1 && (
                  <div className="w-4 flex items-center justify-center">
                    <div className="w-2 h-[1.5px] bg-gradient-to-r from-foreground/20 to-foreground/5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What it Does & How it Works Sections */}
      <section className="px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <Features />
        </div>
      </section>

      <DnaTicker className="my-16" />

      {/* Templates Showcase */}
      <section className="px-4 py-10">
        <TemplatesShowcase />
      </section>

      {/* CTA / Sandbox Workspace */}
      <section className="px-4 py-20 bg-[#0B0F19]/25 border-y border-border/40">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#EF4444]/20 bg-[#EF4444]/5">
              <ShieldCheck size={12} className="text-[#EF4444]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#EF4444]">
                In_Browser_Sandbox
              </span>
            </div>
            <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              [INITIALIZE_WORKSPACE_RUN]
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto font-sans leading-relaxed">
              Load E. coli K-12 benchmark samples directly into local memory or start design workflows from scratch. No registration, no server constraints.
            </p>
          </div>

          <PlaygroundCards />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button
              variant="outline"
              onClick={() => { router.push('/dashboard/workflow'); }}
              className="font-mono text-xs border-border hover:border-[#22C55E] hover:bg-[#22C55E]/10 hover:text-[#22C55E] gap-2 px-6"
            >
              START_BLANK_TOPOLOGY <ArrowRight size={12} />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
