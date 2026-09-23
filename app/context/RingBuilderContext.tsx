import {
  createContext,
  startTransition,
  useContext,
  type ReactNode,
} from 'react';
import {useSearchParams} from 'react-router';
import {selectionFromUrl, type RingProduct} from '~/lib/ring-commerce';
function useBuilder(products: RingProduct[]) {
  const [params, setParams] = useSearchParams();
  function update(values: Record<string, string | null>, replace = false) {
    const next = new URLSearchParams(params);
    if ('product' in values) next.delete('productHandle');
    for (const [key, value] of Object.entries(values)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    startTransition(() => {
      void setParams(next, {replace, preventScrollReset: true});
    });
  }
  return {products, params, update, ...selectionFromUrl(products, params)};
}
const RingContext = createContext<ReturnType<typeof useBuilder> | null>(null);
export function RingBuilderProvider({
  products,
  children,
}: {
  products: RingProduct[];
  children: ReactNode;
}) {
  return (
    <RingContext.Provider value={useBuilder(products)}>
      {children}
    </RingContext.Provider>
  );
}
export function useRingBuilder() {
  const context = useContext(RingContext);
  if (!context) throw new Error('RingBuilderProvider is required');
  return context;
}
