import type {DiamondProduct, LooseDiamond, RingSetting} from '~/types/diamond';
export interface RingVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {amount: string; currencyCode: string};
  selectedOptions: {name: string; value: string}[];
  image?: {url: string; altText?: string | null} | null;
  specs?: {value: string} | null;
}
export interface RingProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  featuredImage?: {url: string; altText?: string | null} | null;
  images: {nodes: {url: string; altText?: string | null}[]};
  variants: {nodes: RingVariant[]};
  specs: {value: string} | null;
}
export type ProductSpecs =
  | {kind: 'diamond'; diamond: LooseDiamond}
  | {kind: 'setting'; setting: RingSetting}
  | {kind: 'ring'; ring: DiamondProduct};
function validDiamond(d: LooseDiamond | DiamondProduct['diamond'] | undefined) {
  return (
    !!d &&
    [
      'Round',
      'Oval',
      'Emerald',
      'Cushion',
      'Pear',
      'Radiant',
      'Princess',
      'Marquise',
      'Asscher',
      'Heart',
    ].includes(d.shape) &&
    [
      d.carat,
      d.measurements?.lengthMm,
      d.measurements?.widthMm,
      d.measurements?.depthMm,
      d.measurements?.ratio,
      d.proportions?.tablePercentage,
      d.proportions?.depthPercentage,
    ].every((n) => typeof n === 'number' && Number.isFinite(n) && n > 0) &&
    [
      d.origin,
      d.colorGrade,
      d.clarityGrade,
      d.cutGrade,
      d.certification?.lab,
      d.certification?.certificateNumber,
      d.finish?.polish,
      d.finish?.symmetry,
      d.finish?.fluorescence,
    ].every((s) => typeof s === 'string' && s.length > 0)
  );
}
const numericChoices = (values: unknown): values is number[] =>
  Array.isArray(values) &&
  values.length > 0 &&
  values.every((n) => typeof n === 'number' && Number.isFinite(n) && n > 0);
const textChoices = (values: unknown): values is string[] =>
  Array.isArray(values) &&
  values.length > 0 &&
  values.every((s) => typeof s === 'string' && s.length > 0);
export function readSpecs(product: RingProduct): ProductSpecs | null {
  try {
    const value = JSON.parse(product.specs?.value || 'null') as
      (Partial<DiamondProduct> & {kind?: string}) | null;
    if (!value || typeof value !== 'object') return null;
    if (value.kind === 'diamond' && validDiamond(value.diamond))
      return {
        kind: 'diamond',
        diamond: value.diamond as unknown as LooseDiamond,
      };
    const setting = value.setting as unknown as RingSetting | undefined;
    if (
      value.kind === 'setting' &&
      setting &&
      textChoices(setting.compatibleShapes) &&
      numericChoices(setting.ringSizesAvailable) &&
      numericChoices(setting.bandWidthsMm) &&
      textChoices(setting.prongStyles) &&
      Array.isArray(setting.availableMetals) &&
      setting.availableMetals.every(
        (m) => typeof m.name === 'string' && typeof m.hexColor === 'string',
      ) &&
      typeof setting.styleCategory === 'string'
    )
      return {kind: 'setting', setting};
    if (
      (!value.kind || value.kind === 'ring') &&
      validDiamond(value.diamond) &&
      numericChoices(value.setting?.ringSizesAvailable) &&
      Number.isFinite(value.setting?.bandWidthMm) &&
      typeof value.setting?.prongStyle === 'string' &&
      value.pricing
    )
      return {kind: 'ring', ring: value as DiamondProduct};
    return null;
  } catch {
    return null;
  }
}
export function filterRange(
  params: URLSearchParams,
  key: string,
  values: number[],
  step = 1,
) {
  const finite = values.filter(Number.isFinite);
  const min = finite.length ? Math.floor(Math.min(...finite) / step) * step : 0;
  const max = finite.length ? Math.ceil(Math.max(...finite) / step) * step : 0;
  const bound = (suffix: string, fallback: number) => {
    const raw = params.get(key + suffix);
    const n = raw === null || raw.trim() === '' ? fallback : Number(raw);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  };
  const a = bound('Min', min),
    b = bound('Max', max);
  return {min, max, low: Math.min(a, b), high: Math.max(a, b)};
}
export function money(amount: number | string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(amount));
}
export function sumPrices(variants: Pick<RingVariant, 'price'>[]) {
  if (new Set(variants.map((v) => v.price.currencyCode)).size > 1)
    throw new Error('Cannot combine different currencies');
  if (
    variants.some(
      (v) =>
        !Number.isFinite(Number(v.price.amount)) || Number(v.price.amount) < 0,
    )
  )
    throw new Error('Invalid Shopify price');
  const currency = variants[0]?.price.currencyCode || 'USD';
  const digits =
    new Intl.NumberFormat('en', {style: 'currency', currency}).resolvedOptions()
      .maximumFractionDigits ?? 2;
  const scale = 10 ** digits;
  return (
    variants.reduce(
      (sum, v) => sum + Math.round(Number(v.price.amount) * scale),
      0,
    ) / scale
  );
}
export function getVariant(
  product: RingProduct | undefined,
  id?: string | null,
) {
  if (!product) return undefined;
  if (id) return product.variants.nodes.find((v) => v.id === id);
  return (
    product.variants.nodes.find((v) => v.availableForSale) ||
    product.variants.nodes[0]
  );
}
export function readVariantSpecs(product: RingProduct, variant?: RingVariant) {
  return variant?.specs
    ? readSpecs({...product, specs: variant.specs})
    : readSpecs(product);
}
export function selectionFromUrl(
  products: RingProduct[],
  params: URLSearchParams,
) {
  const productHandle = params.get('product') || params.get('productHandle');
  const ring = products.find(
    (p) => p.handle === productHandle && readSpecs(p)?.kind === 'ring',
  );
  const diamond = products.find(
    (p) =>
      (p.id === params.get('diamondId') ||
        p.handle === params.get('diamondId')) &&
      readSpecs(p)?.kind === 'diamond',
  );
  const setting = products.find(
    (p) =>
      (p.id === params.get('settingId') ||
        p.handle === params.get('settingId')) &&
      readSpecs(p)?.kind === 'setting',
  );
  const selected = ring || setting;
  const metal = params.get('metal');
  const metalVariant = selected?.variants.nodes.find((v) =>
    v.selectedOptions.some(
      (o) =>
        o.name.toLowerCase() === 'metal' &&
        o.value.toLowerCase().replaceAll(' ', '-') === metal,
    ),
  );
  const variant = getVariant(
    selected,
    params.get('variant') || metalVariant?.id,
  );
  const diamondVariant = getVariant(diamond, params.get('diamondVariant'));
  const specs = selected ? readVariantSpecs(selected, variant) : null;
  const diamondSpecs = diamond
    ? readVariantSpecs(diamond, diamondVariant)
    : null;
  const shape =
    diamondSpecs?.kind === 'diamond' ? diamondSpecs.diamond.shape : null;
  const compatible =
    specs?.kind === 'setting' && shape
      ? specs.setting.compatibleShapes.includes(shape)
      : !!ring;
  const variants = ring
    ? variant
      ? [variant]
      : []
    : [diamondVariant, variant].filter((v): v is RingVariant => !!v);
  return {
    ring,
    diamond,
    setting,
    selected,
    variant,
    diamondVariant,
    specs,
    diamondSpecs,
    compatible,
    variants,
  };
}
export function validateConfiguration(
  products: RingProduct[],
  params: URLSearchParams,
) {
  const selection = selectionFromUrl(products, params);
  const {
    ring,
    diamond,
    setting,
    specs,
    variant,
    diamondVariant,
    compatible,
    variants,
  } = selection;
  if (!ring && (!diamond || !setting))
    throw new Error('Choose a diamond and setting first.');
  if (!compatible)
    throw new Error(
      'This setting does not support the selected diamond shape.',
    );
  if (
    !variant ||
    (!ring && !diamondVariant) ||
    variants.some((v) => !v.availableForSale)
  )
    throw new Error(
      'This selection is unavailable. Choose an available option.',
    );
  const settings =
    specs?.kind === 'ring'
      ? specs.ring.setting
      : specs?.kind === 'setting'
        ? specs.setting
        : null;
  const size = Number(params.get('size'));
  if (
    !settings ||
    !params.has('size') ||
    !settings.ringSizesAvailable.includes(size)
  )
    throw new Error('Choose an available ring size.');
  const prongs =
    specs?.kind === 'setting'
      ? specs.setting.prongStyles
      : specs?.kind === 'ring'
        ? [specs.ring.setting.prongStyle]
        : [];
  const widths =
    specs?.kind === 'setting'
      ? specs.setting.bandWidthsMm
      : specs?.kind === 'ring'
        ? [specs.ring.setting.bandWidthMm]
        : [];
  if (prongs.length && !prongs.includes(params.get('prong') || prongs[0]))
    throw new Error('Choose an available prong style.');
  if (!widths.includes(Number(params.get('width') || widths[0])))
    throw new Error('Choose an available band width.');
  if ((params.get('engraving') || '').length > 30)
    throw new Error('Engraving must be 30 characters or fewer.');
  sumPrices(variants);
  return selection;
}
export const RING_PRODUCTS_QUERY = `#graphql
  query RingCommerceProducts($cursor: String) {
    products(first: 50, after: $cursor, query: "product_type:'Diamond Engagement Ring' OR product_type:'Loose Diamond' OR product_type:'Ring Setting'") {
      pageInfo {hasNextPage endCursor}
      nodes {
        id handle title description productType tags
        featuredImage {url altText}
        images(first: 8) {nodes {url altText}}
        specs: metafield(namespace: "diamond_specs", key: "full_specs_json") {value}
        variants(first: 250) {
          nodes {id title availableForSale price {amount currencyCode} selectedOptions {name value} image {url altText} specs: metafield(namespace: "diamond_specs", key: "full_specs_json") {value}}
        }
      }
    }
  }
`;
