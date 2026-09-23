import {data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/custom-ring';
import {RingStudio} from '~/components/diamond/RingStudio';
import {loadRingCatalog} from '~/lib/ring-catalog.server';
import {sumPrices, validateConfiguration} from '~/lib/ring-commerce';
export const meta: Route.MetaFunction = () => [
  {title: 'Design your ring | KYROS'},
];
export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;
export async function action({request, context}: Route.ActionArgs) {
  const form = await request.formData();
  const raw = form.get('configuration');
  if (typeof raw !== 'string' || raw.length > 8000)
    return data(
      {errors: [{message: 'Invalid ring configuration.'}], success: false},
      {status: 400},
    );
  try {
    const params = new URLSearchParams(raw);
    const products = await loadRingCatalog(context.storefront, true);
    const selection = validateConfiguration(products, params);
    const {ring, diamond, selected, variants, specs, diamondSpecs} = selection;
    if (
      Number(form.get('quotedTotal')) !== sumPrices(variants) ||
      form.get('currency') !== variants[0].price.currencyCode
    ) {
      throw new Error(
        'The price has changed. Review the refreshed total and try again.',
      );
    }
    const d =
      specs?.kind === 'ring'
        ? specs.ring.diamond
        : diamondSpecs?.kind === 'diamond'
          ? diamondSpecs.diamond
          : null;
    const prong =
      specs?.kind === 'setting'
        ? specs.setting.prongStyles[0]
        : specs?.kind === 'ring'
          ? specs.ring.setting.prongStyle
          : '';
    const width =
      specs?.kind === 'setting'
        ? specs.setting.bandWidthsMm[0]
        : specs?.kind === 'ring'
          ? specs.ring.setting.bandWidthMm
          : '';
    const groupId = crypto.randomUUID();
    const attributes = [
      {key: '_ringId', value: groupId},
      {key: 'Ring', value: selected!.title},
      {key: 'Diamond', value: d ? d.carat + ' ct ' + d.shape : diamond!.title},
      ...(d
        ? [
            {key: 'Origin', value: d.origin},
            {
              key: 'Table / depth / ratio',
              value: `${d.proportions.tablePercentage}% / ${d.proportions.depthPercentage}% / ${d.measurements.ratio}`,
            },
            {
              key: 'Polish / symmetry / fluorescence',
              value: `${d.finish.polish} / ${d.finish.symmetry} / ${d.finish.fluorescence}`,
            },
            {
              key: 'Measurements (mm)',
              value: `${d.measurements.lengthMm} × ${d.measurements.widthMm} × ${d.measurements.depthMm}`,
            },
          ]
        : []),
      {
        key: 'Color / clarity / cut',
        value: [d?.colorGrade, d?.clarityGrade, d?.cutGrade].join(' / '),
      },
      {
        key: 'Lab / report',
        value: [d?.certification.lab, d?.certification.certificateNumber].join(
          ' / ',
        ),
      },
      {key: 'Ring size (US)', value: params.get('size')!},
      {key: 'Prong', value: params.get('prong') || String(prong)},
      {key: 'Band width (mm)', value: params.get('width') || String(width)},
      ...(params.get('engraving')?.trim()
        ? [{key: 'Engraving', value: params.get('engraving')!.trim()}]
        : []),
    ];
    const result = await context.cart.addLines(
      variants.map((v, i) => ({
        merchandiseId: v.id,
        quantity: 1,
        attributes: [
          ...attributes,
          {
            key: 'Component',
            value: ring
              ? 'Complete ring'
              : i === 0
                ? 'Center diamond'
                : 'Setting',
          },
        ],
      })),
    );
    const headers = result.cart?.id
      ? context.cart.setCartId(result.cart.id)
      : new Headers();
    headers.set('Cache-Control', 'no-store');
    const errors = [
      ...(result.errors || []),
      ...(result.warnings || []).map((w) => ({message: w.message})),
    ];
    const added =
      result.cart?.lines.nodes.filter((line) =>
        line.attributes.some((a) => a.key === '_ringId' && a.value === groupId),
      ) || [];
    if (
      errors.length ||
      added.length !== variants.length ||
      added.some((line) => line.quantity !== 1)
    ) {
      if (added.length)
        await context.cart.removeLines(
          added.map((line) => line.id),
          {cartId: result.cart!.id},
        );
      if (!errors.length)
        errors.push({
          message: 'The complete ring could not be added. Please try again.',
        });
    }
    return data(
      {errors, success: errors.length === 0},
      {status: errors.length ? 400 : 200, headers},
    );
  } catch (error) {
    return data(
      {
        errors: [
          {
            message:
              error instanceof Error
                ? error.message
                : 'Unable to add this ring. Please try again.',
          },
        ],
        success: false,
      },
      {status: 400},
    );
  }
}
export default function CustomRing() {
  return <RingStudio />;
}
