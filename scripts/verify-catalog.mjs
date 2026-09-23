import fs from 'node:fs';
import assert from 'node:assert/strict';
import {
  readSpecs,
  readVariantSpecs,
  sumPrices,
  validateConfiguration,
} from '../app/lib/ring-commerce.ts';
const products = JSON.parse(
  fs.readFileSync('artifacts/storefront-catalog.json', 'utf8'),
);
const ids = new Set();
const handles = new Set();
let combinations = 0;
for (const p of products) {
  assert(!handles.has(p.handle), 'Duplicate handle: ' + p.handle);
  handles.add(p.handle);
  assert(readSpecs(p), 'Invalid product specs: ' + p.handle);
  const options = new Set();
  for (const v of p.variants.nodes) {
    assert(!ids.has(v.id), 'Duplicate variant ID');
    ids.add(v.id);
    const key = JSON.stringify(v.selectedOptions);
    assert(!options.has(key), 'Duplicate options: ' + p.handle);
    options.add(key);
    assert(v.availableForSale, 'Unavailable sample variant: ' + v.id);
    sumPrices([v]);
    const s = readVariantSpecs(p, v);
    assert(s, 'Invalid variant specs: ' + v.id);
    if (s.kind === 'ring') {
      const d = s.ring.diamond;
      assert.equal(
        Number(v.selectedOptions.find((o) => o.name === 'Carat').value),
        d.carat,
      );
      assert.equal(Number(v.price.amount), s.ring.pricing.totalPrice);
      assert.equal(
        Math.round(
          (s.ring.pricing.defaultDiamondPrice + s.ring.pricing.settingPrice) *
            100,
        ),
        Math.round(Number(v.price.amount) * 100),
      );
      validateConfiguration(
        products,
        new URLSearchParams({
          product: p.handle,
          variant: v.id,
          size: String(s.ring.setting.ringSizesAvailable[0]),
        }),
      );
    }
  }
}
for (const diamond of products.filter((p) => readSpecs(p).kind === 'diamond')) {
  for (const setting of products.filter(
    (p) => readSpecs(p).kind === 'setting',
  )) {
    const ds = readSpecs(diamond).diamond,
      ss = readSpecs(setting).setting;
    const query = new URLSearchParams({
      diamondId: diamond.id,
      settingId: setting.id,
      size: String(ss.ringSizesAvailable[0]),
    });
    if (ss.compatibleShapes.includes(ds.shape)) {
      validateConfiguration(products, query);
      combinations++;
    } else assert.throws(() => validateConfiguration(products, query), /shape/);
  }
}
console.log(
  `Verified ${products.length} Shopify products, ${ids.size} unique variants, and ${combinations} compatible diamond/setting pairs; invalid pairs rejected.`,
);
