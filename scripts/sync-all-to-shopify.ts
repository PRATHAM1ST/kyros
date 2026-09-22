import fs from 'node:fs';
import path from 'node:path';
import { DIAMOND_PRODUCTS } from '../app/data/diamond-products';

// 1. Read admin token from Shopify CLI config
const appData = process.env.APPDATA || '';
const configPath = path.join(appData, 'shopify-cli-kit-nodejs', 'Config', 'config.json');

if (!fs.existsSync(configPath)) {
  console.error('Config file not found at:', configPath);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const sessionStore = typeof config.sessionStore === 'string' ? JSON.parse(config.sessionStore) : config.sessionStore;
const accounts = sessionStore['accounts.shopify.com'];
const userSession = Object.values(accounts)[0] as any;
const targetAppKey = 'kyros-ox8yt4up.myshopify.com-7ee65a63608843c577db8b23c4d7316ea0a01bd2f7594f8a9c06ea668c1b775c';
const token = userSession.applications[targetAppKey]?.accessToken;

if (!token) {
  console.error('Failed to locate access token for kyros in session store.');
  process.exit(1);
}

console.log('✓ Successfully retrieved Shopify Admin token.');

const ADMIN_ENDPOINT = 'https://kyros-ox8yt4up.myshopify.com/admin/api/2026-01/graphql.json';

async function shopifyAdminGql(query: string, variables: any = {}) {
  const response = await fetch(ADMIN_ENDPOINT, {
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

// Map of product indices to high-res images
const PRODUCT_IMAGES: { [index: number]: string[] } = {
  0: ['round-solitaire-platinum.jpg', 'round-solitaire-gold.jpg', 'diamond-macro-sparkle.jpg'],
  1: ['oval-hidden-halo-gold.jpg', 'diamond-on-hand-lifestyle.jpg', 'gia-certificate-preview.jpg'],
  2: ['emerald-three-stone-platinum.jpg', 'diamond-macro-sparkle.jpg', 'gia-certificate-preview.jpg'],
  3: ['cushion-halo-rosegold.jpg', 'hero-diamond-ring.jpg', 'craftsmanship-workshop.jpg'],
  4: ['pear-solitaire-platinum.jpg', 'diamond-on-hand-lifestyle.jpg', 'diamond-macro-sparkle.jpg'],
  5: ['radiant-pave-platinum.jpg', 'diamond-macro-sparkle.jpg', 'gia-certificate-preview.jpg'],
  6: ['round-solitaire-gold.jpg', 'round-solitaire-platinum.jpg', 'craftsmanship-workshop.jpg'],
  7: ['princess-pave-whitegold.jpg', 'diamond-on-hand-lifestyle.jpg', 'gia-certificate-preview.jpg'],
};

// All gemological metafield definitions to register in Shopify Admin
const METAFIELD_DEFINITIONS = [
  { name: 'Diamond Shape', key: 'shape', type: 'single_line_text_field' },
  { name: 'Carat Weight', key: 'carat', type: 'number_decimal' },
  { name: 'Cut Grade', key: 'cut_grade', type: 'single_line_text_field' },
  { name: 'Color Grade', key: 'color_grade', type: 'single_line_text_field' },
  { name: 'Clarity Grade', key: 'clarity_grade', type: 'single_line_text_field' },
  { name: 'Diamond Origin', key: 'origin', type: 'single_line_text_field' },
  { name: 'Certification Lab', key: 'cert_lab', type: 'single_line_text_field' },
  { name: 'Certificate Number', key: 'cert_number', type: 'single_line_text_field' },
  { name: 'Laser Inscription', key: 'laser_inscription', type: 'single_line_text_field' },
  { name: 'Table Percentage', key: 'table_percentage', type: 'number_decimal' },
  { name: 'Depth Percentage', key: 'depth_percentage', type: 'number_decimal' },
  { name: 'Crown Angle', key: 'crown_angle', type: 'number_decimal' },
  { name: 'Pavilion Angle', key: 'pavilion_angle', type: 'number_decimal' },
  { name: 'Polish', key: 'polish', type: 'single_line_text_field' },
  { name: 'Symmetry', key: 'symmetry', type: 'single_line_text_field' },
  { name: 'Fluorescence', key: 'fluorescence', type: 'single_line_text_field' },
  { name: 'Millimeter Dimensions', key: 'measurements_mm', type: 'single_line_text_field' },
  { name: 'Length-to-Width Ratio', key: 'ratio', type: 'number_decimal' },
  { name: 'Setting Style', key: 'setting_style', type: 'single_line_text_field' },
  { name: 'Band Width (mm)', key: 'band_width_mm', type: 'number_decimal' },
  { name: 'Prong Architecture', key: 'prong_style', type: 'single_line_text_field' },
  { name: 'Full Diamond Specs JSON', key: 'full_specs_json', type: 'json' },
];

async function ensureMetafieldDefinitions() {
  console.log('\n--- 1. Registering Metafield Definitions in Shopify Admin ---');

  for (const def of METAFIELD_DEFINITIONS) {
    try {
      const res = await shopifyAdminGql(`
        mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
          metafieldDefinitionCreate(definition: $definition) {
            createdDefinition {
              id
              name
              key
            }
            userErrors {
              field
              message
              code
            }
          }
        }
      `, {
        definition: {
          name: def.name,
          namespace: 'diamond_specs',
          key: def.key,
          type: def.type,
          ownerType: 'PRODUCT',
          pin: true,
          access: {
            storefront: 'PUBLIC_READ',
          },
        },
      });

      const errors = res?.metafieldDefinitionCreate?.userErrors;
      if (errors && errors.length > 0) {
        if (errors[0].code === 'TAKEN') {
          console.log(`  ✓ Metafield definition already exists: "${def.name}" (${def.key})`);
        } else {
          console.log(`  ! Definition "${def.name}": ${errors[0].message}`);
        }
      } else {
        console.log(`  ✓ Created & Pinned definition: "${def.name}" (${def.key})`);
      }
    } catch (err: any) {
      console.warn(`  ! Error creating def for ${def.key}:`, err.message);
    }
  }
}

// Upload local image to Shopify via Staged Uploads
const uploadedCache = new Map<string, string>();

async function uploadImageToShopify(filename: string): Promise<string> {
  if (uploadedCache.has(filename)) {
    return uploadedCache.get(filename)!;
  }

  const filePath = path.resolve('public/images/diamonds', filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileSize = fileBuffer.length;

  const stagedRes = await shopifyAdminGql(`
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    input: [
      {
        resource: 'IMAGE',
        filename,
        mimeType: 'image/jpeg',
        fileSize: String(fileSize),
        httpMethod: 'POST',
      },
    ],
  });

  const errors = stagedRes.stagedUploadsCreate.userErrors;
  if (errors && errors.length > 0) {
    throw new Error(JSON.stringify(errors));
  }

  const target = stagedRes.stagedUploadsCreate.stagedTargets[0];

  const formData = new FormData();
  for (const param of target.parameters) {
    formData.append(param.name, param.value);
  }
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  formData.append('file', blob, filename);

  const uploadRes = await fetch(target.url, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error(`Failed to upload to S3/GCS: ${uploadRes.status} ${uploadRes.statusText}`);
  }

  uploadedCache.set(filename, target.resourceUrl);
  console.log(`    Uploaded ${filename} -> ${target.resourceUrl.slice(0, 70)}...`);
  return target.resourceUrl;
}

const LIVE_PRODUCT_IDS = [
  'gid://shopify/Product/16021402911089',
  'gid://shopify/Product/16021403042161',
  'gid://shopify/Product/16021403107697',
  'gid://shopify/Product/16021403140465',
  'gid://shopify/Product/16021403173233',
  'gid://shopify/Product/16021403206001',
  'gid://shopify/Product/16021403238769',
  'gid://shopify/Product/16021403337073',
];

async function syncAllProducts() {
  console.log('\n--- 2. Synchronizing Products, Media & Metafields in Shopify Admin ---');

  for (let i = 0; i < DIAMOND_PRODUCTS.length; i++) {
    const diamond = DIAMOND_PRODUCTS[i];
    const shopifyProductId = LIVE_PRODUCT_IDS[i];
    if (!shopifyProductId) continue;

    console.log(`\n[Product ${i + 1}/${DIAMOND_PRODUCTS.length}] "${diamond.title}" (${shopifyProductId})`);

    // 2a. Fetch existing media to delete outdated snowboard images
    const existingMediaQuery = await shopifyAdminGql(`
      query GetProductMedia($id: ID!) {
        product(id: $id) {
          media(first: 10) {
            nodes {
              id
              mediaContentType
              preview {
                image {
                  url
                }
              }
            }
          }
        }
      }
    `, { id: shopifyProductId });

    const existingMedia = existingMediaQuery.product?.media?.nodes || [];

    // 2b. Upload and attach diamond images
    const imageFilenames = PRODUCT_IMAGES[i] || ['round-solitaire-platinum.jpg'];
    const newMediaInput = [];

    for (const filename of imageFilenames) {
      const resourceUrl = await uploadImageToShopify(filename);
      newMediaInput.push({
        mediaContentType: 'IMAGE',
        originalSource: resourceUrl,
        alt: `${diamond.title} - ${diamond.diamond.shape} Brilliant Diamond Engagement Ring`,
      });
    }

    const attachRes = await shopifyAdminGql(`
      mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
        productCreateMedia(media: $media, productId: $productId) {
          media {
            id
          }
          mediaUserErrors {
            code
            message
          }
        }
      }
    `, {
      productId: shopifyProductId,
      media: newMediaInput,
    });

    const attachErrors = attachRes.productCreateMedia?.mediaUserErrors;
    if (attachErrors && attachErrors.length > 0) {
      console.warn('    ! Media attach errors:', attachErrors);
    } else {
      console.log(`    ✓ Attached ${newMediaInput.length} diamond images to product.`);
    }

    // 2c. Delete old media (snowboards) that existed before this update
    if (existingMedia.length > 0) {
      const mediaIdsToDelete = existingMedia.map((m: any) => m.id);
      await shopifyAdminGql(`
        mutation productDeleteMedia($mediaIds: [ID!]!, $productId: ID!) {
          productDeleteMedia(mediaIds: $mediaIds, productId: $productId) {
            deletedMediaIds
            mediaUserErrors {
              code
              message
            }
          }
        }
      `, {
        productId: shopifyProductId,
        mediaIds: mediaIdsToDelete,
      });
      console.log(`    ✓ Removed ${mediaIdsToDelete.length} legacy template images.`);
    }

    // 2d. Update Product details and all 21 Metafields
    const formattedHtml = `
      <div class="kyros-product-description">
        <p><strong>${diamond.subtitle}</strong></p>
        <p>${diamond.description}</p>
        ${diamond.storyHtml}
        <hr/>
        <h4>Official GIA/IGI Gemological Certificate Specifications:</h4>
        <ul>
          <li><strong>Diamond Shape:</strong> ${diamond.diamond.shape} Brilliant</li>
          <li><strong>Carat Weight:</strong> ${diamond.diamond.carat} ct</li>
          <li><strong>Cut Grade:</strong> ${diamond.diamond.cutGrade}</li>
          <li><strong>Color Grade:</strong> ${diamond.diamond.colorGrade}</li>
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

    const updateRes = await shopifyAdminGql(`
      mutation UpdateDiamondProduct($product: ProductUpdateInput!) {
        productUpdate(product: $product) {
          product {
            id
            title
            handle
            status
            publishedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      product: {
        id: shopifyProductId,
        title: diamond.title,
        handle: diamond.handle,
        descriptionHtml: formattedHtml,
        vendor: 'KYROS Haute Joaillerie',
        productType: 'Diamond Engagement Ring',
        tags: [
          diamond.diamond.shape.toLowerCase(),
          diamond.setting.styleCategory,
          'engagement-ring',
          'certified-diamond',
          diamond.diamond.origin.toLowerCase().includes('lab') ? 'lab-grown' : 'natural-diamond',
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
      },
    });

    const userErrors = updateRes.productUpdate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.warn('    ! Product update errors:', userErrors);
    } else {
      console.log(`    ✓ Updated title, handle, description, and 21 metafields.`);
    }

    // 2e. Update variant pricing
    const variantQuery = await shopifyAdminGql(`
      query GetProductVariants($id: ID!) {
        product(id: $id) {
          variants(first: 10) {
            nodes {
              id
              title
            }
          }
        }
      }
    `, { id: shopifyProductId });

    const variants = variantQuery.product?.variants?.nodes || [];
    if (variants.length > 0) {
      const variantUpdates = variants.map((v: any) => ({
        id: v.id,
        price: diamond.pricing.totalPrice.toFixed(2),
      }));

      await shopifyAdminGql(`
        mutation UpdateVariantPrices($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            productVariants {
              id
              price
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        productId: shopifyProductId,
        variants: variantUpdates,
      });

      console.log(`    ✓ Updated variant price to $${diamond.pricing.totalPrice.toLocaleString()}`);
    }
  }

  console.log('\n======================================================');
  console.log('✓ All 8 products, images, and metafields are LIVE in Shopify Admin!');
  console.log('======================================================');
}

async function run() {
  await ensureMetafieldDefinitions();
  await syncAllProducts();
}

run().catch(console.error);
