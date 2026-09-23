import {useEffect, useState, useId} from 'react';
import {Link, useFetcher} from 'react-router';
import {useRingBuilder} from '~/context/RingBuilderContext';
import {
  getVariant,
  filterRange,
  money,
  readSpecs,
  readVariantSpecs,
  sumPrices,
  validateConfiguration,
  type RingProduct,
} from '~/lib/ring-commerce';
import {useAside} from '~/components/Aside';
import {Button, buttonVariants} from '~/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '~/components/ui/card';
import {Badge} from '~/components/ui/badge';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {Slider} from '~/components/ui/slider';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '~/components/ui/accordion';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '~/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {DiamondShapeIcon} from './DiamondShapeIcons';
import {RingStyleIcon} from './RingStyleIcons';

export function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value || null}
        onValueChange={(v) => v !== null && onChange(v)}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={`Choose ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Range({
  label,
  values,
  filterKey,
  step = 1,
}: {
  label: string;
  values: number[];
  filterKey: string;
  step?: number;
}) {
  const {params, update} = useRingBuilder();
  const id = useId();
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return null;
  const {min, max, low, high} = filterRange(params, filterKey, finite, step);
  function change(a: number, b: number) {
    if (!Number.isFinite(a) || !Number.isFinite(b)) return;
    update(
      {
        [`${filterKey}Min`]: String(Math.max(min, Math.min(a, b, max))),
        [`${filterKey}Max`]: String(Math.min(max, Math.max(a, b, min))),
      },
      true,
    );
  }
  return (
    <div className="space-y-3">
      <Label htmlFor={`${id}-min`}>{label}</Label>
      <Slider
        aria-label={label}
        min={min}
        max={max === min ? max + step : max}
        step={step}
        disabled={min === max}
        value={[low, high]}
        onValueChange={(v) => {
          if (Array.isArray(v)) change(Number(v[0]), Number(v[1]));
        }}
      />
      <div className="flex items-center gap-2">
        <Input
          id={`${id}-min`}
          aria-label={`Minimum ${label}`}
          type="number"
          min={min}
          max={high}
          step={step}
          value={Number(low.toFixed(3))}
          onChange={(e) => {
            if (e.target.value) change(Number(e.target.value), high);
          }}
        />
        <span className="text-muted-foreground">–</span>
        <Input
          aria-label={`Maximum ${label}`}
          type="number"
          min={low}
          max={max}
          step={step}
          value={Number(high.toFixed(3))}
          onChange={(e) => {
            if (e.target.value) change(low, Number(e.target.value));
          }}
        />
      </div>
    </div>
  );
}

function Chips({
  label,
  values,
  filterKey,
  colors,
}: {
  label: string;
  values: string[];
  filterKey: string;
  colors?: Record<string, string>;
}) {
  const {params, update} = useRingBuilder();
  const selected = (params.get(filterKey) || '').split(',');
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {[...new Set(values)].filter(Boolean).map((v) => (
          <Button
            key={v}
            size="sm"
            variant={selected.includes(v) ? 'default' : 'outline'}
            aria-pressed={selected.includes(v)}
            onClick={() =>
              update(
                {
                  [filterKey]: (selected.includes(v)
                    ? selected.filter((s) => s !== v)
                    : [...selected.filter(Boolean), v]
                  ).join(','),
                },
                true,
              )
            }
          >
            {colors?.[v] && (
              <span
                aria-hidden
                className="size-4 rounded-full border border-foreground/20"
                style={{backgroundColor: colors[v]}}
              />
            )}
            {filterKey.endsWith('shape') && (
              <DiamondShapeIcon
                shape={v as Parameters<typeof DiamondShapeIcon>[0]['shape']}
                size={20}
              />
            )}
            {filterKey.endsWith('style') && (
              <RingStyleIcon
                style={v as Parameters<typeof RingStyleIcon>[0]['style']}
                size={24}
              />
            )}
            {v}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function RingCard({
  product,
  onSelect,
}: {
  product: RingProduct;
  onSelect?: () => void;
}) {
  const variant = getVariant(product);
  const specs = readVariantSpecs(product, variant);
  const d =
    specs?.kind === 'diamond'
      ? specs.diamond
      : specs?.kind === 'ring'
        ? specs.ring.diamond
        : null;
  const image = variant?.image?.url || product.featuredImage?.url;
  return (
    <Card className="group overflow-hidden py-0 gap-0 shadow-none transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-[#efeee8]">
        {specs?.kind === 'diamond' ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 bg-radial from-white to-secondary/10 text-foreground/75">
            <DiamondShapeIcon shape={specs.diamond.shape} size={112} />
            <span className="text-[10px] uppercase tracking-[.2em]">
              {specs.diamond.shape} cut
            </span>
          </div>
        ) : image ? (
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <DiamondShapeIcon shape={d?.shape || 'Round'} size={96} />
          </div>
        )}
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge variant="secondary">
            {d ? `${d.carat} ct · ${d.shape}` : 'Setting'}
          </Badge>
          {product.tags.includes('demo-data') && (
            <Badge variant="outline" className="bg-white">
              Sample
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="space-y-4 py-6">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
            {d
              ? `${d.colorGrade} color · ${d.clarityGrade} clarity`
              : specs?.kind === 'setting'
                ? specs.setting.styleCategory
                : 'The collection'}
          </p>
          <h3 className="text-xl">{product.title}</h3>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium tabular-nums">
            {variant
              ? money(variant.price.amount, variant.price.currencyCode)
              : 'Unavailable'}
          </span>
          {onSelect ? (
            <Button onClick={onSelect} disabled={!variant?.availableForSale}>
              Select <span aria-hidden>↗</span>
            </Button>
          ) : (
            <Link
              className={buttonVariants({variant: 'outline'})}
              to={`/custom-ring?product=${encodeURIComponent(product.handle)}&step=complete${variant ? `&variant=${encodeURIComponent(variant.id)}` : ''}`}
            >
              Explore <span aria-hidden>↗</span>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DiamondSelection() {
  const b = useRingBuilder();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const diamonds = b.products.filter((p) => readSpecs(p)?.kind === 'diamond');
  const origin =
    b.params.get('d-origin') === 'lab-grown' ? 'lab-grown' : 'natural';
  const compatible = diamonds.filter((p) => {
    const s = readSpecs(p);
    return (
      s?.kind === 'diamond' &&
      s.diamond.origin === origin &&
      (b.specs?.kind !== 'setting' ||
        b.specs.setting.compatibleShapes.includes(s.diamond.shape))
    );
  });
  const details = compatible
    .map((p) => {
      const s = readSpecs(p);
      return s?.kind === 'diamond' ? s.diamond : null;
    })
    .filter((d) => d !== null);
  const ranges = {
    'd-carat': filterRange(
      b.params,
      'd-carat',
      details.map((d) => d.carat),
      0.01,
    ),
    'd-price': filterRange(
      b.params,
      'd-price',
      compatible.map((p) => Number(getVariant(p)?.price.amount)),
    ),
    'd-table': filterRange(
      b.params,
      'd-table',
      details.map((d) => d.proportions.tablePercentage),
      0.1,
    ),
    'd-depth': filterRange(
      b.params,
      'd-depth',
      details.map((d) => d.proportions.depthPercentage),
      0.1,
    ),
    'd-ratio': filterRange(
      b.params,
      'd-ratio',
      details.map((d) => d.measurements.ratio),
      0.01,
    ),
  };
  const inRange = (key: keyof typeof ranges, value: number) =>
    value >= ranges[key].low && value <= ranges[key].high;
  const includes = (key: string, value: string) =>
    !b.params.get(key) || b.params.get(key)!.split(',').includes(value);
  const results = compatible.filter((p) => {
    const s = readSpecs(p);
    if (s?.kind !== 'diamond') return false;
    const d = s.diamond;
    return (
      includes('d-shape', d.shape) &&
      includes('d-color', d.colorGrade) &&
      includes('d-clarity', d.clarityGrade) &&
      includes('d-cut', d.cutGrade) &&
      includes('d-lab', d.certification.lab) &&
      includes('d-polish', d.finish.polish) &&
      includes('d-symmetry', d.finish.symmetry) &&
      includes('d-fluorescence', d.finish.fluorescence) &&
      inRange('d-carat', d.carat) &&
      inRange('d-price', Number(getVariant(p)?.price.amount)) &&
      inRange('d-table', d.proportions.tablePercentage) &&
      inRange('d-depth', d.proportions.depthPercentage) &&
      inRange('d-ratio', d.measurements.ratio) &&
      d.certification.certificateNumber
        .toLowerCase()
        .includes((b.params.get('d-report') || '').trim().toLowerCase())
    );
  });
  const sort = b.params.get('d-sort') || 'Featured';
  const limit = Math.max(
    12,
    Math.min(results.length, Number(b.params.get('d-limit')) || 12),
  );
  results.sort((a, c) =>
    sort === 'Price: low to high'
      ? Number(getVariant(a)?.price.amount) -
        Number(getVariant(c)?.price.amount)
      : sort === 'Price: high to low'
        ? Number(getVariant(c)?.price.amount) -
          Number(getVariant(a)?.price.amount)
        : 0,
  );
  function choose(p: RingProduct) {
    b.update({
      diamondId: p.id,
      diamondVariant: getVariant(p)?.id || null,
      product: null,
      step: b.setting ? 'complete' : 'settings',
    });
  }
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">01 / THE CENTER STONE</p>
          <h1 className="mt-2 text-3xl sm:text-5xl">Find your brilliance.</h1>
        </div>
        <div className="flex gap-2">
          {(['natural', 'lab-grown'] as const).map((o) => (
            <Button
              key={o}
              variant={origin === o ? 'default' : 'outline'}
              aria-pressed={origin === o}
              onClick={() => b.update({'d-origin': o, 'd-lab': null})}
            >
              {o === 'natural' ? 'Natural' : 'Lab grown'}
            </Button>
          ))}
        </div>
      </div>
      <Button
        variant="outline"
        className="mb-4 lg:hidden"
        aria-expanded={filtersOpen}
        aria-controls="diamond-filters"
        onClick={() => setFiltersOpen(!filtersOpen)}
      >
        {filtersOpen ? 'Hide filters' : 'Filter diamonds'}
      </Button>
      <div className="grid items-start gap-8 lg:grid-cols-[280px_1fr]">
        <Card
          id="diamond-filters"
          className={`shadow-none ${filtersOpen ? '' : 'hidden lg:flex'}`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Refine your search</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  b.update(
                    Object.fromEntries(
                      [...b.params.keys()]
                        .filter((k) => k.startsWith('d-'))
                        .map((k): [string, null] => [k, null]),
                    ),
                  )
                }
              >
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Chips
              label="Shape"
              values={details.map((d) => d.shape)}
              filterKey="d-shape"
            />
            <Range
              label="Carat"
              values={details.map((d) => d.carat)}
              filterKey="d-carat"
              step={0.01}
            />
            <Range
              label="Price"
              values={compatible.map((p) =>
                Number(getVariant(p)?.price.amount),
              )}
              filterKey="d-price"
            />
            <Chips
              label="Color"
              values={details.map((d) => d.colorGrade).sort()}
              filterKey="d-color"
            />
            <Chips
              label="Clarity"
              values={details.map((d) => d.clarityGrade)}
              filterKey="d-clarity"
            />
            <Chips
              label="Cut"
              values={details.map((d) => d.cutGrade)}
              filterKey="d-cut"
            />
            <Chips
              label="Lab"
              values={details
                .map((d) => d.certification.lab)
                .filter((l) => origin === 'natural' || l !== 'AGS')}
              filterKey="d-lab"
            />
            <Input
              aria-label="Search report number"
              placeholder="Report number"
              value={b.params.get('d-report') || ''}
              onChange={(e) => b.update({'d-report': e.target.value}, true)}
            />
            <Accordion>
              <AccordionItem value="advanced">
                <AccordionTrigger>Advanced specifications</AccordionTrigger>
                <AccordionContent>
                  <div className="mt-6 space-y-6">
                    <Range
                      label="Table (%)"
                      values={details.map((d) => d.proportions.tablePercentage)}
                      filterKey="d-table"
                      step={0.1}
                    />
                    <Range
                      label="Depth (%)"
                      values={details.map((d) => d.proportions.depthPercentage)}
                      filterKey="d-depth"
                      step={0.1}
                    />
                    <Range
                      label="Length / width"
                      values={details.map((d) => d.measurements.ratio)}
                      filterKey="d-ratio"
                      step={0.01}
                    />
                    <Chips
                      label="Polish"
                      values={details.map((d) => d.finish.polish)}
                      filterKey="d-polish"
                    />
                    <Chips
                      label="Symmetry"
                      values={details.map((d) => d.finish.symmetry)}
                      filterKey="d-symmetry"
                    />
                    <Chips
                      label="Fluorescence"
                      values={details.map((d) => d.finish.fluorescence)}
                      filterKey="d-fluorescence"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {results.length} diamonds
            </p>
            <div className="flex items-end gap-2">
              <Choice
                label="Sort"
                value={sort}
                options={[
                  'Featured',
                  'Price: low to high',
                  'Price: high to low',
                ]}
                onChange={(v) => b.update({'d-sort': v})}
              />
              <Button
                variant="outline"
                onClick={() =>
                  b.update({
                    'd-view':
                      b.params.get('d-view') === 'table' ? 'grid' : 'table',
                  })
                }
              >
                {b.params.get('d-view') === 'table' ? 'Cards' : 'Table'}
              </Button>
            </div>
          </div>
          {!results.length && (
            <Empty
              title="No matching diamonds"
              text="Adjust your filters or choose another setting."
            />
          )}
          {b.params.get('d-view') === 'table' ? (
            <div className="overflow-x-auto rounded-xl border bg-card">
              <Table className="w-full text-left text-sm">
                <TableHeader className="border-b bg-muted">
                  <TableRow>
                    {[
                      'Diamond',
                      'Carat',
                      'Color',
                      'Clarity',
                      'Cut',
                      'Price',
                      '',
                    ].map((h) => (
                      <TableHead key={h} className="p-4">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((p) => {
                    const s = readSpecs(p);
                    if (s?.kind !== 'diamond') return null;
                    const d = s.diamond;
                    const v = getVariant(p);
                    return (
                      <TableRow key={p.id} className="border-b last:border-0">
                        <TableCell className="p-4">{d.shape}</TableCell>
                        <TableCell className="p-4">{d.carat}</TableCell>
                        <TableCell className="p-4">{d.colorGrade}</TableCell>
                        <TableCell className="p-4">{d.clarityGrade}</TableCell>
                        <TableCell className="p-4">{d.cutGrade}</TableCell>
                        <TableCell className="whitespace-nowrap p-4">
                          {v && money(v.price.amount, v.price.currencyCode)}
                        </TableCell>
                        <TableCell className="p-4">
                          <Button
                            disabled={!v?.availableForSale}
                            onClick={() => choose(p)}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.slice(0, limit).map((p) => (
                <RingCard key={p.id} product={p} onSelect={() => choose(p)} />
              ))}
            </div>
          )}
          {b.params.get('d-view') !== 'table' && results.length > limit && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => b.update({'d-limit': String(limit + 12)})}
              >
                Show more diamonds · {limit} / {results.length}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SettingSelection() {
  const b = useRingBuilder();
  const settings = b.products.filter((p) => {
    const s = readSpecs(p);
    return (
      s?.kind === 'setting' &&
      (b.diamondSpecs?.kind !== 'diamond' ||
        s.setting.compatibleShapes.includes(b.diamondSpecs.diamond.shape))
    );
  });
  const specs = settings.flatMap((p) => {
    const s = readSpecs(p);
    return s?.kind === 'setting' ? [s.setting] : [];
  });
  const metalOptions = [
    ...new Set<string>(
      settings.flatMap((p) =>
        p.variants.nodes.flatMap((v) =>
          v.selectedOptions
            .filter((o) => o.name === 'Metal')
            .map((o) => o.value),
        ),
      ),
    ),
  ];
  const matches = (key: string, value: string) =>
    !b.params.get(key) || b.params.get(key)!.split(',').includes(value);
  const priceRange = filterRange(
    b.params,
    's-price',
    settings.flatMap((p) =>
      p.variants.nodes.map((v) => Number(v.price.amount)),
    ),
  );
  const variantsFor = (p: RingProduct) =>
    p.variants.nodes.filter(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.every(
          (o) => o.name !== 'Metal' || matches('s-metal', o.value),
        ) &&
        Number(v.price.amount) >= priceRange.low &&
        Number(v.price.amount) <= priceRange.high,
    );
  const results = settings.filter((p) => {
    const s = readSpecs(p);
    return (
      s?.kind === 'setting' &&
      matches('s-style', s.setting.styleCategory) &&
      (!b.params.get('s-shape') ||
        s.setting.compatibleShapes.some((shape) =>
          matches('s-shape', shape),
        )) &&
      variantsFor(p).length
    );
  });
  const guided = b.params.get('s-mode') === 'guided';
  const step = Math.max(1, Math.min(4, Number(b.params.get('s-step')) || 1));
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">02 / THE SETTING</p>
          <h1 className="mt-2 text-3xl sm:text-5xl">A beautiful foundation.</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => b.update({'s-mode': guided ? 'all' : 'guided'})}
        >
          {guided ? 'View all filters' : 'Guide me'}
        </Button>
      </div>
      <Card className="mb-8 shadow-none">
        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(!guided || step === 1) && (
            <Chips
              label="Setting style"
              values={specs.map((s) => s.styleCategory)}
              filterKey="s-style"
            />
          )}
          {(!guided || step === 2) && (
            <div className="space-y-3">
              <Chips
                label="Metal & purity"
                values={metalOptions}
                filterKey="s-metal"
                colors={Object.fromEntries(
                  specs.flatMap((s) =>
                    s.availableMetals.map((m) => [m.name, m.hexColor]),
                  ),
                )}
              />
            </div>
          )}
          {(!guided || step === 3) && (
            <Chips
              label="Diamond shape"
              values={specs.flatMap((s) => s.compatibleShapes)}
              filterKey="s-shape"
            />
          )}
          {(!guided || step === 4) && (
            <Range
              label="Setting price"
              values={settings.flatMap((p) =>
                p.variants.nodes.map((v) => Number(v.price.amount)),
              )}
              filterKey="s-price"
            />
          )}
          {guided && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={step === 1}
                onClick={() => b.update({'s-step': String(step - 1)})}
              >
                Back
              </Button>
              <span className="text-sm">{step} / 4</span>
              <Button
                disabled={step === 4}
                onClick={() => b.update({'s-step': String(step + 1)})}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {results.length} settings
          {b.diamond ? ' · compatible with your diamond' : ''}
        </p>
        <Button
          variant="ghost"
          onClick={() =>
            b.update(
              Object.fromEntries(
                [...b.params.keys()]
                  .filter((k) => k.startsWith('s-'))
                  .map((k): [string, null] => [k, null]),
              ),
            )
          }
        >
          Reset filters
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((p) => (
          <RingCard
            key={p.id}
            product={{...p, variants: {nodes: variantsFor(p)}}}
            onSelect={() =>
              b.update({
                settingId: p.id,
                variant: variantsFor(p)[0].id,
                product: null,
                size: null,
                prong: null,
                width: null,
                step: b.diamond ? 'complete' : 'diamond',
              })
            }
          />
        ))}
      </div>
      {!results.length && (
        <Empty
          title="No matching settings"
          text="Try a different style, metal, or price range."
        />
      )}
    </>
  );
}

function Empty({title, text}: {title: string; text: string}) {
  return (
    <Card className="shadow-none">
      <CardContent className="py-12 text-center">
        <h2 className="mb-2 text-2xl">{title}</h2>
        <p className="text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

function CompleteRing() {
  const b = useRingBuilder();
  const fetcher = useFetcher<{
    errors?: {message: string}[];
    success?: boolean;
  }>();
  const {open} = useAside();
  const [imageIndex, setImageIndex] = useState(0);
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) open('cart');
  }, [fetcher.state, fetcher.data, open]);
  const d =
    b.specs?.kind === 'ring'
      ? b.specs.ring.diamond
      : b.diamondSpecs?.kind === 'diamond'
        ? b.diamondSpecs.diamond
        : null;
  const s =
    b.specs?.kind === 'ring'
      ? b.specs.ring.setting
      : b.specs?.kind === 'setting'
        ? b.specs.setting
        : null;
  if (!b.selected || !d || !s)
    return (
      <>
        <Empty
          title="Your ring is taking shape"
          text="Choose a diamond and a setting to continue."
        />
        <div className="mt-6 flex justify-center gap-4">
          <Button onClick={() => b.update({step: 'diamond'})}>
            Choose diamond
          </Button>
          <Button
            variant="outline"
            onClick={() => b.update({step: 'settings'})}
          >
            Choose setting
          </Button>
        </div>
      </>
    );
  const prongs =
    b.specs?.kind === 'setting'
      ? b.specs.setting.prongStyles
      : b.specs?.kind === 'ring'
        ? [b.specs.ring.setting.prongStyle]
        : [];
  const widths =
    b.specs?.kind === 'setting'
      ? b.specs.setting.bandWidthsMm
      : b.specs?.kind === 'ring'
        ? [b.specs.ring.setting.bandWidthMm]
        : [];
  let invalid = '';
  try {
    validateConfiguration(b.products, b.params);
  } catch (e) {
    invalid = (e as Error).message;
  }
  const currency = b.variant?.price.currencyCode || 'USD';
  const total =
    b.variants.length &&
    new Set(b.variants.map((v) => v.price.currencyCode)).size === 1
      ? sumPrices(b.variants)
      : null;
  const gallery = [
    ...new Set(
      [
        b.variant?.image?.url,
        ...b.selected.images.nodes.map((i) => i.url),
      ].filter((v): v is string => !!v),
    ),
  ];
  const specs = [
    ['Shape', d.shape],
    ['Carat', `${d.carat} ct`],
    ['Color', d.colorGrade],
    ['Clarity', d.clarityGrade],
    ['Cut', d.cutGrade],
    ['Lab', d.certification.lab],
    ['Report', d.certification.certificateNumber],
    ['Table', `${d.proportions.tablePercentage}%`],
    ['Depth', `${d.proportions.depthPercentage}%`],
    ['Ratio', d.measurements.ratio],
    ['Polish', d.finish.polish],
    ['Symmetry', d.finish.symmetry],
    ['Fluorescence', d.finish.fluorescence],
    [
      'Measurements',
      `${d.measurements.lengthMm} × ${d.measurements.widthMm} × ${d.measurements.depthMm} mm`,
    ],
  ];
  return (
    <>
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          03 / MADE PERSONAL
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Entirely yours.</h1>
        <p className="mt-4 text-muted-foreground">
          Every detail, just as you chose it.
        </p>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="aspect-square overflow-hidden rounded-xl border bg-card">
            {gallery.length ? (
              <img
                src={gallery[Math.min(imageIndex, gallery.length - 1)]}
                alt={b.selected.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <DiamondShapeIcon shape={d.shape} size={150} />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {gallery.map((url, i) => (
              <Button
                key={url}
                variant={i === imageIndex ? 'default' : 'outline'}
                aria-label={`View image ${i + 1}`}
                onClick={() => setImageIndex(i)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Reference photography · shape, metal and proportions may differ.
            Your selected specifications are shown alongside.
          </p>
        </div>
        <div className="space-y-6">
          <div>
            <Badge variant="secondary">
              {b.ring ? 'The collection' : 'Your custom ring'}
            </Badge>
            <h2 className="mt-3 text-3xl">{b.selected.title}</h2>
            <p className="mt-3 text-muted-foreground">
              {b.selected.description}
            </p>
            {b.selected.tags.includes('demo-data') && (
              <p className="mt-3 text-sm">
                Sample catalog item. Gemological details are demonstration data.
              </p>
            )}
          </div>
          <Card className="shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {d.carat} ct {d.shape}
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    b.update({
                      product: null,
                      variant: b.setting ? b.variant?.id || null : null,
                      step: 'diamond',
                    })
                  }
                >
                  Change diamond
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {specs.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="mt-1 break-words font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Setting & personalization</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => b.update({product: null, step: 'settings'})}
                >
                  Change setting
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {(b.variant?.selectedOptions || [])
                .filter((o) => o.value !== 'Default Title')
                .map((option) => {
                  const available = b.selected!.variants.nodes.filter(
                    (v) =>
                      v.availableForSale &&
                      b.variant!.selectedOptions.every(
                        (o) =>
                          o.name === option.name ||
                          v.selectedOptions.some(
                            (candidate) =>
                              candidate.name === o.name &&
                              candidate.value === o.value,
                          ),
                      ),
                  );
                  return (
                    <Choice
                      key={option.name}
                      label={option.name}
                      value={option.value}
                      options={[
                        ...new Set<string>(
                          available.flatMap((v) =>
                            v.selectedOptions
                              .filter((o) => o.name === option.name)
                              .map((o) => o.value),
                          ),
                        ),
                      ]}
                      onChange={(value) => {
                        const next = available.find((v) =>
                          v.selectedOptions.some(
                            (o) => o.name === option.name && o.value === value,
                          ),
                        );
                        if (next) b.update({variant: next.id, metal: null});
                      }}
                    />
                  );
                })}
              <div className="grid gap-4 sm:grid-cols-2">
                <Choice
                  label="Ring size (US)"
                  value={b.params.get('size') || ''}
                  options={s.ringSizesAvailable.map(String)}
                  onChange={(size) => b.update({size})}
                />
                {prongs.length > 0 && (
                  <Choice
                    label="Prong style"
                    value={b.params.get('prong') || prongs[0]}
                    options={prongs}
                    onChange={(prong) => b.update({prong})}
                  />
                )}
                <Choice
                  label="Band width (mm)"
                  value={b.params.get('width') || String(widths[0])}
                  options={widths.map(String)}
                  onChange={(width) => b.update({width})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engraving">
                  Engraving{' '}
                  <span className="text-muted-foreground">· optional</span>
                </Label>
                <Input
                  id="engraving"
                  placeholder="Your words, forever"
                  maxLength={30}
                  value={b.params.get('engraving') || ''}
                  onChange={(e) => b.update({engraving: e.target.value}, true)}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {(b.params.get('engraving') || '').length} / 30
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-foreground/15 bg-background shadow-none">
            <CardContent className="space-y-4">
              {b.variants.map((v, i) => (
                <div key={v.id} className="flex justify-between gap-3 text-sm">
                  <span>
                    {b.ring
                      ? b.ring.title
                      : i === 0
                        ? 'Center diamond'
                        : 'Setting'}{' '}
                    · {v.title !== 'Default Title' ? v.title : ''}
                  </span>
                  <span className="whitespace-nowrap tabular-nums">
                    {money(v.price.amount, v.price.currencyCode)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-4 text-xl">
                <span>Total</span>
                <strong className="tabular-nums">
                  {total === null ? 'Unavailable' : money(total, currency)}
                </strong>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and applicable taxes calculated at checkout.
              </p>
              <fetcher.Form method="post" action="/custom-ring">
                <input type="hidden" name="quotedTotal" value={total ?? ''} />
                <input type="hidden" name="currency" value={currency} />
                <input
                  type="hidden"
                  name="configuration"
                  value={b.params.toString()}
                />
                <Button
                  className="w-full"
                  size="lg"
                  type="submit"
                  disabled={!!invalid || fetcher.state !== 'idle'}
                >
                  {fetcher.state !== 'idle'
                    ? 'Adding your ring…'
                    : 'Add ring to bag'}
                </Button>
              </fetcher.Form>
              {invalid && (
                <p className="text-sm text-muted-foreground">{invalid}</p>
              )}
              {fetcher.data?.errors?.map((e) => (
                <p
                  key={e.message}
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {e.message}
                </p>
              ))}
              {fetcher.data?.success && (
                <Link
                  className={buttonVariants({
                    variant: 'outline',
                    className: 'w-full',
                  })}
                  to="/checkout"
                >
                  Continue to secure checkout
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export function RingStudio() {
  const b = useRingBuilder();
  const step = ['diamond', 'settings', 'complete'].includes(
    b.params.get('step') || '',
  )
    ? b.params.get('step')!
    : b.params.get('flow') === 'setting-first'
      ? 'settings'
      : 'diamond';
  const order =
    b.params.get('flow') === 'setting-first'
      ? ['settings', 'diamond', 'complete']
      : ['diamond', 'settings', 'complete'];
  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="border-b bg-card">
        <nav
          aria-label="Ring builder steps"
          className="mx-auto grid max-w-7xl grid-cols-3 px-4 sm:px-8"
        >
          {order.map((s, i) => (
            <Button
              key={s}
              variant="ghost"
              className={`h-auto rounded-none border-b-2 py-5 sm:py-6 ${step === s ? 'border-foreground bg-background' : 'border-transparent'}`}
              aria-current={step === s ? 'step' : undefined}
              onClick={() => b.update({step: s})}
            >
              <span
                className={`mr-1 flex size-6 items-center justify-center rounded-full text-xs ${step === s ? 'bg-foreground text-background' : 'bg-muted'}`}
              >
                {i + 1}
              </span>
              {s === 'diamond'
                ? 'Diamond'
                : s === 'settings'
                  ? 'Setting'
                  : 'Your ring'}
              {(s === 'diamond' && (b.diamond || b.ring)) ||
              (s === 'settings' && b.selected)
                ? ' ✓'
                : ''}
            </Button>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/catalog"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← The collection
          </Link>
          {step !== 'complete' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                b.update({
                  flow:
                    b.params.get('flow') === 'setting-first'
                      ? 'diamond-first'
                      : 'setting-first',
                  step:
                    b.params.get('flow') === 'setting-first'
                      ? 'diamond'
                      : 'settings',
                })
              }
            >
              {b.params.get('flow') === 'setting-first'
                ? 'Start with a diamond'
                : 'Start with a setting'}{' '}
              ↗
            </Button>
          )}
        </div>
        <div
          key={step}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {step === 'diamond' ? (
            <DiamondSelection />
          ) : step === 'settings' ? (
            <SettingSelection />
          ) : (
            <CompleteRing />
          )}
        </div>
      </div>
    </div>
  );
}
