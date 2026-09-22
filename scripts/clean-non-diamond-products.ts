import fs from 'node:fs';
import path from 'node:path';

const appData = process.env.APPDATA || '';
const configPath = path.join(appData, 'shopify-cli-kit-nodejs', 'Config', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const sessionStore = typeof config.sessionStore === 'string' ? JSON.parse(config.sessionStore) : config.sessionStore;
const accounts = sessionStore['accounts.shopify.com'];
const userSession = Object.values(accounts)[0] as any;
const targetAppKey = 'kyros-ox8yt4up.myshopify.com-7ee65a63608843c577db8b23c4d7316ea0a01bd2f7594f8a9c06ea668c1b775c';
const token = userSession.applications[targetAppKey]?.accessToken;

async function adminGql(query: string, variables: any = {}) {
  const res = await fetch('https://kyros-ox8yt4up.myshopify.com/admin/api/2026-01/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

const DIAMOND_RING_HANDLES = new Set([
  'the-kyros-signature-solitaire',
  'the-lumina-hidden-halo-oval',
  'the-elysian-emerald-three-stone',
  'the-celestial-cushion-vintage-halo',
  'the-seraphina-pear-cathedral',
  'the-sovereign-radiant-french-pave',
  'the-aurelia-modern-bezel-solitaire',
  'the-royal-princess-pave',
]);

async function purgeNonDiamondProducts() {
  console.log('--- Checking all products in Shopify Store ---');

  const res = await adminGql(`
    query {
      products(first: 50) {
        nodes {
          id
          title
          handle
          productType
          status
        }
      }
    }
  `);

  const products = res.data?.products?.nodes || [];
  const nonDiamondProducts = products.filter(
    (p: any) => !DIAMOND_RING_HANDLES.has(p.handle) && p.productType !== 'Diamond Engagement Ring'
  );

  console.log(`Found ${products.length} total products.`);
  console.log(`Found ${nonDiamondProducts.length} non-diamond products to remove:\n`);

  for (const p of nonDiamondProducts) {
    console.log(`Deleting: "${p.title}" (${p.handle}, ID: ${p.id})...`);
    const delRes = await adminGql(`
      mutation DeleteProduct($input: ProductDeleteInput!) {
        productDelete(input: $input) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `, {
      input: {
        id: p.id,
      },
    });

    const userErrors = delRes.data?.productDelete?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error(`  ! Error deleting ${p.title}:`, userErrors);
    } else {
      console.log(`  ✓ Successfully deleted "${p.title}"`);
    }
  }

  // Verify remaining products
  console.log('\n--- Verifying Remaining Products in Store ---');
  const verifyRes = await adminGql(`
    query {
      products(first: 50) {
        nodes {
          id
          title
          handle
          productType
          status
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `);

  const remaining = verifyRes.data?.products?.nodes || [];
  console.log(`Remaining products count: ${remaining.length}`);
  for (const r of remaining) {
    console.log(`✓ [${r.status}] ${r.title} ($${r.priceRangeV2?.minVariantPrice?.amount} ${r.priceRangeV2?.minVariantPrice?.currencyCode})`);
  }
}

purgeNonDiamondProducts().catch(console.error);
