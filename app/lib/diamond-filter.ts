import type {
  DiamondFilterState,
  DiamondProduct,
  DiamondSortOption,
} from '~/types/diamond';

export const DEFAULT_DIAMOND_FILTERS: DiamondFilterState = {
  originTab: 'all',
  shapes: [],
  metals: [],
  settingStyles: [],
  caratMin: 1.0,
  caratMax: 3.5,
  priceMin: 5000,
  priceMax: 80000,
  cutGrades: [],
  colorGrades: [],
  clarityGrades: [],
  origins: [],
  searchQuery: '',
};

export function filterDiamondProducts(
  products: DiamondProduct[],
  filters: DiamondFilterState,
): DiamondProduct[] {
  return products.filter((product) => {
    // 0. Origin Tab Filter (Natural vs Lab-Grown)
    if (filters.originTab === 'natural') {
      if (!product.diamond.origin.includes('Natural')) return false;
    } else if (filters.originTab === 'lab-grown') {
      if (!product.diamond.origin.includes('Lab')) return false;
    }
    // 1. Shape Filter
    if (
      filters.shapes.length > 0 &&
      !filters.shapes.includes(product.diamond.shape)
    ) {
      return false;
    }

    // 2. Metal Filter
    if (filters.metals.length > 0) {
      const hasMatchingMetal = filters.metals.some((metal) =>
        product.setting.metalsAvailable.includes(metal),
      );
      if (!hasMatchingMetal) return false;
    }

    // 3. Setting Style Filter
    if (
      filters.settingStyles.length > 0 &&
      !filters.settingStyles.includes(product.setting.styleCategory)
    ) {
      return false;
    }

    // 4. Carat Range Filter
    const carat = product.diamond.carat;
    if (carat < filters.caratMin || carat > filters.caratMax) {
      return false;
    }

    // 5. Price Range Filter
    const price = product.pricing.totalPrice;
    if (price < filters.priceMin || price > filters.priceMax) {
      return false;
    }

    // 6. Cut Grade Filter
    if (
      filters.cutGrades.length > 0 &&
      !filters.cutGrades.includes(product.diamond.cutGrade)
    ) {
      return false;
    }

    // 7. Color Grade Filter
    if (
      filters.colorGrades.length > 0 &&
      !filters.colorGrades.includes(product.diamond.colorGrade)
    ) {
      return false;
    }

    // 8. Clarity Grade Filter
    if (
      filters.clarityGrades.length > 0 &&
      !filters.clarityGrades.includes(product.diamond.clarityGrade)
    ) {
      return false;
    }

    // 9. Origin Filter
    if (
      filters.origins.length > 0 &&
      !filters.origins.includes(product.diamond.origin)
    ) {
      return false;
    }

    // 10. Search Query Filter
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchShape = product.diamond.shape.toLowerCase().includes(q);
      const matchSetting = product.setting.styleName.toLowerCase().includes(q);
      const matchDescription = product.description.toLowerCase().includes(q);
      const matchTags = product.tags.some((t) => t.toLowerCase().includes(q));

      if (
        !matchTitle &&
        !matchShape &&
        !matchSetting &&
        !matchDescription &&
        !matchTags
      ) {
        return false;
      }
    }

    return true;
  });
}

export function sortDiamondProducts(
  products: DiamondProduct[],
  sortBy: DiamondSortOption,
): DiamondProduct[] {
  const cloned = [...products];

  switch (sortBy) {
    case 'price-asc':
      return cloned.sort((a, b) => a.pricing.totalPrice - b.pricing.totalPrice);

    case 'price-desc':
      return cloned.sort((a, b) => b.pricing.totalPrice - a.pricing.totalPrice);

    case 'carat-desc':
      return cloned.sort((a, b) => b.diamond.carat - a.diamond.carat);

    case 'carat-asc':
      return cloned.sort((a, b) => a.diamond.carat - b.diamond.carat);

    case 'featured':
    default:
      return cloned.sort((a, b) => a.featuredOrder - b.featuredOrder);
  }
}

export function getActiveFilterCount(filters: DiamondFilterState): number {
  let count = 0;
  if (filters.originTab !== 'all') count += 1;
  if (filters.shapes.length > 0) count += filters.shapes.length;
  if (filters.metals.length > 0) count += filters.metals.length;
  if (filters.settingStyles.length > 0) count += filters.settingStyles.length;
  if (filters.cutGrades.length > 0) count += filters.cutGrades.length;
  if (filters.colorGrades.length > 0) count += filters.colorGrades.length;
  if (filters.clarityGrades.length > 0) count += filters.clarityGrades.length;
  if (filters.origins.length > 0) count += filters.origins.length;
  if (filters.caratMin > 1.0 || filters.caratMax < 3.5) count += 1;
  if (filters.priceMin > 5000 || filters.priceMax < 80000) count += 1;
  if (filters.searchQuery && filters.searchQuery.trim()) count += 1;
  return count;
}
