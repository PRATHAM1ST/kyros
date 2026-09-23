import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {LOOSE_DIAMONDS} from '../app/data/loose-diamonds.ts';
import {RING_SETTINGS, METALS_CATALOG} from '../app/data/ring-settings.ts';
import {AUDIT, DEFINITION, METAFIELDS} from './shopify-operations.mjs';

// Local fixtures are import material only. The storefront never imports them.
// All new synthetic records are explicitly labelled sample data in Shopify.
const store = 'kyros-ox8yt4up.myshopify.com';
const directory = path.resolve('artifacts/catalog-repair');
fs.mkdirSync(directory, {recursive: true});
const cli = path.resolve('node_modules/@shopify/cli/bin/run.js');
function execute(query, variables = {}, mutate = false) {
  const queryFile = path.join(directory, 'operation.graphql');
  const variableFile = path.join(directory, 'variables.json');
  const outputFile = path.join(directory, 'result.json');
  fs.writeFileSync(queryFile, query); fs.writeFileSync(variableFile, JSON.stringify(variables));
  const args = [cli, 'store', 'execute', '--store', store, '--version', '2026-04', '--query-file', queryFile, '--variable-file', variableFile, '--output-file', outputFile, '--json', ...(mutate ? ['--allow-mutations'] : [])];
  execFileSync(process.execPath, args, {stdio: ['ignore', 'pipe', 'pipe'], env: {...process.env, SHOPIFY_CLI_NO_ANALYTICS: '1'}, timeout: 90000});
  const result = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  if (result.errors?.length) throw new Error(JSON.stringify(result.errors));
  return result.data || result;
}
const audit = execute(AUDIT);
fs.writeFileSync(path.join(directory, `backup-${Date.now()}.json`), JSON.stringify(audit, null, 2));
if (!audit.shop.plan.partnerDevelopment) throw new Error('Sample catalog import is restricted to development stores. Existing catalog has not been modified.');
const existing = audit.products.nodes;
const rings = existing.filter((p) => p.productType === 'Diamond Engagement Ring');
const storefront = JSON.parse(fs.readFileSync('artifacts/storefront-catalog.json', 'utf8'));
const macro = storefront.flatMap((p) => p.images.nodes).find((i) => i.url.includes('diamond-macro'))?.url;
const records = [];
const publicImage = (local, fallback) => storefront.flatMap((p) => p.images.nodes).find((i) => i.url.includes(path.basename(local || '').replace(/\.jpg$/, '')))?.url || fallback;
for (const p of rings) {
  const raw = p.metafields.nodes.find((m) => m.namespace === 'diamond_specs' && m.key === 'full_specs_json');
  if (!raw) continue;
  const specs = JSON.parse(raw.value);
  const choices = specs.setting.metalsAvailable.map((id) => METALS_CATALOG.find((m) => m.id === id || (id === 'platinum' && m.metal === 'platinum'))).filter(Boolean);
  const defaultMetal = choices.find((m) => m.id === specs.setting.defaultMetal || (specs.setting.defaultMetal === 'platinum' && m.metal === 'platinum')) || choices[0];
  const carats = [...specs.caratOptions];
  if (!carats.some((c) => c.carat === specs.diamond.carat)) carats.push({carat: specs.diamond.carat, centerDiamondPrice: specs.pricing.defaultDiamondPrice, specs: {measurements: specs.diamond.measurements, proportions: specs.diamond.proportions, certificateNumber: specs.diamond.certification.certificateNumber}});
  carats.sort((a, b) => Number(b.carat === specs.diamond.carat) - Number(a.carat === specs.diamond.carat));
  choices.sort((a, b) => Number(b.id === defaultMetal.id) - Number(a.id === defaultMetal.id));
  const variantSpecs = [];
  const variants = choices.flatMap((metal) => carats.map((carat) => {
    const price = specs.pricing.settingPrice + carat.centerDiamondPrice + metal.priceAdjustment - defaultMetal.priceAdjustment;
    const detail = structuredClone(specs);
    detail.diamond.carat = carat.carat;
    detail.diamond.measurements = carat.specs.measurements;
    detail.diamond.proportions = carat.specs.proportions;
    detail.diamond.certification.certificateNumber = carat.specs.certificateNumber;
    detail.setting.defaultMetal = metal.metal === 'platinum' ? 'platinum' : metal.id;
    detail.pricing.totalPrice = price;
    detail.pricing.defaultDiamondPrice = carat.centerDiamondPrice;
    detail.pricing.settingPrice = price - carat.centerDiamondPrice;
    variantSpecs.push(detail);
    return {optionValues: [{optionName: 'Metal', name: metal.name}, {optionName: 'Carat', name: String(carat.carat)}], price: price.toFixed(2), inventoryPolicy: 'CONTINUE', inventoryItem: {tracked: false}};
  }));
  // Preserve the ID of each option combination even if Shopify reorders variants.
  const usedIds = new Set();
  variants.forEach((v) => {
    const match = p.variants.nodes.find((old) => v.optionValues.every((o) => old.selectedOptions.some((s) => s.name === o.optionName && s.value === o.name)))
      || p.variants.nodes.find((old) => !usedIds.has(old.id) && old.selectedOptions.every((o) => !['Metal', 'Carat'].includes(o.name)));
    if (match) {v.id = match.id; usedIds.add(match.id);}
  });
  records.push({input: {id: p.id, title: p.title, handle: p.handle, tags: [...new Set([...p.tags, 'demo-data'])], productType: p.productType, status: 'ACTIVE', productOptions: [{name: 'Metal', values: choices.map((m) => ({name: m.name}))}, {name: 'Carat', values: carats.map((c) => ({name: String(c.carat)}))}], variants}, specs, variantSpecs});
}
const shapes = ['Round', 'Oval', 'Emerald', 'Cushion', 'Pear', 'Radiant', 'Princess', 'Marquise', 'Asscher', 'Heart'];
for (const origin of ['natural', 'lab-grown']) for (const shape of shapes) for (const tier of [1, 1.5, 2]) {
  const base = LOOSE_DIAMONDS.find((d) => d.shape === shape && d.origin === origin) || LOOSE_DIAMONDS.find((d) => d.origin === origin);
  const diamond = structuredClone(base);
  const slug = `${origin}-${shape.toLowerCase()}-${String(tier).replace('.', '-')}`;
  diamond.id = `kyros-diamond-${slug}`;
  diamond.stockNumber = `DEMO-${slug.toUpperCase()}`;
  diamond.origin = origin; diamond.shape = shape; diamond.carat = tier;
  diamond.certification = {lab: origin === 'natural' ? (tier === 1 ? 'GIA' : tier === 1.5 ? 'IGI' : 'AGS') : (tier === 2 ? 'GIA' : 'IGI'), certificateNumber: `DEMO-${slug.toUpperCase()}`, issueDate: '', laserInscription: ''};
  const ratio = ['Round', 'Princess', 'Asscher', 'Cushion', 'Heart'].includes(shape) ? 1 : shape === 'Marquise' ? 1.9 : 1.4;
  const width = Number((6.4 * Math.cbrt(tier / ratio)).toFixed(2));
  const length = Number((width * ratio).toFixed(2));
  const depthPercent = ['Emerald', 'Asscher', 'Princess'].includes(shape) ? 67 : 62;
  diamond.measurements = {lengthMm: length, widthMm: width, depthMm: Number((width * depthPercent / 100).toFixed(2)), ratio: Number((length / width).toFixed(2))};
  diamond.proportions.tablePercentage = ['Emerald', 'Asscher'].includes(shape) ? 64 : 58;
  diamond.proportions.depthPercentage = depthPercent;
  diamond.cutGrade = tier === 1 ? (shapes.indexOf(shape) % 2 ? 'Good' : 'Very Good') : tier === 1.5 ? 'Excellent' : 'Ideal';
  diamond.finish.polish = tier === 1 ? 'Good' : tier === 1.5 ? 'Very Good' : 'Excellent';
  diamond.finish.symmetry = tier === 1 ? 'Very Good' : 'Excellent';
  diamond.finish.fluorescence = origin === 'lab-grown' || tier === 2 ? 'None' : tier === 1 ? 'Medium' : 'Faint';
  diamond.colorGrade = tier === 1 ? 'G' : tier === 1.5 ? 'F' : 'E';
  diamond.clarityGrade = tier === 1 ? 'VS2' : tier === 1.5 ? 'VS1' : 'VVS2';
  diamond.pricing = {price: Math.round((origin === 'natural' ? 5000 : 1100) * tier ** 1.8)};
  diamond.image = macro || '';
  const title = `${tier.toFixed(2)} ct ${shape} · ${origin === 'natural' ? 'Natural' : 'Lab grown'}`;
  const old = existing.find((p) => p.handle === diamond.id);
  records.push({input: { ...(old ? {id: old.id} : {}), handle: diamond.id, title, productType: 'Loose Diamond', status: 'ACTIVE', tags: ['kyros-builder', 'demo-data', origin, shape], descriptionHtml: '<p>Sample diamond for exploring the ring builder. Specifications and report reference are demonstration data, not a laboratory certification.</p>', ...(!old && macro ? {files: [{originalSource: macro, contentType: 'IMAGE', alt: `${shape} diamond reference photograph`}]} : {}), productOptions: [{name: 'Title', values: [{name: 'Default Title'}]}], variants: [{...(old?.variants.nodes[0] ? {id: old.variants.nodes[0].id} : {}), optionValues: [{optionName: 'Title', name: 'Default Title'}], price: diamond.pricing.price.toFixed(2), inventoryPolicy: 'CONTINUE', inventoryItem: {tracked: false}}]}, specs: {kind: 'diamond', diamond}, variantSpecs: []});
}
// The three-stage builder chooses one center stone; two-center designs stay unpublished.
for (const setting of RING_SETTINGS.filter((s) => s.styleCategory !== 'toi-et-moi')) {
  const handle = `kyros-${setting.id}`;
  const old = existing.find((p) => p.handle === handle);
  const detail = structuredClone(setting);
  const image = publicImage(Object.values(setting.images)[0], storefront[0]?.featuredImage?.url);
  detail.images = Object.fromEntries(setting.availableMetals.map((m) => [m.id, publicImage(setting.images[m.id], image)]));
  const metals = setting.availableMetals;
  records.push({input: {...(old ? {id: old.id} : {}), handle, title: setting.title, productType: 'Ring Setting', status: 'ACTIVE', tags: ['kyros-builder', 'demo-data', setting.styleCategory], descriptionHtml: `<p>${setting.description}</p><p>Sample made-to-order setting. Photography illustrates the setting style.</p>`, ...(!old && image ? {files: [{originalSource: image, contentType: 'IMAGE', alt: setting.title}]} : {}), productOptions: [{name: 'Metal', values: metals.map((m) => ({name: m.name}))}], variants: metals.map((m, i) => ({...(old?.variants.nodes[i] ? {id: old.variants.nodes[i].id} : {}), optionValues: [{optionName: 'Metal', name: m.name}], price: (setting.basePrice + m.priceAdjustment).toFixed(2), inventoryPolicy: 'CONTINUE', inventoryItem: {tracked: false}}))}, specs: {kind: 'setting', setting: detail}, variantSpecs: []});
}
fs.writeFileSync(path.join(directory, 'plan.json'), JSON.stringify(records, null, 2));
console.log(`Prepared ${records.length} products, ${records.reduce((n, r) => n + r.input.variants.length, 0)} variants for ${store}. Backup and exact plan saved in artifacts/catalog-repair.`);
if (!process.argv.includes('--apply')) process.exit(0);
for (const ownerType of ['PRODUCT', 'PRODUCTVARIANT']) {
  const result = execute(DEFINITION, {definition: {name: 'Ring specifications', namespace: 'diamond_specs', key: 'full_specs_json', type: 'json', ownerType, access: {storefront: 'PUBLIC_READ'}}}, true);
  const errors = result.metafieldDefinitionCreate.userErrors.filter((e) => e.code !== 'TAKEN');
  if (errors.length) throw new Error(JSON.stringify(errors));
}
const publications = audit.publications.nodes.filter((p) => /hydrogen|headless|online store|^kyros$/i.test(p.name));
if (!publications.length) throw new Error('No storefront publication found.');

for (let start = 0; start < records.length; start += 4) {
  const batch = records.slice(start, start + 4);
  const definitions = batch.map((_, i) => '$p' + i + ': ProductSetInput!').join(', ');
  const operations = batch.map((record, i) => 'p' + i + ': productSet(input: $p' + i + ', synchronous: true) { product { id handle variants(first: ' + record.input.variants.length + ') { nodes {id title price selectedOptions {name value}} } } userErrors {field message code} }').join('\n');
  const created = execute('mutation RepairBatch(' + definitions + ') {' + operations + '}', Object.fromEntries(batch.map((r, i) => ['p' + i, r.input])), true);
  const metafields = [];
  const productIds = [];
  for (let i = 0; i < batch.length; i++) {
    const record = batch[i];
    const result = created['p' + i];
    if (result.userErrors.length) throw new Error(JSON.stringify({handle: record.input.handle, errors: result.userErrors}));
    productIds.push(result.product.id);
    metafields.push({ownerId: result.product.id, namespace: 'diamond_specs', key: 'full_specs_json', type: 'json', value: JSON.stringify(record.specs)});
    for (let j = 0; j < record.variantSpecs.length; j++) {
      const options = record.input.variants[j].optionValues;
      const match = result.product.variants.nodes.find((v) => options.every((o) => v.selectedOptions.some((so) => so.name === o.optionName && so.value === o.name)));
      if (!match) throw new Error('Missing variant combination: ' + record.input.handle);
      metafields.push({ownerId: match.id, namespace: 'diamond_specs', key: 'full_specs_json', type: 'json', value: JSON.stringify(record.variantSpecs[j])});
    }
  }
  for (let i = 0; i < metafields.length; i += 25) {
    const response = execute(METAFIELDS, {metafields: metafields.slice(i, i + 25)}, true).metafieldsSet;
    if (response.userErrors.length) throw new Error(JSON.stringify(response.userErrors));
  }
  const publishDefs = productIds.map((_, i) => '$id' + i + ': ID!').join(', ');
  const publishOps = productIds.map((_, i) => 'p' + i + ': publishablePublish(id: $id' + i + ', input: $input) {userErrors {field message}}').join('\n');
  const published = execute('mutation PublishBatch($input: [PublicationInput!]!, ' + publishDefs + ') {' + publishOps + '}', {input: publications.map((p) => ({publicationId: p.id})), ...Object.fromEntries(productIds.map((id, i) => ['id' + i, id]))}, true);
  for (const result of Object.values(published)) if (result.userErrors.length) throw new Error(JSON.stringify(result.userErrors));
  console.log('Updated ' + Math.min(start + 4, records.length) + '/' + records.length + ': ' + batch.map((r) => r.input.handle).join(', '));
}
