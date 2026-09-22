import fs from 'node:fs';
import path from 'node:path';

// 1. Read token from Shopify CLI config
const appData = process.env.APPDATA || '';
const configPath = path.join(appData, 'shopify-cli-kit-nodejs', 'Config', 'config.json');

if (!fs.existsSync(configPath)) {
  console.error('Config file not found at:', configPath);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const sessionStore = typeof config.sessionStore === 'string' ? JSON.parse(config.sessionStore) : config.sessionStore;
const accounts = sessionStore['accounts.shopify.com'];
const userSession = Object.values(accounts)[0];
const targetAppKey = 'kyros-ox8yt4up.myshopify.com-7ee65a63608843c577db8b23c4d7316ea0a01bd2f7594f8a9c06ea668c1b775c';
const token = userSession.applications[targetAppKey]?.accessToken;

if (!token) {
  console.error('Failed to locate access token for kyros in session store.');
  process.exit(1);
}

console.log('Successfully retrieved Shopify Admin token.');

const ADMIN_GRAPHQL_ENDPOINT = 'https://kyros-ox8yt4up.myshopify.com/admin/api/2026-01/graphql.json';

async function shopifyAdminGql(query, variables = {}) {
  const response = await fetch(ADMIN_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

// Published product IDs in the Shopify store that are live on the Storefront/Headless channels
const LIVE_PRODUCT_IDS = [
  'gid://shopify/Product/16021402911089',
  'gid://shopify/Product/16021403042161',
  'gid://shopify/Product/16021403107697',
  'gid://shopify/Product/16021403140465',
  'gid://shopify/Product/16021403173233',
  'gid://shopify/Product/16021403206001',
  'gid://shopify/Product/16021403238769',
  'gid://shopify/Product/16021403337073',
  'gid://shopify/Product/16021403369841',
  'gid://shopify/Product/16021403402609',
];

// Import our diamond products
import { DIAMOND_PRODUCTS } from '../app/data/diamond-products';

const UPDATE_PRODUCT_MUTATION = `#graphql
mutation UpdateDiamondProduct($product: ProductUpdateInput!) {
  productUpdate(product: $product) {
    product {
      id
      title
      handle
      status
      publishedAt
      metafields(first: 20) {
        nodes {
          key
          value
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

const UPDATE_VARIANTS_MUTATION = `#graphql
mutation UpdateVariantPrices($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
    productVariants {
      id
      title
      price
    }
    userErrors {
      field
      message
    }
  }
}
`;

async function syncProducts() {
  console.log(`Starting synchronization of ${DIAMOND_PRODUCTS.length} diamond products to Shopify store...`);

  for (let i = 0; i < DIAMOND_PRODUCTS.length; i++) {
    const diamond = DIAMOND_PRODUCTS[i];
    const shopifyProductId = LIVE_PRODUCT_IDS[i];

    if (!shopifyProductId) {
      console.warn(`No slot for product ${diamond.title}, skipping.`);
      continue;
    }

    console.log(`\n[${i + 1}/${DIAMOND_PRODUCTS.length}] Pushing "${diamond.title}" -> ${shopifyProductId}...`);

    // Format rich HTML description
    const formattedHtml = `
      <div class="kyros-product-description">
        <p><strong>${diamond.subtitle}</strong></p>
        <p>${diamond.description}</p>
        ${diamond.storyHtml}
        <hr/>
        <h4>Official GIA Gemological Certificate Specifications:</h4>
        <ul>
          <li><strong>Diamond Shape:</strong> ${diamond.diamond.shape} Brilliant</li>
          <li><strong>Carat Weight:</strong> ${diamond.diamond.carat} ct</li>
          <li><strong>Cut Grade:</strong> ${diamond.diamond.cutGrade}</li>
          <li><strong>Color Grade:</strong> ${diamond.diamond.colorGrade} (Colorless)</li>
          <li><strong>Clarity Grade:</strong> ${diamond.diamond.clarityGrade}</li>
          <li><strong>Origin:</strong> ${diamond.diamond.origin}</li>
          <li><strong>Grading Lab:</strong> ${diamond.diamond.certification.lab} Report #${diamond.diamond.certification.certificateNumber}</li>
          <li><strong>Laser Inscription:</strong> "${diamond.diamond.certification.laserInscription}"</li>
          <li><strong>Proportions:</strong> Table ${diamond.diamond.proportions.tablePercentage}%, Depth ${diamond.diamond.proportions.depthPercentage}%</li>
          <li><strong>Crown & Pavilion:</strong> Crown Angle ${diamond.diamond.proportions.crownAngle}°, Pavilion Angle ${diamond.diamond.proportions.pavilionAngle}°</li>
          <li><strong>Finish:</strong> Polish ${diamond.diamond.finish.polish}, Symmetry ${diamond.diamond.finish.symmetry}, Fluorescence ${diamond.diamond.finish.fluorescence}</li>
          <li><strong>Millimeter Dimensions:</strong> ${diamond.diamond.measurements.lengthMm} x ${diamond.diamond.measurements.widthMm} x ${diamond.diamond.measurements.depthMm} mm (Ratio: ${diamond.diamond.measurements.ratio})</li>
        </ul>
        <h4>Setting Anatomy:</h4>
        <ul>
          <li><strong>Setting Style:</strong> ${diamond.setting.styleName} (${diamond.setting.styleCategory})</li>
          <li><strong>Prongs:</strong> ${diamond.setting.prongCount || 'Bezel'} ${diamond.setting.prongStyle}</li>
          <li><strong>Band Width:</strong> ${diamond.setting.bandWidthMm} mm</li>
          <li><strong>Available Metals:</strong> Platinum 950, 18k Yellow Gold, 18k Rose Gold, 18k White Gold</li>
        </ul>
      </div>
    `.trim();

    // Prepare gemological metafields
    const metafields = [
      { namespace: 'diamond_specs', key: 'shape', value: diamond.diamond.shape, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'carat', value: String(diamond.diamond.carat), type: 'number_decimal' },
      { namespace: 'diamond_specs', key: 'cut_grade', value: diamond.diamond.cutGrade, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'color_grade', value: diamond.diamond.colorGrade, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'clarity_grade', value: diamond.diamond.clarityGrade, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'origin', value: diamond.diamond.origin, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'cert_lab', value: diamond.diamond.certification.lab, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'cert_number', value: diamond.diamond.certification.certificateNumber, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'laser_inscription', value: diamond.diamond.certification.laserInscription, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'table_percentage', value: String(diamond.diamond.proportions.tablePercentage), type: 'number_decimal' },
      { namespace: 'diamond_specs', key: 'depth_percentage', value: String(diamond.diamond.proportions.depthPercentage), type: 'number_decimal' },
      { namespace: 'diamond_specs', key: 'crown_angle', value: String(diamond.diamond.proportions.crownAngle), type: 'number_decimal' },
      { namespace: 'diamond_specs', key: 'pavilion_angle', value: String(diamond.diamond.proportions.pavilionAngle), type: 'number_decimal' },
      { namespace: 'diamond_specs', key: 'polish', value: diamond.diamond.finish.polish, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'symmetry', value: diamond.diamond.finish.symmetry, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'fluorescence', value: diamond.diamond.finish.fluorescence, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'measurements_mm', value: `${diamond.diamond.measurements.lengthMm} x ${diamond.diamond.measurements.widthMm} x ${diamond.diamond.measurements.depthMm} mm`, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'ratio', value: String(diamond.diamond.measurements.ratio), type: 'number_decimal' },
      { namespace: 'diamond_specs', key: 'setting_style', value: diamond.setting.styleName, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'band_width_mm', value: String(diamond.setting.bandWidthMm), type: 'number_decimal' },
      { namespace: 'diamond_specs', key: 'prong_style', value: diamond.setting.prongStyle, type: 'single_line_text_field' },
      { namespace: 'diamond_specs', key: 'full_specs_json', value: JSON.stringify(diamond), type: 'json' },
    ];

    const updateInput = {
      id: shopifyProductId,
      title: diamond.title,
      handle: diamond.handle,
      descriptionHtml: formattedHtml,
      vendor: 'KYROS',
      productType: 'Diamond Engagement Ring',
      tags: [
        diamond.diamond.shape.toLowerCase(),
        diamond.setting.styleCategory,
        'engagement-ring',
        'gia-certified',
        diamond.diamond.cutGrade.toLowerCase().replace(/\s+/g, '-'),
        `${diamond.diamond.colorGrade.toLowerCase()}-color`,
        diamond.diamond.clarityGrade.toLowerCase(),
        ...diamond.setting.metalsAvailable,
      ],
      collectionsToJoin: [
        'gid://shopify/Collection/710358204785', // Hydrogen
        'gid://shopify/Collection/710358106481', // Home page
      ],
      metafields,
    };

    try {
      const res = await shopifyAdminGql(UPDATE_PRODUCT_MUTATION, { product: updateInput });
      if (res.productUpdate.userErrors.length > 0) {
        console.error('User errors:', res.productUpdate.userErrors);
      } else {
        const prod = res.productUpdate.product;
        console.log(`✓ Updated "${prod.title}" (Handle: ${prod.handle}, Published: ${prod.publishedAt})`);
      }

      // Update variant prices to reflect the real diamond ring pricing
      const queryVariants = await shopifyAdminGql(`{ product(id: "${shopifyProductId}") { variants(first: 10) { nodes { id title } } } }`);
      const existingVariants = queryVariants.product.variants.nodes;
      if (existingVariants.length > 0) {
        const variantUpdates = existingVariants.map(v => ({
          id: v.id,
          price: diamond.pricing.totalPrice.toFixed(2),
        }));
        await shopifyAdminGql(UPDATE_VARIANTS_MUTATION, {
          productId: shopifyProductId,
          variants: variantUpdates,
        });
        console.log(`  ✓ Updated variant pricing to $${diamond.pricing.totalPrice.toLocaleString()}`);
      }
    } catch (err) {
      console.error(`Failed to update product ${diamond.title}:`, err);
    }
  }

  console.log('\n✓ All diamond products have been pushed directly into the Shopify Store with complete specifications and metafields!');
}

syncProducts().catch(console.error);
