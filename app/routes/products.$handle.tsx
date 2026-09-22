import {useState} from 'react';
import {useLoaderData, useSearchParams, Link} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getDiamondProductByHandle,
  DIAMOND_PRODUCTS,
} from '~/data/diamond-products';
import {DiamondRingCustomizer} from '~/components/diamond/DiamondRingCustomizer';
import {DiamondProductCard} from '~/components/diamond/DiamondProductCard';
import {DiamondShapeIcon} from '~/components/diamond/DiamondShapeIcons';
import type {PreciousMetal, DiamondProduct} from '~/types/diamond';
import {
  SINGLE_DIAMOND_PRODUCT_QUERY,
  ALL_DIAMOND_PRODUCTS_QUERY,
  mapShopifyProductToDiamond,
} from '~/lib/shopify-diamond-adapter';
import {Badge} from '~/components/ui/badge';
import {Card, CardContent} from '~/components/ui/card';
import {Separator} from '~/components/ui/separator';

export const meta: Route.MetaFunction = ({data}) => {
  if (data?.diamondProduct) {
    const p = data.diamondProduct;
    return [
      {title: `${p.title} | KYROS Haute Joaillerie`},
      {name: 'description', content: p.description},
      {rel: 'canonical', href: `/products/${p.handle}`},
    ];
  }
  return [{title: 'KYROS Diamond Engagement Ring'}];
};

export async function loader({context, params}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  let liveDiamond: DiamondProduct | null = null;
  let allDiamonds: DiamondProduct[] = DIAMOND_PRODUCTS;

  // 1. Fetch from Shopify Storefront API
  try {
    const [singleData, allData] = await Promise.all([
      context.storefront.query(SINGLE_DIAMOND_PRODUCT_QUERY, {
        variables: {handle},
        cache: context.storefront.CacheShort(),
      }),
      context.storefront
        .query(ALL_DIAMOND_PRODUCTS_QUERY, {
          cache: context.storefront.CacheShort(),
        })
        .catch(() => null),
    ]);

    if (singleData?.product) {
      liveDiamond = mapShopifyProductToDiamond(singleData.product);
    }

    const allNodes = allData?.products?.nodes;
    if (allNodes && allNodes.length > 0) {
      allDiamonds = allNodes.map(mapShopifyProductToDiamond);
    }
  } catch (error) {
    console.error('Error fetching live product from Shopify Storefront API:', error);
  }

  // 2. Fallback to local catalog if not found in Shopify
  const diamondProduct = liveDiamond || getDiamondProductByHandle(handle) || DIAMOND_PRODUCTS[0];

  const relatedRings = allDiamonds
    .filter((p) => p.handle !== diamondProduct.handle)
    .slice(0, 3);

  return {
    isDiamond: true,
    diamondProduct,
    relatedRings,
  };
}

export default function ProductRoute() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const product = data.diamondProduct;

  // Active metal from searchParams or default
  const initialMetal = (searchParams.get('metal') as PreciousMetal) || product.setting.defaultMetal;
  const [selectedMetal, setSelectedMetal] = useState<PreciousMetal>(initialMetal);

  // Gallery images
  const activeMetalAsset = product.metalAssets[selectedMetal];
  const galleryImages = [
    {
      id: 'primary',
      label: 'Face Up View',
      url: activeMetalAsset?.primaryImage || product.images.primary,
    },
    {
      id: 'side',
      label: 'Side Profile',
      url: activeMetalAsset?.sideImage || product.images.secondary || product.images.primary,
    },
    {
      id: 'hand',
      label: 'On-Hand Scale',
      url: product.images.onHand || '/images/diamonds/diamond-on-hand-lifestyle.jpg',
    },
    {
      id: 'cert',
      label: 'Certificate Preview',
      url: product.images.certificate || '/images/diamonds/gia-certificate-preview.jpg',
    },
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <div className="kyros-product-page bg-stone-100/40 min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-xs text-stone-500 font-sans">
            <li>
              <Link to="/" className="hover:text-stone-900 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/collections/all" className="hover:text-stone-900 transition-colors">
                Diamond Rings
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                to={`/collections/all?shape=${product.diamond.shape}`}
                className="hover:text-stone-900 transition-colors"
              >
                {product.diamond.shape}
              </Link>
            </li>
            <li>/</li>
            <li className="text-stone-900 font-medium truncate max-w-xs">{product.title}</li>
          </ol>
        </nav>

        {/* Main Product Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Interactive Image Gallery (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <Card className="bg-white border-stone-200 rounded-2xl overflow-hidden shadow-sm relative group">
              <CardContent className="p-0">
                <div className="aspect-[4/3] sm:aspect-[1/1] max-h-[600px] w-full flex items-center justify-center p-6 bg-stone-50/50">
                  <img
                    src={galleryImages[activeImageIndex]?.url}
                    alt={`${product.title} - ${galleryImages[activeImageIndex]?.label}`}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* Floating Lab Badge */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <Badge variant="outline" className="bg-white/95 backdrop-blur-sm border-stone-200 text-stone-900 font-serif font-bold text-xs uppercase tracking-wider py-1 px-3 shadow-sm">
                    {product.diamond.certification.lab} Certified
                  </Badge>
                  <Badge variant="outline" className="bg-stone-900/90 text-amber-200 border-none font-mono text-xs py-1 px-2.5">
                    {product.diamond.carat} ct
                  </Badge>
                </div>

                {/* Light reflection watermark */}
                <div className="absolute bottom-3 right-4 text-[10px] uppercase font-mono tracking-widest text-stone-300">
                  KYROS High Jewelry Atelier
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Selectors */}
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative rounded-xl overflow-hidden border p-2 bg-white transition-all cursor-pointer aspect-[4/3] flex flex-col items-center justify-center ${
                    activeImageIndex === idx
                      ? 'border-stone-900 ring-2 ring-stone-900/10 shadow-sm'
                      : 'border-stone-200 hover:border-stone-400 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-12 object-contain mix-blend-multiply"
                  />
                  <span className="text-[10px] font-sans text-stone-600 mt-1 truncate">
                    {img.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Atelier Trust Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-center">
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <div className="text-stone-900 font-serif text-sm font-semibold">100% Conflict-Free</div>
                <div className="text-[11px] text-stone-500 font-light mt-0.5">Kimberley Process Compliant</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <div className="text-stone-900 font-serif text-sm font-semibold">Laser Inscribed</div>
                <div className="text-[11px] text-stone-500 font-light mt-0.5 font-mono">{product.diamond.certification.laserInscription}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <div className="text-stone-900 font-serif text-sm font-semibold">Complimentary Resizing</div>
                <div className="text-[11px] text-stone-500 font-light mt-0.5">Lifetime Atelier Warranty</div>
              </div>
            </div>
          </div>

          {/* Right Column: Customizer & Gemological Specs (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header / Title / Origin */}
            <div>
              <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-amber-800 font-serif font-semibold mb-1">
                <DiamondShapeIcon shape={product.diamond.shape} className="w-4 h-4 text-amber-700" />
                <span>{product.diamond.shape} Brilliant</span>
                <span>•</span>
                <span>{product.diamond.origin}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight font-medium">
                {product.title}
              </h1>

              <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">
                {product.subtitle}
              </p>
            </div>

            {/* Quick 4Cs Badges with shadcn Badge */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className="bg-stone-100 text-stone-900 border-stone-200 font-semibold font-mono py-1">
                {product.diamond.carat} ct
              </Badge>
              <Badge variant="outline" className="bg-stone-100 text-stone-800 border-stone-200 font-medium py-1">
                Cut: {product.diamond.cutGrade}
              </Badge>
              <Badge variant="outline" className="bg-stone-100 text-stone-800 border-stone-200 font-medium py-1">
                Color: {product.diamond.colorGrade}
              </Badge>
              <Badge variant="outline" className="bg-stone-100 text-stone-800 border-stone-200 font-medium py-1">
                Clarity: {product.diamond.clarityGrade}
              </Badge>
            </div>

            {/* The Ring Customizer Component */}
            <DiamondRingCustomizer
              product={product}
              initialMetal={selectedMetal}
            />

            {/* Link to 3-Stage Custom Ring Atelier */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-900 font-serif font-bold block">
                  Custom Ring Atelier
                </span>
                <span className="text-[11px] text-stone-600 font-light">
                  Pair this setting with certified loose diamonds of any carat, color, or shape.
                </span>
              </div>
              <Link
                to={`/custom-ring?step=complete&product=${product.handle}&metal=${selectedMetal}`}
                className="shrink-0 py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-serif font-medium transition-colors cursor-pointer"
              >
                View Atelier Composition &rarr;
              </Link>
            </div>

            {/* Editorial Craftsmanship Description */}
            <div className="pt-6 border-t border-stone-200">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-400 mb-2">
                Atelier Notes &amp; Architecture
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed mb-3">
                {product.description}
              </p>
              <div
                className="text-xs text-stone-500 leading-relaxed font-light"
                dangerouslySetInnerHTML={{__html: product.storyHtml}}
              />
            </div>
          </div>
        </div>

        {/* Related Creations */}
        {data.relatedRings && data.relatedRings.length > 0 && (
          <section className="mt-20 pt-16 border-t border-stone-200">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-800 font-serif font-semibold">
                  Complementary Creations
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 tracking-tight mt-1">
                  You May Also Admire
                </h2>
              </div>
              <Link
                to="/collections/all"
                className="text-xs font-serif uppercase tracking-widest text-stone-900 hover:text-amber-800 font-bold underline"
              >
                View Collection →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.relatedRings.map((ring) => (
                <DiamondProductCard key={ring.id} product={ring} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
