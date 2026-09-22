import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  DiamondFilterState,
  DiamondShape,
  DiamondSortOption,
  PreciousMetal,
  SettingStyle,
  CutGrade,
  ColorGrade,
  ClarityGrade,
  DiamondProduct,
} from '~/types/diamond';
import {
  DEFAULT_DIAMOND_FILTERS,
  filterDiamondProducts,
  sortDiamondProducts,
  getActiveFilterCount,
} from '~/lib/diamond-filter';

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

interface DiamondContextType {
  // Global filter state
  filters: DiamondFilterState;
  sortBy: DiamondSortOption;
  activeFilterCount: number;

  // Selected ring customization state (global across views)
  selectedMetal: PreciousMetal;
  selectedRingSize: number;

  // Actions
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

  // Global selection setters
  setSelectedMetal: (metal: PreciousMetal) => void;
  setSelectedRingSize: (size: number) => void;

  // Optimistic helper for filtering products
  filterAndSort: (products: DiamondProduct[]) => DiamondProduct[];
}

const DiamondContext = createContext<DiamondContextType | undefined>(undefined);

export function DiamondProvider({
  children,
  initialFilters,
  initialSortBy = 'featured',
}: {
  children: ReactNode;
  initialFilters?: Partial<DiamondFilterState>;
  initialSortBy?: DiamondSortOption;
}) {
  const [filters, setFilters] = useState<DiamondFilterState>({
    ...DEFAULT_DIAMOND_FILTERS,
    ...initialFilters,
  });

  const [sortBy, setSortBy] = useState<DiamondSortOption>(initialSortBy);
  const [selectedMetal, setSelectedMetal] = useState<PreciousMetal>('platinum');
  const [selectedRingSize, setSelectedRingSize] = useState<number>(6.0);

  const activeFilterCount = useMemo(() => getActiveFilterCount(filters), [filters]);

  const setOriginTab = useCallback((tab: 'all' | 'natural' | 'lab-grown') => {
    setFilters((prev) => ({...prev, originTab: tab}));
  }, []);

  const toggleShape = useCallback((shape: DiamondShape) => {
    setFilters((prev) => {
      const exists = prev.shapes.includes(shape);
      const updated = exists
        ? prev.shapes.filter((s) => s !== shape)
        : [...prev.shapes, shape];
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
    const validMin = Math.max(5000, Math.min(min, max));
    const validMax = Math.min(60000, Math.max(min, max));
    setFilters((prev) => ({
      ...prev,
      priceMin: Math.round(validMin),
      priceMax: Math.round(validMax),
    }));
  }, []);

  const toggleCutGrade = useCallback((cut: CutGrade) => {
    setFilters((prev) => {
      const exists = prev.cutGrades.includes(cut);
      const updated = exists
        ? prev.cutGrades.filter((c) => c !== cut)
        : [...prev.cutGrades, cut];
      return {...prev, cutGrades: updated};
    });
  }, []);

  const toggleColorGrade = useCallback((color: ColorGrade) => {
    setFilters((prev) => {
      const exists = prev.colorGrades.includes(color);
      const updated = exists
        ? prev.colorGrades.filter((c) => c !== color)
        : [...prev.colorGrades, color];
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
      const updated = exists
        ? prev.clarityGrades.filter((c) => c !== clarity)
        : [...prev.clarityGrades, clarity];
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
      const updated = exists
        ? prev.metals.filter((m) => m !== metal)
        : [...prev.metals, metal];
      return {...prev, metals: updated};
    });
  }, []);

  const toggleSetting = useCallback((setting: SettingStyle) => {
    setFilters((prev) => {
      const exists = prev.settingStyles.includes(setting);
      const updated = exists
        ? prev.settingStyles.filter((s) => s !== setting)
        : [...prev.settingStyles, setting];
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
      filters,
      sortBy,
      activeFilterCount,
      selectedMetal,
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
      setSelectedMetal,
      setSelectedRingSize,
      filterAndSort,
    }),
    [
      filters,
      sortBy,
      activeFilterCount,
      selectedMetal,
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
    <DiamondContext.Provider value={value}>{children}</DiamondContext.Provider>
  );
}

export function useOptionalDiamondContext() {
  return useContext(DiamondContext);
}

export function useDiamondContext() {
  const ctx = useContext(DiamondContext);
  if (!ctx) {
    throw new Error('useDiamondContext must be used within a DiamondProvider');
  }
  return ctx;
}
