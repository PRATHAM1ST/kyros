import fs from 'node:fs';
import path from 'node:path';

async function testStorefrontQuery() {
  const query = `
    query GetShopifyDiamonds {
      products(first: 25, query: "product_type:'Diamond Engagement Ring'") {
        nodes {
          id
          title
          handle
          vendor
          productType
          featuredImage {
            url
            altText
          }
          images(first: 5) {
            nodes {
              url
              altText
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 5) {
            nodes {
              id
              title
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
          fullSpecs: metafield(namespace: "diamond_specs", key: "full_specs_json") { value }
        }
      }
    }
  `;

  const res = await fetch('https://kyros-ox8yt4up.myshopify.com/api/2026-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': '90a441744b633493d4d2b666c059ab77',
    },
    body: JSON.stringify({ query }),
  });

  const json = await res.json();
  const products = json.data?.products?.nodes || [];
  console.log(`Found ${products.length} diamond engagement rings on Storefront API:\n`);
  for (const p of products) {
    console.log(`- ${p.title} (${p.handle})`);
    console.log(`  Price: $${p.priceRange?.minVariantPrice?.amount} ${p.priceRange?.minVariantPrice?.currencyCode}`);
    console.log(`  Images: ${p.images?.nodes?.length || 0} images`);
    console.log(`  Shape: ${p.shape?.value}, Carat: ${p.carat?.value}, Color: ${p.colorGrade?.value}, Clarity: ${p.clarityGrade?.value}, Cut: ${p.cutGrade?.value}`);
    console.log(`  Cert: ${p.certLab?.value} #${p.certNumber?.value}`);
    console.log('');
  }
}

testStorefrontQuery().catch(console.error);
