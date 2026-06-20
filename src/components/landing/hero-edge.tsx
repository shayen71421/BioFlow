'use client';

import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

function HeroEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const pathId = `hero-path-${id}`;
  
  // Custom sequence flowing along the edge
  const sequence = 'ATGCTAGCTAGCATG'.split('');

  return (
    <>
      {/* Hidden path for text alignment reference */}
      <path
        id={pathId}
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={0}
      />
      {/* Visual background edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: 'rgba(30, 41, 59, 0.6)',
          strokeWidth: 2,
        }}
      />
      {/* Base letters moving along the path */}
      <text className="font-mono text-[9px] font-extrabold select-none tracking-wide" dy="-4">
        <textPath href={`#${pathId}`} startOffset="0%">
          <animate
            attributeName="startOffset"
            from="0%"
            to="100%"
            dur="7s"
            repeatCount="indefinite"
          />
          {sequence.map((char, index) => {
            let fill = '#64748B'; // fallback
            if (char === 'A') fill = '#22C55E';
            else if (char === 'T') fill = '#EF4444';
            else if (char === 'G') fill = '#F59E0B';
            else if (char === 'C') fill = '#3B82F6';

            return (
              <tspan key={`${char}-${index}`} fill={fill}>
                {char}
                {'\u00A0'}
              </tspan>
            );
          })}
        </textPath>
      </text>
    </>
  );
}

export default memo(HeroEdge);
