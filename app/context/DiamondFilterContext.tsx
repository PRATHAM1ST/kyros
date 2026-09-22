import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import {useSearchParams, useNavigate} from 'react-router';
import type {
  DiamondFilterState,
  DiamondShape,
  DiamondSortOption,
  PreciousMetal,
  PreciousMetalType,
  MetalKarat,
  MetalOption,
  SettingStyle,
  CutGrade,
  ColorGrade,
  ClarityGrade,
  PolishGrade,
  SymmetryGrade,
  FluorescenceGrade,
  DiamondProduct,
  LooseDiamond,
  RingSetting,
  SettingFilterState,
} from '~/types/diamond';
import {
  DEFAULT_DIAMOND_FILTERS,
  filterDiamondProducts,
  sortDiamondProducts,
  getActiveFilterCount,
} from '~/lib/diamond-filter';
import {LOOSE_DIAMONDS, getLooseDiamondById} from '~/data/loose-diamonds';
import {RING_SETTINGS, METALS_CATALOG, getRingSettingById, getMetalOptionById} from '~/data/ring-settings';

export const COLOR_ORDER: ColorGrade[] = ['D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const CLARITY_ORDER: ClarityGrade[] = [
  'FL',
  'IF',
  'VVS1',
  'VVS2',
  'VS1',
  'VS2',
  'SI1',
  'SI2',
];

export const CUT_GRADES_LIST: CutGrade[] = [
  'Super Ideal (Hearts & Arrows)',
  'Ideal',
  'Excellent',
  'Very Good',
];

export const POLISH_GRADES_LIST: PolishGrade[] = ['Ideal', 'Excellent', 'Very Good', 'Good'];
export const SYMMETRY_GRADES_LIST: SymmetryGrade[] = ['Ideal', 'Excellent', 'Very Good', 'Good'];
export const FLUORESCENCE_GRADES_LIST: FluorescenceGrade[] = ['None', 'Faint', 'Medium', 'Strong'];

export interface ExtendedDiamondFilterState extends DiamondFilterState {
  labs: ('GIA' | 'IGI' | 'AGS')[];
  reportNumberQuery: string;
  tableMin: number;
  tableMax: number;
  depthMin: number;
  depthMax: number;
  ratioMin: number;
  ratioMax: number;
  polishGrades: PolishGrade[];
  symmetryGrades: SymmetryGrade[];
  fluorescenceGrades: FluorescenceGrade[];
}

export const DEFAULT_EXTENDED_DIAMOND_FILTERS: ExtendedDiamondFilterState = {
  ...DEFAULT_DIAMOND_FILTERS,
  originTab: 'all',
  shapes: [],
  caratMin: 0.7,
  caratMax: 4.5,
  priceMin: 2000,
  priceMax: 90000,
  cutGrades: [],
  colorGrades: [],
  clarityGrades: [],
  origins: [],
  labs: [],
  reportNumberQuery: '',
  tableMin: 53.0,
  tableMax: 70.0,
  depthMin: 58.0,
  depthMax: 73.0,
  ratioMin: 1.0,
  ratioMax: 2.1,
  polishGrades: [],
  symmetryGrades: [],
  fluorescenceGrades: [],
};

export const DEFAULT_SETTING_FILTERS: SettingFilterState = {
  styles: [],
  metalTypes: [],
  karats: [],
  shapes: [],
  priceMin: 1500,
  priceMax: 5000,
  viewMode: 'all',
  guidedStep: 1,
};

interface DiamondRingBuilderContextType {
  // --- 3-Stage Builder State ---
  stage: 'diamond' | 'settings' | 'complete';
  flow: 'diamond-first' | 'setting-first';
  setStage: (stage: 'diamond' | 'settings' | 'complete') => void;
  setFlow: (flow: 'diamond-first' | 'setting-first') => void;

  selectedDiamond: LooseDiamond | null;
  selectedSetting: RingSetting | null;
  selectedMetal: MetalOption;
  ringSize: number;
  prongStyle: string;
  bandWidthMm: number;
  engraving: {text: string; font: 'Script' | 'Serif' | 'Block'};

  selectDiamond: (diamond: LooseDiamond) => void;
  clearDiamond: () => void;
  selectSetting: (setting: RingSetting, metal?: MetalOption) => void;
  clearSetting: () => void;
  setSelectedMetalOption: (metal: MetalOption) => void;
  setRingSize: (size: number) => void;
  setProngStyle: (style: string) => void;
  setBandWidthMm: (width: number) => void;
  setEngraving: (engraving: {text: string; font: 'Script' | 'Serif' | 'Block'}) => void;

  totalInvestment: number;
  isCompleteReady: boolean;

  // --- Stage 1: Diamond Filters & Catalog ---
  diamondFilters: ExtendedDiamondFilterState;
  setDiamondFilters: React.Dispatch<React.SetStateAction<ExtendedDiamondFilterState>>;
  diamondSortBy: DiamondSortOption;
  setDiamondSortBy: (sort: DiamondSortOption) => void;
  diamondViewMode: 'grid' | 'table';
  setDiamondViewMode: (mode: 'grid' | 'table') => void;
  filteredDiamonds: LooseDiamond[];
  resetDiamondFilters: () => void;

  // --- Stage 2: Setting Filters & Catalog ---
  settingFilters: SettingFilterState;
  setSettingFilters: React.Dispatch<React.SetStateAction<SettingFilterState>>;
  filteredSettings: RingSetting[];
  resetSettingFilters: () => void;

  // --- Backwards Compatibility for /collections/all & Legacy ---
  filters: DiamondFilterState;
  sortBy: DiamondSortOption;
  activeFilterCount: number;
  selectedRingSize: number;
  setFilters: React.Dispatch<React.SetStateAction<DiamondFilterState>>;
  setSortBy: (sort: DiamondSortOption) => void;
  setOriginTab: (tab: 'all' | 'natural' | 'lab-grown') => void;
  toggleShape: (shape: DiamondShape) => void;
  setShapes: (shapes: DiamondShape[]) => void;
  setCaratRange: (min: number, max: number) => void;
  setPriceRange: (min: number, max: number) => void;
  toggleCutGrade: (cut: CutGrade) => void;
  toggleColorGrade: (color: ColorGrade) => void;
  setColorRangeIndices: (minIdx: number, maxIdx: number) => void;
  toggleClarityGrade: (clarity: ClarityGrade) => void;
  setClarityRangeIndices: (minIdx: number, maxIdx: number) => void;
  toggleMetal: (metal: PreciousMetal) => void;
  toggleSetting: (setting: SettingStyle) => void;
  resetFilters: () => void;
  setSelectedMetal: (metal: PreciousMetal) => void;
  setSelectedRingSize: (size: number) => void;
  filterAndSort: (products: DiamondProduct[]) => DiamondProduct[];
}

const DiamondRingBuilderContext = createContext<DiamondRingBuilderContextType | undefined>(undefined);

export function DiamondProvider({
  children,
  initialFilters,
  initialSortBy = 'featured',
}: {
  children: ReactNode;
  initialFilters?: Partial<DiamondFilterState>;
  initialSortBy?: DiamondSortOption;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // --- 1. Builder Stage & Flow from URL or Defaults ---
  const urlStage = (searchParams.get('step') as 'diamond' | 'settings' | 'complete') || 'diamond';
  const [stage, setStageInternal] = useState<'diamond' | 'settings' | 'complete'>(urlStage);

  const urlFlow = (searchParams.get('flow') as 'diamond-first' | 'setting-first') || 'diamond-first';
  const [flow, setFlow] = useState<'diamond-first' | 'setting-first'>(urlFlow);

  // --- 2. Selections from URL or Defaults ---
  const urlDiamondId = searchParams.get('diamondId');
  const [selectedDiamond, setSelectedDiamond] = useState<LooseDiamond | null>(() => {
    return urlDiamondId ? getLooseDiamondById(urlDiamondId) || null : null;
  });

  const urlSettingId = searchParams.get('settingId');
  const [selectedSetting, setSelectedSetting] = useState<RingSetting | null>(() => {
    return urlSettingId ? getRingSettingById(urlSettingId) || null : null;
  });

  const urlMetalId = searchParams.get('metalId') || 'platinum-950';
  const [selectedMetal, setSelectedMetalOption] = useState<MetalOption>(() => {
    return getMetalOptionById(urlMetalId);
  });

  const urlRingSize = parseFloat(searchParams.get('size') || '6.0');
  const [ringSize, setRingSize] = useState<number>(urlRingSize);

  const [prongStyle, setProngStyle] = useState<string>(
    searchParams.get('prong') || selectedSetting?.defaultProngStyle || 'Claw Prongs',
  );

  const [bandWidthMm, setBandWidthMm] = useState<number>(
    parseFloat(searchParams.get('width') || '1.8'),
  );

  const [engraving, setEngraving] = useState<{text: string; font: 'Script' | 'Serif' | 'Block'}>({
    text: searchParams.get('engraving') || '',
    font: (searchParams.get('engravingFont') as 'Script' | 'Serif' | 'Block') || 'Script',
  });

  // --- 3. Stage 1: Diamond Filters ---
  const [diamondFilters, setDiamondFilters] = useState<ExtendedDiamondFilterState>(() => {
    const originTab = (searchParams.get('origin') as 'all' | 'natural' | 'lab-grown') || 'all';
    const shapesParam = searchParams.get('shapes');
    const shapes = shapesParam ? (shapesParam.split(',') as DiamondShape[]) : [];
    const caratMin = parseFloat(searchParams.get('caratMin') || '0.7');
    const caratMax = parseFloat(searchParams.get('caratMax') || '4.5');
    const priceMin = parseInt(searchParams.get('diaPriceMin') || '2000', 10);
    const priceMax = parseInt(searchParams.get('diaPriceMax') || '90000', 10);
    const colorsParam = searchParams.get('colors');
    const colorGrades = colorsParam ? (colorsParam.split(',') as ColorGrade[]) : [];
    const claritiesParam = searchParams.get('clarities');
    const clarityGrades = claritiesParam ? (claritiesParam.split(',') as ClarityGrade[]) : [];
    const cutsParam = searchParams.get('cuts');
    const cutGrades = cutsParam ? (cutsParam.split(',') as CutGrade[]) : [];
    const labsParam = searchParams.get('labs');
    const labs = labsParam ? (labsParam.split(',') as ('GIA' | 'IGI' | 'AGS')[]) : [];
    const reportNumberQuery = searchParams.get('report') || '';

    return {
      ...DEFAULT_EXTENDED_DIAMOND_FILTERS,
      ...initialFilters,
      originTab,
      shapes,
      caratMin,
      caratMax,
      priceMin,
      priceMax,
      colorGrades,
      clarityGrades,
      cutGrades,
      labs,
      reportNumberQuery,
    };
  });

  const [diamondSortBy, setDiamondSortBy] = useState<DiamondSortOption>('featured');
  const [diamondViewMode, setDiamondViewMode] = useState<'grid' | 'table'>('grid');

  // --- 4. Stage 2: Setting Filters ---
  const [settingFilters, setSettingFilters] = useState<SettingFilterState>(() => {
    const stylesParam = searchParams.get('settingStyles');
    const styles = stylesParam ? (stylesParam.split(',') as SettingStyle[]) : [];
    const viewMode = (searchParams.get('settingMode') as 'guided' | 'all') || 'all';

    return {
      ...DEFAULT_SETTING_FILTERS,
      styles,
      viewMode,
    };
  });

  // --- 5. Sync State to URL Query Parameters smoothly ---
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, val]) => {
            if (val === null || val === undefined || val === '') {
              next.delete(key);
            } else {
              next.set(key, val);
            }
          });
          return next;
        },
        {replace: true},
      );
    },
    [setSearchParams],
  );

  const setStage = useCallback(
    (newStage: 'diamond' | 'settings' | 'complete') => {
      setStageInternal(newStage);
      updateUrlParams({step: newStage});
    },
    [updateUrlParams],
  );

  const selectDiamond = useCallback(
    (diamond: LooseDiamond) => {
      setSelectedDiamond(diamond);
      updateUrlParams({diamondId: diamond.id});

      // Flow routing: If setting not chosen yet, go to settings; otherwise go to complete
      if (!selectedSetting) {
        setStage('settings');
      } else {
        setStage('complete');
      }
    },
    [selectedSetting, setStage, updateUrlParams],
  );

  const clearDiamond = useCallback(() => {
    setSelectedDiamond(null);
    updateUrlParams({diamondId: null});
  }, [updateUrlParams]);

  const selectSetting = useCallback(
    (setting: RingSetting, metal?: MetalOption) => {
      setSelectedSetting(setting);
      const activeMetal = metal || selectedMetal || setting.defaultMetal;
      setSelectedMetalOption(activeMetal);
      setProngStyle(setting.defaultProngStyle);
      setBandWidthMm(setting.defaultBandWidthMm);

      updateUrlParams({
        settingId: setting.id,
        metalId: activeMetal.id,
        prong: setting.defaultProngStyle,
        width: setting.defaultBandWidthMm.toString(),
      });

      // Flow routing: If diamond not chosen yet, go to diamond; otherwise go to complete
      if (!selectedDiamond) {
        setStage('diamond');
      } else {
        setStage('complete');
      }
    },
    [selectedDiamond, selectedMetal, setStage, updateUrlParams],
  );

  const clearSetting = useCallback(() => {
    setSelectedSetting(null);
    updateUrlParams({settingId: null});
  }, [updateUrlParams]);

  // Synchronize metal selection with URL
  const handleSetSelectedMetalOption = useCallback(
    (metal: MetalOption) => {
      setSelectedMetalOption(metal);
      updateUrlParams({metalId: metal.id});
    },
    [updateUrlParams],
  );

  // Synchronize ring size with URL
  const handleSetRingSize = useCallback(
    (size: number) => {
      setRingSize(size);
      updateUrlParams({size: size.toString()});
    },
    [updateUrlParams],
  );

  // Synchronize prong with URL
  const handleSetProngStyle = useCallback(
    (style: string) => {
      setProngStyle(style);
      updateUrlParams({prong: style});
    },
    [updateUrlParams],
  );

  // Synchronize width with URL
  const handleSetBandWidthMm = useCallback(
    (width: number) => {
      setBandWidthMm(width);
      updateUrlParams({width: width.toString()});
    },
    [updateUrlParams],
  );

  // Synchronize engraving with URL
  const handleSetEngraving = useCallback(
    (eng: {text: string; font: 'Script' | 'Serif' | 'Block'}) => {
      setEngraving(eng);
      updateUrlParams({engraving: eng.text || null, engravingFont: eng.font});
    },
    [updateUrlParams],
  );

  // Total Investment Calculation
  const totalInvestment = useMemo(() => {
    const diamondPrice = selectedDiamond?.pricing.price || 0;
    const baseSettingPrice = selectedSetting?.basePrice || 0;
    const metalDelta = selectedMetal?.priceAdjustment || 0;
    return diamondPrice + baseSettingPrice + metalDelta;
  }, [selectedDiamond, selectedSetting, selectedMetal]);

  const isCompleteReady = !!(selectedDiamond && selectedSetting);

  // Filter Loose Diamonds
  const filteredDiamonds = useMemo(() => {
    return LOOSE_DIAMONDS.filter((d) => {
      // Origin Tab: natural vs lab-grown
      if (diamondFilters.originTab === 'natural' && d.origin !== 'natural') return false;
      if (diamondFilters.originTab === 'lab-grown' && d.origin !== 'lab-grown') return false;

      // Shape
      if (diamondFilters.shapes.length > 0 && !diamondFilters.shapes.includes(d.shape)) {
        return false;
      }

      // Carat Range
      if (d.carat < diamondFilters.caratMin || d.carat > diamondFilters.caratMax) {
        return false;
      }

      // Price Range
      if (d.pricing.price < diamondFilters.priceMin || d.pricing.price > diamondFilters.priceMax) {
        return false;
      }

      // Color Grades
      if (diamondFilters.colorGrades.length > 0 && !diamondFilters.colorGrades.includes(d.colorGrade)) {
        return false;
      }

      // Clarity Grades
      if (
        diamondFilters.clarityGrades.length > 0 &&
        !diamondFilters.clarityGrades.includes(d.clarityGrade)
      ) {
        return false;
      }

      // Cut Grades
      if (diamondFilters.cutGrades.length > 0 && !diamondFilters.cutGrades.includes(d.cutGrade)) {
        return false;
      }

      // Lab Certification
      if (diamondFilters.labs.length > 0 && !diamondFilters.labs.includes(d.certification.lab)) {
        return false;
      }

      // Search Report Number
      if (diamondFilters.reportNumberQuery.trim() !== '') {
        const query = diamondFilters.reportNumberQuery.toLowerCase().trim();
        const matchesCert = d.certification.certificateNumber.toLowerCase().includes(query);
        const matchesStock = d.stockNumber.toLowerCase().includes(query);
        if (!matchesCert && !matchesStock) return false;
      }

      // Proportions: Table %
      if (
        d.proportions.tablePercentage < diamondFilters.tableMin ||
        d.proportions.tablePercentage > diamondFilters.tableMax
      ) {
        return false;
      }

      // Proportions: Depth %
      if (
        d.proportions.depthPercentage < diamondFilters.depthMin ||
        d.proportions.depthPercentage > diamondFilters.depthMax
      ) {
        return false;
      }

      // Ratio
      if (
        d.measurements.ratio < diamondFilters.ratioMin ||
        d.measurements.ratio > diamondFilters.ratioMax
      ) {
        return false;
      }

      // Polish
      if (
        diamondFilters.polishGrades.length > 0 &&
        !diamondFilters.polishGrades.includes(d.finish.polish)
      ) {
        return false;
      }

      // Symmetry
      if (
        diamondFilters.symmetryGrades.length > 0 &&
        !diamondFilters.symmetryGrades.includes(d.finish.symmetry)
      ) {
        return false;
      }

      // Fluorescence
      if (
        diamondFilters.fluorescenceGrades.length > 0 &&
        !diamondFilters.fluorescenceGrades.includes(d.finish.fluorescence)
      ) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (diamondSortBy) {
        case 'price-asc':
          return a.pricing.price - b.pricing.price;
        case 'price-desc':
          return b.pricing.price - a.pricing.price;
        case 'carat-desc':
          return b.carat - a.carat;
        case 'carat-asc':
          return a.carat - b.carat;
        case 'featured':
        default:
          return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      }
    });
  }, [diamondFilters, diamondSortBy]);

  // Filter Ring Settings
  const filteredSettings = useMemo(() => {
    return RING_SETTINGS.filter((s) => {
      // Style Category
      if (settingFilters.styles.length > 0 && !settingFilters.styles.includes(s.styleCategory)) {
        return false;
      }

      // Center Shape Compatibility (if a diamond is selected or shape filtered)
      const targetShape = selectedDiamond?.shape || (settingFilters.shapes.length > 0 ? settingFilters.shapes[0] : null);
      if (targetShape && !s.compatibleShapes.includes(targetShape)) {
        return false;
      }

      // Metal Types
      if (settingFilters.metalTypes.length > 0) {
        const matchesMetal = s.availableMetals.some((m) =>
          settingFilters.metalTypes.includes(m.metal),
        );
        if (!matchesMetal) return false;
      }

      // Karats
      if (settingFilters.karats.length > 0) {
        const matchesKarat = s.availableMetals.some((m) =>
          settingFilters.karats.includes(m.karat),
        );
        if (!matchesKarat) return false;
      }

      // Price Range
      const effectivePrice = s.basePrice + (selectedMetal.priceAdjustment || 0);
      if (effectivePrice < settingFilters.priceMin || effectivePrice > settingFilters.priceMax) {
        return false;
      }

      return true;
    }).sort((a, b) => a.featuredOrder - b.featuredOrder);
  }, [settingFilters, selectedDiamond, selectedMetal]);

  const resetDiamondFilters = useCallback(() => {
    setDiamondFilters(DEFAULT_EXTENDED_DIAMOND_FILTERS);
  }, []);

  const resetSettingFilters = useCallback(() => {
    setSettingFilters(DEFAULT_SETTING_FILTERS);
  }, []);

  // --- Backwards Compatibility with Collections.all ---
  const [filters, setFilters] = useState<DiamondFilterState>({
    ...DEFAULT_DIAMOND_FILTERS,
    ...initialFilters,
  });

  const [sortBy, setSortBy] = useState<DiamondSortOption>(initialSortBy);
  const [legacyMetal, setLegacyMetal] = useState<PreciousMetal>('platinum');
  const [selectedRingSize, setSelectedRingSize] = useState<number>(6.0);

  const activeFilterCount = useMemo(() => getActiveFilterCount(filters), [filters]);

  const setOriginTab = useCallback((tab: 'all' | 'natural' | 'lab-grown') => {
    setFilters((prev) => ({...prev, originTab: tab}));
    setDiamondFilters((prev) => ({...prev, originTab: tab}));
  }, []);

  const toggleShape = useCallback((shape: DiamondShape) => {
    setFilters((prev) => {
      const exists = prev.shapes.includes(shape);
      const updated = exists ? prev.shapes.filter((s) => s !== shape) : [...prev.shapes, shape];
      return {...prev, shapes: updated};
    });
  }, []);

  const setShapes = useCallback((shapes: DiamondShape[]) => {
    setFilters((prev) => ({...prev, shapes}));
  }, []);

  const setCaratRange = useCallback((min: number, max: number) => {
    const validMin = Math.max(0.5, Math.min(min, max));
    const validMax = Math.min(5.0, Math.max(min, max));
    setFilters((prev) => ({
      ...prev,
      caratMin: Number(validMin.toFixed(2)),
      caratMax: Number(validMax.toFixed(2)),
    }));
  }, []);

  const setPriceRange = useCallback((min: number, max: number) => {
    const validMin = Math.max(2000, Math.min(min, max));
    const validMax = Math.min(90000, Math.max(min, max));
    setFilters((prev) => ({
      ...prev,
      priceMin: Math.round(validMin),
      priceMax: Math.round(validMax),
    }));
  }, []);

  const toggleCutGrade = useCallback((cut: CutGrade) => {
    setFilters((prev) => {
      const exists = prev.cutGrades.includes(cut);
      const updated = exists ? prev.cutGrades.filter((c) => c !== cut) : [...prev.cutGrades, cut];
      return {...prev, cutGrades: updated};
    });
  }, []);

  const toggleColorGrade = useCallback((color: ColorGrade) => {
    setFilters((prev) => {
      const exists = prev.colorGrades.includes(color);
      const updated = exists ? prev.colorGrades.filter((c) => c !== color) : [...prev.colorGrades, color];
      return {...prev, colorGrades: updated};
    });
  }, []);

  const setColorRangeIndices = useCallback((minIdx: number, maxIdx: number) => {
    const start = Math.max(0, Math.min(minIdx, maxIdx));
    const end = Math.min(COLOR_ORDER.length - 1, Math.max(minIdx, maxIdx));
    const selected = COLOR_ORDER.slice(start, end + 1);
    setFilters((prev) => ({
      ...prev,
      colorGrades: selected.length === COLOR_ORDER.length ? [] : selected,
    }));
  }, []);

  const toggleClarityGrade = useCallback((clarity: ClarityGrade) => {
    setFilters((prev) => {
      const exists = prev.clarityGrades.includes(clarity);
      const updated = exists ? prev.clarityGrades.filter((c) => c !== clarity) : [...prev.clarityGrades, clarity];
      return {...prev, clarityGrades: updated};
    });
  }, []);

  const setClarityRangeIndices = useCallback((minIdx: number, maxIdx: number) => {
    const start = Math.max(0, Math.min(minIdx, maxIdx));
    const end = Math.min(CLARITY_ORDER.length - 1, Math.max(minIdx, maxIdx));
    const selected = CLARITY_ORDER.slice(start, end + 1);
    setFilters((prev) => ({
      ...prev,
      clarityGrades: selected.length === CLARITY_ORDER.length ? [] : selected,
    }));
  }, []);

  const toggleMetal = useCallback((metal: PreciousMetal) => {
    setFilters((prev) => {
      const exists = prev.metals.includes(metal);
      const updated = exists ? prev.metals.filter((m) => m !== metal) : [...prev.metals, metal];
      return {...prev, metals: updated};
    });
  }, []);

  const toggleSetting = useCallback((setting: SettingStyle) => {
    setFilters((prev) => {
      const exists = prev.settingStyles.includes(setting);
      const updated = exists ? prev.settingStyles.filter((s) => s !== setting) : [...prev.settingStyles, setting];
      return {...prev, settingStyles: updated};
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_DIAMOND_FILTERS);
  }, []);

  const filterAndSort = useCallback(
    (products: DiamondProduct[]) => {
      const filtered = filterDiamondProducts(products, filters);
      return sortDiamondProducts(filtered, sortBy);
    },
    [filters, sortBy],
  );

  const value = useMemo(
    () => ({
      stage,
      flow,
      setStage,
      setFlow,
      selectedDiamond,
      selectedSetting,
      selectedMetal,
      ringSize,
      prongStyle,
      bandWidthMm,
      engraving,
      selectDiamond,
      clearDiamond,
      selectSetting,
      clearSetting,
      setSelectedMetalOption: handleSetSelectedMetalOption,
      setRingSize: handleSetRingSize,
      setProngStyle: handleSetProngStyle,
      setBandWidthMm: handleSetBandWidthMm,
      setEngraving: handleSetEngraving,
      totalInvestment,
      isCompleteReady,
      diamondFilters,
      setDiamondFilters,
      diamondSortBy,
      setDiamondSortBy,
      diamondViewMode,
      setDiamondViewMode,
      filteredDiamonds,
      resetDiamondFilters,
      settingFilters,
      setSettingFilters,
      filteredSettings,
      resetSettingFilters,
      // Legacy
      filters,
      sortBy,
      activeFilterCount,
      selectedMetal: legacyMetal,
      selectedRingSize,
      setFilters,
      setSortBy,
      setOriginTab,
      toggleShape,
      setShapes,
      setCaratRange,
      setPriceRange,
      toggleCutGrade,
      toggleColorGrade,
      setColorRangeIndices,
      toggleClarityGrade,
      setClarityRangeIndices,
      toggleMetal,
      toggleSetting,
      resetFilters,
      setSelectedMetal: setLegacyMetal,
      setSelectedRingSize,
      filterAndSort,
    }),
    [
      stage,
      flow,
      setStage,
      selectedDiamond,
      selectedSetting,
      selectedMetal,
      ringSize,
      prongStyle,
      bandWidthMm,
      engraving,
      selectDiamond,
      clearDiamond,
      selectSetting,
      clearSetting,
      handleSetSelectedMetalOption,
      handleSetRingSize,
      handleSetProngStyle,
      handleSetBandWidthMm,
      handleSetEngraving,
      totalInvestment,
      isCompleteReady,
      diamondFilters,
      diamondSortBy,
      diamondViewMode,
      filteredDiamonds,
      resetDiamondFilters,
      settingFilters,
      filteredSettings,
      resetSettingFilters,
      filters,
      sortBy,
      activeFilterCount,
      legacyMetal,
      selectedRingSize,
      setOriginTab,
      toggleShape,
      setShapes,
      setCaratRange,
      setPriceRange,
      toggleCutGrade,
      toggleColorGrade,
      setColorRangeIndices,
      toggleClarityGrade,
      setClarityRangeIndices,
      toggleMetal,
      toggleSetting,
      resetFilters,
      filterAndSort,
    ],
  );

  return (
    <DiamondRingBuilderContext.Provider value={value}>
      {children}
    </DiamondRingBuilderContext.Provider>
  );
}

export function useOptionalDiamondContext() {
  return useContext(DiamondRingBuilderContext);
}

export function useDiamondContext() {
  const ctx = useContext(DiamondRingBuilderContext);
  if (!ctx) {
    throw new Error('useDiamondContext must be used within a DiamondProvider');
  }
  return ctx;
}
