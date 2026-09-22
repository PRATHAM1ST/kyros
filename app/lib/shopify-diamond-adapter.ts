import type {
  DiamondProduct,
  DiamondShape,
  DiamondOrigin,
  CutGrade,
  ColorGrade,
  ClarityGrade,
  PreciousMetal,
  LooseDiamond,
  RingSetting,
  MetalOption,
} from '~/types/diamond';
import { DIAMOND_PRODUCTS, getDiamondProductByHandle } from '~/data/diamond-products';
import { METALS_CATALOG } from '~/data/ring-settings';

export const SHOPIFY_DIAMOND_PRODUCT_FIELDS = `#graphql
  fragment ShopifyDiamondProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    vendor
    productType
    tags
    options {
      id
      name
      values
    }
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 12) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        image {
          url
        }
      }
    }
    shape: metafield(namespace: "diamond_specs", key: "shape") { value }
    carat: metafield(namespace: "diamond_specs", key: "carat") { value }
    cutGrade: metafield(namespace: "diamond_specs", key: "cut_grade") { value }
    colorGrade: metafield(namespace: "diamond_specs", key: "color_grade") { value }
    clarityGrade: metafield(namespace: "diamond_specs", key: "clarity_grade") { value }
    origin: metafield(namespace: "diamond_specs", key: "origin") { value }
    certLab: metafield(namespace: "diamond_specs", key: "cert_lab") { value }
    certNumber: metafield(namespace: "diamond_specs", key: "cert_number") { value }
    laserInscription: metafield(namespace: "diamond_specs", key: "laser_inscription") { value }
    tablePercentage: metafield(namespace: "diamond_specs", key: "table_percentage") { value }
    depthPercentage: metafield(namespace: "diamond_specs", key: "depth_percentage") { value }
    crownAngle: metafield(namespace: "diamond_specs", key: "crown_angle") { value }
    pavilionAngle: metafield(namespace: "diamond_specs", key: "pavilion_angle") { value }
    polish: metafield(namespace: "diamond_specs", key: "polish") { value }
    symmetry: metafield(namespace: "diamond_specs", key: "symmetry") { value }
    fluorescence: metafield(namespace: "diamond_specs", key: "fluorescence") { value }
    measurementsMm: metafield(namespace: "diamond_specs", key: "measurements_mm") { value }
    ratio: metafield(namespace: "diamond_specs", key: "ratio") { value }
    settingStyle: metafield(namespace: "diamond_specs", key: "setting_style") { value }
    bandWidthMm: metafield(namespace: "diamond_specs", key: "band_width_mm") { value }
    prongStyle: metafield(namespace: "diamond_specs", key: "prong_style") { value }
    fullSpecs: metafield(namespace: "diamond_specs", key: "full_specs_json") { value }
  }
`;

export const ALL_DIAMOND_PRODUCTS_QUERY = `#graphql
  query AllDiamondsFromShopify {
    products(first: 50, query: "product_type:'Diamond Engagement Ring'") {
      nodes {
        ...ShopifyDiamondProductFields
      }
    }
  }
  ${SHOPIFY_DIAMOND_PRODUCT_FIELDS}
`;

export const SINGLE_DIAMOND_PRODUCT_QUERY = `#graphql
  query SingleDiamondByHandle($handle: String!) {
    product(handle: $handle) {
      ...ShopifyDiamondProductFields
    }
  }
  ${SHOPIFY_DIAMOND_PRODUCT_FIELDS}
`;

// Helper regex extractors for text description
function extractMatch(text: string, regex: RegExp): string | null {
  const m = text.match(regex);
  return m && m[1] ? m[1].trim() : null;
}

/**
 * Transforms a Shopify Storefront API product node with full specs, description, tags, and variants into DiamondProduct
 */
export function mapShopifyProductToDiamond(shopifyProduct: any): DiamondProduct {
  // If full specs JSON exists, use it as baseline
  let base: DiamondProduct | undefined;
  if (shopifyProduct.fullSpecs?.value) {
    try {
      base = JSON.parse(shopifyProduct.fullSpecs.value) as DiamondProduct;
    } catch {
      // ignore
    }
  }

  // If not found in JSON, search local template products by handle
  if (!base) {
    base = getDiamondProductByHandle(shopifyProduct.handle) || DIAMOND_PRODUCTS[0];
  }

  const desc = shopifyProduct.description || '';
  const tags: string[] = shopifyProduct.tags || [];

  // Extract primary image from Shopify CDN
  const imagesNodes = shopifyProduct.images?.nodes || [];
  const primaryImageUrl = imagesNodes[0]?.url || shopifyProduct.featuredImage?.url || base.images.primary;
  const secondaryImageUrl = imagesNodes[1]?.url || base.images.secondary || primaryImageUrl;
  const galleryUrls = imagesNodes.length > 0 ? imagesNodes.map((img: any) => img.url) : base.images.gallery;

  // Extract price
  const rawPrice = shopifyProduct.priceRange?.minVariantPrice?.amount;
  const totalPrice = rawPrice ? parseFloat(rawPrice) : base.pricing.totalPrice;

  // Extract metafields or parse from Shopify description / tags
  const shapeStr = shopifyProduct.shape?.value || extractMatch(desc, /Diamond Shape:\s*([A-Za-z]+)/i);
  let shape: DiamondShape = base.diamond.shape;
  if (shapeStr) {
    const s = shapeStr.trim();
    if (['Round', 'Oval', 'Emerald', 'Cushion', 'Pear', 'Radiant', 'Princess', 'Marquise', 'Asscher'].includes(s)) {
      shape = s as DiamondShape;
    }
  }

  const caratVal = shopifyProduct.carat?.value || extractMatch(desc, /Carat Weight:\s*([\d.]+)/i);
  const carat = caratVal ? parseFloat(caratVal) : base.diamond.carat;

  const cutVal = shopifyProduct.cutGrade?.value || extractMatch(desc, /Cut Grade:\s*([^<\n\r]+)/i);
  const cutGrade = (cutVal as CutGrade) || base.diamond.cutGrade;

  const colorVal = shopifyProduct.colorGrade?.value || extractMatch(desc, /Color Grade:\s*([D-Z])/i);
  const colorGrade = (colorVal as ColorGrade) || base.diamond.colorGrade;

  const clarityVal = shopifyProduct.clarityGrade?.value || extractMatch(desc, /Clarity Grade:\s*([A-Z0-9]+)/i);
  const clarityGrade = (clarityVal as ClarityGrade) || base.diamond.clarityGrade;

  const originVal = shopifyProduct.origin?.value || extractMatch(desc, /Origin:\s*([^<\n\r]+)/i);
  const origin: DiamondOrigin = originVal
    ? originVal.toLowerCase().includes('lab')
      ? 'Lab-Grown (Renewable Type IIa)'
      : 'Natural Mined (Conflict-Free)'
    : base.diamond.origin;

  const certLabVal = shopifyProduct.certLab?.value || extractMatch(desc, /Grading Lab:\s*([A-Za-z]+)/i);
  const certLab = (certLabVal as 'GIA' | 'IGI') || base.diamond.certification.lab;

  const certNumber =
    shopifyProduct.certNumber?.value ||
    extractMatch(desc, /Report #?([A-Za-z0-9-]+)/i) ||
    base.diamond.certification.certificateNumber;

  const laserInscription =
    shopifyProduct.laserInscription?.value ||
    extractMatch(desc, /Laser Inscription:\s*"?([^<\n\r"]+)"?/i) ||
    base.diamond.certification.laserInscription;

  const tableVal = shopifyProduct.tablePercentage?.value || extractMatch(desc, /Table\s*([\d.]+)/i);
  const tablePercentage = tableVal ? parseFloat(tableVal) : base.diamond.proportions.tablePercentage;

  const depthVal = shopifyProduct.depthPercentage?.value || extractMatch(desc, /Depth\s*([\d.]+)/i);
  const depthPercentage = depthVal ? parseFloat(depthVal) : base.diamond.proportions.depthPercentage;

  const crownVal = shopifyProduct.crownAngle?.value || extractMatch(desc, /Crown Angle\s*([\d.]+)/i);
  const crownAngle = crownVal ? parseFloat(crownVal) : base.diamond.proportions.crownAngle;

  const pavilionVal = shopifyProduct.pavilionAngle?.value || extractMatch(desc, /Pavilion Angle\s*([\d.]+)/i);
  const pavilionAngle = pavilionVal ? parseFloat(pavilionVal) : base.diamond.proportions.pavilionAngle;

  const polishVal = shopifyProduct.polish?.value || extractMatch(desc, /Polish\s*([A-Za-z]+)/i);
  const polish = (polishVal as any) || base.diamond.finish.polish || 'Excellent';

  const symmetryVal = shopifyProduct.symmetry?.value || extractMatch(desc, /Symmetry\s*([A-Za-z]+)/i);
  const symmetry = (symmetryVal as any) || base.diamond.finish.symmetry || 'Excellent';

  const fluorVal = shopifyProduct.fluorescence?.value || extractMatch(desc, /Fluorescence\s*([A-Za-z]+)/i);
  const fluorescence = (fluorVal as any) || base.diamond.finish.fluorescence || 'None';

  // Parse variants for metals and IDs
  const variantsNodes = shopifyProduct.variants?.nodes || [];
  const metalsAvailable: PreciousMetal[] = [];

  // Check tags first for available metals
  if (tags.includes('platinum') && !metalsAvailable.includes('platinum')) metalsAvailable.push('platinum');
  if (tags.includes('18k-yellow-gold') && !metalsAvailable.includes('18k-yellow-gold')) metalsAvailable.push('18k-yellow-gold');
  if (tags.includes('18k-white-gold') && !metalsAvailable.includes('18k-white-gold')) metalsAvailable.push('18k-white-gold');
  if (tags.includes('18k-rose-gold') && !metalsAvailable.includes('18k-rose-gold')) metalsAvailable.push('18k-rose-gold');

  // Check variants for metals
  variantsNodes.forEach((v: any) => {
    const t = (v.title || '').toLowerCase();
    if (t.includes('yellow') && !metalsAvailable.includes('18k-yellow-gold')) metalsAvailable.push('18k-yellow-gold');
    if (t.includes('white') && !metalsAvailable.includes('18k-white-gold')) metalsAvailable.push('18k-white-gold');
    if (t.includes('rose') && !metalsAvailable.includes('18k-rose-gold')) metalsAvailable.push('18k-rose-gold');
    if (t.includes('platinum') && !metalsAvailable.includes('platinum')) metalsAvailable.push('platinum');
  });

  if (metalsAvailable.length === 0) {
    metalsAvailable.push('platinum', '18k-yellow-gold', '18k-white-gold', '18k-rose-gold');
  }

  // First available variant ID for checkout
  const firstVariantId = variantsNodes[0]?.id || base.id;

  // Build metalAssets dynamically from Shopify gallery images where possible
  const metalAssets = {...base.metalAssets};
  if (metalAssets['platinum']) {
    metalAssets['platinum'] = {
      ...metalAssets['platinum'],
      primaryImage: imagesNodes[0]?.url || metalAssets['platinum'].primaryImage,
      sideImage: imagesNodes[1]?.url || metalAssets['platinum'].sideImage,
    };
  }
  if (metalAssets['18k-yellow-gold'] && imagesNodes[1]?.url) {
    metalAssets['18k-yellow-gold'] = {
      ...metalAssets['18k-yellow-gold'],
      primaryImage: imagesNodes[1]?.url || metalAssets['18k-yellow-gold'].primaryImage,
    };
  }

  return {
    ...base,
    id: shopifyProduct.id || base.id,
    shopifyVariantId: firstVariantId,
    handle: shopifyProduct.handle || base.handle,
    title: shopifyProduct.title || base.title,
    description: shopifyProduct.description || base.description,
    images: {
      ...base.images,
      primary: primaryImageUrl,
      secondary: secondaryImageUrl,
      gallery: galleryUrls,
    },
    pricing: {
      ...base.pricing,
      totalPrice,
      defaultDiamondPrice: Math.round(totalPrice * 0.76),
      centerDiamondPrice: Math.round(totalPrice * 0.76),
      settingPrice: Math.round(totalPrice * 0.24),
    },
    diamond: {
      ...base.diamond,
      shape,
      carat,
      cutGrade,
      colorGrade,
      clarityGrade,
      origin,
      certification: {
        ...base.diamond.certification,
        lab: certLab,
        certificateNumber: certNumber,
        laserInscription,
      },
      proportions: {
        ...base.diamond.proportions,
        tablePercentage,
        depthPercentage,
        crownAngle,
        pavilionAngle,
      },
      finish: {
        ...base.diamond.finish,
        polish,
        symmetry,
        fluorescence,
      },
    },
    setting: {
      ...base.setting,
      metalsAvailable,
      defaultMetal: metalsAvailable[0],
    },
    metalAssets,
    tags,
  };
}

/**
 * Converts a DiamondProduct into an active bespoke selection:
 * LooseDiamond + RingSetting + MetalOption for the CompleteRingStage
 */
export function mapDiamondProductToRingSelection(
  product: DiamondProduct,
  metalChoice?: PreciousMetal,
): {
  diamond: LooseDiamond;
  setting: RingSetting;
  metalOption: MetalOption;
} {
  const chosenMetal = metalChoice || product.setting.defaultMetal || 'platinum';
  const metalOption =
    METALS_CATALOG.find((m) => m.metal === chosenMetal || m.id.includes(chosenMetal)) ||
    METALS_CATALOG[0];

  const diamond: LooseDiamond = {
    id: `dia-${product.handle}`,
    stockNumber: product.diamond.certification.certificateNumber || `KYR-${product.handle.toUpperCase()}`,
    origin: product.diamond.origin.toLowerCase().includes('lab') ? 'lab-grown' : 'natural',
    shape: product.diamond.shape,
    carat: product.diamond.carat,
    cutGrade: product.diamond.cutGrade,
    colorGrade: product.diamond.colorGrade,
    clarityGrade: product.diamond.clarityGrade,
    certification: {
      lab: (product.diamond.certification.lab as any) || 'GIA',
      certificateNumber: product.diamond.certification.certificateNumber || `KYR-${product.handle}`,
      issueDate: product.diamond.certification.issueDate || 'October 2025',
      laserInscription: product.diamond.certification.laserInscription || `${product.diamond.certification.lab} ${product.handle}`,
      reportUrl: product.diamond.certification.reportUrl || 'https://www.gia.edu/report-check',
    },
    pricing: {
      price: product.pricing.centerDiamondPrice || Math.round(product.pricing.totalPrice * 0.76),
      compareAtPrice: product.pricing.compareAtPrice,
    },
    proportions: product.diamond.proportions,
    finish: product.diamond.finish,
    measurements: product.diamond.measurements,
    image: product.images.primary,
    isBestseller: product.isBestseller,
    shopifyVariantId: product.shopifyVariantId,
  };

  const imagesByMetal: Record<string, string> = {};
  Object.entries(product.metalAssets || {}).forEach(([mKey, asset]) => {
    imagesByMetal[mKey] = asset.primaryImage;
    // Also map by metal catalog id like platinum-950, 18k-yellow-gold
    const matchedCatalog = METALS_CATALOG.find((mc) => mc.metal === mKey || mc.id.includes(mKey));
    if (matchedCatalog) {
      imagesByMetal[matchedCatalog.id] = asset.primaryImage;
    }
  });

  const setting: RingSetting = {
    id: `set-${product.handle}`,
    handle: product.handle,
    title: product.setting.styleName || product.title,
    subtitle: product.subtitle || 'Atelier Setting',
    styleCategory: product.setting.styleCategory || 'solitaire',
    description: product.description,
    basePrice: product.pricing.settingPrice || Math.round(product.pricing.totalPrice * 0.24),
    availableMetals: (product.setting.metalsAvailable || ['platinum']).map((m) => {
      const found = METALS_CATALOG.find((mo) => mo.metal === m || mo.id.includes(m));
      return found || METALS_CATALOG[0];
    }),
    defaultMetal: metalOption,
    compatibleShapes: [product.diamond.shape],
    prongCount: product.setting.prongCount || 4,
    prongStyles: [product.setting.prongStyle || 'Claw Prongs'],
    defaultProngStyle: product.setting.prongStyle || 'Claw Prongs',
    bandWidthsMm: [product.setting.bandWidthMm || 1.8],
    defaultBandWidthMm: product.setting.bandWidthMm || 1.8,
    ringSizesAvailable: product.setting.ringSizesAvailable || [
      3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0,
    ],
    images: imagesByMetal,
    featuredOrder: product.featuredOrder || 1,
    shopifyVariantId: product.shopifyVariantId,
  };

  return {diamond, setting, metalOption};
}
