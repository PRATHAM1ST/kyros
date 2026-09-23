import {Link} from 'react-router';
import type {Route} from './+types/_index';
import {useRingBuilder} from '~/context/RingBuilderContext';
import {readSpecs} from '~/lib/ring-commerce';
import {RingCard} from '~/components/diamond/RingStudio';
import {buttonVariants} from '~/components/ui/button';
export const meta: Route.MetaFunction = () => [
  {title: 'KYROS | A ring, entirely yours'},
];
export default function Home() {
  const {products} = useRingBuilder();
  const rings = products.filter((p) => readSpecs(p)?.kind === 'ring');
  const hero = rings.find((p) => p.featuredImage)?.featuredImage;
  return (
    <>
      <section className="grid min-h-[650px] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-20 sm:px-12 lg:px-20">
          <p className="text-xs uppercase tracking-[.25em] text-muted-foreground">
            KYROS · DIAMOND ATELIER
          </p>
          <h1 className="mt-6 text-5xl leading-[1.12] sm:text-7xl">
            For your
            <br />
            <em>kind of forever.</em>
          </h1>
          <p className="mt-6 max-w-sm text-lg text-muted-foreground">
            An extraordinary diamond. A setting that feels like you. A ring with
            your story at its heart.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link className={buttonVariants({size: 'lg'})} to="/custom-ring">
              Create your ring ↗
            </Link>
            <Link
              className={buttonVariants({variant: 'outline', size: 'lg'})}
              to="/catalog"
            >
              Explore the collection
            </Link>
          </div>
          <div className="mt-12 flex gap-6 border-t pt-6 text-sm text-muted-foreground">
            <span>01 Choose a diamond</span>
            <span>02 Find a setting</span>
            <span>03 Make it yours</span>
          </div>
        </div>
        <div className="relative min-h-80 bg-[#e8e7de]">
          {hero && (
            <img
              src={hero.url}
              alt={hero.altText || 'The KYROS ring collection'}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <span className="absolute bottom-8 left-8 rounded-full border border-white/50 bg-background/90 px-4 py-2 text-sm">
            Considered in every detail.
          </span>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              THE COLLECTION
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Some things are timeless.
            </h2>
          </div>
          <Link to="/catalog" className="text-sm underline underline-offset-4">
            View all rings ↗
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rings.slice(0, 3).map((p) => (
            <RingCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <section className="bg-secondary/15 px-6 py-16 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          YOUR VISION, YOUR WAY
        </p>
        <h2 className="mx-auto mt-4 max-w-xl text-3xl sm:text-5xl">
          Start with the detail
          <br />
          you love most.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            className={buttonVariants({size: 'lg'})}
            to="/custom-ring?flow=diamond-first&step=diamond"
          >
            Start with a diamond
          </Link>
          <Link
            className={buttonVariants({variant: 'outline', size: 'lg'})}
            to="/custom-ring?flow=setting-first&step=settings"
          >
            Start with a setting
          </Link>
        </div>
      </section>
    </>
  );
}
