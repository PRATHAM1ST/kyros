import React, {useState, useMemo} from 'react';
import type {
  DiamondFilterState,
  DiamondShape,
  DiamondSortOption,
  PreciousMetal,
  SettingStyle,
  CutGrade,
  ColorGrade,
  ClarityGrade,
} from '~/types/diamond';
import {DiamondShapeIcon} from './DiamondShapeIcons';
import {
  useOptionalDiamondContext,
  COLOR_ORDER,
  CLARITY_ORDER,
} from '~/context/DiamondFilterContext';
import {DEFAULT_DIAMOND_FILTERS} from '~/lib/diamond-filter';
import {Slider} from '~/components/ui/slider';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {Button} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';
import {Card, CardContent} from '~/components/ui/card';
import {Separator} from '~/components/ui/separator';

interface DiamondFilterBarProps {
  filters?: DiamondFilterState;
  onFilterChange?: (newFilters: DiamondFilterState) => void;
  sortBy?: DiamondSortOption;
  onSortChange?: (newSort: DiamondSortOption) => void;
  totalResults: number;
}

const SHAPES: DiamondShape[] = [
  'Round',
  'Oval',
  'Emerald',
  'Radiant',
  'Cushion',
  'Pear',
  'Princess',
  'Asscher',
  'Marquise',
];

const METALS: {id: PreciousMetal; name: string; hex: string}[] = [
  {id: 'platinum', name: 'Platinum 950', hex: '#E5E8EC'},
  {id: '18k-yellow-gold', name: '18k Yellow Gold', hex: '#D4AF37'},
  {id: '18k-rose-gold', name: '18k Rose Gold', hex: '#E0A899'},
  {id: '18k-white-gold', name: '18k White Gold', hex: '#F0F2F5'},
];

const CUT_GRADES: CutGrade[] = [
  'Super Ideal (Hearts & Arrows)',
  'Ideal',
  'Excellent',
  'Very Good',
];

const SETTING_STYLES: {id: SettingStyle; name: string}[] = [
  {id: 'solitaire', name: 'Solitaire'},
  {id: 'hidden-halo', name: 'Hidden Halo'},
  {id: 'pave', name: 'French Pavé'},
  {id: 'three-stone', name: 'Three-Stone'},
  {id: 'bezel', name: 'Bezel'},
  {id: 'cathedral', name: 'Cathedral'},
];

const COLOR_TIER_MAP: Record<string, string> = {
  D: 'Colorless',
  E: 'Colorless',
  F: 'Colorless',
  G: 'Near Colorless',
  H: 'Near Colorless',
  I: 'Near Colorless',
  J: 'Faint Warm',
};

const CLARITY_TIER_MAP: Record<ClarityGrade, string> = {
  FL: 'Flawless',
  IF: 'Internally Flawless',
  VVS1: 'VVS1 (Very Very Slight)',
  VVS2: 'VVS2 (Very Very Slight)',
  VS1: 'VS1 (Very Slight)',
  VS2: 'VS2 (Very Slight)',
  SI1: 'SI1 (Slightly Included)',
  SI2: 'SI2 (Slightly Included)',
};

export function DiamondFilterBar(props: DiamondFilterBarProps) {
  // Global context access with graceful fallback to props
  const context = useOptionalDiamondContext();

  const filters = props.filters ?? context?.filters!;
  const onFilterChange = props.onFilterChange ?? context?.setFilters!;
  const sortBy = props.sortBy ?? context?.sortBy ?? 'featured';
  const onSortChange = props.onSortChange ?? context?.setSortBy!;
  const totalResults = props.totalResults;

  const [showAdvanced, setShowAdvanced] = useState(true);

  // Optimistic toggle helpers
  const toggleShape = (shape: DiamondShape) => {
    const exists = filters.shapes.includes(shape);
    const updated = exists
      ? filters.shapes.filter((s) => s !== shape)
      : [...filters.shapes, shape];
    onFilterChange({...filters, shapes: updated});
  };

  const toggleMetal = (metal: PreciousMetal) => {
    const exists = filters.metals.includes(metal);
    const updated = exists
      ? filters.metals.filter((m) => m !== metal)
      : [...filters.metals, metal];
    onFilterChange({...filters, metals: updated});
  };

  const toggleCut = (cut: CutGrade) => {
    const exists = filters.cutGrades.includes(cut);
    const updated = exists
      ? filters.cutGrades.filter((c) => c !== cut)
      : [...filters.cutGrades, cut];
    onFilterChange({...filters, cutGrades: updated});
  };

  const toggleSettingStyle = (style: SettingStyle) => {
    const exists = filters.settingStyles.includes(style);
    const updated = exists
      ? filters.settingStyles.filter((s) => s !== style)
      : [...filters.settingStyles, style];
    onFilterChange({...filters, settingStyles: updated});
  };

  // Helper to normalize Slider values
  const toArray = (v: number | readonly number[]): number[] =>
    Array.isArray(v) ? (Array.from(v) as number[]) : [Number(v)];

  // Color stepper range indices
  const colorIndices = useMemo(() => {
    if (filters.colorGrades.length === 0) {
      return [0, COLOR_ORDER.length - 1];
    }
    const idxs = filters.colorGrades.map((g) => COLOR_ORDER.indexOf(g)).filter((i) => i >= 0);
    return [Math.min(...idxs), Math.max(...idxs)];
  }, [filters.colorGrades]);

  const handleColorRangeChange = (rawValues: number | readonly number[]) => {
    const values = toArray(rawValues);
    const minIdx = Math.min(values[0], values[1] ?? values[0]);
    const maxIdx = Math.max(values[0], values[1] ?? values[0]);
    const selected = COLOR_ORDER.slice(minIdx, maxIdx + 1);
    onFilterChange({
      ...filters,
      colorGrades: selected.length === COLOR_ORDER.length ? [] : selected,
    });
  };

  // Clarity stepper range indices
  const clarityIndices = useMemo(() => {
    if (filters.clarityGrades.length === 0) {
      return [0, CLARITY_ORDER.length - 1];
    }
    const idxs = filters.clarityGrades.map((c) => CLARITY_ORDER.indexOf(c)).filter((i) => i >= 0);
    return [Math.min(...idxs), Math.max(...idxs)];
  }, [filters.clarityGrades]);

  const handleClarityRangeChange = (rawValues: number | readonly number[]) => {
    const values = toArray(rawValues);
    const minIdx = Math.min(values[0], values[1] ?? values[0]);
    const maxIdx = Math.max(values[0], values[1] ?? values[0]);
    const selected = CLARITY_ORDER.slice(minIdx, maxIdx + 1);
    onFilterChange({
      ...filters,
      clarityGrades: selected.length === CLARITY_ORDER.length ? [] : selected,
    });
  };

  return (
    <Card className="diamond-filter-bar bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-7 mb-8 shadow-sm space-y-7">
      {/* 1. Origin Selection Tabs: Natural Earth-Mined vs Lab-Grown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-widest text-stone-500 font-serif font-semibold">
            Diamond Origin Selection
          </span>
          <span className="text-xs text-stone-400 font-light hidden sm:inline">
            Identical optical fire, refractive physics, and chemical carbon crystalline structure
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 p-1.5 bg-stone-100 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => onFilterChange({...filters, originTab: 'all'})}
            className={`py-2.5 px-3 rounded-lg text-xs font-serif font-semibold tracking-wider transition-all cursor-pointer ${
              filters.originTab === 'all'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Diamonds ({totalResults})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({...filters, originTab: 'natural'})}
            className={`py-2.5 px-3 rounded-lg text-xs font-serif font-semibold tracking-wider transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center space-x-1 ${
              filters.originTab === 'natural'
                ? 'bg-stone-900 text-amber-200 shadow-md border border-stone-900'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>✦ Natural Earth-Mined</span>
            <span className="text-[10px] opacity-75 font-sans font-normal hidden sm:inline">
              (GIA Certified)
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({...filters, originTab: 'lab-grown'})}
            className={`py-2.5 px-3 rounded-lg text-xs font-serif font-semibold tracking-wider transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center space-x-1 ${
              filters.originTab === 'lab-grown'
                ? 'bg-stone-900 text-amber-200 shadow-md border border-stone-900'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>⚛ Lab-Grown Type IIa</span>
            <span className="text-[10px] opacity-75 font-sans font-normal hidden sm:inline">
              (IGI Certified)
            </span>
          </button>
        </div>
      </div>

      {/* 2. Shape Selection with Geometric SVG Icons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-widest text-stone-500 font-serif font-semibold">
            Diamond Shape (Silhouette)
          </span>
          {filters.shapes.length > 0 && (
            <button
              type="button"
              onClick={() => onFilterChange({...filters, shapes: []})}
              className="text-xs text-amber-800 hover:underline cursor-pointer font-medium"
            >
              Clear Shapes ({filters.shapes.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {SHAPES.map((shape) => {
            const isSelected = filters.shapes.includes(shape);
            return (
              <button
                key={shape}
                type="button"
                onClick={() => toggleShape(shape)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                    : 'border-stone-200/90 bg-stone-50/50 hover:bg-stone-100 text-stone-700 hover:border-stone-400'
                }`}
              >
                <div
                  className={`w-7 h-7 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                    isSelected ? 'text-amber-300' : 'text-stone-600'
                  }`}
                >
                  <DiamondShapeIcon shape={shape} size={26} />
                </div>
                <span className="text-[11px] font-medium tracking-tight">
                  {shape}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Carat Weight: Stepper/Smooth Dual Range Slider AND Min/Max Numeric Input Fields */}
      <div className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-widest text-stone-800 font-serif font-semibold">
              Carat Weight Range
            </span>
            <Badge variant="outline" className="text-[11px] font-mono bg-white text-stone-900 border-stone-300">
              {filters.caratMin.toFixed(2)} ct – {filters.caratMax.toFixed(2)} ct
            </Badge>
          </div>

          {/* Quick Stepper Presets */}
          <div className="flex items-center space-x-1.5">
            {[1.0, 1.5, 2.0, 2.5, 3.0].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    caratMin: Number((c - 0.2).toFixed(2)),
                    caratMax: Number((c + 0.3).toFixed(2)),
                  })
                }
                className="text-[10px] px-2 py-0.5 rounded bg-white border border-stone-200 hover:border-stone-900 text-stone-700 cursor-pointer font-mono"
              >
                {c.toFixed(1)} ct
              </button>
            ))}
          </div>
        </div>

        {/* Dual Range Slider + Min/Max Numeric Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Min input field */}
          <div className="sm:col-span-3 flex items-center space-x-2">
            <Label className="text-xs text-stone-500 font-medium shrink-0">Min:</Label>
            <div className="relative flex-1">
              <Input
                type="number"
                step="0.05"
                min="0.5"
                max={filters.caratMax}
                value={filters.caratMin}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    onFilterChange({
                      ...filters,
                      caratMin: Math.max(0.5, Math.min(val, filters.caratMax)),
                    });
                  }
                }}
                className="h-8 py-1 px-2.5 bg-white text-xs font-mono font-medium"
              />
              <span className="absolute right-2 top-1.5 text-xs text-stone-400 pointer-events-none">
                ct
              </span>
            </div>
          </div>

          {/* Shadcn Stepper Dual Range Slider */}
          <div className="sm:col-span-6 px-2">
            <Slider
              min={0.5}
              max={4.0}
              step={0.05}
              value={[filters.caratMin, filters.caratMax]}
              onValueChange={(rawVals) => {
                const vals = toArray(rawVals);
                if (vals.length >= 2) {
                  onFilterChange({
                    ...filters,
                    caratMin: Number(vals[0].toFixed(2)),
                    caratMax: Number(vals[1].toFixed(2)),
                  });
                }
              }}
              className="py-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>0.5 ct</span>
              <span>1.0 ct</span>
              <span>1.5 ct</span>
              <span>2.0 ct</span>
              <span>2.5 ct</span>
              <span>3.0 ct</span>
              <span>4.0 ct+</span>
            </div>
          </div>

          {/* Max input field */}
          <div className="sm:col-span-3 flex items-center space-x-2">
            <Label className="text-xs text-stone-500 font-medium shrink-0">Max:</Label>
            <div className="relative flex-1">
              <Input
                type="number"
                step="0.05"
                min={filters.caratMin}
                max="5.0"
                value={filters.caratMax}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    onFilterChange({
                      ...filters,
                      caratMax: Math.min(5.0, Math.max(val, filters.caratMin)),
                    });
                  }
                }}
                className="h-8 py-1 px-2.5 bg-white text-xs font-mono font-medium"
              />
              <span className="absolute right-2 top-1.5 text-xs text-stone-400 pointer-events-none">
                ct
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Color Spectrum Slider (D through J) with Stepper and Min/Max Fields */}
      <div className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-widest text-stone-800 font-serif font-semibold">
              Color Spectrum Range (D – J)
            </span>
            <span className="text-[11px] text-amber-800 font-medium hidden sm:inline">
              Selected: {COLOR_ORDER[colorIndices[0]]} to {COLOR_ORDER[colorIndices[1]]}
            </span>
          </div>

          {filters.colorGrades.length > 0 && (
            <button
              type="button"
              onClick={() => onFilterChange({...filters, colorGrades: []})}
              className="text-xs text-amber-800 hover:underline cursor-pointer"
            >
              Reset Color ({filters.colorGrades.length})
            </button>
          )}
        </div>

        {/* Dual Stepper Range Slider across Color Spectrum */}
        <div className="px-2 pt-1 pb-2">
          <Slider
            min={0}
            max={COLOR_ORDER.length - 1}
            step={1}
            value={colorIndices}
            onValueChange={handleColorRangeChange}
            className="cursor-pointer"
          />
        </div>

        {/* Visual Tier Brackets with Direct Stepper Buttons */}
        <div className="grid grid-cols-7 gap-1.5">
          {COLOR_ORDER.map((grade, idx) => {
            const inRange = idx >= colorIndices[0] && idx <= colorIndices[1];
            return (
              <button
                key={grade}
                type="button"
                onClick={() => {
                  if (inRange && filters.colorGrades.length > 0) {
                    onFilterChange({
                      ...filters,
                      colorGrades: filters.colorGrades.filter((g) => g !== grade),
                    });
                  } else {
                    onFilterChange({
                      ...filters,
                      colorGrades: [...filters.colorGrades, grade],
                    });
                  }
                }}
                className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                  inRange
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                    : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="text-sm font-serif font-bold">{grade}</div>
                <div
                  className={`text-[9px] uppercase tracking-tighter mt-0.5 truncate ${
                    inRange ? 'text-amber-300' : 'text-stone-400'
                  }`}
                >
                  {COLOR_TIER_MAP[grade]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Clarity Scale Slider (FL through SI2) with Stepper and Min/Max Fields */}
      <div className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-widest text-stone-800 font-serif font-semibold">
              Clarity Purity Scale (FL – SI2)
            </span>
            <span className="text-[11px] text-amber-800 font-medium hidden sm:inline">
              Selected: {CLARITY_ORDER[clarityIndices[0]]} to {CLARITY_ORDER[clarityIndices[1]]}
            </span>
          </div>

          {filters.clarityGrades.length > 0 && (
            <button
              type="button"
              onClick={() => onFilterChange({...filters, clarityGrades: []})}
              className="text-xs text-amber-800 hover:underline cursor-pointer"
            >
              Reset Clarity ({filters.clarityGrades.length})
            </button>
          )}
        </div>

        {/* Dual Stepper Range Slider across Clarity Scale */}
        <div className="px-2 pt-1 pb-2">
          <Slider
            min={0}
            max={CLARITY_ORDER.length - 1}
            step={1}
            value={clarityIndices}
            onValueChange={handleClarityRangeChange}
            className="cursor-pointer"
          />
        </div>

        {/* Visual Tier Brackets with Direct Stepper Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {CLARITY_ORDER.map((grade, idx) => {
            const inRange = idx >= clarityIndices[0] && idx <= clarityIndices[1];
            return (
              <button
                key={grade}
                type="button"
                onClick={() => {
                  if (inRange && filters.clarityGrades.length > 0) {
                    onFilterChange({
                      ...filters,
                      clarityGrades: filters.clarityGrades.filter((c) => c !== grade),
                    });
                  } else {
                    onFilterChange({
                      ...filters,
                      clarityGrades: [...filters.clarityGrades, grade],
                    });
                  }
                }}
                className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                  inRange
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                    : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="text-xs font-serif font-bold">{grade}</div>
                <div
                  className={`text-[9px] uppercase tracking-tighter mt-0.5 truncate ${
                    inRange ? 'text-amber-300' : 'text-stone-400'
                  }`}
                >
                  {grade.startsWith('VV') ? 'VVS' : grade.startsWith('V') ? 'VS' : grade.startsWith('S') ? 'SI' : 'FL/IF'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Price Budget Range: Stepper Slider + Min/Max Numeric Input Fields */}
      <div className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-widest text-stone-800 font-serif font-semibold">
              Price Budget Range
            </span>
            <Badge variant="outline" className="text-[11px] font-mono bg-white text-stone-900 border-stone-300">
              ${(filters.priceMin || 5000).toLocaleString()} – ${(filters.priceMax || 60000).toLocaleString()}
            </Badge>
          </div>

          <div className="flex items-center space-x-1.5">
            {[15000, 25000, 35000, 50000].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    priceMin: Math.max(5000, p - 5000),
                    priceMax: p + 5000,
                  })
                }
                className="text-[10px] px-2 py-0.5 rounded bg-white border border-stone-200 hover:border-stone-900 text-stone-700 cursor-pointer font-mono"
              >
                Under ${(p / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        {/* Dual Range Slider + Min/Max Currency Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Min price input */}
          <div className="sm:col-span-3 flex items-center space-x-2">
            <Label className="text-xs text-stone-500 font-medium shrink-0">Min:</Label>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1.5 text-xs text-stone-400 font-mono pointer-events-none">
                $
              </span>
              <Input
                type="number"
                step="500"
                min="5000"
                max={filters.priceMax || 60000}
                value={filters.priceMin || 5000}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    onFilterChange({
                      ...filters,
                      priceMin: Math.max(5000, Math.min(val, filters.priceMax || 60000)),
                    });
                  }
                }}
                className="h-8 py-1 pl-6 pr-2 bg-white text-xs font-mono font-medium"
              />
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="sm:col-span-6 px-2">
            <Slider
              min={5000}
              max={50000}
              step={500}
              value={[filters.priceMin || 5000, filters.priceMax || 50000]}
              onValueChange={(rawVals) => {
                const vals = toArray(rawVals);
                if (vals.length >= 2) {
                  onFilterChange({
                    ...filters,
                    priceMin: vals[0],
                    priceMax: vals[1],
                  });
                }
              }}
              className="py-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>$5,000</span>
              <span>$15,000</span>
              <span>$25,000</span>
              <span>$35,000</span>
              <span>$50,000+</span>
            </div>
          </div>

          {/* Max price input */}
          <div className="sm:col-span-3 flex items-center space-x-2">
            <Label className="text-xs text-stone-500 font-medium shrink-0">Max:</Label>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1.5 text-xs text-stone-400 font-mono pointer-events-none">
                $
              </span>
              <Input
                type="number"
                step="500"
                min={filters.priceMin || 5000}
                max="60000"
                value={filters.priceMax || 50000}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    onFilterChange({
                      ...filters,
                      priceMax: Math.min(60000, Math.max(val, filters.priceMin || 5000)),
                    });
                  }
                }}
                className="h-8 py-1 pl-6 pr-2 bg-white text-xs font-mono font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 7. Collapsible Advanced Specifications: Cut Quality, Precious Metals, Setting Architecture */}
      <div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-xs uppercase tracking-widest text-stone-700 font-serif font-semibold hover:text-stone-900 cursor-pointer"
          >
            <span>{showAdvanced ? '▼ Hide Detailed Specs' : '▶ Show Cut, Metals & Settings'}</span>
          </button>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-stone-500 font-medium">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as DiamondSortOption)}
              className="py-1 px-3 bg-white border border-stone-300 rounded-lg text-xs font-serif font-medium cursor-pointer"
            >
              <option value="featured">Featured Atelier Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="carat-desc">Carat: Largest First</option>
              <option value="carat-asc">Carat: Smallest First</option>
            </select>
          </div>
        </div>

        {showAdvanced && (
          <div className="mt-5 pt-5 border-t border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cut Quality */}
            <div>
              <span className="text-xs uppercase tracking-widest text-stone-500 font-serif font-semibold block mb-2">
                Optical Cut Quality
              </span>
              <div className="space-y-1.5">
                {CUT_GRADES.map((cut) => {
                  const isSelected = filters.cutGrades.includes(cut);
                  return (
                    <button
                      key={cut}
                      type="button"
                      onClick={() => toggleCut(cut)}
                      className={`w-full text-left py-2 px-3 rounded-lg border text-xs font-sans transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-amber-200 font-medium'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="truncate">{cut}</span>
                      {isSelected && <span className="text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Precious Metal Bands */}
            <div>
              <span className="text-xs uppercase tracking-widest text-stone-500 font-serif font-semibold block mb-2">
                Precious Metal Band
              </span>
              <div className="space-y-1.5">
                {METALS.map((metal) => {
                  const isSelected = filters.metals.includes(metal.id);
                  return (
                    <button
                      key={metal.id}
                      type="button"
                      onClick={() => toggleMetal(metal.id)}
                      className={`w-full text-left py-2 px-3 rounded-lg border text-xs font-sans transition-all cursor-pointer flex items-center space-x-2.5 ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white font-medium'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0"
                        style={{backgroundColor: metal.hex}}
                      />
                      <span className="flex-1">{metal.name}</span>
                      {isSelected && <span className="text-xs text-amber-300">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Setting Architecture */}
            <div>
              <span className="text-xs uppercase tracking-widest text-stone-500 font-serif font-semibold block mb-2">
                Setting Style Architecture
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {SETTING_STYLES.map((setting) => {
                  const isSelected = filters.settingStyles.includes(setting.id);
                  return (
                    <button
                      key={setting.id}
                      type="button"
                      onClick={() => toggleSettingStyle(setting.id)}
                      className={`py-2 px-2.5 rounded-lg border text-center text-xs font-sans transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white font-medium shadow-sm'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {setting.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. Active Filter Summary Pill Bar */}
      <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-stone-500 font-serif font-semibold">Active Selection:</span>
          {filters.originTab !== 'all' && (
            <Badge variant="outline" className="bg-stone-100 text-stone-800 border-stone-300 text-[11px]">
              Origin: {filters.originTab === 'natural' ? 'Natural Earth' : 'Lab-Grown IIa'}
            </Badge>
          )}
          {filters.shapes.map((s) => (
            <Badge key={s} variant="outline" className="bg-stone-100 text-stone-800 border-stone-300 text-[11px]">
              {s}
            </Badge>
          ))}
          {(filters.caratMin !== 1.0 || filters.caratMax !== 3.5) && (
            <Badge variant="outline" className="bg-stone-100 text-stone-800 border-stone-300 text-[11px] font-mono">
              {filters.caratMin.toFixed(2)}–{filters.caratMax.toFixed(2)} ct
            </Badge>
          )}
          {filters.colorGrades.length > 0 && (
            <Badge variant="outline" className="bg-stone-100 text-stone-800 border-stone-300 text-[11px]">
              Color: {filters.colorGrades.join(', ')}
            </Badge>
          )}
          {filters.clarityGrades.length > 0 && (
            <Badge variant="outline" className="bg-stone-100 text-stone-800 border-stone-300 text-[11px]">
              Clarity: {filters.clarityGrades.join(', ')}
            </Badge>
          )}
          {filters.metals.map((m) => (
            <Badge key={m} variant="outline" className="bg-stone-100 text-stone-800 border-stone-300 text-[11px]">
              {m.replace(/-/g, ' ')}
            </Badge>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-stone-600 font-serif font-medium">
            Showing <strong className="text-stone-950 font-bold">{totalResults}</strong> handcrafted creations
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (context?.resetFilters) {
                context.resetFilters();
              } else {
                onFilterChange(DEFAULT_DIAMOND_FILTERS);
              }
            }}
            className="text-stone-500 hover:text-stone-900 text-xs cursor-pointer h-7 px-2"
          >
            Reset All
          </Button>
        </div>
      </div>
    </Card>
  );
}
