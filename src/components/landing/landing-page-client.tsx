'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from 'next/navigation';
import { Hero } from './hero';
import { Features } from './features';
import { PlaygroundCards } from '@/components/genome-playground/playground-cards';
import { Button } from '@/components/ui/button';
import { ArrowRight, Dna, GitFork, FlaskConical, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '16', label: 'Node Types', icon: GitFork, color: 'text-primary' },
  { value: '42+', label: 'Benchmark Tests', icon: ShieldCheck, color: 'text-success' },
  { value: '15', label: 'Templates', icon: FlaskConical, color: 'text-accent' },
  { value: '100%', label: 'In-Browser', icon: Dna, color: 'text-warning' },
];

export function LandingPageClient() {
  const router = useRouter();
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.stat-item', { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: statsRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    }, statsRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Hero />

      <section ref={statsRef} className="px-4 py-12 border-t border-border bg-surface/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-item text-center">
              <div className="flex justify-center mb-2">
                <stat.icon size={24} className={stat.color} />
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <Features />
        </div>
      </section>

      <section className="px-4 py-20 border-t border-border bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-lg font-semibold text-foreground">Try BioFlow Instantly</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Load a sample genome with one click — no files needed
            </p>
          </div>
          <PlaygroundCards />
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => router.push('/dashboard/workflow')} className="gap-2">
              Start from Scratch <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12 2a8 8 0 0 0-8 8c0 4 8 12 8 12s8-8 8-12a8 8 0 0 0-8-8z" />
              <path d="M12 6a4 4 0 0 0-4 4c0 2 4 6 4 6s4-4 4-6a4 4 0 0 0-4-4z" />
            </svg>
            <span className="text-sm font-semibold text-foreground">BioFlow</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>Next.js 15 · React Flow · TypeScript</span>
            <span className="hidden sm:inline">·</span>
            <button onClick={() => router.push('/dashboard/templates')} className="hover:text-foreground transition-colors">Templates</button>
            <button onClick={() => router.push('/dashboard/docs')} className="hover:text-foreground transition-colors">Docs</button>
          </div>
          <div className="text-xs text-muted-foreground">MIT License</div>
        </div>
      </footer>
    </div>
  );
}
