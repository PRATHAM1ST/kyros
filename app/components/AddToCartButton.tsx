import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {Button} from '~/components/ui/button';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className,
  variant = 'default',
  size = 'default',
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon';
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <Button
            type="submit"
            variant={variant}
            size={size}
            className={className}
            onClick={onClick}
            disabled={disabled || fetcher.state !== 'idle' || lines.length === 0}
          >
            {fetcher.state !== 'idle' ? 'Adding…' : children}
          </Button>
          {fetcher.data?.errors?.length > 0 && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {fetcher.data.errors.map((error: {message: string}) => error.message).join(' ')}
            </p>
          )}
        </>
      )}
    </CartForm>
  );
}
