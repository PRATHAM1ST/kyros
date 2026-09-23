import type {Storefront} from '@shopify/hydrogen';
import {
  RING_PRODUCTS_QUERY,
  readSpecs,
  type RingProduct,
} from './ring-commerce';
export async function loadRingCatalog(
  storefront: Storefront,
  fresh = false,
): Promise<RingProduct[]> {
  const products: RingProduct[] = [];
  let cursor: string | null = null;
  do {
    const result: {
      products: {
        nodes: RingProduct[];
        pageInfo: {hasNextPage: boolean; endCursor: string | null};
      };
    } = await storefront.query(RING_PRODUCTS_QUERY, {
      variables: {cursor},
      cache: fresh ? storefront.CacheNone() : storefront.CacheShort(),
    });
    products.push(...result.products.nodes.filter((p) => readSpecs(p)));
    cursor = result.products.pageInfo.hasNextPage
      ? result.products.pageInfo.endCursor
      : null;
  } while (cursor);
  return products;
}
