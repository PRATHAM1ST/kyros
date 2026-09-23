import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {Button} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {menu} = header;
  return (
    <header className="header">
      <NavLink
        prefetch="intent"
        to="/"
        style={activeLinkStyle}
        end
        className="flex shrink-0 flex-col items-center whitespace-nowrap"
      >
        <strong className="font-serif tracking-[0.25em] text-lg font-bold">
          KYROS
        </strong>
        <span className="text-[9px] tracking-[0.3em] uppercase text-stone-500 font-serif">
          Haute Joaillerie
        </span>
      </NavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} aria-label="Main navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      <NavLink
        className="header-menu-item font-serif font-semibold text-amber-900 flex items-center gap-1"
        end
        onClick={close}
        prefetch="intent"
        style={activeLinkStyle}
        to="/catalog"
      >
        <span className="text-amber-700">✧</span>
        <span>Catalog</span>
      </NavLink>
      <NavLink
        className="header-menu-item font-serif font-semibold text-amber-900 flex items-center gap-1"
        end
        onClick={close}
        prefetch="intent"
        style={activeLinkStyle}
        to="/custom-ring"
      >
        <span className="text-amber-700">✦</span>
        <span>Create your ring</span>
      </NavLink>
      {viewport === 'mobile' && (
        <NavLink to="/account" onClick={close}>
          Your account
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (
          !item.url ||
          ['Catalog', 'Home', 'Engagement Rings'].includes(item.title)
        )
          return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink
        prefetch="intent"
        to="/account"
        style={activeLinkStyle}
        className="hidden sm:block"
      >
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="header-menu-mobile-toggle cursor-pointer lg:hidden"
      onClick={() => open('mobile')}
      aria-label="Open navigation menu"
    >
      <span aria-hidden>☰</span>
    </Button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="reset font-normal hover:bg-transparent cursor-pointer"
      onClick={() => open('search')}
    >
      Search
    </Button>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      className="inline-flex items-center gap-1.5"
    >
      <span>Cart</span>
      <Badge
        variant="secondary"
        className="h-4 px-1.5 text-[10px] font-mono min-w-4 text-center justify-center"
      >
        <span aria-label={`(items: ${count})`}>{count}</span>
      </Badge>
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  const groups = new Set<string>();
  const count = (cart?.lines.nodes || []).reduce((sum, line) => {
    const group = line.attributes.find((a) => a.key === '_ringId')?.value;
    if (group && groups.has(group)) return sum;
    if (group) groups.add(group);
    return sum + line.quantity;
  }, 0);
  return <CartBadge count={count} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Engagement Rings',
      type: 'HTTP',
      url: '/collections/all',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Round Solitaire',
      type: 'HTTP',
      url: '/collections/all?shape=Round',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Oval Cut',
      type: 'HTTP',
      url: '/collections/all?shape=Oval',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: null,
      tags: [],
      title: 'The 4Cs Guide',
      type: 'HTTP',
      url: '/#diamond-shapes',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
