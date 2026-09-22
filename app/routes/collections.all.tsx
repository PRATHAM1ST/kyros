import {useEffect, useMemo} from 'react';
import {useSearchParams, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.all';
import {DIAMOND_PRODUCTS} from '~/data/diamond-products';
import {DiamondFilterBar} from '~/components/diamond/DiamondFilterBar';
import {DiamondProductCard} from '~/components/diamond/DiamondProductCard';
import type {DiamondShape, PreciousMetal, DiamondProduct} from '~/types/diamond';
import {
  ALL_DIAMOND_PRODUCTS_QUERY,
  mapShopifyProductToDiamond,
} from '~/lib/shopify-diamond-adapter';
import {useDiamondContext} from '~/context/DiamondFilterContext';
import {Button} from '~/components/ui/button';
import {Card, CardContent} from '~/components/ui/card';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'All Diamond Rings | KYROS Haute Joaillerie'},
    {
      name: 'description',
      content:
        'Browse our complete collection of certified diamond engagement rings. Filter by diamond cut, precious metal, carat weight, and setting style.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  try {
    const data = await context.storefront.query(ALL_DIAMOND_PRODUCTS_QUERY);
    const nodes = data?.products?.nodes || [];
    if (nodes.length > 0) {
      const liveProducts: DiamondProduct[] = nodes.map(mapShopifyProductToDiamond);
      return {products: liveProducts, isLiveShopify: true};
    }
  } catch (error) {
    console.error('Failed to query products from Shopify Storefront API:', error);
  }

  // Fallback to local catalog if network or storefront is unreachable
  return {products: DIAMOND_PRODUCTS, isLiveShopify: false};
}

export default function CollectionsAll() {
  const {products: initialProducts} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const {
    filters,
    sortBy,
    setFilters,
    setSortBy,
    resetFilters,
    filterAndSort,
  } = useDiamondContext();

  // Sync state if URL query params specify shape or metal
  useEffect(() => {
    const shapeParam = searchParams.get('shape') as DiamondShape | null;
    const metalParam = searchParams.get('metal') as PreciousMetal | null;

    if (shapeParam && !filters.shapes.includes(shapeParam)) {
      setFilters((prev) => ({...prev, shapes: [shapeParam]}));
    }
    if (metalParam && !filters.metals.includes(metalParam)) {
      setFilters((prev) => ({...prev, metals: [metalParam]}));
    }
  }, [searchParams]);

  // Compute filtered & sorted products from live Shopify products using global context
  const filteredProducts = useMemo(() => {
    return filterAndSort(initialProducts);
  }, [initialProducts, filterAndSort]);

  return (
    <div className="collection-all-page bg-stone-100/40 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs uppercase tracking-widest text-amber-800 font-serif font-semibold">
            KYROS High Jewelry Archive
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-stone-900 tracking-tight mt-1 mb-3">
            Diamond Engagement Rings
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
            Every creation is bespoke-crafted to order. Filter across diamond silhouettes, rare carat weights, optical cut proportions, and precious metal bands.
          </p>

          {/* 3-Stage Bespoke Ring Builder Banner */}
          <div className="mt-6 p-4 bg-stone-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md text-left">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-amber-400 text-sm">✦</span>
                <span className="text-xs uppercase tracking-widest text-amber-200 font-serif font-bold">
                  Systematic 3-Stage Bespoke Ring Atelier
                </span>
              </div>
              <p className="text-xs text-stone-300 font-light max-w-md">
                Build your bespoke ring one step at a time: Choose a certified diamond or setting in flexible order, customize sizing &amp; laser engraving, and inspect transparent atelier pricing.
              </p>
            </div>
            <a
              href="/custom-ring"
              className="shrink-0 py-2.5 px-5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-serif font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow cursor-pointer"
            >
              Start Bespoke Journey &rarr;
            </a>
          </div>
        </div>

        {/* Real-time Multi-attribute Filter and Sort Bar connected to Global Context */}
        <DiamondFilterBar
          filters={filters}
          onFilterChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredProducts.length}
        />

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <DiamondProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card className="bg-white border-stone-200 rounded-xl max-w-lg mx-auto shadow-sm my-12">
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3 text-lg font-serif">
                ✦
              </div>
              <h3 className="text-lg font-serif text-stone-900 font-medium">
                No Matching Diamond Rings
              </h3>
              <p className="text-xs text-stone-500 mt-1 mb-4 font-light">
                No rings currently match your selected filters. Try broadening your carat or shape selection.
              </p>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={resetFilters}
                className="bg-stone-900 hover:bg-stone-800 text-white rounded text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Reset All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
