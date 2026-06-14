'use client';

import { useMemo, useState, useRef, useCallback } from 'react';
import type { ORF, GenBankFeature, MotifMatch, RestrictionEnzymeCut } from '@/types/sequence';

interface TrackItem {
  id: string;
  label: string;
  start: number;
  end: number;
  color: string;
  type: 'gene' | 'orf' | 'feature' | 'motif' | 'cut' | 'primer';
  strand?: '+' | '-' | '.';
  detail?: string;
}

interface GenomeMapProps {
  sequence: string;
  length: number;
  orfs?: ORF[];
  features?: GenBankFeature[];
  motifs?: MotifMatch[];
  restrictionCuts?: RestrictionEnzymeCut[];
  primers?: { forward: { start: number; end: number }[]; reverse: { start: number; end: number }[] };
  height?: number;
}

export function GenomeMapView({
  length,
  orfs = [],
  features = [],
  motifs = [],
  restrictionCuts = [],
  primers,
  height = 400,
}: GenomeMapProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<TrackItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const tracks = useMemo(() => {
    const items: TrackItem[] = [];

    orfs.forEach((orf, i) => {
      items.push({
        id: `orf-${i}`,
        label: `ORF ${i + 1} (${orf.frame > 2 ? '-' : '+'}${orf.frame % 3})`,
        start: orf.start,
        end: orf.end,
        color: '#8B5CF6',
        type: 'orf',
        strand: orf.strand,
        detail: `${orf.lengthBp} bp, ${orf.protein.slice(0, 20)}...`,
      });
    });

    features.forEach((feat, i) => {
      items.push({
        id: `feat-${i}`,
        label: feat.type,
        start: feat.start,
        end: feat.end,
        color: '#3B82F6',
        type: 'feature',
        strand: feat.strand,
        detail: feat.qualifiers?.gene?.[0] || feat.qualifiers?.product?.[0] || '',
      });
    });

    motifs.forEach((motif, i) => {
      items.push({
        id: `motif-${i}`,
        label: `Motif ${i + 1}`,
        start: motif.start,
        end: motif.end,
        color: '#F59E0B',
        type: 'motif',
        strand: motif.strand,
        detail: motif.sequence,
      });
    });

    restrictionCuts.forEach((cut, i) => {
      items.push({
        id: `cut-${i}`,
        label: cut.enzyme,
        start: cut.cutPosition - 3,
        end: cut.cutPosition + 3,
        color: '#EC4899',
        type: 'cut',
        detail: `${cut.enzyme} (${cut.recognitionSite})`,
      });
    });

    if (primers) {
      primers.forward.forEach((p, i) => {
        items.push({
          id: `primer-f-${i}`,
          label: `Fwd ${i + 1}`,
          start: p.start,
          end: p.end,
          color: '#22C55E',
          type: 'primer',
          strand: '+',
        });
      });
      primers.reverse.forEach((p, i) => {
        items.push({
          id: `primer-r-${i}`,
          label: `Rev ${i + 1}`,
          start: p.start,
          end: p.end,
          color: '#EF4444',
          type: 'primer',
          strand: '-',
        });
      });
    }

    return items;
  }, [orfs, features, motifs, restrictionCuts, primers]);

  const visibleWidth = 800;
  const visibleRange = visibleWidth / zoom;
  const startPos = offset;
  const endPos = offset + visibleRange;

  const visibleTracks = tracks.filter(
    (t) => t.start < endPos && t.end > startPos,
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(1, Math.min(100, z * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: offset };
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const newOffset = Math.max(0, Math.min(length - visibleWidth / zoom, dragStart.current.y - dx / zoom));
      setOffset(newOffset);
    }
  }, [length, zoom]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const trackY = (index: number) => 30 + index * 16;

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-border bg-surface p-4"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-foreground">Genome Map</div>
        <div className="flex items-center gap-2">
          <div className="text-[11px] text-muted-foreground">{length.toLocaleString()} bp</div>
          <button
            onClick={() => setZoom((z) => Math.min(100, z * 1.5))}
            className="rounded bg-background px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(1, z / 1.5))}
            className="rounded bg-background px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
          >
            -
          </button>
          <button
            onClick={() => { setZoom(1); setOffset(0); }}
            className="rounded bg-background px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Fit
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden" style={{ height }}>
        <svg width="100%" height={height} className="overflow-visible">
          {/* Ruler */}
          <g transform="translate(0, 20)">
            <line x1={0} y1={0} x2="100%" y2={0} stroke="#1E293B" strokeWidth={1} />
            {Array.from({ length: Math.min(20, Math.ceil(visibleRange / 100)) }).map((_, i) => {
              const pos = i * 100 * zoom;
              const bp = startPos + i * 100;
              if (bp > length) return null;
              return (
                <g key={i} transform={`translate(${pos}, 0)`}>
                  <line x1={0} y1={0} x2={0} y2={5} stroke="#64748B" strokeWidth={1} />
                  <text x={0} y={14} textAnchor="middle" fill="#64748B" fontSize={9} fontFamily="JetBrains Mono">
                    {bp.toLocaleString()}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Tracks */}
          {visibleTracks.map((item, idx) => {
            const x = (item.start - startPos) * zoom;
            const w = Math.max(4, (item.end - item.start) * zoom);
            const y = trackY(idx);
            return (
              <g
                key={item.id}
                onMouseEnter={(e) => {
                  setHoveredItem(item);
                  setTooltipPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={10}
                  rx={3}
                  fill={item.color}
                  fillOpacity={0.7}
                  stroke={item.color}
                  strokeWidth={1}
                />
                {w > 40 && (
                  <text
                    x={x + 4}
                    y={y + 9}
                    fill="#F1F5F9"
                    fontSize={8}
                    fontFamily="JetBrains Mono"
                  >
                    {item.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Arrow indicator for drag */}
          {visibleTracks.length === 0 && tracks.length > 0 && (
            <text x={400} y={200} textAnchor="middle" fill="#64748B" fontSize={12}>
              Zoom out or scroll to view annotations
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      {tracks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {orfs.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="h-2 w-4 rounded bg-[#8B5CF6]" /> ORFs
            </div>
          )}
          {features.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="h-2 w-4 rounded bg-[#3B82F6]" /> Features
            </div>
          )}
          {motifs.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="h-2 w-4 rounded bg-[#F59E0B]" /> Motifs
            </div>
          )}
          {restrictionCuts.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="h-2 w-4 rounded bg-[#EC4899]" /> Restriction Sites
            </div>
          )}
          {primers && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="h-2 w-4 rounded bg-[#22C55E]" /> Primers
            </div>
          )}
        </div>
      )}

      {/* Tooltip */}
      {hoveredItem && (
        <div
          className="fixed z-50 rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-xl pointer-events-none"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 40 }}
        >
          <div className="font-medium text-foreground">{hoveredItem.label}</div>
          {hoveredItem.detail && (
            <div className="text-muted-foreground">{hoveredItem.detail}</div>
          )}
          <div className="text-muted-foreground font-mono">
            {hoveredItem.start.toLocaleString()} – {hoveredItem.end.toLocaleString()} bp
          </div>
        </div>
      )}
    </div>
  );
}
