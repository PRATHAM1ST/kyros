import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {DIAMOND_PRODUCTS} from '~/data/diamond-products';
import {DiamondProductCard} from '~/components/diamond/DiamondProductCard';
import {DiamondFilterBar} from '~/components/diamond/DiamondFilterBar';
import {
  ALL_DIAMOND_PRODUCTS_QUERY,
  mapShopifyProductToDiamond,
} from '~/lib/shopify-diamond-adapter';
import {useDiamondContext} from '~/context/DiamondFilterContext';
import {useEffect, useMemo} from 'react';
import type {
  DiamondProduct,
  SettingStyle,
} from '~/types/diamond';
import {Button} from '~/components/ui/button';
import {Card, CardContent} from '~/components/ui/card';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {
      title: `${data?.collectionTitle ?? 'Diamond Rings'} | KYROS Haute Joaillerie`,
    },
  ];
};

export async function loader({context, params}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) {
    throw redirect('/collections/all');
  }

  // Map handle to friendly title and initial style filter if applicable
  let collectionTitle = 'Curated Diamond Creations';
  let initialSettingStyle: SettingStyle | null = null;

  if (handle.includes('solitaire')) {
    collectionTitle = 'Solitaire Diamond Rings';
    initialSettingStyle = 'solitaire';
  } else if (handle.includes('halo')) {
    collectionTitle = 'Hidden Halo Diamond Rings';
    initialSettingStyle = 'hidden-halo';
  } else if (handle.includes('pave')) {
    collectionTitle = 'French Pavé Diamond Rings';
    initialSettingStyle = 'pave';
  } else if (handle.includes('three-stone')) {
    collectionTitle = 'Three-Stone Trilogy Rings';
    initialSettingStyle = 'three-stone';
  } else if (handle.includes('bezel')) {
    collectionTitle = 'Modern Bezel Diamond Rings';
    initialSettingStyle = 'bezel';
  } else {
    collectionTitle = 'Bespoke Diamond Rings';
  }

  let products: DiamondProduct[] = DIAMOND_PRODUCTS;
  try {
    const data = await context.storefront.query(ALL_DIAMOND_PRODUCTS_QUERY);
    const nodes = data?.products?.nodes || [];
    if (nodes.length > 0) {
      products = nodes.map(mapShopifyProductToDiamond);
    }
  } catch (error) {
    console.error('Failed to query collection products from Shopify:', error);
  }

  return {
    handle,
    collectionTitle,
    initialSettingStyle,
    products,
  };
}

export default function CollectionRoute() {
  const {collectionTitle, initialSettingStyle, products} = useLoaderData<typeof loader>();
  const {
    filters,
    sortBy,
    setFilters,
    setSortBy,
    resetFilters,
    filterAndSort,
  } = useDiamondContext();

  useEffect(() => {
    if (initialSettingStyle && !filters.settingStyles.includes(initialSettingStyle)) {
      setFilters((prev) => ({...prev, settingStyles: [initialSettingStyle]}));
    }
  }, [initialSettingStyle]);

  const filteredProducts = useMemo(() => {
    return filterAndSort(products);
  }, [products, filterAndSort]);

  return (
    <div className="collection-page bg-stone-100/40 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-stone-500 mb-6 flex items-center space-x-2 font-light">
          <Link to="/" className="hover:text-stone-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            to="/collections/all"
            className="hover:text-stone-900 transition-colors"
          >
            Collections
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-medium">{collectionTitle}</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs uppercase tracking-widest text-amber-800 font-serif font-semibold">
            KYROS Fine Jewelry
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-stone-900 tracking-tight mt-1 mb-3">
            {collectionTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
            Meticulously proportioned settings featuring certified Super Ideal center diamonds.
          </p>
        </div>

        {/* Filter Bar */}
        <DiamondFilterBar
          filters={filters}
          onFilterChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredProducts.length}
        />

        {/* Products Grid */}
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
