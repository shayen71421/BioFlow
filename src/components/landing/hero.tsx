'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';
import { Dna, ArrowRight, Beaker, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSequenceStore } from '@/store/sequence-store';
import { E_COLI_K12 } from '@/data/examples/ecoli-k12';
import { useUIStore } from '@/store/ui-store';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const loadExample = useSequenceStore((s) => s.loadExample);
  const setActiveSidebarItem = useUIStore((s) => s.setActiveSidebarItem);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.hero-badge', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5 })
        .fromTo('.hero-title', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
        .fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
        .fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, '-=0.2');
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleTryDemo = () => {
    loadExample(E_COLI_K12);
    setActiveSidebarItem('biodrop');
    router.push('/dashboard/biodrop');
  };

  const handleBuildWorkflow = () => {
    setActiveSidebarItem('workflow');
    router.push('/dashboard/workflow');
  };

  return (
    <div ref={containerRef} className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
        <div className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
          <Dna size={14} className="text-primary" />
          <span className="text-xs font-medium text-primary">Visual Bioinformatics Workflows</span>
        </div>

        <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          Drag. Connect.
          <br />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Discover.
          </span>
        </h1>

        <p className="hero-desc mt-6 max-w-xl text-base text-muted-foreground leading-relaxed">
          Build bioinformatics pipelines visually, explore sequences in real-time, and export results —
          all from your browser. No backend, no setup, no terminal required.
        </p>

        <div className="hero-cta mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" variant="primary" onClick={handleTryDemo} className="gap-2">
            Try Demo <ArrowRight size={16} />
          </Button>
          <Button size="lg" variant="outline" onClick={handleBuildWorkflow} className="gap-2">
            <GitFork size={16} /> Build Workflow
          </Button>
          <Button size="lg" variant="ghost" onClick={() => router.push('/dashboard/templates')} className="gap-2">
            <Beaker size={16} /> Templates
          </Button>
        </div>
      </div>
    </div>
  );
}
