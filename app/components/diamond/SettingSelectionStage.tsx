import React, {useState} from 'react';
import type {
  SettingStyle,
  PreciousMetalType,
  MetalKarat,
  DiamondShape,
  RingSetting,
  MetalOption,
} from '~/types/diamond';
import {useDiamondContext} from '~/context/DiamondFilterContext';
import {RingStyleIcon} from './RingStyleIcons';
import {DiamondShapeIcon} from './DiamondShapeIcons';
import {METALS_CATALOG} from '~/data/ring-settings';
import {Slider} from '~/components/ui/slider';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {Button} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';
import {Card, CardContent} from '~/components/ui/card';

const SETTING_STYLES: {id: SettingStyle; name: string; subtitle: string}[] = [
  {id: 'solitaire', name: 'Solitaire', subtitle: 'Timeless pure brilliance'},
  {id: 'hidden-halo', name: 'Hidden Halo', subtitle: 'Secret collar of diamonds'},
  {id: 'pave', name: 'French Pavé', subtitle: 'Diamond encrusted band'},
  {id: 'three-stone', name: 'Three-Stone', subtitle: 'Past, present & future'},
  {id: 'halo', name: 'Halo', subtitle: 'Framed radiant halo'},
  {id: 'bezel', name: 'Bezel', subtitle: 'Sleek protective rim'},
  {id: 'vintage', name: 'Vintage', subtitle: 'Antique milgrain filigree'},
  {id: 'cathedral', name: 'Cathedral', subtitle: 'High sweeping arches'},
  {id: 'toi-et-moi', name: 'Toi et Moi', subtitle: 'Twin gemstone duet'},
];

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

export function SettingSelectionStage() {
  const {
    settingFilters,
    setSettingFilters,
    filteredSettings,
    resetSettingFilters,
    selectedSetting,
    selectedMetal,
    selectSetting,
    setSelectedMetalOption,
    selectedDiamond,
  } = useDiamondContext();

  const [guidedStep, setGuidedStep] = useState<number>(1);
  const [inspectSetting, setInspectSetting] = useState<RingSetting | null>(null);

  // Helper to normalize Slider values
  const toArray = (v: number | readonly number[]): number[] =>
    Array.isArray(v) ? (Array.from(v) as number[]) : [Number(v)];

  const toggleStyle = (style: SettingStyle) => {
    setSettingFilters((prev) => {
      const exists = prev.styles.includes(style);
      const styles = exists ? prev.styles.filter((s) => s !== style) : [...prev.styles, style];
      return {...prev, styles};
    });
  };

  const toggleShape = (shape: DiamondShape) => {
    setSettingFilters((prev) => {
      const exists = prev.shapes.includes(shape);
      const shapes = exists ? prev.shapes.filter((s) => s !== shape) : [...prev.shapes, shape];
      return {...prev, shapes};
    });
  };

  return (
    <div className="setting-selection-stage space-y-6">
      {/* 1. Header & Mode Switcher (Guided Step-by-Step vs View All at Once) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-amber-800 font-serif font-semibold block">
              Step 2: Ring Setting Atelier
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-stone-900 font-medium">
              Select Ring Setting &amp; Precious Metal
            </h2>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSettingFilters((prev) => ({...prev, viewMode: 'guided'}))}
              className={`py-1.5 px-3 rounded-lg text-xs font-serif font-semibold tracking-wider transition-all cursor-pointer ${
                settingFilters.viewMode === 'guided'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              ✦ Guided (One at a Time)
            </button>
            <button
              type="button"
              onClick={() => setSettingFilters((prev) => ({...prev, viewMode: 'all'}))}
              className={`py-1.5 px-3 rounded-lg text-xs font-serif font-semibold tracking-wider transition-all cursor-pointer ${
                settingFilters.viewMode === 'all'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              ☰ View All at Once
            </button>
          </div>
        </div>

        {/* GUIDED MODE NAVIGATION TABS */}
        {settingFilters.viewMode === 'guided' && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <div className="grid grid-cols-4 gap-2">
              {[
                {step: 1, label: '1. Setting Style'},
                {step: 2, label: '2. Metal & Karat'},
                {step: 3, label: '3. Diamond Shape'},
                {step: 4, label: '4. Budget Price'},
              ].map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setGuidedStep(item.step)}
                  className={`py-2 px-3 rounded-xl border text-xs font-serif font-medium transition-all cursor-pointer text-center ${
                    guidedStep === item.step
                      ? 'border-stone-900 bg-stone-900 text-amber-200 shadow-sm'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. FILTER CONTROLS (Guided Step View OR All-at-Once View) */}
      <div className="space-y-4">
        {/* SECTION A: SETTING STYLES WITH SVG ILLUSTRATIONS */}
        {(settingFilters.viewMode === 'all' || guidedStep === 1) && (
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-stone-600 font-serif font-semibold">
                Ring Setting Style Silhouettes
              </span>
              {settingFilters.styles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSettingFilters((prev) => ({...prev, styles: []}))}
                  className="text-xs text-amber-800 hover:underline cursor-pointer"
                >
                  Clear Styles ({settingFilters.styles.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5">
              {SETTING_STYLES.map((style) => {
                const isSelected = settingFilters.styles.includes(style.id);
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => toggleStyle(style.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                        : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                        isSelected ? 'text-amber-300' : 'text-stone-700'
                      }`}
                    >
                      <RingStyleIcon style={style.id} size={28} />
                    </div>
                    <span className="text-[11px] font-serif font-bold text-center">
                      {style.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {settingFilters.viewMode === 'guided' && (
              <div className="flex justify-end mt-4 pt-3 border-t border-stone-100">
                <Button
                  type="button"
                  size="xs"
                  onClick={() => setGuidedStep(2)}
                  className="bg-stone-900 text-white text-xs"
                >
                  Next: Choose Precious Metal &rarr;
                </Button>
              </div>
            )}
          </div>
        )}

        {/* SECTION B: COLOR-CODED PRECIOUS METALS WITH MULTIPLE KARATS */}
        {(settingFilters.viewMode === 'all' || guidedStep === 2) && (
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-stone-600 font-serif font-semibold block">
                  Precious Metal &amp; Karat Options
                </span>
                <span className="text-xs text-stone-500 font-light">
                  Active Atelier Metal: <strong className="text-stone-900 font-serif">{selectedMetal.name}</strong> ({selectedMetal.purity})
                </span>
              </div>
            </div>

            {/* Grouped by Metal Families: Platinum, Yellow Gold, White Gold, Rose Gold */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Platinum 950 */}
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-serif font-semibold block">
                  Pure Platinum
                </span>
                {METALS_CATALOG.filter((m) => m.metal === 'platinum').map((metal) => {
                  const isSelected = selectedMetal.id === metal.id;
                  return (
                    <button
                      key={metal.id}
                      type="button"
                      onClick={() => setSelectedMetalOption(metal)}
                      className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                          : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0 shadow-inner"
                          style={{backgroundColor: metal.hexColor}}
                        />
                        <span className="font-medium">{metal.name}</span>
                      </div>
                      <span className={`text-[10px] ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                        +{metal.priceAdjustment > 0 ? `$${metal.priceAdjustment}` : '$0'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Yellow Gold: 9k, 14k, 18k, 22k, 24k */}
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-amber-800 font-serif font-semibold block">
                  Yellow Gold (9k, 14k, 18k, 22k, 24k)
                </span>
                <div className="space-y-1">
                  {METALS_CATALOG.filter((m) => m.metal === 'yellow-gold').map((metal) => {
                    const isSelected = selectedMetal.id === metal.id;
                    return (
                      <button
                        key={metal.id}
                        type="button"
                        onClick={() => setSelectedMetalOption(metal)}
                        className={`w-full text-left p-1.5 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                            : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-full border border-stone-300 shrink-0 shadow-inner"
                            style={{backgroundColor: metal.hexColor}}
                          />
                          <span className="font-medium text-[11px]">{metal.name}</span>
                        </div>
                        <span className={`text-[10px] ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                          {metal.priceAdjustment >= 0 ? `+$${metal.priceAdjustment}` : `-$${Math.abs(metal.priceAdjustment)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* White Gold: 9k, 14k, 18k */}
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-serif font-semibold block">
                  White Gold (9k, 14k, 18k)
                </span>
                <div className="space-y-1">
                  {METALS_CATALOG.filter((m) => m.metal === 'white-gold').map((metal) => {
                    const isSelected = selectedMetal.id === metal.id;
                    return (
                      <button
                        key={metal.id}
                        type="button"
                        onClick={() => setSelectedMetalOption(metal)}
                        className={`w-full text-left p-1.5 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                            : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-full border border-stone-300 shrink-0 shadow-inner"
                            style={{backgroundColor: metal.hexColor}}
                          />
                          <span className="font-medium text-[11px]">{metal.name}</span>
                        </div>
                        <span className={`text-[10px] ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                          {metal.priceAdjustment >= 0 ? `+$${metal.priceAdjustment}` : `-$${Math.abs(metal.priceAdjustment)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rose Gold: 9k, 14k, 18k */}
              <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-rose-800 font-serif font-semibold block">
                  Rose Gold (9k, 14k, 18k)
                </span>
                <div className="space-y-1">
                  {METALS_CATALOG.filter((m) => m.metal === 'rose-gold').map((metal) => {
                    const isSelected = selectedMetal.id === metal.id;
                    return (
                      <button
                        key={metal.id}
                        type="button"
                        onClick={() => setSelectedMetalOption(metal)}
                        className={`w-full text-left p-1.5 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                            : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-full border border-stone-300 shrink-0 shadow-inner"
                            style={{backgroundColor: metal.hexColor}}
                          />
                          <span className="font-medium text-[11px]">{metal.name}</span>
                        </div>
                        <span className={`text-[10px] ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                          {metal.priceAdjustment >= 0 ? `+$${metal.priceAdjustment}` : `-$${Math.abs(metal.priceAdjustment)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {settingFilters.viewMode === 'guided' && (
              <div className="flex justify-between mt-4 pt-3 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setGuidedStep(1)}
                  className="text-xs"
                >
                  &larr; Back to Style
                </Button>
                <Button
                  type="button"
                  size="xs"
                  onClick={() => setGuidedStep(3)}
                  className="bg-stone-900 text-white text-xs"
                >
                  Next: Compatible Diamond Shapes &rarr;
                </Button>
              </div>
            )}
          </div>
        )}

        {/* SECTION C: DIAMOND SHAPE COMPATIBILITY FILTER */}
        {(settingFilters.viewMode === 'all' || guidedStep === 3) && (
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs uppercase tracking-widest text-stone-600 font-serif font-semibold block">
                  Center Diamond Shape Compatibility
                </span>
                {selectedDiamond && (
                  <span className="text-xs text-amber-800 font-medium">
                    Pre-filtered to fit your selected {selectedDiamond.carat} ct {selectedDiamond.shape} diamond
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {SHAPES.map((shape) => {
                const isSelected = selectedDiamond ? selectedDiamond.shape === shape : settingFilters.shapes.includes(shape);
                return (
                  <button
                    key={shape}
                    type="button"
                    disabled={!!selectedDiamond}
                    onClick={() => toggleShape(shape)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                      selectedDiamond
                        ? isSelected
                          ? 'border-stone-900 bg-stone-900 text-white opacity-100 cursor-default'
                          : 'border-stone-100 bg-stone-50 text-stone-300 opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'border-stone-900 bg-stone-900 text-white cursor-pointer shadow-sm'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 cursor-pointer'
                    }`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center mb-1 ${isSelected ? 'text-amber-300' : 'text-stone-600'}`}>
                      <DiamondShapeIcon shape={shape} size={22} />
                    </div>
                    <span className="text-[10px] font-medium truncate">{shape}</span>
                  </button>
                );
              })}
            </div>

            {settingFilters.viewMode === 'guided' && (
              <div className="flex justify-between mt-4 pt-3 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setGuidedStep(2)}
                  className="text-xs"
                >
                  &larr; Back to Metal
                </Button>
                <Button
                  type="button"
                  size="xs"
                  onClick={() => setGuidedStep(4)}
                  className="bg-stone-900 text-white text-xs"
                >
                  Next: Setting Budget &rarr;
                </Button>
              </div>
            )}
          </div>
        )}

        {/* SECTION D: PRICE RANGE BUDGET SLIDER */}
        {(settingFilters.viewMode === 'all' || guidedStep === 4) && (
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-stone-800 font-serif font-semibold">
                Setting Price Range Budget
              </span>
              <Badge variant="outline" className="text-[11px] font-mono bg-stone-50 text-stone-900 border-stone-300">
                ${settingFilters.priceMin.toLocaleString()} – ${settingFilters.priceMax.toLocaleString()}
              </Badge>
            </div>

            <div className="px-2 pt-1 pb-2">
              <Slider
                min={1500}
                max={5000}
                step={100}
                value={[settingFilters.priceMin, settingFilters.priceMax]}
                onValueChange={(raw) => {
                  const vals = toArray(raw);
                  if (vals.length >= 2) {
                    setSettingFilters((prev) => ({
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
                <Label className="text-xs text-stone-500 font-medium shrink-0">Min Setting ($):</Label>
                <Input
                  type="number"
                  step="100"
                  min="1000"
                  max={settingFilters.priceMax}
                  value={settingFilters.priceMin}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setSettingFilters((prev) => ({
                        ...prev,
                        priceMin: Math.max(1000, Math.min(val, prev.priceMax)),
                      }));
                    }
                  }}
                  className="h-8 py-1 px-2 bg-stone-50 text-xs font-mono font-medium"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Label className="text-xs text-stone-500 font-medium shrink-0">Max Setting ($):</Label>
                <Input
                  type="number"
                  step="100"
                  min={settingFilters.priceMin}
                  max="6000"
                  value={settingFilters.priceMax}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setSettingFilters((prev) => ({
                        ...prev,
                        priceMax: Math.min(6000, Math.max(val, prev.priceMin)),
                      }));
                    }
                  }}
                  className="h-8 py-1 px-2 bg-stone-50 text-xs font-mono font-medium"
                />
              </div>
            </div>

            {settingFilters.viewMode === 'guided' && (
              <div className="flex justify-between mt-4 pt-3 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setGuidedStep(3)}
                  className="text-xs"
                >
                  &larr; Back to Shapes
                </Button>
                <Button
                  type="button"
                  size="xs"
                  onClick={() => setSettingFilters((prev) => ({...prev, viewMode: 'all'}))}
                  className="bg-stone-900 text-white text-xs"
                >
                  Review Matching Settings &rarr;
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. SETTING PRODUCT CARDS GRID */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-500 font-serif">
            Showing <strong className="text-stone-950 font-bold">{filteredSettings.length}</strong> handcrafted ring settings
          </span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={resetSettingFilters}
            className="text-stone-400 hover:text-stone-900 text-xs"
          >
            Reset Filters
          </Button>
        </div>

        {filteredSettings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSettings.map((setting) => {
              const isSelected = selectedSetting?.id === setting.id;
              const settingPrice = setting.basePrice + (selectedMetal.priceAdjustment || 0);
              const imageUrl = setting.images[selectedMetal.id] || setting.images['platinum-950'];

              return (
                <Card
                  key={setting.id}
                  className={`overflow-hidden rounded-2xl border transition-all hover:shadow-lg ${
                    isSelected
                      ? 'border-stone-950 ring-2 ring-stone-950 bg-stone-50/50'
                      : 'border-stone-200 bg-white hover:border-stone-400'
                  }`}
                >
                  <CardContent className="p-0 flex flex-col justify-between h-full">
                    {/* Ring Image Preview */}
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden group">
                      <img
                        src={imageUrl}
                        alt={setting.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Style Category Badge */}
                      <Badge
                        variant="secondary"
                        className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-stone-900 text-[10px] uppercase font-serif tracking-widest font-semibold border border-stone-200 shadow-sm"
                      >
                        {setting.styleCategory}
                      </Badge>
                    </div>

                    {/* Setting Details */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-serif font-bold text-stone-900 tracking-tight">
                          {setting.title}
                        </h3>
                        <p className="text-xs text-stone-500 font-light mt-1 line-clamp-2 leading-relaxed">
                          {setting.subtitle}
                        </p>

                        {/* Interactive Metal Swatches on the Card */}
                        <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-stone-100">
                          <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                            Metal:
                          </span>
                          <div className="flex items-center space-x-1.5">
                            {['platinum-950', '18k-yellow-gold', '18k-white-gold', '18k-rose-gold'].map((mid) => {
                              const metal = METALS_CATALOG.find((m) => m.id === mid)!;
                              const isCurMetal = selectedMetal.id === metal.id;
                              return (
                                <button
                                  key={metal.id}
                                  type="button"
                                  onClick={() => setSelectedMetalOption(metal)}
                                  className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                                    isCurMetal
                                      ? 'ring-2 ring-stone-900 ring-offset-1 scale-110 border-stone-400'
                                      : 'border-stone-300 hover:scale-105'
                                  }`}
                                  style={{backgroundColor: metal.hexColor}}
                                  title={`${metal.name} (${metal.purity})`}
                                />
                              );
                            })}
                          </div>
                          <span className="text-[10px] text-stone-600 font-serif font-medium truncate ml-1">
                            {selectedMetal.shortName}
                          </span>
                        </div>
                      </div>

                      {/* Price & Select Action */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                            Setting Price:
                          </span>
                          <span className="text-xl font-serif font-bold text-stone-900 font-mono">
                            ${settingPrice.toLocaleString()}
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => selectSetting(setting, selectedMetal)}
                          className={`rounded-lg text-xs font-semibold uppercase tracking-widest px-4 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow'
                              : 'bg-stone-950 hover:bg-stone-800 text-white shadow-sm'
                          }`}
                        >
                          {isSelected ? '✓ Setting Chosen' : 'Select Setting'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <Card className="bg-white border-stone-200 rounded-2xl max-w-lg mx-auto shadow-sm my-8">
            <CardContent className="p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-lg font-serif">
                ✦
              </div>
              <h3 className="text-lg font-serif text-stone-900 font-medium">
                No Matching Ring Settings
              </h3>
              <p className="text-xs text-stone-500 font-light max-w-sm mx-auto">
                No settings match your style or budget criteria. Try broadening your budget range or selecting more styles.
              </p>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={resetSettingFilters}
                className="bg-stone-900 hover:bg-stone-800 text-white rounded text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Reset Setting Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
