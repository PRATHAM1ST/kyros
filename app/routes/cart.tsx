import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Your bag | KYROS'}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate: {
      const current = await cart.get();
      const updates = new Map(inputs.lines.map((line) => [line.id, line]));
      for (const update of inputs.lines) {
        const source = current?.lines.nodes.find(
          (line) => line.id === update.id,
        );
        const group = source?.attributes.find(
          (a) => a.key === '_ringId',
        )?.value;
        if (group)
          for (const sibling of current?.lines.nodes || []) {
            if (
              sibling.attributes.some(
                (a) => a.key === '_ringId' && a.value === group,
              )
            )
              updates.set(sibling.id, {
                id: sibling.id,
                quantity: update.quantity,
              });
          }
      }
      result = await cart.updateLines([...updates.values()]);
      break;
    }
    case CartForm.ACTIONS.LinesRemove: {
      const current = await cart.get();
      const ids = new Set(inputs.lineIds);
      const groups = new Set(
        current?.lines.nodes
          .filter((line) => ids.has(line.id))
          .flatMap((line) =>
            line.attributes
              .filter((a) => a.key === '_ringId')
              .map((a) => a.value),
          ),
      );
      for (const line of current?.lines.nodes || []) {
        if (
          line.attributes.some(
            (a) => a.key === '_ringId' && groups.has(a.value),
          )
        )
          ids.add(line.id);
      }
      result = await cart.removeLines([...ids]);
      break;
    }
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (errors?.length) status = 400;
  if (
    !errors?.length &&
    typeof redirectTo === 'string' &&
    redirectTo.startsWith('/') &&
    !redirectTo.startsWith('//') &&
    !redirectTo.includes('\\')
  ) {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="cart">
      <h1>Cart</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}
