import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterRange,
  getVariant,
  money,
  readSpecs,
  selectionFromUrl,
  sumPrices,
  validateConfiguration,
} from '../app/lib/ring-commerce.ts';
import {LOOSE_DIAMONDS} from '../app/data/loose-diamonds.ts';
import {RING_SETTINGS} from '../app/data/ring-settings.ts';
const variant = (id, amount, currencyCode = 'USD') => ({
  id,
  title: id,
  price: {amount, currencyCode},
  availableForSale: true,
  selectedOptions: [],
});
const product = (id, specs, variants) => ({
  id,
  handle: id,
  title: id,
  description: '',
  productType: '',
  tags: [],
  specs: {value: JSON.stringify(specs)},
  variants: {nodes: variants},
  images: {nodes: []},
});
const diamond = product(
  'diamond',
  {kind: 'diamond', diamond: LOOSE_DIAMONDS[0]},
  [variant('d1', '15400.10')],
);
const setting = product(
  'setting',
  {
    kind: 'setting',
    setting: {
      ...RING_SETTINGS[0],
      compatibleShapes: ['Round'],
      ringSizesAvailable: [5, 6, 7],
      prongStyles: ['Claw Prongs'],
      bandWidthsMm: [1.8, 2],
    },
  },
  [variant('s1', '1850.20'), variant('s2', '2200.50')],
);
const products = [diamond, setting];
const params = () =>
  new URLSearchParams({
    diamondId: 'diamond',
    settingId: 'setting',
    variant: 's1',
    size: '6',
  });

test('money sums minor units instead of floating-point display values', () => {
  assert.equal(sumPrices([variant('a', '0.1'), variant('b', '0.2')]), 0.3);
  assert.equal(
    sumPrices([variant('a', '15400.10'), variant('b', '1850.20')]),
    17250.3,
  );
});
test('currency mismatches and invalid prices cannot be purchased', () => {
  assert.throws(() => sumPrices([variant('a', '1'), variant('b', '1', 'INR')]));
  assert.throws(() => sumPrices([variant('a', '-1')]));
  assert.throws(() => sumPrices([variant('a', 'NaN')]));
});
test('malformed metafields are rejected without a sample-product fallback', () => {
  assert.equal(readSpecs({...diamond, specs: {value: '{bad json'}}), null);
  assert.equal(readSpecs({...diamond, specs: null}), null);
});
test('a valid configuration restores exact product and variant after URL serialization', () => {
  const query = new URLSearchParams(params().toString());
  const restored = validateConfiguration(products, query);
  assert.equal(restored.diamond.id, 'diamond');
  assert.equal(restored.variant.id, 's1');
  assert.equal(sumPrices(restored.variants), 17250.3);
});
test('metal variant changes use the actual variant price', () => {
  const query = params();
  query.set('variant', 's2');
  assert.equal(
    sumPrices(validateConfiguration(products, query).variants),
    17600.6,
  );
});
test('unknown variant never silently falls back to the first variant', () => {
  assert.equal(getVariant(setting, 'missing'), undefined);
  const query = params();
  query.set('variant', 'missing');
  assert.throws(() => validateConfiguration(products, query), /unavailable/);
});
test('changing to an incompatible shape cannot reach purchase', () => {
  const other = structuredClone(diamond);
  const spec = JSON.parse(other.specs.value);
  spec.diamond.shape = 'Pear';
  other.specs.value = JSON.stringify(spec);
  assert.throws(
    () => validateConfiguration([other, setting], params()),
    /shape/,
  );
});
test('missing, NaN, and unsupported ring sizes are rejected', () => {
  for (const value of ['', 'NaN', '0', '6.25']) {
    const q = params();
    q.set('size', value);
    assert.throws(() => validateConfiguration(products, q), /size/);
  }
});
test('only Shopify-supported prongs and widths are accepted', () => {
  const q = params();
  q.set('prong', 'Invented');
  assert.throws(() => validateConfiguration(products, q), /prong/);
  q.delete('prong');
  q.set('width', '99');
  assert.throws(() => validateConfiguration(products, q), /width/);
});
test('sold-out diamonds and overly long engravings cannot be added', () => {
  const sold = structuredClone(diamond);
  sold.variants.nodes[0].availableForSale = false;
  assert.throws(
    () => validateConfiguration([sold, setting], params()),
    /unavailable/,
  );
  const q = params();
  q.set('engraving', 'x'.repeat(31));
  assert.throws(() => validateConfiguration(products, q), /30/);
});
test('removing URL selections clears them instead of retaining old state', () => {
  const q = params();
  q.delete('diamondId');
  assert.equal(selectionFromUrl(products, q).diamond, undefined);
  assert.throws(() => validateConfiguration(products, q), /Choose a diamond/);
});
test('currency precision follows the currency in display and sums', () => {
  assert.equal(
    sumPrices([variant('a', '0.001', 'KWD'), variant('b', '0.002', 'KWD')]),
    0.003,
  );
  assert.match(money('.003', 'KWD'), /0\.003/);
  assert.equal(
    sumPrices([variant('a', '100', 'JPY'), variant('b', '200', 'JPY')]),
    300,
  );
});
test('range state rejects invalid numbers, clamps bounds, and sorts inverted URL ranges', () => {
  assert.deepEqual(
    filterRange(
      new URLSearchParams('xMin=bad&xMax=999'),
      'x',
      [1, 1.5, 2],
      0.01,
    ),
    {min: 1, max: 2, low: 1, high: 2},
  );
  assert.deepEqual(
    filterRange(new URLSearchParams('xMin=2&xMax=1.5'), 'x', [1, 1.5, 2], 0.01),
    {min: 1, max: 2, low: 1.5, high: 2},
  );
});
test('structurally invalid diamond or setting metadata is excluded', () => {
  const bad = structuredClone(diamond);
  const specs = JSON.parse(bad.specs.value);
  specs.diamond.carat = '1';
  bad.specs.value = JSON.stringify(specs);
  assert.equal(readSpecs(bad), null);
  assert.equal(
    readSpecs(
      product(
        'bad',
        {
          kind: 'setting',
          setting: {compatibleShapes: ['Round'], ringSizesAvailable: '6'},
        },
        [],
      ),
    ),
    null,
  );
});
test('catalogue rings resolve their exact Shopify component products', () => {
  const ringSpecs = {
      ...LOOSE_DIAMONDS[0],
      id: 'ring',
      handle: 'ring',
      diamond: LOOSE_DIAMONDS[0],
      setting: {
        ...RING_SETTINGS[0],
        styleCategory: 'solitaire',
        compatibleShapes: ['Round'],
        ringSizesAvailable: [6],
        prongStyles: ['Claw Prongs'],
        prongStyle: 'Claw Prongs',
        bandWidthsMm: [1.8],
        bandWidthMm: 1.8,
      },
      pricing: {
        settingPrice: 100,
        defaultDiamondPrice: 500,
        totalPrice: 600,
        currency: 'USD',
      },
      caratOptions: [],
  };
  const ring = product('ring', ringSpecs, [variant('ring-v', '600')]);
  const standaloneDiamond = product(
    'standalone',
    {kind: 'diamond', diamond: LOOSE_DIAMONDS[0]},
    [variant('d-v', '500')],
  );
  const standaloneSetting = product(
    'standalone-setting',
    {
      kind: 'setting',
      setting: {
        ...RING_SETTINGS[0],
        styleCategory: 'solitaire',
        compatibleShapes: ['Round'],
        ringSizesAvailable: [6],
        prongStyles: ['Claw Prongs'],
        bandWidthsMm: [1.8],
      },
    },
    [variant('s-v', '100')],
  );
  const restored = selectionFromUrl(
    [ring, standaloneDiamond, standaloneSetting],
    new URLSearchParams({product: 'ring', variant: 'ring-v', size: '6'}),
  );
  assert.equal(restored.diamond.id, 'standalone');
  assert.equal(restored.setting.id, 'standalone-setting');
  assert.equal(restored.variants[0].id, 'ring-v');
});
