'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Dna, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSequenceStore } from '@/store/sequence-store';
import { E_COLI_K12 } from '@/data/examples/ecoli-k12';
import { toast } from 'sonner';

export function DropZone() {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadFasta = useSequenceStore((s) => s.loadFasta);
  const loadExample = useSequenceStore((s) => s.loadExample);
  const sequences = useSequenceStore((s) => s.sequences);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragging(true);
    } else if (e.type === 'dragleave') {
      setDragging(false);
    }
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const fastaFile = files.find((f) =>
      /\.(fasta|fa|fna)$/i.test(f.name),
    );
    if (!fastaFile) {
      toast.error('Please drop a FASTA file (.fasta, .fa, .fna)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      loadFasta(text);
      toast.success(`Loaded ${fastaFile.name}`);
    };
    reader.readAsText(fastaFile);
  }, [loadFasta]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [handleFiles],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    e.target.value = '';
  };

  const handleLoadDemo = () => {
    loadExample(E_COLI_K12);
    toast.success('Loaded E. coli K12 demo');
  };

  if (sequences.length > 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
          <Dna size={18} className="text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">
            {sequences[0].header}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {sequences[0].length.toLocaleString()} bp
          </div>
        </div>
        <button
          onClick={() => {
            useSequenceStore.getState().clearData();
            toast.success('Sequence cleared');
          }}
          className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-300',
          dragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-surface/50',
        )}
      >
        <div className={cn(
          'mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-background transition-all',
          dragging && 'scale-110 bg-primary/10',
        )}>
          <Upload size={22} className={dragging ? 'text-primary' : 'text-muted-foreground'} />
        </div>
        <p className="text-sm font-medium text-foreground">Drop your FASTA file here</p>
        <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
            .fasta
          </span>
          <span className="rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
            .fa
          </span>
          <span className="rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
            .fna
          </span>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".fasta,.fa,.fna"
        className="hidden"
        onChange={handleFileInput}
      />
      <button
        onClick={handleLoadDemo}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
      >
        <FileText size={14} className="text-primary" />
        Load E. coli K12 Demo
      </button>
    </div>
  );
}
