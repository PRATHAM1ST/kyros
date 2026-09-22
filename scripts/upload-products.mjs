#!/usr/bin/env node
/**
 * upload-products.mjs
 * Uploads all 8 Kyros DiamondProducts to Shopify via Admin GraphQL API.
 *
 * Usage:
 *   node scripts/upload-products.mjs
 *
 * Requires: SHOPIFY_ADMIN_TOKEN (or PRIVATE_STOREFRONT_API_TOKEN) and PUBLIC_STORE_DOMAIN in .env
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
  const text = readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
  return env;
}

const env = loadEnv();

const STORE_DOMAIN = env.PUBLIC_STORE_DOMAIN;
const ADMIN_TOKEN = env.SHOPIFY_ADMIN_TOKEN || env.PRIVATE_STOREFRONT_API_TOKEN;
const ADMIN_API_VERSION = '2024-10';

if (!STORE_DOMAIN || !ADMIN_TOKEN) {
  console.error('❌ Missing PUBLIC_STORE_DOMAIN or SHOPIFY_ADMIN_TOKEN in .env');
  process.exit(1);
}

const ADMIN_URL = `https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`;

// ─── GraphQL helper ───────────────────────────────────────────────────────────
async function adminQuery(query, variables = {}) {
  const res = await fetch(ADMIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`);
  }
  return json.data;
}

async function findProductByHandle(handle) {
  const data = await adminQuery(`
    query findProduct($query: String!) {
      products(first: 1, query: $query) {
        edges { node { id handle } }
      }
    }
  `, { query: `handle:${handle}` });

  return data.products.edges[0]?.node ?? null;
}

function buildMetafields(p) {
  const d = p.diamond;
  const mfs = [
    { namespace: 'kyros', key: 'shape',           type: 'single_line_text_field', value: d.shape },
    { namespace: 'kyros', key: 'carat',           type: 'number_decimal',         value: String(d.carat) },
    { namespace: 'kyros', key: 'cut_grade',       type: 'single_line_text_field', value: d.cutGrade },
    { namespace: 'kyros', key: 'color_grade',     type: 'single_line_text_field', value: d.colorGrade },
    { namespace: 'kyros', key: 'clarity_grade',   type: 'single_line_text_field', value: d.clarityGrade },
    { namespace: 'kyros', key: 'origin',          type: 'single_line_text_field', value: d.origin },
    { namespace: 'kyros', key: 'cert_lab',        type: 'single_line_text_field', value: d.certification.lab },
    { namespace: 'kyros', key: 'cert_number',     type: 'single_line_text_field', value: d.certification.certificateNumber },
    { namespace: 'kyros', key: 'cert_date',       type: 'single_line_text_field', value: d.certification.issueDate },
    { namespace: 'kyros', key: 'laser_inscription', type: 'single_line_text_field', value: d.certification.laserInscription },
    { namespace: 'kyros', key: 'report_url',      type: 'url',                    value: d.certification.reportUrl || 'https://www.gia.edu/report-check' },
    { namespace: 'kyros', key: 'table_percentage', type: 'number_decimal',        value: String(d.proportions.tablePercentage) },
    { namespace: 'kyros', key: 'depth_percentage', type: 'number_decimal',        value: String(d.proportions.depthPercentage) },
    { namespace: 'kyros', key: 'crown_angle',     type: 'number_decimal',         value: String(d.proportions.crownAngle) },
    { namespace: 'kyros', key: 'pavilion_angle',  type: 'number_decimal',         value: String(d.proportions.pavilionAngle) },
    { namespace: 'kyros', key: 'polish',          type: 'single_line_text_field', value: d.finish.polish },
    { namespace: 'kyros', key: 'symmetry',        type: 'single_line_text_field', value: d.finish.symmetry },
    { namespace: 'kyros', key: 'fluorescence',    type: 'single_line_text_field', value: d.finish.fluorescence },
    { namespace: 'kyros', key: 'measurements',    type: 'json', value: JSON.stringify(d.measurements) },
    { namespace: 'kyros', key: 'setting_style',   type: 'single_line_text_field', value: p.setting.styleCategory },
    { namespace: 'kyros', key: 'prong_count',     type: 'number_integer',         value: String(p.setting.prongCount) },
    { namespace: 'kyros', key: 'band_width_mm',   type: 'number_decimal',         value: String(p.setting.bandWidthMm) },
    { namespace: 'kyros', key: 'default_metal',   type: 'single_line_text_field', value: p.setting.defaultMetal },
    { namespace: 'kyros', key: 'metals_available', type: 'json', value: JSON.stringify(p.setting.metalsAvailable) },
    { namespace: 'kyros', key: 'ring_sizes',      type: 'json', value: JSON.stringify(p.setting.ringSizesAvailable) },
    { namespace: 'kyros', key: 'setting_price',   type: 'number_integer',         value: String(p.pricing.settingPrice) },
    { namespace: 'kyros', key: 'default_diamond_price', type: 'number_integer',   value: String(p.pricing.defaultDiamondPrice) },
    { namespace: 'kyros', key: 'carat_options',   type: 'json', value: JSON.stringify(p.caratOptions) },
    { namespace: 'kyros', key: 'full_specs',      type: 'json', value: JSON.stringify(p) },
    { namespace: 'kyros', key: 'is_bestseller',   type: 'boolean', value: String(p.isBestseller) },
    { namespace: 'kyros', key: 'is_new',          type: 'boolean', value: String(p.isNew) },
    { namespace: 'kyros', key: 'tagline',         type: 'single_line_text_field', value: p.tagline },
    { namespace: 'kyros', key: 'subtitle',        type: 'single_line_text_field', value: p.subtitle },
  ];
  if (p.setting.accentStones) {
    mfs.push({ namespace: 'kyros', key: 'accent_stones', type: 'json', value: JSON.stringify(p.setting.accentStones) });
  }
  return mfs;
}

function buildVariants(p) {
  const variants = [];
  for (const caratOpt of (p.caratOptions ?? [])) {
    for (const metal of (p.setting.metalsAvailable ?? ['platinum'])) {
      variants.push({
        price: String(p.pricing.settingPrice + caratOpt.centerDiamondPrice),
        inventoryPolicy: 'DENY',
        requiresShipping: true,
        taxable: true,
        selectedOptions: [
          { name: 'Carat', value: `${caratOpt.carat}ct` },
          { name: 'Metal', value: metal },
        ],
        metafields: [
          { namespace: 'kyros', key: 'carat',                 type: 'number_decimal',         value: String(caratOpt.carat) },
          { namespace: 'kyros', key: 'center_diamond_price',  type: 'number_integer',         value: String(caratOpt.centerDiamondPrice) },
          { namespace: 'kyros', key: 'cert_number',           type: 'single_line_text_field', value: caratOpt.specs.certificateNumber },
          { namespace: 'kyros', key: 'metal',                 type: 'single_line_text_field', value: metal },
        ],
      });
    }
  }
  return variants;
}

async function createProduct(p) {
  const input = {
    title: p.title,
    handle: p.handle,
    descriptionHtml: p.storyHtml || `<p>${p.description}</p>`,
    productType: 'Diamond Engagement Ring',
    vendor: 'Kyros',
    tags: p.tags ?? [],
    status: 'ACTIVE',
    options: ['Carat', 'Metal'],
    variants: buildVariants(p),
    metafields: buildMetafields(p),
  };

  const data = await adminQuery(`
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product { id handle title }
        userErrors { field message }
      }
    }
  `, { input });

  const { product, userErrors } = data.productCreate;
  if (userErrors?.length) throw new Error(`userErrors: ${JSON.stringify(userErrors)}`);
  return product;
}

async function updateProduct(shopifyId, p) {
  const input = {
    id: shopifyId,
    title: p.title,
    descriptionHtml: p.storyHtml || `<p>${p.description}</p>`,
    tags: p.tags ?? [],
    status: 'ACTIVE',
    metafields: buildMetafields(p),
  };

  const data = await adminQuery(`
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id handle title }
        userErrors { field message }
      }
    }
  `, { input });

  const { product, userErrors } = data.productUpdate;
  if (userErrors?.length) throw new Error(`userErrors: ${JSON.stringify(userErrors)}`);
  return product;
}

// ─── Product data ─────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 'kyros-01', handle: 'the-kyros-signature-solitaire',
    title: 'The Kyros Signature Solitaire',
    subtitle: 'Classic Four-Claw Solitaire with Knife-Edge Platinum Band',
    tagline: 'The timeless icon of pure diamond brilliance and architectural precision.',
    description: 'The Kyros Signature Solitaire represents the quintessential expression of enduring devotion. Sculpted by master artisans in Geneva, this iconic setting cradles a certified Super Ideal Round Brilliant center stone in ultra-slender platinum claw prongs. Designed with an open-gallery basket that elevates the diamond above the finger to maximize optical refraction, fire, and scintillation from every vantage point.',
    storyHtml: '<p>Handcrafted to cradle a world-class center diamond, <em>The Kyros Signature Solitaire</em> is celebrated for its whisper-thin 1.8mm band that tapers delicately toward the center stone. Every facet is inspected under 50x binocular magnification to verify certified Hearts &amp; Arrows optical symmetry.</p>',
    isBestseller: true, isNew: false, featuredOrder: 1,
    diamond: { shape: 'Round', carat: 1.52, cutGrade: 'Super Ideal (Hearts & Arrows)', colorGrade: 'D', clarityGrade: 'VVS1', origin: 'Natural Mined (Conflict-Free)', certification: { lab: 'GIA', certificateNumber: 'GIA-2489104820', issueDate: 'October 14, 2025', laserInscription: 'GIA 2489104820 KYROS-EX', reportUrl: 'https://www.gia.edu/report-check' }, proportions: { tablePercentage: 57.0, depthPercentage: 61.4, crownAngle: 34.5, crownHeightPercentage: 15.0, pavilionAngle: 40.8, pavilionDepthPercentage: 43.0, girdle: 'Medium (Faceted, 3.0%)', culet: 'None' }, finish: { polish: 'Excellent', symmetry: 'Excellent', fluorescence: 'None' }, measurements: { lengthMm: 7.38, widthMm: 7.41, depthMm: 4.54, ratio: 1.0 } },
    setting: { styleName: 'The Kyros Signature Solitaire', styleCategory: 'solitaire', prongCount: 4, prongStyle: 'Claw Prongs', bandWidthMm: 1.8, metalsAvailable: ['platinum', '18k-yellow-gold', '18k-rose-gold', '18k-white-gold'], defaultMetal: 'platinum', ringSizesAvailable: [3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0], profileHeightMm: 6.4, galleryType: 'Open Floating' },
    caratOptions: [
      { carat: 1.01, centerDiamondPrice: 7800, specs: { measurements: { lengthMm: 6.48, widthMm: 6.51, depthMm: 3.99, ratio: 1.0 }, proportions: { tablePercentage: 56.5, depthPercentage: 61.2, crownAngle: 34.2, crownHeightPercentage: 15.2, pavilionAngle: 40.7, pavilionDepthPercentage: 43.1, girdle: 'Medium (Faceted)', culet: 'None' }, certificateNumber: 'GIA-2489104812' } },
      { carat: 1.52, centerDiamondPrice: 15400, specs: { measurements: { lengthMm: 7.38, widthMm: 7.41, depthMm: 4.54, ratio: 1.0 }, proportions: { tablePercentage: 57.0, depthPercentage: 61.4, crownAngle: 34.5, crownHeightPercentage: 15.0, pavilionAngle: 40.8, pavilionDepthPercentage: 43.0, girdle: 'Medium (Faceted, 3.0%)', culet: 'None' }, certificateNumber: 'GIA-2489104820' } },
      { carat: 2.05, centerDiamondPrice: 28900, specs: { measurements: { lengthMm: 8.16, widthMm: 8.2, depthMm: 5.02, ratio: 1.0 }, proportions: { tablePercentage: 57.5, depthPercentage: 61.8, crownAngle: 34.8, crownHeightPercentage: 15.1, pavilionAngle: 40.9, pavilionDepthPercentage: 43.2, girdle: 'Medium to Slightly Thick', culet: 'None' }, certificateNumber: 'GIA-2489104838' } },
      { carat: 2.54, centerDiamondPrice: 46200, specs: { measurements: { lengthMm: 8.78, widthMm: 8.82, depthMm: 5.41, ratio: 1.0 }, proportions: { tablePercentage: 57.0, depthPercentage: 61.5, crownAngle: 34.6, crownHeightPercentage: 15.0, pavilionAngle: 40.8, pavilionDepthPercentage: 43.0, girdle: 'Medium (Faceted)', culet: 'None' }, certificateNumber: 'GIA-2489104855' } },
      { carat: 3.12, centerDiamondPrice: 74500, specs: { measurements: { lengthMm: 9.42, widthMm: 9.46, depthMm: 5.8, ratio: 1.0 }, proportions: { tablePercentage: 58.0, depthPercentage: 61.6, crownAngle: 35.0, crownHeightPercentage: 15.3, pavilionAngle: 40.9, pavilionDepthPercentage: 43.1, girdle: 'Slightly Thick', culet: 'None' }, certificateNumber: 'GIA-2489104879' } },
    ],
    pricing: { settingPrice: 1850, defaultDiamondPrice: 15400, totalPrice: 17250, currency: 'USD' },
    tags: ['solitaire', 'round', 'engagement-ring', 'gia-certified', 'super-ideal', 'd-color', 'vvs1', 'platinum', 'natural-diamond'],
  },
  {
    id: 'kyros-02', handle: 'the-lumina-hidden-halo-oval',
    title: 'The Lumina Hidden Halo Oval',
    subtitle: 'Elongated Oval Cut with Micro-Pavé Hidden Gallery in 18k Yellow Gold',
    tagline: 'Graceful elongated curves accented by an intimate halo of hidden micro-diamonds.',
    description: 'The Lumina is designed for connoisseurs of understated luxury. Featuring an exceptional elongated Oval Brilliant cut diamond perched upon a whisper-thin 1.6mm band paved with DEF round micro-diamonds. Beneath the center stone, an intimate hidden halo encircles the pavilion, reflecting secret flashes of fire whenever the ring turns.',
    storyHtml: '<p>Every Lumina ring features an optical length-to-width ratio between 1.40 and 1.45, ensuring the most flattering elongation on the finger. The hidden halo contains 16 micro-pavé diamonds individually set under microscope magnification.</p>',
    isBestseller: true, isNew: false, featuredOrder: 2,
    diamond: { shape: 'Oval', carat: 2.05, cutGrade: 'Ideal', colorGrade: 'E', clarityGrade: 'VVS2', origin: 'Lab-Grown (Renewable Type IIa)', certification: { lab: 'IGI', certificateNumber: 'IGI-LG5192038471', issueDate: 'November 2, 2025', laserInscription: 'IGI LG5192038471 KYROS-LAB', reportUrl: 'https://www.igi.org/reports/verify-your-report' }, proportions: { tablePercentage: 58.5, depthPercentage: 62.1, crownAngle: 34.0, crownHeightPercentage: 14.8, pavilionAngle: 41.2, pavilionDepthPercentage: 43.5, girdle: 'Thin to Medium (Faceted)', culet: 'None' }, finish: { polish: 'Excellent', symmetry: 'Excellent', fluorescence: 'None' }, measurements: { lengthMm: 10.25, widthMm: 7.18, depthMm: 4.46, ratio: 1.43 } },
    setting: { styleName: 'The Lumina Hidden Halo', styleCategory: 'hidden-halo', prongCount: 4, prongStyle: 'Claw Prongs', bandWidthMm: 1.6, metalsAvailable: ['18k-yellow-gold', 'platinum', '18k-rose-gold', '18k-white-gold'], defaultMetal: '18k-yellow-gold', accentStones: { count: 32, totalCaratWeight: 0.38, color: 'D-E', clarity: 'VVS', shape: 'Round', description: 'Micro-pavé band and 360-degree hidden gallery halo' }, ringSizesAvailable: [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0], profileHeightMm: 6.1, galleryType: 'Hidden Halo' },
    caratOptions: [
      { carat: 1.25, centerDiamondPrice: 9400, specs: { measurements: { lengthMm: 8.64, widthMm: 6.08, depthMm: 3.78, ratio: 1.42 }, proportions: { tablePercentage: 58.0, depthPercentage: 62.0, crownAngle: 34.0, crownHeightPercentage: 14.7, pavilionAngle: 41.1, pavilionDepthPercentage: 43.4, girdle: 'Thin to Medium', culet: 'None' }, certificateNumber: 'GIA-5192038410' } },
      { carat: 1.75, centerDiamondPrice: 17200, specs: { measurements: { lengthMm: 9.68, widthMm: 6.81, depthMm: 4.23, ratio: 1.42 }, proportions: { tablePercentage: 58.5, depthPercentage: 62.1, crownAngle: 34.1, crownHeightPercentage: 14.8, pavilionAngle: 41.2, pavilionDepthPercentage: 43.5, girdle: 'Medium', culet: 'None' }, certificateNumber: 'GIA-5192038435' } },
      { carat: 2.05, centerDiamondPrice: 24800, specs: { measurements: { lengthMm: 10.25, widthMm: 7.18, depthMm: 4.46, ratio: 1.43 }, proportions: { tablePercentage: 58.5, depthPercentage: 62.1, crownAngle: 34.0, crownHeightPercentage: 14.8, pavilionAngle: 41.2, pavilionDepthPercentage: 43.5, girdle: 'Thin to Medium (Faceted)', culet: 'None' }, certificateNumber: 'GIA-5192038471' } },
      { carat: 2.75, centerDiamondPrice: 42500, specs: { measurements: { lengthMm: 11.28, widthMm: 7.89, depthMm: 4.9, ratio: 1.43 }, proportions: { tablePercentage: 59.0, depthPercentage: 62.3, crownAngle: 34.3, crownHeightPercentage: 14.9, pavilionAngle: 41.3, pavilionDepthPercentage: 43.6, girdle: 'Medium (Faceted)', culet: 'None' }, certificateNumber: 'GIA-5192038499' } },
    ],
    pricing: { settingPrice: 2450, defaultDiamondPrice: 24800, totalPrice: 27250, currency: 'USD' },
    tags: ['hidden-halo', 'oval', 'pave', 'yellow-gold', 'engagement-ring', 'igi-certified', 'e-color', 'vvs2', 'lab-grown', '18k-yellow-gold'],
  },
  {
    id: 'kyros-03', handle: 'the-elysian-emerald-three-stone',
    title: 'The Elysian Emerald Three-Stone',
    subtitle: 'Step-Cut Emerald Center with Dual Tapered Baguettes in Platinum',
    tagline: 'Art Deco geometric majesty showcasing the hall-of-mirrors step-cut reflection.',
    description: 'A triumph of Art Deco architecture and haute joaillerie craftsmanship. The Elysian centers a commanding 2.50 carat D Color VS1 Emerald cut diamond flanked by calibrated tapered baguette side diamonds. The parallel rectilinear step-faceting creates an endless hall-of-mirrors optical echo, framed by crisp platinum double-claw prongs.',
    storyHtml: '<p>Step-cut diamonds require absolute clarity, as their expansive glass-like table reveals any internal inclusion. The Elysian features an ultra-rare D Color, VS1 clarity center diamond certified by the GIA for flawless symmetry.</p>',
    isBestseller: true, isNew: true, featuredOrder: 3,
    diamond: { shape: 'Emerald', carat: 2.5, cutGrade: 'Excellent', colorGrade: 'D', clarityGrade: 'VS1', origin: 'Natural Mined (Conflict-Free)', certification: { lab: 'GIA', certificateNumber: 'GIA-6201948273', issueDate: 'December 1, 2025', laserInscription: 'GIA 6201948273 KYROS-ELYSIAN', reportUrl: 'https://www.gia.edu/report-check' }, proportions: { tablePercentage: 64.0, depthPercentage: 66.5, crownAngle: 36.5, crownHeightPercentage: 14.5, pavilionAngle: 42.0, pavilionDepthPercentage: 49.0, girdle: 'Very Thick to Extremely Thick (Polished)', culet: 'None' }, finish: { polish: 'Excellent', symmetry: 'Excellent', fluorescence: 'None' }, measurements: { lengthMm: 11.2, widthMm: 8.02, depthMm: 5.33, ratio: 1.4 } },
    setting: { styleName: 'The Elysian Three-Stone', styleCategory: 'three-stone', prongCount: 6, prongStyle: 'Compass Prongs', bandWidthMm: 2.2, metalsAvailable: ['platinum', '18k-yellow-gold', '18k-rose-gold', '18k-white-gold'], defaultMetal: 'platinum', accentStones: { count: 2, totalCaratWeight: 0.72, color: 'D-E', clarity: 'VS', shape: 'Baguette', description: 'Tapered baguette flanking side diamonds' }, ringSizesAvailable: [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0], profileHeightMm: 7.2, galleryType: 'Cathedral Arches' },
    caratOptions: [
      { carat: 1.50, centerDiamondPrice: 14200, specs: { measurements: { lengthMm: 9.18, widthMm: 6.56, depthMm: 4.36, ratio: 1.4 }, proportions: { tablePercentage: 63.5, depthPercentage: 66.2, crownAngle: 36.2, crownHeightPercentage: 14.3, pavilionAngle: 41.8, pavilionDepthPercentage: 48.8, girdle: 'Thick', culet: 'None' }, certificateNumber: 'GIA-6201948261' } },
      { carat: 2.00, centerDiamondPrice: 23600, specs: { measurements: { lengthMm: 10.42, widthMm: 7.44, depthMm: 4.95, ratio: 1.4 }, proportions: { tablePercentage: 64.0, depthPercentage: 66.5, crownAngle: 36.5, crownHeightPercentage: 14.5, pavilionAngle: 42.0, pavilionDepthPercentage: 49.0, girdle: 'Very Thick', culet: 'None' }, certificateNumber: 'GIA-6201948268' } },
      { carat: 2.50, centerDiamondPrice: 38500, specs: { measurements: { lengthMm: 11.2, widthMm: 8.02, depthMm: 5.33, ratio: 1.4 }, proportions: { tablePercentage: 64.0, depthPercentage: 66.5, crownAngle: 36.5, crownHeightPercentage: 14.5, pavilionAngle: 42.0, pavilionDepthPercentage: 49.0, girdle: 'Very Thick to Extremely Thick (Polished)', culet: 'None' }, certificateNumber: 'GIA-6201948273' } },
      { carat: 3.10, centerDiamondPrice: 62000, specs: { measurements: { lengthMm: 12.1, widthMm: 8.64, depthMm: 5.75, ratio: 1.4 }, proportions: { tablePercentage: 64.5, depthPercentage: 66.8, crownAngle: 36.8, crownHeightPercentage: 14.7, pavilionAngle: 42.2, pavilionDepthPercentage: 49.3, girdle: 'Extremely Thick', culet: 'None' }, certificateNumber: 'GIA-6201948289' } },
    ],
    pricing: { settingPrice: 3200, defaultDiamondPrice: 38500, totalPrice: 41700, currency: 'USD' },
    tags: ['three-stone', 'emerald', 'platinum', 'd-color', 'vs1', 'art-deco', 'gia-certified', 'baguette', 'natural-diamond'],
  },
  {
    id: 'kyros-04', handle: 'the-celestial-cushion-vintage-halo',
    title: 'The Celestial Cushion Halo',
    subtitle: 'Antique Modified Cushion Cut Diamond with French Pavé Halo in 18k Rose Gold',
    tagline: 'Warm romantic heirloom appeal blended with contemporary light performance.',
    description: 'The Celestial combines the romantic curvature of antique cushion cuts with contemporary micro-pavé brilliance. Cradled in radiant 18k Rose Gold, the center cushion cut is illuminated by a halo of thirty handset brilliant-cut diamonds with delicate hand-applied milgrain edge detailing.',
    storyHtml: '<p>Our master stonecutters custom polish each cushion stone with modified brilliant faceting to eliminate dark spots and enhance chromatic fire. Cast in ethically sourced 750 warm rose gold.</p>',
    isBestseller: false, isNew: true, featuredOrder: 4,
    diamond: { shape: 'Cushion', carat: 1.75, cutGrade: 'Ideal', colorGrade: 'F', clarityGrade: 'VVS1', origin: 'Lab-Grown (Renewable Type IIa)', certification: { lab: 'IGI', certificateNumber: 'IGI-LG1192847291', issueDate: 'January 10, 2026', laserInscription: 'IGI LG1192847291 KYROS-LAB', reportUrl: 'https://www.igi.org/reports/verify-your-report' }, proportions: { tablePercentage: 60.0, depthPercentage: 65.2, crownAngle: 35.0, crownHeightPercentage: 14.5, pavilionAngle: 41.5, pavilionDepthPercentage: 44.0, girdle: 'Medium to Thick (Faceted)', culet: 'Very Small' }, finish: { polish: 'Excellent', symmetry: 'Excellent', fluorescence: 'Faint' }, measurements: { lengthMm: 7.42, widthMm: 7.15, depthMm: 4.66, ratio: 1.04 } },
    setting: { styleName: 'The Celestial Cushion Halo', styleCategory: 'halo', prongCount: 4, prongStyle: 'Petal Prongs', bandWidthMm: 1.9, metalsAvailable: ['18k-rose-gold', '18k-yellow-gold', 'platinum', '18k-white-gold'], defaultMetal: '18k-rose-gold', accentStones: { count: 38, totalCaratWeight: 0.52, color: 'D-F', clarity: 'VVS', shape: 'Round', description: 'French pavé halo and band micro-diamonds with milgrain edge' }, ringSizesAvailable: [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0], profileHeightMm: 6.8, galleryType: 'Vintage Milgrain' },
    caratOptions: [
      { carat: 1.25, centerDiamondPrice: 8200, specs: { measurements: { lengthMm: 6.78, widthMm: 6.52, depthMm: 4.25, ratio: 1.04 }, proportions: { tablePercentage: 59.5, depthPercentage: 65.0, crownAngle: 34.8, crownHeightPercentage: 14.3, pavilionAngle: 41.3, pavilionDepthPercentage: 43.8, girdle: 'Medium', culet: 'None' }, certificateNumber: 'IGI-LG1192847260' } },
      { carat: 1.75, centerDiamondPrice: 16900, specs: { measurements: { lengthMm: 7.42, widthMm: 7.15, depthMm: 4.66, ratio: 1.04 }, proportions: { tablePercentage: 60.0, depthPercentage: 65.2, crownAngle: 35.0, crownHeightPercentage: 14.5, pavilionAngle: 41.5, pavilionDepthPercentage: 44.0, girdle: 'Medium to Thick (Faceted)', culet: 'Very Small' }, certificateNumber: 'IGI-LG1192847291' } },
      { carat: 2.25, centerDiamondPrice: 27500, specs: { measurements: { lengthMm: 8.02, widthMm: 7.72, depthMm: 5.04, ratio: 1.04 }, proportions: { tablePercentage: 60.5, depthPercentage: 65.5, crownAngle: 35.2, crownHeightPercentage: 14.6, pavilionAngle: 41.7, pavilionDepthPercentage: 44.2, girdle: 'Thick', culet: 'Very Small' }, certificateNumber: 'IGI-LG1192847318' } },
    ],
    pricing: { settingPrice: 2600, defaultDiamondPrice: 16900, totalPrice: 19500, currency: 'USD' },
    tags: ['halo', 'cushion', 'rose-gold', 'engagement-ring', 'igi-certified', 'f-color', 'vvs1', 'lab-grown', 'vintage', '18k-rose-gold'],
  },
  {
    id: 'kyros-05', handle: 'the-seraphina-pear-cathedral',
    title: 'The Seraphina Pear Cathedral',
    subtitle: 'East-West Pear Brilliant in Cathedral Setting with Tapered Diamond Band',
    tagline: 'Avant-garde east-west pear orientation for the bold, modern romantic.',
    description: 'The Seraphina breaks tradition with an east-west oriented pear brilliant diamond, celebrating the stone\'s natural asymmetry on a cathedral arch platinum setting with a tapered micro-pavé diamond band.',
    storyHtml: '<p>The east-west orientation of the pear diamond in The Seraphina creates a dramatically wide visual presence, appearing significantly larger than its carat weight. Perfect for those seeking unique sophistication.</p>',
    isBestseller: false, isNew: true, featuredOrder: 5,
    diamond: { shape: 'Pear', carat: 1.85, cutGrade: 'Excellent', colorGrade: 'E', clarityGrade: 'VS1', origin: 'Natural Mined (Conflict-Free)', certification: { lab: 'GIA', certificateNumber: 'GIA-7830192847', issueDate: 'January 25, 2026', laserInscription: 'GIA 7830192847 KYROS-SERA', reportUrl: 'https://www.gia.edu/report-check' }, proportions: { tablePercentage: 61.0, depthPercentage: 63.5, crownAngle: 35.2, crownHeightPercentage: 14.6, pavilionAngle: 41.5, pavilionDepthPercentage: 44.8, girdle: 'Medium to Slightly Thick', culet: 'None' }, finish: { polish: 'Excellent', symmetry: 'Excellent', fluorescence: 'None' }, measurements: { lengthMm: 11.62, widthMm: 7.18, depthMm: 4.56, ratio: 1.62 } },
    setting: { styleName: 'The Seraphina Cathedral', styleCategory: 'solitaire', prongCount: 4, prongStyle: 'Claw Prongs', bandWidthMm: 2.0, metalsAvailable: ['platinum', '18k-yellow-gold', '18k-white-gold', '18k-rose-gold'], defaultMetal: 'platinum', accentStones: { count: 24, totalCaratWeight: 0.28, color: 'D-E', clarity: 'VVS', shape: 'Round', description: 'Tapered micro-pavé band diamonds' }, ringSizesAvailable: [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0], profileHeightMm: 7.0, galleryType: 'Cathedral Arches' },
    caratOptions: [
      { carat: 1.21, centerDiamondPrice: 8900, specs: { measurements: { lengthMm: 9.68, widthMm: 5.98, depthMm: 3.80, ratio: 1.62 }, proportions: { tablePercentage: 60.5, depthPercentage: 63.2, crownAngle: 35.0, crownHeightPercentage: 14.4, pavilionAngle: 41.3, pavilionDepthPercentage: 44.6, girdle: 'Medium', culet: 'None' }, certificateNumber: 'GIA-7830192833' } },
      { carat: 1.85, centerDiamondPrice: 18400, specs: { measurements: { lengthMm: 11.62, widthMm: 7.18, depthMm: 4.56, ratio: 1.62 }, proportions: { tablePercentage: 61.0, depthPercentage: 63.5, crownAngle: 35.2, crownHeightPercentage: 14.6, pavilionAngle: 41.5, pavilionDepthPercentage: 44.8, girdle: 'Medium to Slightly Thick', culet: 'None' }, certificateNumber: 'GIA-7830192847' } },
      { carat: 2.40, centerDiamondPrice: 34500, specs: { measurements: { lengthMm: 13.0, widthMm: 8.02, depthMm: 5.10, ratio: 1.62 }, proportions: { tablePercentage: 61.5, depthPercentage: 63.8, crownAngle: 35.4, crownHeightPercentage: 14.8, pavilionAngle: 41.7, pavilionDepthPercentage: 45.0, girdle: 'Slightly Thick', culet: 'None' }, certificateNumber: 'GIA-7830192861' } },
    ],
    pricing: { settingPrice: 1950, defaultDiamondPrice: 18400, totalPrice: 20350, currency: 'USD' },
    tags: ['cathedral', 'pear', 'platinum', 'engagement-ring', 'gia-certified', 'e-color', 'vs1', 'east-west', 'natural-diamond'],
  },
  {
    id: 'kyros-06', handle: 'the-sovereign-radiant-french-pave',
    title: 'The Sovereign Radiant French Pavé',
    subtitle: 'Modified Radiant Cut with French-Cut Pavé Diamond Band',
    tagline: 'Regal brilliance through precision-cut radiant geometry and hand-set French pavé.',
    description: 'The Sovereign pairs the exceptional light return of a modified radiant cut with an exquisite French-cut pavé diamond band. Seventy-two individually hand-set diamonds line the band with an open-heart chevron gallery for maximum fire.',
    storyHtml: '<p>The radiant cut combines the geometry of the emerald with the brilliance of the round. Each Sovereign stone is graded for symmetry by a team of GIA-certified gemologists before setting.</p>',
    isBestseller: false, isNew: false, featuredOrder: 6,
    diamond: { shape: 'Radiant', carat: 2.12, cutGrade: 'Excellent', colorGrade: 'F', clarityGrade: 'VS1', origin: 'Natural Mined (Conflict-Free)', certification: { lab: 'GIA', certificateNumber: 'GIA-3920184756', issueDate: 'February 5, 2026', laserInscription: 'GIA 3920184756 KYROS-SVRN', reportUrl: 'https://www.gia.edu/report-check' }, proportions: { tablePercentage: 68.0, depthPercentage: 67.5, crownAngle: 37.0, crownHeightPercentage: 14.0, pavilionAngle: 42.5, pavilionDepthPercentage: 50.0, girdle: 'Medium to Thick', culet: 'None' }, finish: { polish: 'Excellent', symmetry: 'Very Good', fluorescence: 'None' }, measurements: { lengthMm: 9.08, widthMm: 7.54, depthMm: 5.09, ratio: 1.2 } },
    setting: { styleName: 'The Sovereign Pavé', styleCategory: 'pave', prongCount: 4, prongStyle: 'Compass Prongs', bandWidthMm: 2.4, metalsAvailable: ['18k-white-gold', 'platinum', '18k-yellow-gold', '18k-rose-gold'], defaultMetal: '18k-white-gold', accentStones: { count: 72, totalCaratWeight: 0.85, color: 'D-F', clarity: 'VVS-VS', shape: 'Round', description: 'French-cut pavé band with open-heart chevron gallery' }, ringSizesAvailable: [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0], profileHeightMm: 7.5, galleryType: 'Tulip Basket' },
    caratOptions: [
      { carat: 1.52, centerDiamondPrice: 11800, specs: { measurements: { lengthMm: 7.72, widthMm: 6.42, depthMm: 4.33, ratio: 1.2 }, proportions: { tablePercentage: 67.5, depthPercentage: 67.2, crownAngle: 36.8, crownHeightPercentage: 13.8, pavilionAngle: 42.3, pavilionDepthPercentage: 49.8, girdle: 'Medium', culet: 'None' }, certificateNumber: 'GIA-3920184744' } },
      { carat: 2.12, centerDiamondPrice: 22400, specs: { measurements: { lengthMm: 9.08, widthMm: 7.54, depthMm: 5.09, ratio: 1.2 }, proportions: { tablePercentage: 68.0, depthPercentage: 67.5, crownAngle: 37.0, crownHeightPercentage: 14.0, pavilionAngle: 42.5, pavilionDepthPercentage: 50.0, girdle: 'Medium to Thick', culet: 'None' }, certificateNumber: 'GIA-3920184756' } },
      { carat: 2.85, centerDiamondPrice: 48000, specs: { measurements: { lengthMm: 10.18, widthMm: 8.48, depthMm: 5.72, ratio: 1.2 }, proportions: { tablePercentage: 68.5, depthPercentage: 67.8, crownAngle: 37.2, crownHeightPercentage: 14.2, pavilionAngle: 42.7, pavilionDepthPercentage: 50.3, girdle: 'Thick', culet: 'None' }, certificateNumber: 'GIA-3920184771' } },
    ],
    pricing: { settingPrice: 2250, defaultDiamondPrice: 22400, totalPrice: 24650, currency: 'USD' },
    tags: ['pave', 'radiant', 'white-gold', 'engagement-ring', 'gia-certified', 'f-color', 'vs1', 'french-pave', 'natural-diamond', '18k-white-gold'],
  },
  {
    id: 'kyros-07', handle: 'the-aurelia-modern-bezel-solitaire',
    title: 'The Aurelia Modern Bezel Solitaire',
    subtitle: 'Full Bezel-Set Round Brilliant in Architectural 18k Yellow Gold',
    tagline: 'Minimalist architectural purity—the diamond held in a seamless gold embrace.',
    description: 'The Aurelia reimagines the solitaire through a modernist lens. A full bezel of polished 18k yellow gold encircles the round brilliant diamond in a seamless architectural embrace, creating a fluid, sculptural silhouette that is simultaneously modern and timeless.',
    storyHtml: '<p>The Aurelia bezel is hand-fabricated using a traditional Milanese bezel-setting technique, where gold is gradually burnished around the girdle of the diamond using hand tools under 20x magnification.</p>',
    isBestseller: false, isNew: false, featuredOrder: 7,
    diamond: { shape: 'Round', carat: 1.22, cutGrade: 'Super Ideal (Hearts & Arrows)', colorGrade: 'G', clarityGrade: 'VS2', origin: 'Lab-Grown (Renewable Type IIa)', certification: { lab: 'IGI', certificateNumber: 'IGI-LG8839201847', issueDate: 'March 1, 2026', laserInscription: 'IGI LG8839201847 KYROS-AURE', reportUrl: 'https://www.igi.org/reports/verify-your-report' }, proportions: { tablePercentage: 56.5, depthPercentage: 61.1, crownAngle: 34.4, crownHeightPercentage: 15.1, pavilionAngle: 40.75, pavilionDepthPercentage: 42.9, girdle: 'Medium (Faceted)', culet: 'None' }, finish: { polish: 'Excellent', symmetry: 'Excellent', fluorescence: 'None' }, measurements: { lengthMm: 6.88, widthMm: 6.91, depthMm: 4.21, ratio: 1.0 } },
    setting: { styleName: 'The Aurelia Bezel', styleCategory: 'bezel', prongCount: 0, prongStyle: 'Full Bezel', bandWidthMm: 2.2, metalsAvailable: ['18k-yellow-gold', '18k-white-gold', 'platinum', '18k-rose-gold'], defaultMetal: '18k-yellow-gold', ringSizesAvailable: [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0], profileHeightMm: 5.8, galleryType: 'Open Floating' },
    caratOptions: [
      { carat: 0.92, centerDiamondPrice: 9800, specs: { measurements: { lengthMm: 6.24, widthMm: 6.27, depthMm: 3.83, ratio: 1.0 }, proportions: { tablePercentage: 56.0, depthPercentage: 61.0, crownAngle: 34.2, crownHeightPercentage: 15.0, pavilionAngle: 40.7, pavilionDepthPercentage: 42.8, girdle: 'Medium (Faceted)', culet: 'None' }, certificateNumber: 'IGI-LG8839201839' } },
      { carat: 1.22, centerDiamondPrice: 19800, specs: { measurements: { lengthMm: 6.88, widthMm: 6.91, depthMm: 4.21, ratio: 1.0 }, proportions: { tablePercentage: 56.5, depthPercentage: 61.1, crownAngle: 34.4, crownHeightPercentage: 15.1, pavilionAngle: 40.75, pavilionDepthPercentage: 42.9, girdle: 'Medium (Faceted)', culet: 'None' }, certificateNumber: 'IGI-LG8839201847' } },
      { carat: 1.65, centerDiamondPrice: 38200, specs: { measurements: { lengthMm: 7.6, widthMm: 7.64, depthMm: 4.67, ratio: 1.0 }, proportions: { tablePercentage: 57.0, depthPercentage: 61.3, crownAngle: 34.6, crownHeightPercentage: 15.2, pavilionAngle: 40.8, pavilionDepthPercentage: 43.0, girdle: 'Medium', culet: 'None' }, certificateNumber: 'IGI-LG8839201862' } },
    ],
    pricing: { settingPrice: 2100, defaultDiamondPrice: 19800, totalPrice: 21900, currency: 'USD' },
    tags: ['bezel', 'round', 'yellow-gold', 'engagement-ring', 'igi-certified', 'g-color', 'vs2', 'lab-grown', 'minimalist', '18k-yellow-gold'],
  },
  {
    id: 'kyros-08', handle: 'the-royal-princess-pave',
    title: 'The Royal Princess Pavé',
    subtitle: 'Princess Cut Diamond with Channel-Set Pavé Shoulders in 18k White Gold',
    tagline: 'Sharp geometric boldness of the princess cut crowned in sparkling white gold.',
    description: 'The Royal is built for those who demand architectural perfection. A precisely calibrated Princess cut diamond sits center-stage, flanked by channel-set pavé diamond shoulders in 18k White Gold with a cathedral arch profile.',
    storyHtml: "<p>Princess cut diamonds are the second most popular shape for engagement rings worldwide. The Royal's channel-set shoulders protect the pavé diamonds for lifetime wearability while maximizing brilliance across the full ring width.</p>",
    isBestseller: false, isNew: false, featuredOrder: 8,
    diamond: { shape: 'Princess', carat: 1.42, cutGrade: 'Excellent', colorGrade: 'F', clarityGrade: 'VS1', origin: 'Natural Mined (Conflict-Free)', certification: { lab: 'GIA', certificateNumber: 'GIA-9102847365', issueDate: 'March 15, 2026', laserInscription: 'GIA 9102847365 KYROS-ROYAL', reportUrl: 'https://www.gia.edu/report-check' }, proportions: { tablePercentage: 73.5, depthPercentage: 70.2, crownAngle: 35.5, crownHeightPercentage: 13.5, pavilionAngle: 42.2, pavilionDepthPercentage: 52.5, girdle: 'Medium (Polished)', culet: 'None' }, finish: { polish: 'Excellent', symmetry: 'Excellent', fluorescence: 'None' }, measurements: { lengthMm: 5.88, widthMm: 5.85, depthMm: 4.12, ratio: 1.0 } },
    setting: { styleName: 'The Royal Princess Cathedral', styleCategory: 'pave', prongCount: 4, prongStyle: 'Compass Prongs', bandWidthMm: 2.8, metalsAvailable: ['18k-white-gold', 'platinum', '18k-yellow-gold', '18k-rose-gold'], defaultMetal: '18k-white-gold', accentStones: { count: 48, totalCaratWeight: 0.62, color: 'D-F', clarity: 'VVS-VS', shape: 'Round', description: 'Channel-set pavé shoulder diamonds' }, ringSizesAvailable: [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0], profileHeightMm: 7.2, galleryType: 'Cathedral Arches' },
    caratOptions: [
      { carat: 1.00, centerDiamondPrice: 7600, specs: { measurements: { lengthMm: 5.00, widthMm: 4.98, depthMm: 3.51, ratio: 1.0 }, proportions: { tablePercentage: 73.0, depthPercentage: 70.0, crownAngle: 35.3, crownHeightPercentage: 13.3, pavilionAngle: 42.0, pavilionDepthPercentage: 52.3, girdle: 'Medium', culet: 'None' }, certificateNumber: 'GIA-9102847358' } },
      { carat: 1.42, centerDiamondPrice: 14800, specs: { measurements: { lengthMm: 5.88, widthMm: 5.85, depthMm: 4.12, ratio: 1.0 }, proportions: { tablePercentage: 73.5, depthPercentage: 70.2, crownAngle: 35.5, crownHeightPercentage: 13.5, pavilionAngle: 42.2, pavilionDepthPercentage: 52.5, girdle: 'Medium (Polished)', culet: 'None' }, certificateNumber: 'GIA-9102847365' } },
      { carat: 1.90, centerDiamondPrice: 26500, specs: { measurements: { lengthMm: 6.68, widthMm: 6.65, depthMm: 4.68, ratio: 1.0 }, proportions: { tablePercentage: 74.0, depthPercentage: 70.5, crownAngle: 35.7, crownHeightPercentage: 13.7, pavilionAngle: 42.4, pavilionDepthPercentage: 52.8, girdle: 'Medium to Slightly Thick', culet: 'None' }, certificateNumber: 'GIA-9102847379' } },
    ],
    pricing: { settingPrice: 1950, defaultDiamondPrice: 14800, totalPrice: 16750, currency: 'USD' },
    tags: ['princess', 'pave', 'white-gold', 'engagement-ring', 'gia-certified', 'f-color', 'vs1', 'natural-diamond', 'channel-set', '18k-white-gold'],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔷 Kyros Product Uploader`);
  console.log(`📡 Store: ${STORE_DOMAIN}`);
  console.log(`📦 Products to sync: ${PRODUCTS.length}\n`);

  const results = { created: [], updated: [], failed: [] };

  for (const product of PRODUCTS) {
    process.stdout.write(`  → ${product.title} (${product.handle}) ... `);
    try {
      const existing = await findProductByHandle(product.handle);
      if (existing) {
        await updateProduct(existing.id, product);
        console.log(`✅ updated  (${existing.id})`);
        results.updated.push(product.handle);
      } else {
        const created = await createProduct(product);
        console.log(`🆕 created  (${created.id})`);
        results.created.push(product.handle);
      }
      await new Promise(r => setTimeout(r, 700));
    } catch (err) {
      console.log(`❌ FAILED`);
      console.error(`     ${err.message}\n`);
      results.failed.push({ handle: product.handle, error: err.message });
    }
  }

  console.log('\n─────────────────────────────────────────────');
  console.log(`✅ Created : ${results.created.length}`);
  console.log(`🔄 Updated : ${results.updated.length}`);
  console.log(`❌ Failed  : ${results.failed.length}`);
  if (results.failed.length) {
    for (const f of results.failed) console.log(`   • ${f.handle}: ${f.error}`);
  }
  console.log('─────────────────────────────────────────────\n');
}

main().catch(e => { console.error(e); process.exit(1); });
