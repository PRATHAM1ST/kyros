import React from 'react';
import type {DiamondShape} from '~/types/diamond';
import {Card, CardContent} from '~/components/ui/card';
import {Progress} from '~/components/ui/progress';
import {Badge} from '~/components/ui/badge';

interface CaratVisualizerProps {
  carat: number;
  shape: DiamondShape;
  ringSize?: number;
}

export function CaratVisualizer({
  carat,
  shape,
  ringSize = 6.0,
}: CaratVisualizerProps) {
  // Approximate mm diameter/length for standard shapes
  const getDimensionMm = (c: number, s: DiamondShape) => {
    switch (s) {
      case 'Round':
        return (6.5 * Math.cbrt(c / 1.0)).toFixed(1);
      case 'Oval':
        return (7.7 * Math.cbrt(c / 1.0)).toFixed(1);
      case 'Emerald':
        return (7.0 * Math.cbrt(c / 1.0)).toFixed(1);
      case 'Radiant':
        return (6.8 * Math.cbrt(c / 1.0)).toFixed(1);
      case 'Pear':
        return (8.6 * Math.cbrt(c / 1.0)).toFixed(1);
      case 'Princess':
        return (5.5 * Math.cbrt(c / 1.0)).toFixed(1);
      default:
        return (6.5 * Math.cbrt(c / 1.0)).toFixed(1);
    }
  };

  const dim = getDimensionMm(carat, shape);

  // Finger coverage % based on US size 6 (approx 16.5mm finger width)
  const fingerCoverage = Math.min(
    Math.round((parseFloat(dim) / 16.5) * 100),
    80,
  );

  return (
    <Card className="bg-stone-50 border-stone-200 rounded-xl shadow-none my-4">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold font-serif">
            Scale &amp; Finger Coverage
          </span>
          <Badge variant="outline" className="text-[11px] font-mono text-stone-600 border-stone-200 bg-white">
            US Size {ringSize} Reference
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-700">
          <span>Estimated Face-Up Diameter:</span>
          <strong className="font-mono text-stone-900">~{dim} mm</strong>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-700">
          <span>Finger Surface Coverage:</span>
          <strong className="text-amber-800 font-semibold">{fingerCoverage}% coverage</strong>
        </div>

        {/* Visual Bar representation via shadcn Progress */}
        <div className="pt-1">
          <Progress value={fingerCoverage} className="h-2 bg-stone-200 overflow-hidden" />
        </div>

        <p className="text-[11px] text-stone-400 italic">
          Visual proportions modeled for an average finger size 6. Larger carats provide higher coverage and perceived visual footprint.
        </p>
      </CardContent>
    </Card>
  );
}
