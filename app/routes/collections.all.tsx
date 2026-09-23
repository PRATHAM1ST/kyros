import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.all';
import {useRingBuilder} from '~/context/RingBuilderContext';
import {readSpecs, getVariant} from '~/lib/ring-commerce';
import {RingCard, Choice} from '~/components/diamond/RingStudio';
import {Button, buttonVariants} from '~/components/ui/button';
export const meta: Route.MetaFunction = () => [
  {title: 'The ring collection | KYROS'},
];
export async function loader({request, context}: Route.LoaderArgs) {
  const handle = new URL(request.url).searchParams.get('collection');
  if (!handle) return {collection: null};
  const ids: string[] = [];
  let cursor: string | null = null;
  let title = '';
  do {
    const result: {
      collection: {
        title: string;
        products: {
          nodes: {id: string}[];
          pageInfo: {hasNextPage: boolean; endCursor: string | null};
        };
      } | null;
    } = await context.storefront.query(
      `#graphql
      query CatalogCollection($handle: String!, $cursor: String) {
        collection(handle: $handle) {title products(first: 250, after: $cursor) {nodes {id} pageInfo {hasNextPage endCursor}}}
      }
    `,
      {variables: {handle, cursor}, cache: context.storefront.CacheShort()},
    );
    if (!result.collection)
      throw new Response('Collection not found', {status: 404});
    title = result.collection.title;
    ids.push(...result.collection.products.nodes.map((p) => p.id));
    cursor = result.collection.products.pageInfo.hasNextPage
      ? result.collection.products.pageInfo.endCursor
      : null;
  } while (cursor);
  return {collection: {title, ids}};
}
export default function Catalog() {
  const {collection} = useLoaderData<typeof loader>();
  const {products, params, update} = useRingBuilder();
  const rings = products.filter(
    (p) =>
      readSpecs(p)?.kind === 'ring' &&
      (!collection || collection.ids.includes(p.id)),
  );
  const shapes = [
    ...new Set(
      rings.flatMap((p) => {
        const s = readSpecs(p);
        return s?.kind === 'ring' ? [s.ring.diamond.shape] : [];
      }),
    ),
  ];
  const shape = params.get('shape') || 'All shapes';
  const origin = params.get('origin') || 'All origins';
  const sort = params.get('sort') || 'Featured';
  const results = rings.filter((p) => {
    const s = readSpecs(p);
    return (
      s?.kind === 'ring' &&
      (shape === 'All shapes' || s.ring.diamond.shape === shape) &&
      (origin === 'All origins' ||
        s.ring.diamond.origin
          .toLowerCase()
          .includes(origin === 'Natural' ? 'natural' : 'lab'))
    );
  });
  results.sort((a, b) =>
    sort === 'Price: low to high'
      ? Number(getVariant(a)?.price.amount) -
        Number(getVariant(b)?.price.amount)
      : sort === 'Price: high to low'
        ? Number(getVariant(b)?.price.amount) -
          Number(getVariant(a)?.price.amount)
        : 0,
  );
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
      <div className="grid items-end gap-8 border-b pb-10 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[.2em] text-muted-foreground">
            {collection?.title || 'THE KYROS COLLECTION'}
          </p>
          <h1 className="mt-4 text-4xl sm:text-6xl">A little forever.</h1>
          <p className="mt-5 max-w-md text-muted-foreground">
            Thoughtfully selected diamonds. Beautifully considered settings.
            Find the ring that feels like you.
          </p>
        </div>
        <div className="md:text-right">
          <Link
            className={buttonVariants({variant: 'outline', size: 'lg'})}
            to="/custom-ring"
          >
            Create your own ring ↗
          </Link>
        </div>
      </div>
      <div className="my-8 grid gap-4 sm:grid-cols-3">
        <Choice
          label="Shape"
          value={shape}
          options={['All shapes', ...shapes]}
          onChange={(v) => update({shape: v})}
        />
        <Choice
          label="Origin"
          value={origin}
          options={['All origins', 'Natural', 'Lab grown']}
          onChange={(v) => update({origin: v})}
        />
        <Choice
          label="Sort"
          value={sort}
          options={['Featured', 'Price: low to high', 'Price: high to low']}
          onChange={(v) => update({sort: v})}
        />
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        {results.length} rings
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((p) => (
          <RingCard key={p.id} product={p} />
        ))}
      </div>
      {!results.length && (
        <div className="py-20 text-center">
          <h2 className="mb-4 text-2xl">No rings match your selection</h2>
          <Button
            onClick={() => update({shape: null, origin: null, sort: null})}
          >
            Reset filters
          </Button>
        </div>
      )}
    </div>
  );
}
