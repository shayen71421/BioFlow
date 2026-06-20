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
import { ArrowRight, GitFork, ShieldCheck, FlaskConical, Dna } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '16', label: 'NODE_TYPES', icon: GitFork, color: 'text-[#3B82F6]' },
  { value: '42+', label: 'BENCHMARK_TESTS', icon: ShieldCheck, color: 'text-[#22C55E]' },
  { value: '15', label: 'TOPOLOGY_TEMPLATES', icon: FlaskConical, color: 'text-[#8B5CF6]' },
  { value: '100%', label: 'BROWSER_LOCAL', icon: Dna, color: 'text-[#F59E0B]' },
];

export function LandingPageClient() {
  const router = useRouter();
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stat-item',
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, statsRef);
    return () => ctx.revert();
  }, []);

  // Visual connection pipeline line between sections
  const renderPipelineConnector = (fromColor: string, toColor: string) => {
    return (
      <div className="flex justify-center py-10 select-none pointer-events-none">
        <div
          className="h-20 w-[1.5px] relative"
          style={{
            background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border border-border bg-[#0A0E17] flex items-center justify-center">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: fromColor }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-foreground font-sans relative overflow-x-hidden selection:bg-[#22C55E]/30 selection:text-white">
      {/* Signature horizontal sequencer ticker at the top */}
      <DnaTicker className="border-t-0" />

      {/* Hero Section */}
      <Hero />

      {/* Stats Monospace readout Panel */}
      <section ref={statsRef} className="px-4 py-8 border-y border-border/60 bg-[#0B0F19]/40">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-item text-center flex flex-col items-center justify-center p-4 border border-border/20 rounded bg-[#070A10]/60">
              <stat.icon size={18} className={`${stat.color} mb-2`} />
              <div className="text-xl md:text-2xl font-mono font-bold tracking-tight text-foreground">
                {stat.value}
              </div>
              <div className="text-[9px] font-mono text-muted-foreground mt-1 tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Connector: Green to Blue */}
      {renderPipelineConnector('#22C55E', '#3B82F6')}

      {/* What it Does & How it Works Sections */}
      <section className="px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <Features />
        </div>
      </section>

      {/* Ticker separator */}
      <DnaTicker className="my-16" />

      {/* Templates Showcase */}
      <section className="px-4 py-10">
        <TemplatesShowcase />
      </section>

      {/* Connector: Pink to Red */}
      {renderPipelineConnector('#EC4899', '#EF4444')}

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
              onClick={() => {
                router.push('/dashboard/workflow');
              }}
              className="font-mono text-xs border-border hover:border-[#22C55E] hover:bg-[#22C55E]/10 hover:text-[#22C55E] gap-2 px-6"
            >
              START_BLANK_TOPOLOGY <ArrowRight size={12} />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
