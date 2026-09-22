import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {DIAMOND_PRODUCTS} from '~/data/diamond-products';
import {DiamondProductCard} from '~/components/diamond/DiamondProductCard';
import {DiamondShapeIcon} from '~/components/diamond/DiamondShapeIcons';
import {The4CsGuide} from '~/components/diamond/The4CsGuide';
import type {DiamondShape, DiamondProduct} from '~/types/diamond';
import {
  ALL_DIAMOND_PRODUCTS_QUERY,
  mapShopifyProductToDiamond,
} from '~/lib/shopify-diamond-adapter';
import {buttonVariants} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';
import {Card, CardContent} from '~/components/ui/card';
import {cn} from '~/lib/utils';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'KYROS Haute Joaillerie | Certified Diamond Engagement Rings'},
    {
      name: 'description',
      content:
        'Discover exceptional GIA-certified diamond engagement rings, custom-crafted in platinum and 18k gold. Precision-cut diamonds with verified 4Cs specifications.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  try {
    const data = await context.storefront.query(ALL_DIAMOND_PRODUCTS_QUERY);
    const nodes = data?.products?.nodes || [];
    if (nodes.length > 0) {
      const liveProducts: DiamondProduct[] = nodes.map(mapShopifyProductToDiamond);
      return {products: liveProducts};
    }
  } catch (error) {
    console.error('Failed to load products from Shopify in _index loader:', error);
  }
  return {products: DIAMOND_PRODUCTS};
}

const FEATURED_SHAPES: {shape: DiamondShape; label: string; desc: string}[] = [
  {shape: 'Round', label: 'Round Brilliant', desc: '57 facets of optimal light physics'},
  {shape: 'Oval', label: 'Elongated Oval', desc: 'Flattering finger elongation with soft curves'},
  {shape: 'Emerald', label: 'Emerald Step Cut', desc: 'Art Deco rectilinear hall-of-mirrors'},
  {shape: 'Radiant', label: 'Radiant Cut', desc: '70 facets of crushed-ice brilliance'},
  {shape: 'Cushion', label: 'Cushion Cut', desc: 'Romantic vintage pillow silhouette'},
  {shape: 'Pear', label: 'Pear Cut', desc: 'Sculptural teardrop drama and fire'},
  {shape: 'Princess', label: 'Princess Cut', desc: 'Square chevron pyramid brilliance'},
];

export default function Homepage() {
  const {products} = useLoaderData<typeof loader>();
  const featuredRings = products.slice(0, 4);

  return (
    <div className="kyros-home bg-stone-100/50">
      {/* 1. Luxury Hero Banner */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-stone-950 text-white overflow-hidden">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/diamonds/hero-diamond-ring.jpg"
            alt="KYROS High Jewelry Diamond Solitaire"
            className="w-full h-full object-cover object-center opacity-45 scale-105 animate-pulse duration-10000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
          <Badge
            variant="outline"
            className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border-amber-400/40 bg-stone-900/80 backdrop-blur-md mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs uppercase tracking-widest text-amber-200 font-serif font-semibold">
              Haute Joaillerie Atelier • Geneva &amp; New York
            </span>
          </Badge>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight text-white font-normal leading-[1.1] mb-6">
            Sculpted for Eternity, <br />
            <span className="italic font-light text-amber-100">
              Verified by Science.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-300 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
            Welcome to KYROS. Each center stone is hand-selected from the top 1% of global diamond yields, cut to Super Ideal optical symmetry, and accompanied by transparent GIA grading certificates.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/collections/all"
              className={cn(
                buttonVariants({size: 'lg'}),
                'w-full sm:w-auto px-8 py-6 bg-amber-200 text-stone-950 hover:bg-amber-100 font-serif font-semibold text-xs tracking-widest uppercase rounded-lg shadow-xl transition-all duration-300',
              )}
            >
              Explore Diamond Rings
            </Link>

            <a
              href="#diamond-shapes"
              className={cn(
                buttonVariants({variant: 'outline', size: 'lg'}),
                'w-full sm:w-auto px-8 py-6 bg-stone-900/80 hover:bg-stone-800 text-stone-200 border-stone-700 font-serif font-medium text-xs tracking-widest uppercase rounded-lg backdrop-blur-sm transition-colors',
              )}
            >
              Select By Diamond Cut
            </a>
          </div>

          {/* Quick trust metrics */}
          <div className="mt-12 pt-8 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-serif text-amber-200 font-bold">GIA</div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider">
                Certified &amp; Inscribed
              </div>
            </div>
            <div>
              <div className="text-lg font-serif text-amber-200 font-bold">Top 1%</div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider">
                Optical Light Return
              </div>
            </div>
            <div>
              <div className="text-lg font-serif text-amber-200 font-bold">100%</div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider">
                Conflict-Free Origin
              </div>
            </div>
            <div>
              <div className="text-lg font-serif text-amber-200 font-bold">Lifetime</div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider">
                Atelier Warranty
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Browse by Diamond Shape */}
      <section id="diamond-shapes" className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold font-serif">
            Geometric Precision
          </span>
          <h2 className="text-3xl font-serif text-stone-900 tracking-wide mt-1">
            Shop by Diamond Shape
          </h2>
          <p className="text-xs text-stone-500 mt-2 font-light">
            Every silhouette possesses a distinct personality, light reflection geometry, and finger coverage.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {FEATURED_SHAPES.map((item) => (
            <Link
              key={item.shape}
              to={`/collections/all?shape=${item.shape}`}
              className="group block"
            >
              <Card className="h-full border-stone-200 group-hover:border-stone-900 group-hover:shadow-md transition-all duration-300">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-stone-900 group-hover:text-amber-300 transition-colors mb-3">
                    <DiamondShapeIcon shape={item.shape} size={28} />
                  </div>
                  <h3 className="text-xs font-serif font-bold text-stone-900 group-hover:text-amber-900">
                    {item.shape}
                  </h3>
                  <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Masterpiece Diamond Rings */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold font-serif">
              Curated Atelier Editions
            </span>
            <h2 className="text-3xl font-serif text-stone-900 tracking-wide mt-1">
              Featured Diamond Engagement Rings
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Hand-set in Platinum 950 and 18-karat recycled gold with certified center stones.
            </p>
          </div>
          <Link
            to="/collections/all"
            className="mt-4 sm:mt-0 text-xs font-serif uppercase tracking-widest text-stone-900 hover:text-amber-800 font-bold underline underline-offset-4"
          >
            View All ({DIAMOND_PRODUCTS.length}) Rings →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredRings.map((product) => (
            <DiamondProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. The 4Cs Educational Masterclass */}
      <div className="max-w-7xl mx-auto px-4">
        <The4CsGuide />
      </div>

      {/* 5. Craftsmanship & Ethical Guarantee */}
      <section className="py-20 px-4 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/images/diamonds/craftsmanship-workshop.jpg"
              alt="KYROS Master Jeweler at the Bench"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-8">
              <div className="text-white">
                <span className="text-xs font-serif uppercase tracking-widest text-amber-300">
                  Haute Joaillerie Craftsmanship
                </span>
                <h3 className="text-2xl font-serif mt-1">
                  Individual Microscope Setting
                </h3>
                <p className="text-xs text-stone-300 font-light mt-1">
                  Every prong is hand-filed and burnished to match the unique girdle contour of your diamond.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold font-serif">
              The KYROS Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight leading-snug">
              Uncompromising Gemological Purity &amp; Ethical Stewardship
            </h2>
            <p className="text-sm text-stone-600 font-light leading-relaxed">
              We reject the opacity of traditional diamond retail. Every KYROS diamond is laser-inscribed with its official GIA grading report number, verified conflict-free under the Kimberley Process, and cut to mathematical tolerances that unlock unprecedented fire.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Card className="bg-stone-50 border-stone-200">
                <CardContent className="p-4">
                  <h4 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wide">
                    GIA Laser Inscription
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Microscopic laser inscription on the girdle verifies the stone matches your official grading certificate.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-stone-50 border-stone-200">
                <CardContent className="p-4">
                  <h4 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wide">
                    Complimentary Resizing
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Enjoy complimentary custom sizing for the lifetime of your ring at our atelier workshops.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-stone-50 border-stone-200">
                <CardContent className="p-4">
                  <h4 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wide">
                    Recycled Precious Metals
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1">
                    100% recycled 950 Platinum and 18k solid gold, cast with minimal environmental footprint.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-stone-50 border-stone-200">
                <CardContent className="p-4">
                  <h4 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wide">
                    Private Concierge
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1">
                    One-on-one virtual or in-person consultation with graduate gemologists to select your stone.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="pt-2">
              <Link
                to="/collections/all"
                className={cn(
                  buttonVariants({size: 'lg'}),
                  'px-8 py-3.5 bg-stone-950 hover:bg-stone-800 text-white font-serif text-xs font-semibold uppercase tracking-widest shadow-md transition-colors rounded-lg',
                )}
              >
                Browse The Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
