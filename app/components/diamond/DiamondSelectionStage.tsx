import React, {useState, useMemo} from 'react';
import type {
  DiamondShape,
  CutGrade,
  ColorGrade,
  ClarityGrade,
  PolishGrade,
  SymmetryGrade,
  FluorescenceGrade,
  LooseDiamond,
  DiamondSortOption,
} from '~/types/diamond';
import {
  useDiamondContext,
  COLOR_ORDER,
  CLARITY_ORDER,
  CUT_GRADES_LIST,
  POLISH_GRADES_LIST,
  SYMMETRY_GRADES_LIST,
  FLUORESCENCE_GRADES_LIST,
} from '~/context/DiamondFilterContext';
import {DiamondShapeIcon} from './DiamondShapeIcons';
import {Slider} from '~/components/ui/slider';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {Button} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';
import {Card, CardContent} from '~/components/ui/card';
import {Separator} from '~/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';

const SHAPES: DiamondShape[] = [
  'Round',
  'Oval',
  'Princess',
  'Cushion',
  'Emerald',
  'Pear',
  'Radiant',
  'Marquise',
  'Asscher',
  'Heart',
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

export function DiamondSelectionStage() {
  const {
    diamondFilters,
    setDiamondFilters,
    diamondSortBy,
    setDiamondSortBy,
    diamondViewMode,
    setDiamondViewMode,
    filteredDiamonds,
    resetDiamondFilters,
    selectDiamond,
    selectedDiamond,
    selectedSetting,
  } = useDiamondContext();

  const [showAdvancedProportions, setShowAdvancedProportions] = useState(false);
  const [inspectDiamond, setInspectDiamond] = useState<LooseDiamond | null>(null);

  // Helper to normalize Slider values
  const toArray = (v: number | readonly number[]): number[] =>
    Array.isArray(v) ? (Array.from(v) as number[]) : [Number(v)];

  // Allowed labs depending on origin tab
  const allowedLabs: ('GIA' | 'IGI' | 'AGS')[] = useMemo(() => {
    if (diamondFilters.originTab === 'lab-grown') {
      return ['IGI', 'GIA'];
    }
    // Natural diamonds or All
    return ['GIA', 'IGI', 'AGS'];
  }, [diamondFilters.originTab]);

  // Toggle Helpers
  const toggleShape = (shape: DiamondShape) => {
    setDiamondFilters((prev) => {
      const exists = prev.shapes.includes(shape);
      const shapes = exists ? prev.shapes.filter((s) => s !== shape) : [...prev.shapes, shape];
      return {...prev, shapes};
    });
  };

  const toggleCut = (cut: CutGrade) => {
    setDiamondFilters((prev) => {
      const exists = prev.cutGrades.includes(cut);
      const cutGrades = exists ? prev.cutGrades.filter((c) => c !== cut) : [...prev.cutGrades, cut];
      return {...prev, cutGrades};
    });
  };

  const toggleLab = (lab: 'GIA' | 'IGI' | 'AGS') => {
    setDiamondFilters((prev) => {
      const exists = prev.labs.includes(lab);
      const labs = exists ? prev.labs.filter((l) => l !== lab) : [...prev.labs, lab];
      return {...prev, labs};
    });
  };

  const togglePolish = (p: PolishGrade) => {
    setDiamondFilters((prev) => {
      const exists = prev.polishGrades.includes(p);
      const polishGrades = exists ? prev.polishGrades.filter((x) => x !== p) : [...prev.polishGrades, p];
      return {...prev, polishGrades};
    });
  };

  const toggleSymmetry = (s: SymmetryGrade) => {
    setDiamondFilters((prev) => {
      const exists = prev.symmetryGrades.includes(s);
      const symmetryGrades = exists ? prev.symmetryGrades.filter((x) => x !== s) : [...prev.symmetryGrades, s];
      return {...prev, symmetryGrades};
    });
  };

  const toggleFluor = (f: FluorescenceGrade) => {
    setDiamondFilters((prev) => {
      const exists = prev.fluorescenceGrades.includes(f);
      const fluorescenceGrades = exists ? prev.fluorescenceGrades.filter((x) => x !== f) : [...prev.fluorescenceGrades, f];
      return {...prev, fluorescenceGrades};
    });
  };

  // Color Stepper indices
  const colorIndices = useMemo(() => {
    if (diamondFilters.colorGrades.length === 0) {
      return [0, COLOR_ORDER.length - 1];
    }
    const idxs = diamondFilters.colorGrades.map((g) => COLOR_ORDER.indexOf(g)).filter((i) => i >= 0);
    return [Math.min(...idxs), Math.max(...idxs)];
  }, [diamondFilters.colorGrades]);

  const handleColorSliderChange = (raw: number | readonly number[]) => {
    const vals = toArray(raw);
    const minIdx = Math.min(vals[0], vals[1] ?? vals[0]);
    const maxIdx = Math.max(vals[0], vals[1] ?? vals[0]);
    const selected = COLOR_ORDER.slice(minIdx, maxIdx + 1);
    setDiamondFilters((prev) => ({
      ...prev,
      colorGrades: selected.length === COLOR_ORDER.length ? [] : selected,
    }));
  };

  // Clarity Stepper indices
  const clarityIndices = useMemo(() => {
    if (diamondFilters.clarityGrades.length === 0) {
      return [0, CLARITY_ORDER.length - 1];
    }
    const idxs = diamondFilters.clarityGrades.map((c) => CLARITY_ORDER.indexOf(c)).filter((i) => i >= 0);
    return [Math.min(...idxs), Math.max(...idxs)];
  }, [diamondFilters.clarityGrades]);

  const handleClaritySliderChange = (raw: number | readonly number[]) => {
    const vals = toArray(raw);
    const minIdx = Math.min(vals[0], vals[1] ?? vals[0]);
    const maxIdx = Math.max(vals[0], vals[1] ?? vals[0]);
    const selected = CLARITY_ORDER.slice(minIdx, maxIdx + 1);
    setDiamondFilters((prev) => ({
      ...prev,
      clarityGrades: selected.length === CLARITY_ORDER.length ? [] : selected,
    }));
  };

  return (
    <div className="diamond-selection-stage space-y-6">
      {/* 1. Origin Selection Tabs: 2 Tabs (Natural vs Lab-Grown) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-amber-800 font-serif font-semibold block">
              Step 1: Gemological Origin
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-stone-900 font-medium">
              Choose Diamond Origin
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-light hidden md:inline">
            Both natural earth-mined &amp; lab-grown diamonds share identical 10-Mohs crystalline physics
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-100 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => setDiamondFilters((prev) => ({...prev, originTab: 'natural'}))}
            className={`py-3.5 px-4 rounded-lg text-xs font-serif font-bold tracking-wider transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center space-x-2 ${
              diamondFilters.originTab === 'natural'
                ? 'bg-stone-900 text-amber-200 shadow-md border border-stone-900'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <span className="text-sm">✦ Natural Earth-Mined</span>
            <span className="text-[11px] opacity-80 font-sans font-normal">
              (GIA / IGI / AGS)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDiamondFilters((prev) => ({...prev, originTab: 'lab-grown'}))}
            className={`py-3.5 px-4 rounded-lg text-xs font-serif font-bold tracking-wider transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center space-x-2 ${
              diamondFilters.originTab === 'lab-grown'
                ? 'bg-stone-900 text-amber-200 shadow-md border border-stone-900'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <span className="text-sm">⚛ Lab-Grown Type IIa</span>
            <span className="text-[11px] opacity-80 font-sans font-normal">
              (IGI / GIA Certified)
            </span>
          </button>
        </div>

        {/* Setting Compatibility Guide if Setting Pre-selected */}
        {selectedSetting && (
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center space-x-2">
              <span className="text-amber-800 text-base">✦</span>
              <span>
                Paired with your chosen setting: <strong>{selectedSetting.title}</strong>. Compatible silhouettes:{' '}
                <span className="font-serif font-medium">{selectedSetting.compatibleShapes.join(', ')}</span>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setDiamondFilters((prev) => ({
                  ...prev,
                  shapes: selectedSetting.compatibleShapes,
                }));
              }}
              className="text-amber-900 underline font-semibold text-[11px] shrink-0 ml-2"
            >
              Filter to Compatible Shapes
            </button>
          </div>
        )}

        {/* ACTIVE LIVE FILTERING REAL-TIME STATUS BAR */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-serif font-bold text-stone-900">
              Active Gemological Filter:
            </span>
            <Badge variant="outline" className="font-mono bg-stone-50 text-stone-900 border-stone-300">
              {filteredDiamonds.length} diamonds match active criteria
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {diamondFilters.originTab !== 'all' && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-stone-100 text-stone-800">
                Origin: {diamondFilters.originTab === 'natural' ? 'Natural' : 'Lab-Grown'}
                <button
                  type="button"
                  onClick={() => setDiamondFilters((prev) => ({...prev, originTab: 'all'}))}
                  className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </Badge>
            )}

            {diamondFilters.shapes.map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px] gap-1 bg-stone-100 text-stone-800">
                {s}
                <button
                  type="button"
                  onClick={() => toggleShape(s)}
                  className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </Badge>
            ))}

            {(diamondFilters.caratMin > 0.7 || diamondFilters.caratMax < 4.5) && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-stone-100 text-stone-800 font-mono">
                {diamondFilters.caratMin.toFixed(2)}–{diamondFilters.caratMax.toFixed(2)} ct
                <button
                  type="button"
                  onClick={() =>
                    setDiamondFilters((prev) => ({
                      ...prev,
                      caratMin: 0.7,
                      caratMax: 4.5,
                    }))
                  }
                  className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </Badge>
            )}

            {(diamondFilters.priceMin > 2000 || diamondFilters.priceMax < 90000) && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-stone-100 text-stone-800 font-mono">
                ${diamondFilters.priceMin.toLocaleString()}–${diamondFilters.priceMax.toLocaleString()}
                <button
                  type="button"
                  onClick={() =>
                    setDiamondFilters((prev) => ({
                      ...prev,
                      priceMin: 2000,
                      priceMax: 90000,
                    }))
                  }
                  className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </Badge>
            )}

            {diamondFilters.colorGrades.length > 0 && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-stone-100 text-stone-800">
                Colors: {diamondFilters.colorGrades.join(', ')}
                <button
                  type="button"
                  onClick={() => setDiamondFilters((prev) => ({...prev, colorGrades: []}))}
                  className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </Badge>
            )}

            {diamondFilters.clarityGrades.length > 0 && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-stone-100 text-stone-800">
                Clarity: {diamondFilters.clarityGrades.join(', ')}
                <button
                  type="button"
                  onClick={() => setDiamondFilters((prev) => ({...prev, clarityGrades: []}))}
                  className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </Badge>
            )}

            {diamondFilters.labs.length > 0 && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-stone-100 text-stone-800 font-mono">
                Lab: {diamondFilters.labs.join(', ')}
                <button
                  type="button"
                  onClick={() => setDiamondFilters((prev) => ({...prev, labs: []}))}
                  className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </Badge>
            )}

            {diamondFilters.reportNumberQuery && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-stone-100 text-stone-800 font-mono">
                Report: {diamondFilters.reportNumberQuery}
                <button
                  type="button"
                  onClick={() => setDiamondFilters((prev) => ({...prev, reportNumberQuery: ''}))}
                  className="hover:text-red-700 font-bold ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </Badge>
            )}

            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={resetDiamondFilters}
              className="text-[11px] text-stone-400 hover:text-stone-900 h-6 px-1.5 cursor-pointer"
            >
              Reset All
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Shape Selection (SVG Illustration Icons) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-widest text-stone-600 font-serif font-semibold">
              Center Diamond Shape (Silhouette)
            </span>
            {diamondFilters.shapes.length > 0 && (
              <Badge variant="outline" className="text-[10px] bg-stone-50 border-stone-300">
                {diamondFilters.shapes.length} Selected
              </Badge>
            )}
          </div>

          {diamondFilters.shapes.length > 0 && (
            <button
              type="button"
              onClick={() => setDiamondFilters((prev) => ({...prev, shapes: []}))}
              className="text-xs text-amber-800 hover:underline cursor-pointer font-medium"
            >
              Clear Shapes
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {SHAPES.map((shape) => {
            const isSelected = diamondFilters.shapes.includes(shape);
            return (
              <button
                key={shape}
                type="button"
                onClick={() => toggleShape(shape)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                    : 'border-stone-200/90 bg-stone-50/50 hover:bg-stone-100 text-stone-700 hover:border-stone-400'
                }`}
              >
                <div
                  className={`w-7 h-7 flex items-center justify-center mb-1 transition-transform group-hover:scale-110 ${
                    isSelected ? 'text-amber-300' : 'text-stone-600'
                  }`}
                >
                  <DiamondShapeIcon shape={shape} size={24} />
                </div>
                <span className="text-[10px] font-medium tracking-tight">
                  {shape}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Core 4Cs Filters Grid: Carat, Price, Color, Clarity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Carat Weight (Dual Stepper Slider + Min/Max Input Ranges) */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-stone-800 font-serif font-semibold">
              Carat Weight Range
            </span>
            <Badge variant="outline" className="text-[11px] font-mono bg-stone-50 text-stone-900 border-stone-300">
              {diamondFilters.caratMin.toFixed(2)} ct – {diamondFilters.caratMax.toFixed(2)} ct
            </Badge>
          </div>

          <div className="px-2 pt-1 pb-2">
            <Slider
              min={0.7}
              max={4.5}
              step={0.05}
              value={[diamondFilters.caratMin, diamondFilters.caratMax]}
              onValueChange={(raw) => {
                const vals = toArray(raw);
                if (vals.length >= 2) {
                  setDiamondFilters((prev) => ({
                    ...prev,
                    caratMin: Number(vals[0].toFixed(2)),
                    caratMax: Number(vals[1].toFixed(2)),
                  }));
                }
              }}
              className="cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="flex items-center space-x-2">
              <Label className="text-xs text-stone-500 font-medium shrink-0">Min Carat:</Label>
              <div className="relative flex-1">
                <Input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max={diamondFilters.caratMax}
                  value={diamondFilters.caratMin}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setDiamondFilters((prev) => ({
                        ...prev,
                        caratMin: Math.max(0.5, Math.min(val, prev.caratMax)),
                      }));
                    }
                  }}
                  className="h-8 py-1 px-2 bg-stone-50 text-xs font-mono font-medium"
                />
                <span className="absolute right-2 top-1.5 text-xs text-stone-400 pointer-events-none">ct</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Label className="text-xs text-stone-500 font-medium shrink-0">Max Carat:</Label>
              <div className="relative flex-1">
                <Input
                  type="number"
                  step="0.05"
                  min={diamondFilters.caratMin}
                  max="5.0"
                  value={diamondFilters.caratMax}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setDiamondFilters((prev) => ({
                        ...prev,
                        caratMax: Math.min(5.0, Math.max(val, prev.caratMin)),
                      }));
                    }
                  }}
                  className="h-8 py-1 px-2 bg-stone-50 text-xs font-mono font-medium"
                />
                <span className="absolute right-2 top-1.5 text-xs text-stone-400 pointer-events-none">ct</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Budget Range (Dual Slider + Min/Max Currency Inputs) */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-stone-800 font-serif font-semibold">
              Price Range Budget
            </span>
            <Badge variant="outline" className="text-[11px] font-mono bg-stone-50 text-stone-900 border-stone-300">
              ${diamondFilters.priceMin.toLocaleString()} – ${diamondFilters.priceMax.toLocaleString()}
            </Badge>
          </div>

          <div className="px-2 pt-1 pb-2">
            <Slider
              min={2000}
              max={90000}
              step={500}
              value={[diamondFilters.priceMin, diamondFilters.priceMax]}
              onValueChange={(raw) => {
                const vals = toArray(raw);
                if (vals.length >= 2) {
                  setDiamondFilters((prev) => ({
                    ...prev,
                    priceMin: vals[0],
                    priceMax: vals[1],
                  }));
                }
              }}
              className="cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="flex items-center space-x-2">
              <Label className="text-xs text-stone-500 font-medium shrink-0">Min ($):</Label>
              <Input
                type="number"
                step="500"
                min="1000"
                max={diamondFilters.priceMax}
                value={diamondFilters.priceMin}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    setDiamondFilters((prev) => ({
                      ...prev,
                      priceMin: Math.max(1000, Math.min(val, prev.priceMax)),
                    }));
                  }
                }}
                className="h-8 py-1 px-2 bg-stone-50 text-xs font-mono font-medium"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Label className="text-xs text-stone-500 font-medium shrink-0">Max ($):</Label>
              <Input
                type="number"
                step="500"
                min={diamondFilters.priceMin}
                max="100000"
                value={diamondFilters.priceMax}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    setDiamondFilters((prev) => ({
                      ...prev,
                      priceMax: Math.min(100000, Math.max(val, prev.priceMin)),
                    }));
                  }
                }}
                className="h-8 py-1 px-2 bg-stone-50 text-xs font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* Color Spectrum (Slider + Direct Grade Buttons) */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-stone-800 font-serif font-semibold">
              Color Spectrum (D – J)
            </span>
            <span className="text-[11px] text-amber-800 font-medium">
              {COLOR_ORDER[colorIndices[0]]} to {COLOR_ORDER[colorIndices[1]]}
            </span>
          </div>

          <div className="px-2 pt-1 pb-2">
            <Slider
              min={0}
              max={COLOR_ORDER.length - 1}
              step={1}
              value={colorIndices}
              onValueChange={handleColorSliderChange}
              className="cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-7 gap-1">
            {COLOR_ORDER.map((grade, idx) => {
              const inRange = idx >= colorIndices[0] && idx <= colorIndices[1];
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => {
                    if (inRange && diamondFilters.colorGrades.length > 0) {
                      setDiamondFilters((prev) => ({
                        ...prev,
                        colorGrades: prev.colorGrades.filter((g) => g !== grade),
                      }));
                    } else {
                      setDiamondFilters((prev) => ({
                        ...prev,
                        colorGrades: [...prev.colorGrades, grade],
                      }));
                    }
                  }}
                  className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                    inRange
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  <div className="text-xs font-serif font-bold">{grade}</div>
                  <div className={`text-[8px] uppercase tracking-tighter truncate ${inRange ? 'text-amber-300' : 'text-stone-400'}`}>
                    {COLOR_TIER_MAP[grade]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clarity Purity Scale (Slider + Direct Grade Buttons) */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-stone-800 font-serif font-semibold">
              Clarity Purity Scale (FL – SI2)
            </span>
            <span className="text-[11px] text-amber-800 font-medium">
              {CLARITY_ORDER[clarityIndices[0]]} to {CLARITY_ORDER[clarityIndices[1]]}
            </span>
          </div>

          <div className="px-2 pt-1 pb-2">
            <Slider
              min={0}
              max={CLARITY_ORDER.length - 1}
              step={1}
              value={clarityIndices}
              onValueChange={handleClaritySliderChange}
              className="cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
            {CLARITY_ORDER.map((grade, idx) => {
              const inRange = idx >= clarityIndices[0] && idx <= clarityIndices[1];
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => {
                    if (inRange && diamondFilters.clarityGrades.length > 0) {
                      setDiamondFilters((prev) => ({
                        ...prev,
                        clarityGrades: prev.clarityGrades.filter((c) => c !== grade),
                      }));
                    } else {
                      setDiamondFilters((prev) => ({
                        ...prev,
                        clarityGrades: [...prev.clarityGrades, grade],
                      }));
                    }
                  }}
                  className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                    inRange
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  <div className="text-xs font-serif font-bold">{grade}</div>
                  <div className={`text-[8px] uppercase tracking-tighter truncate ${inRange ? 'text-amber-300' : 'text-stone-400'}`}>
                    {grade.startsWith('VV') ? 'VVS' : grade.startsWith('V') ? 'VS' : grade.startsWith('S') ? 'SI' : 'FL'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Optical Cut Quality, Lab Certification & Report Search Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Cut Grade Selection */}
          <div className="md:col-span-5 space-y-1.5">
            <span className="text-[11px] uppercase tracking-widest text-stone-600 font-serif font-semibold block">
              Optical Cut Grade
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CUT_GRADES_LIST.map((cut) => {
                const isSelected = diamondFilters.cutGrades.includes(cut);
                const shortLabel = cut.includes('Super') ? 'Super Ideal ✦' : cut;
                return (
                  <button
                    key={cut}
                    type="button"
                    onClick={() => toggleCut(cut)}
                    className={`py-1.5 px-2.5 rounded-lg border text-xs font-sans transition-all cursor-pointer ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-amber-200 font-medium shadow-sm'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lab Selection (Dynamically adapts based on Natural vs Lab origin) */}
          <div className="md:col-span-3 space-y-1.5">
            <span className="text-[11px] uppercase tracking-widest text-stone-600 font-serif font-semibold block">
              Grading Lab ({diamondFilters.originTab === 'lab-grown' ? 'Lab: IGI / GIA' : 'Natural: GIA / IGI / AGS'})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allowedLabs.map((lab) => {
                const isSelected = diamondFilters.labs.includes(lab);
                return (
                  <button
                    key={lab}
                    type="button"
                    onClick={() => toggleLab(lab)}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-800 bg-amber-900 text-white shadow-sm'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    {lab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search by Report Number */}
          <div className="md:col-span-4 space-y-1.5">
            <span className="text-[11px] uppercase tracking-widest text-stone-600 font-serif font-semibold block">
              Search by Report / Stock #
            </span>
            <div className="relative">
              <Input
                type="text"
                placeholder="e.g. GIA-2489104820 or IGI-LG..."
                value={diamondFilters.reportNumberQuery}
                onChange={(e) =>
                  setDiamondFilters((prev) => ({
                    ...prev,
                    reportNumberQuery: e.target.value,
                  }))
                }
                className="h-9 py-1 px-3 bg-stone-50 text-xs font-mono"
              />
              {diamondFilters.reportNumberQuery && (
                <button
                  type="button"
                  onClick={() => setDiamondFilters((prev) => ({...prev, reportNumberQuery: ''}))}
                  className="absolute right-2 top-2 text-xs text-stone-400 hover:text-stone-900"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Proportions (Table %, Depth %, Ratio, Polish, Symmetry, Fluorescence) */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvancedProportions(!showAdvancedProportions)}
            className="text-xs uppercase tracking-widest text-stone-700 font-serif font-semibold hover:text-stone-900 cursor-pointer flex items-center space-x-1.5 pt-2 border-t border-stone-100 w-full justify-between"
          >
            <span>
              {showAdvancedProportions ? '▼ Hide Detailed Proportions' : '▶ Advanced Gemology: Table %, Depth %, Ratio & Finish'}
            </span>
            <span className="text-[11px] font-sans text-stone-400 font-normal">
              {showAdvancedProportions ? 'Collapse' : 'Expand Proportions'}
            </span>
          </button>

          {showAdvancedProportions && (
            <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Table % Slider + Inputs */}
              <div className="space-y-2 bg-stone-50/70 p-3 rounded-xl border border-stone-200">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-700">Table Percentage:</span>
                  <span className="font-mono text-stone-900">{diamondFilters.tableMin}% - {diamondFilters.tableMax}%</span>
                </div>
                <Slider
                  min={53}
                  max={70}
                  step={0.5}
                  value={[diamondFilters.tableMin, diamondFilters.tableMax]}
                  onValueChange={(raw) => {
                    const vals = toArray(raw);
                    setDiamondFilters((prev) => ({
                      ...prev,
                      tableMin: vals[0],
                      tableMax: vals[1],
                    }));
                  }}
                  className="cursor-pointer py-1"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>53%</span>
                  <span>Ideal: 54-58%</span>
                  <span>70%</span>
                </div>
              </div>

              {/* Depth % Slider + Inputs */}
              <div className="space-y-2 bg-stone-50/70 p-3 rounded-xl border border-stone-200">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-700">Depth Percentage:</span>
                  <span className="font-mono text-stone-900">{diamondFilters.depthMin}% - {diamondFilters.depthMax}%</span>
                </div>
                <Slider
                  min={58}
                  max={73}
                  step={0.5}
                  value={[diamondFilters.depthMin, diamondFilters.depthMax]}
                  onValueChange={(raw) => {
                    const vals = toArray(raw);
                    setDiamondFilters((prev) => ({
                      ...prev,
                      depthMin: vals[0],
                      depthMax: vals[1],
                    }));
                  }}
                  className="cursor-pointer py-1"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>58%</span>
                  <span>Ideal: 60-62.5%</span>
                  <span>73%</span>
                </div>
              </div>

              {/* Length/Width Ratio Slider */}
              <div className="space-y-2 bg-stone-50/70 p-3 rounded-xl border border-stone-200">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-700">L/W Ratio:</span>
                  <span className="font-mono text-stone-900">{diamondFilters.ratioMin.toFixed(2)} - {diamondFilters.ratioMax.toFixed(2)}</span>
                </div>
                <Slider
                  min={1.0}
                  max={2.1}
                  step={0.01}
                  value={[diamondFilters.ratioMin, diamondFilters.ratioMax]}
                  onValueChange={(raw) => {
                    const vals = toArray(raw);
                    setDiamondFilters((prev) => ({
                      ...prev,
                      ratioMin: Number(vals[0].toFixed(2)),
                      ratioMax: Number(vals[1].toFixed(2)),
                    }));
                  }}
                  className="cursor-pointer py-1"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>1.00 (Round)</span>
                  <span>1.40 (Oval)</span>
                  <span>2.10 (Marquise)</span>
                </div>
              </div>

              {/* Polish Selection */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-700">Polish:</span>
                <div className="flex flex-wrap gap-1">
                  {POLISH_GRADES_LIST.map((p) => {
                    const isSelected = diamondFilters.polishGrades.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePolish(p)}
                        className={`text-xs py-1 px-2.5 rounded border cursor-pointer ${
                          isSelected ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Symmetry Selection */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-700">Symmetry:</span>
                <div className="flex flex-wrap gap-1">
                  {SYMMETRY_GRADES_LIST.map((s) => {
                    const isSelected = diamondFilters.symmetryGrades.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSymmetry(s)}
                        className={`text-xs py-1 px-2.5 rounded border cursor-pointer ${
                          isSelected ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fluorescence Selection */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-700">Fluorescence:</span>
                <div className="flex flex-wrap gap-1">
                  {FLUORESCENCE_GRADES_LIST.map((f) => {
                    const isSelected = diamondFilters.fluorescenceGrades.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFluor(f)}
                        className={`text-xs py-1 px-2.5 rounded border cursor-pointer ${
                          isSelected ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200'
                        }`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Inventory Results Header & View Toggle (Grid vs Table) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <span className="text-xs text-stone-500 font-serif">
            Found <strong className="text-stone-950 font-bold">{filteredDiamonds.length}</strong> certified diamonds
          </span>
          {selectedDiamond && (
            <span className="ml-3 text-xs text-amber-800 font-medium">
              Currently Selected: {selectedDiamond.carat} ct {selectedDiamond.shape}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-stone-100 rounded-lg border border-stone-200 text-xs">
            <button
              type="button"
              onClick={() => setDiamondViewMode('grid')}
              className={`py-1 px-2.5 rounded font-medium transition-all cursor-pointer ${
                diamondViewMode === 'grid' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              ⊞ Grid View
            </button>
            <button
              type="button"
              onClick={() => setDiamondViewMode('table')}
              className={`py-1 px-2.5 rounded font-medium transition-all cursor-pointer ${
                diamondViewMode === 'table' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              ☰ Gemology Table
            </button>
          </div>

          {/* Sort By */}
          <select
            value={diamondSortBy}
            onChange={(e) => setDiamondSortBy(e.target.value as DiamondSortOption)}
            className="py-1 px-2.5 bg-white border border-stone-300 rounded-lg text-xs font-serif font-medium cursor-pointer"
          >
            <option value="featured">Featured Order</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="carat-desc">Carat: Largest First</option>
            <option value="carat-asc">Carat: Smallest First</option>
          </select>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={resetDiamondFilters}
            className="text-stone-400 hover:text-stone-900 text-xs"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* 6. Diamonds Listing (Grid View OR Table View) */}
      {filteredDiamonds.length > 0 ? (
        diamondViewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDiamonds.map((diamond) => {
              const isSelected = selectedDiamond?.id === diamond.id;
              return (
                <Card
                  key={diamond.id}
                  className={`overflow-hidden rounded-2xl border transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-stone-950 ring-2 ring-stone-950 bg-stone-50/50'
                      : 'border-stone-200 bg-white hover:border-stone-400'
                  }`}
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-4">
                    {/* Top Badges & Image Preview */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] font-bold py-0.5 px-2 bg-amber-50 text-amber-900 border-amber-300"
                        >
                          {diamond.certification.lab} Certified
                        </Badge>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {diamond.stockNumber}
                        </span>
                      </div>

                      {/* Visual Diamond Silhouette Preview */}
                      <div className="w-full aspect-square bg-stone-100 rounded-xl flex flex-col items-center justify-center p-6 relative overflow-hidden group">
                        <div className="text-stone-800 transition-transform duration-300 group-hover:scale-110">
                          <DiamondShapeIcon shape={diamond.shape} size={70} />
                        </div>
                        <span className="absolute bottom-2 text-[10px] uppercase tracking-wider text-stone-400 font-mono">
                          {diamond.origin === 'natural' ? 'Natural Mined' : 'Lab-Grown IIa'}
                        </span>
                      </div>

                      {/* 4Cs Summary */}
                      <div className="mt-3">
                        <h3 className="text-base font-serif font-bold text-stone-900 tracking-tight">
                          {diamond.carat.toFixed(2)} ct {diamond.shape}
                        </h3>
                        <p className="text-xs text-stone-600 font-sans mt-0.5">
                          {diamond.colorGrade} Color • {diamond.clarityGrade} Clarity • {diamond.cutGrade.includes('Super') ? 'Super Ideal' : diamond.cutGrade} Cut
                        </p>

                        {/* Proportions Snippet */}
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-stone-400 font-mono">
                          <span>Table: {diamond.proportions.tablePercentage}%</span>
                          <span>•</span>
                          <span>Depth: {diamond.proportions.depthPercentage}%</span>
                          <span>•</span>
                          <span>Ratio: {diamond.measurements.ratio.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="pt-3 border-t border-stone-100 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-stone-500 font-sans">Diamond Price:</span>
                        <span className="text-lg font-serif font-bold text-stone-900 font-mono">
                          ${diamond.pricing.price.toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setInspectDiamond(diamond)}
                          className="w-full text-[11px] font-serif border-stone-300 hover:bg-stone-100"
                        >
                          Specs &amp; Cert
                        </Button>

                        <Button
                          type="button"
                          variant={isSelected ? 'default' : 'default'}
                          size="xs"
                          onClick={() => selectDiamond(diamond)}
                          className={`w-full text-[11px] font-sans font-semibold uppercase tracking-wider cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                              : 'bg-stone-950 hover:bg-stone-800 text-white'
                          }`}
                        >
                          {isSelected ? '✓ Chosen' : 'Select Diamond'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[10px] font-serif">
                  <tr>
                    <th className="p-3">Shape</th>
                    <th className="p-3">Carat</th>
                    <th className="p-3">Color</th>
                    <th className="p-3">Clarity</th>
                    <th className="p-3">Cut</th>
                    <th className="p-3">Lab</th>
                    <th className="p-3">Report #</th>
                    <th className="p-3">Table %</th>
                    <th className="p-3">Depth %</th>
                    <th className="p-3">Ratio</th>
                    <th className="p-3">Finish</th>
                    <th className="p-3">Price</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredDiamonds.map((diamond) => {
                    const isSelected = selectedDiamond?.id === diamond.id;
                    return (
                      <tr
                        key={diamond.id}
                        className={`hover:bg-stone-50/70 transition-colors ${
                          isSelected ? 'bg-amber-50/40 font-medium' : ''
                        }`}
                      >
                        <td className="p-3 flex items-center space-x-2">
                          <span className="w-4 h-4 text-stone-700 shrink-0">
                            <DiamondShapeIcon shape={diamond.shape} size={16} />
                          </span>
                          <span className="font-serif">{diamond.shape}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-stone-900">
                          {diamond.carat.toFixed(2)} ct
                        </td>
                        <td className="p-3 font-bold">{diamond.colorGrade}</td>
                        <td className="p-3">{diamond.clarityGrade}</td>
                        <td className="p-3 truncate max-w-[120px]">
                          {diamond.cutGrade.includes('Super') ? 'Super Ideal' : diamond.cutGrade}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                            {diamond.certification.lab}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-stone-500">
                          {diamond.certification.certificateNumber}
                        </td>
                        <td className="p-3 font-mono">{diamond.proportions.tablePercentage}%</td>
                        <td className="p-3 font-mono">{diamond.proportions.depthPercentage}%</td>
                        <td className="p-3 font-mono">{diamond.measurements.ratio.toFixed(2)}</td>
                        <td className="p-3 text-[11px] text-stone-500 truncate">
                          {diamond.finish.polish[0]}/{diamond.finish.symmetry[0]} • {diamond.finish.fluorescence}
                        </td>
                        <td className="p-3 font-mono font-bold text-stone-900 text-sm">
                          ${diamond.pricing.price.toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            type="button"
                            size="xs"
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={() => selectDiamond(diamond)}
                            className={`text-[11px] cursor-pointer ${
                              isSelected ? 'bg-emerald-700 text-white' : 'hover:bg-stone-900 hover:text-white'
                            }`}
                          >
                            {isSelected ? '✓ Chosen' : 'Select'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <Card className="bg-white border-stone-200 rounded-2xl max-w-lg mx-auto shadow-sm my-8">
          <CardContent className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-lg font-serif">
              ✦
            </div>
            <h3 className="text-lg font-serif text-stone-900 font-medium">
              No Certified Diamonds Found
            </h3>
            <p className="text-xs text-stone-500 font-light max-w-sm mx-auto">
              No diamonds currently match your exact filter configuration. Try broadening your carat, color, or price criteria.
            </p>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={resetDiamondFilters}
              className="bg-stone-900 hover:bg-stone-800 text-white rounded text-xs uppercase tracking-wider font-semibold cursor-pointer"
            >
              Reset Diamond Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 7. Diamond Gemological Specs & Certificate Inspection Modal */}
      {inspectDiamond && (
        <Dialog open={!!inspectDiamond} onOpenChange={(open) => !open && setInspectDiamond(null)}>
          <DialogContent className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="font-mono bg-amber-50 text-amber-900 border-amber-300">
                  {inspectDiamond.certification.lab} Certified Gemological Dossier
                </Badge>
                <span className="text-xs text-stone-400 font-mono">
                  {inspectDiamond.stockNumber}
                </span>
              </div>
              <DialogTitle className="text-2xl font-serif font-bold text-stone-900 mt-2">
                {inspectDiamond.carat} ct {inspectDiamond.shape} Brilliant Diamond
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500">
                Official grading analysis verified by {inspectDiamond.certification.lab} Gemological Institute
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Top 4Cs Grid */}
              <div className="grid grid-cols-4 gap-2 text-center p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-semibold">Carat</span>
                  <span className="text-base font-serif font-bold text-stone-900">{inspectDiamond.carat} ct</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-semibold">Color</span>
                  <span className="text-base font-serif font-bold text-stone-900">{inspectDiamond.colorGrade}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-semibold">Clarity</span>
                  <span className="text-base font-serif font-bold text-stone-900">{inspectDiamond.clarityGrade}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-semibold">Cut</span>
                  <span className="text-xs font-serif font-bold text-stone-900 truncate block mt-0.5">
                    {inspectDiamond.cutGrade.includes('Super') ? 'Super Ideal' : inspectDiamond.cutGrade}
                  </span>
                </div>
              </div>

              {/* Precise Gemological Dimensions & Proportions */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-stone-500 font-serif font-semibold mb-2">
                  Anatomical Proportions &amp; Finish
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-stone-50/60 p-4 rounded-xl border border-stone-200">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Table Percentage:</span>
                    <span className="font-mono font-semibold text-stone-900">{inspectDiamond.proportions.tablePercentage}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Depth Percentage:</span>
                    <span className="font-mono font-semibold text-stone-900">{inspectDiamond.proportions.depthPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Length / Width Ratio:</span>
                    <span className="font-mono font-semibold text-stone-900">{inspectDiamond.measurements.ratio.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Crown Angle:</span>
                    <span className="font-mono font-semibold text-stone-900">{inspectDiamond.proportions.crownAngle}°</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Pavilion Angle:</span>
                    <span className="font-mono font-semibold text-stone-900">{inspectDiamond.proportions.pavilionAngle}°</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Girdle Thickness:</span>
                    <span className="font-sans font-semibold text-stone-900">{inspectDiamond.proportions.girdle}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Polish Grade:</span>
                    <span className="font-sans font-semibold text-stone-900">{inspectDiamond.finish.polish}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Symmetry Grade:</span>
                    <span className="font-sans font-semibold text-stone-900">{inspectDiamond.finish.symmetry}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Fluorescence:</span>
                    <span className="font-sans font-semibold text-stone-900">{inspectDiamond.finish.fluorescence}</span>
                  </div>
                </div>
              </div>

              {/* Lab Certificate Number & Inscription */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-500 font-sans block text-[11px]">Laser Inscription Registry:</span>
                  <strong className="font-mono text-stone-900 text-sm">{inspectDiamond.certification.laserInscription}</strong>
                </div>
                {inspectDiamond.certification.reportUrl && (
                  <a
                    href={inspectDiamond.certification.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-900 underline text-xs font-semibold"
                  >
                    Verify at {inspectDiamond.certification.lab} &rarr;
                  </a>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                <div>
                  <span className="text-xs text-stone-400 block">Diamond Investment:</span>
                  <span className="text-2xl font-serif font-bold text-stone-900 font-mono">
                    ${inspectDiamond.pricing.price.toLocaleString()}
                  </span>
                </div>

                <Button
                  type="button"
                  size="lg"
                  onClick={() => {
                    selectDiamond(inspectDiamond);
                    setInspectDiamond(null);
                  }}
                  className="bg-stone-950 hover:bg-stone-800 text-white font-sans text-xs uppercase tracking-widest font-semibold px-6 cursor-pointer"
                >
                  Select This Diamond
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
