import {redirect} from 'react-router';
import type {Route} from './+types/checkout';
export async function loader({context}: Route.LoaderArgs) {
  const cart = await context.cart.get();
  if (!cart?.totalQuantity || !cart.checkoutUrl) return redirect('/cart');
  return redirect(cart.checkoutUrl, {headers: {'Cache-Control': 'no-store'}});
}
export default function Checkout() {
  return null;
}
