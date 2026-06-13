'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Workflow, Dna, LayoutTemplate, Terminal } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Workflow,
    title: 'Visual Workflow Builder',
    description: 'Build bioinformatics pipelines by dragging and connecting nodes. No command line required.',
    color: 'text-primary',
  },
  {
    icon: Dna,
    title: 'Sequence Explorer',
    description: 'Upload FASTA files and instantly explore sequences, ORFs, translations, and GC content.',
    color: 'text-accent',
  },
  {
    icon: LayoutTemplate,
    title: 'Starter Templates',
    description: 'Begin with pre-built workflows for common analysis tasks. Customize as needed.',
    color: 'text-secondary',
  },
  {
    icon: Terminal,
    title: 'One-Click Export',
    description: 'Export workflows as CLI commands, JSON, or CSV. Share or run on any system.',
    color: 'text-warning',
  },
];

export function Features() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
  );
}
