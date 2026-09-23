import {redirect} from 'react-router';
import type {Route} from './+types/collections.$handle';
export async function loader({context, params}: Route.LoaderArgs) {
  const {collection} = await context.storefront.query(
    `#graphql
    query RingCollection($handle: String!) {
      collection(handle: $handle) {handle}
    }
  `,
    {
      variables: {handle: params.handle},
      cache: context.storefront.CacheShort(),
    },
  );
  if (!collection) throw new Response('Collection not found', {status: 404});
  return redirect(
    '/catalog?collection=' + encodeURIComponent(collection.handle),
  );
}
export default function Collection() {
  return null;
}
