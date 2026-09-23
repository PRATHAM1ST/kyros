import {redirect} from 'react-router';
import type {Route} from './+types/products.$handle';
import {loadRingCatalog} from '~/lib/ring-catalog.server';
import {readSpecs} from '~/lib/ring-commerce';
export async function loader({context, params, request}: Route.LoaderArgs) {
  const products = await loadRingCatalog(context.storefront);
  const product = products.find((p) => p.handle === params.handle);
  if (!product) throw new Response('Product not found', {status: 404});
  const query = new URL(request.url).searchParams;
  const specs = readSpecs(product);
  if (specs?.kind === 'ring') {
    query.set('product', product.handle);
    query.set('step', 'complete');
  } else if (specs?.kind === 'diamond') {
    query.set('diamondId', product.id);
    query.set('step', 'settings');
  } else {
    query.set('settingId', product.id);
    query.set('step', 'diamond');
  }
  return redirect('/custom-ring?' + query.toString());
}
export default function Product() {
  return null;
}
