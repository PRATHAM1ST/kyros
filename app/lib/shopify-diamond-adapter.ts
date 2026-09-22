import type {
  DiamondProduct,
  DiamondShape,
  DiamondOrigin,
  CutGrade,
  ColorGrade,
  ClarityGrade,
  PreciousMetal,
} from '~/types/diamond';
import { DIAMOND_PRODUCTS, getDiamondProductByHandle } from '~/data/diamond-products';

export const SHOPIFY_DIAMOND_PRODUCT_FIELDS = `#graphql
  fragment ShopifyDiamondProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    vendor
    productType
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 8) {
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
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
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

/**
 * Transforms a Shopify Storefront API product node with metafields into a DiamondProduct
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

  // Extract primary image from Shopify CDN
  const imagesNodes = shopifyProduct.images?.nodes || [];
  const primaryImageUrl = imagesNodes[0]?.url || shopifyProduct.featuredImage?.url || base.images.primary;
  const secondaryImageUrl = imagesNodes[1]?.url || base.images.secondary || primaryImageUrl;
  const galleryUrls = imagesNodes.length > 0 ? imagesNodes.map((img: any) => img.url) : base.images.gallery;

  // Extract price
  const rawPrice = shopifyProduct.priceRange?.minVariantPrice?.amount;
  const totalPrice = rawPrice ? parseFloat(rawPrice) : base.pricing.totalPrice;

  // Extract metafields
  const shape = (shopifyProduct.shape?.value as DiamondShape) || base.diamond.shape;
  const carat = shopifyProduct.carat?.value ? parseFloat(shopifyProduct.carat.value) : base.diamond.carat;
  const cutGrade = (shopifyProduct.cutGrade?.value as CutGrade) || base.diamond.cutGrade;
  const colorGrade = (shopifyProduct.colorGrade?.value as ColorGrade) || base.diamond.colorGrade;
  const clarityGrade = (shopifyProduct.clarityGrade?.value as ClarityGrade) || base.diamond.clarityGrade;
  const origin = (shopifyProduct.origin?.value as DiamondOrigin) || base.diamond.origin;
  const certLab = (shopifyProduct.certLab?.value as 'GIA' | 'IGI') || base.diamond.certification.lab;
  const certNumber = shopifyProduct.certNumber?.value || base.diamond.certification.certificateNumber;
  const laserInscription = shopifyProduct.laserInscription?.value || base.diamond.certification.laserInscription;
  const tablePercentage = shopifyProduct.tablePercentage?.value ? parseFloat(shopifyProduct.tablePercentage.value) : base.diamond.proportions.tablePercentage;
  const depthPercentage = shopifyProduct.depthPercentage?.value ? parseFloat(shopifyProduct.depthPercentage.value) : base.diamond.proportions.depthPercentage;
  const crownAngle = shopifyProduct.crownAngle?.value ? parseFloat(shopifyProduct.crownAngle.value) : base.diamond.proportions.crownAngle;
  const pavilionAngle = shopifyProduct.pavilionAngle?.value ? parseFloat(shopifyProduct.pavilionAngle.value) : base.diamond.proportions.pavilionAngle;
  const polish = (shopifyProduct.polish?.value as any) || base.diamond.finish.polish;
  const symmetry = (shopifyProduct.symmetry?.value as any) || base.diamond.finish.symmetry;
  const fluorescence = (shopifyProduct.fluorescence?.value as any) || base.diamond.finish.fluorescence;

  // First available variant ID for checkout
  const firstVariantId = shopifyProduct.variants?.nodes?.[0]?.id || base.id;

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
  };
}
