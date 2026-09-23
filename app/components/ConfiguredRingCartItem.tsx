import {CartForm, Money} from '@shopify/hydrogen';
import {useFetcher} from 'react-router';
import type {CartLine} from './CartLineItem';
import {Button} from './ui/button';
import {money, sumPrices} from '~/lib/ring-commerce';

export function ConfiguredRingCartItem({lines}: {lines: CartLine[]}) {
  const main =
    lines.find((l) =>
      l.attributes.some(
        (a) => a.key === 'Component' && a.value !== 'Center diamond',
      ),
    ) || lines[0];
  const attributes = main.attributes.filter(
    (a) => !a.key.startsWith('_') && !['Component', 'Ring'].includes(a.key),
  );
  const quantity = main.quantity;
  const busy = lines.some((l) => l.isOptimistic);
  const ids = lines.map((l) => l.id);
  const key = `ring-${ids.join('-')}`;
  const mutation = useFetcher<{errors?: {message: string}[]}>({key});
  const total = sumPrices(
    lines.map((line) => ({price: line.cost.totalAmount})),
  );
  return (
    <li className="border-b py-6" aria-busy={busy}>
      <div className="flex gap-4">
        {main.merchandise.image && (
          <img
            src={main.merchandise.image.url}
            alt={main.merchandise.product.title}
            className="size-20 rounded-lg object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Your ring
          </p>
          <h3 className="mt-1 text-lg">
            {main.attributes.find((a) => a.key === 'Ring')?.value ||
              main.merchandise.product.title}
          </h3>
          <p className="mt-2 font-medium tabular-nums">
            {busy
              ? 'Updating…'
              : money(total, main.cost.totalAmount.currencyCode)}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {lines.map((line) => (
          <div key={line.id} className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {line.attributes.find((a) => a.key === 'Component')?.value} ·{' '}
              {line.merchandise.title === 'Default Title'
                ? line.merchandise.product.title
                : line.merchandise.title}
            </span>
            {busy ? (
              <span>Updating…</span>
            ) : (
              <Money data={line.cost.totalAmount} />
            )}
          </div>
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-muted p-4 text-xs">
        {attributes.map((a) => (
          <div key={a.key}>
            <dt className="text-muted-foreground">{a.key}</dt>
            <dd className="mt-1 break-words">{a.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-center gap-3">
        <CartForm
          route="/cart"
          fetcherKey={key}
          action={CartForm.ACTIONS.LinesUpdate}
          inputs={{lines: ids.map((id) => ({id, quantity: quantity - 1}))}}
        >
          {(fetcher) => (
            <Button
              type="submit"
              variant="outline"
              size="icon-sm"
              aria-label="Decrease ring quantity"
              disabled={quantity <= 1 || busy || fetcher.state !== 'idle'}
            >
              −
            </Button>
          )}
        </CartForm>
        <span aria-live="polite">{quantity}</span>
        <CartForm
          route="/cart"
          fetcherKey={key}
          action={CartForm.ACTIONS.LinesUpdate}
          inputs={{lines: ids.map((id) => ({id, quantity: quantity + 1}))}}
        >
          {(fetcher) => (
            <Button
              type="submit"
              variant="outline"
              size="icon-sm"
              aria-label="Increase ring quantity"
              disabled={busy || fetcher.state !== 'idle'}
            >
              +
            </Button>
          )}
        </CartForm>
        <CartForm
          route="/cart"
          fetcherKey={key}
          action={CartForm.ACTIONS.LinesRemove}
          inputs={{lineIds: ids}}
        >
          {(fetcher) => (
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              disabled={busy || fetcher.state !== 'idle'}
            >
              Remove ring
            </Button>
          )}
        </CartForm>
      </div>
      {mutation.data?.errors?.map((error) => (
        <p
          role="alert"
          className="mt-3 text-sm text-destructive"
          key={error.message}
        >
          {error.message}
        </p>
      ))}
    </li>
  );
}
