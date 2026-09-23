import fs from 'node:fs';
import {parseEnv} from 'node:util';
const env = {...parseEnv(fs.readFileSync('.env', 'utf8')), ...process.env};
const source = fs.readFileSync('app/lib/ring-commerce.ts', 'utf8');
const query = source
  .split('export const RING_PRODUCTS_QUERY = `')[1]
  .split('`;')[0];
const products = [];
let cursor = null;
do {
  const result = await fetch(
    `https://${env.PUBLIC_STORE_DOMAIN}/api/2026-04/graphql.json`,
    {
      method: 'POST',
      signal: AbortSignal.timeout(25000),
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': env.PUBLIC_STOREFRONT_API_TOKEN,
      },
      body: JSON.stringify({query, variables: {cursor}}),
    },
  );
  const payload = await result.json();
  if (!result.ok || payload.errors)
    throw new Error(JSON.stringify(payload.errors || result.status));
  products.push(...payload.data.products.nodes);
  cursor = payload.data.products.pageInfo.hasNextPage
    ? payload.data.products.pageInfo.endCursor
    : null;
} while (cursor);
{
  fs.mkdirSync('artifacts', {recursive: true});
  fs.writeFileSync(
    'artifacts/storefront-catalog.json',
    JSON.stringify(products, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        products: products.length,
        variants: products.reduce((n, p) => n + p.variants.nodes.length, 0),
        types: Object.fromEntries(
          [...new Set(products.map((p) => p.productType))].map((type) => [
            type,
            products.filter((p) => p.productType === type).length,
          ]),
        ),
        missingSpecs: products.filter((p) => !p.specs).map((p) => p.handle),
      },
      null,
      2,
    ),
  );
}
