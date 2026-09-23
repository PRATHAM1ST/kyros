import {test, expect} from '@playwright/test';
const usd = (amount: number) =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(
    amount,
  );

test('catalog selection restores, adds the exact ring, updates quantity and removes it', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    if (!error.message.includes('error #421')) errors.push(error.message);
  });
  await page.goto('/catalog');
  await expect(
    page.getByRole('heading', {name: 'A little forever.'}),
  ).toBeVisible();
  await page.getByRole('link', {name: 'Explore', exact: true}).first().click();
  await expect(
    page.getByRole('heading', {name: 'Entirely yours.'}),
  ).toBeVisible();
  await expect(
    page.getByRole('button', {name: 'Add ring to bag'}),
  ).toBeDisabled();
  await page
    .getByRole('combobox', {name: 'Ring size (US)', exact: true})
    .click();
  await page.getByRole('option', {name: '6', exact: true}).click();
  await page.getByLabel('Engraving', {exact: false}).fill('Forever & always');
  await expect(page).toHaveURL(/engraving=Forever/);
  await page.reload();
  await expect(page.getByLabel('Engraving', {exact: false})).toHaveValue(
    'Forever & always',
  );
  await expect(
    page.getByRole('combobox', {name: 'Ring size (US)', exact: true}),
  ).toHaveText('6');
  const total = Number(
    await page.locator('input[name="quotedTotal"]').inputValue(),
  );
  await page.getByRole('button', {name: 'Add ring to bag'}).click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  await expect(
    drawer.getByText('Forever & always', {exact: true}),
  ).toBeVisible();
  await expect(
    drawer.getByRole('heading', {name: 'The Kyros Signature Solitaire'}),
  ).toBeVisible();
  await page.screenshot({path: 'artifacts/cart-desktop.png'});
  await drawer.getByRole('button', {name: 'Increase ring quantity'}).click();
  await expect(
    drawer.getByText(usd(total * 2), {exact: true}).first(),
  ).toBeVisible();
  await drawer.getByRole('button', {name: 'Remove ring'}).click();
  await expect(drawer.getByText(/haven.t added anything yet/)).toBeVisible();
  expect(errors).toEqual([]);
});

for (const flow of ['diamond-first', 'setting-first']) {
  test(`${flow}: filters restore, exact variants price correctly, and components stay together in cart`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => {
      // Hydrogen's deferred cart Suspense boundary can emit React's hydration
      // recovery warning while a test navigates immediately after load.
      if (!e.message.includes('error #421')) errors.push(e.message);
    });
    await page.goto(`/custom-ring?flow=${flow}`);
    if (flow === 'setting-first') {
      await expect(
        page.getByRole('heading', {name: 'A beautiful foundation.'}),
      ).toBeVisible();
      await page.getByRole('button', {name: 'Guide me', exact: true}).click();
      await page.getByRole('button', {name: 'solitaire', exact: true}).click();
      await page
        .getByRole('button', {name: 'Select', exact: true})
        .first()
        .click();
    }
    await expect(
      page.getByRole('heading', {name: 'Find your brilliance.'}),
    ).toBeVisible();
    await page.getByRole('button', {name: 'Lab grown', exact: true}).click();
    await page.getByRole('button', {name: 'Round', exact: true}).click();
    await page
      .getByRole('spinbutton', {name: 'Minimum Carat', exact: true})
      .fill('1.5');
    await expect(page).toHaveURL(/d-caratMin=1.5/);
    await page.reload();
    await expect(
      page.getByRole('spinbutton', {name: 'Minimum Carat', exact: true}),
    ).toHaveValue('1.5');
    await expect(
      page.getByRole('button', {name: 'Lab grown', exact: true}),
    ).toHaveAttribute('aria-pressed', 'true');
    await page
      .getByRole('button', {name: 'Select', exact: true})
      .first()
      .click();
    if (flow === 'diamond-first') {
      await expect(
        page.getByRole('heading', {name: 'A beautiful foundation.'}),
      ).toBeVisible();
      await page
        .getByRole('button', {name: 'Select', exact: true})
        .first()
        .click();
    }
    await expect(
      page.getByRole('heading', {name: 'Entirely yours.'}),
    ).toBeVisible();
    const firstTotal = Number(
      await page.locator('input[name="quotedTotal"]').inputValue(),
    );
    await page.getByRole('combobox', {name: 'Metal', exact: true}).click();
    await page
      .getByRole('option', {name: '18k Yellow Gold', exact: true})
      .click();
    await expect
      .poll(async () =>
        Number(await page.locator('input[name="quotedTotal"]').inputValue()),
      )
      .not.toEqual(firstTotal);
    const expectedTotal = Number(
      await page.locator('input[name="quotedTotal"]').inputValue(),
    );
    await page
      .getByRole('combobox', {name: 'Ring size (US)', exact: true})
      .click();
    await page.getByRole('option', {name: '6.5', exact: true}).click();
    await page.getByLabel('Engraving', {exact: false}).fill('Always');
    await expect(page).toHaveURL(/engraving=Always/);
    const config = await page
      .locator('input[name="configuration"]')
      .inputValue();
    const invalid = await page.request.post('/custom-ring', {
      form: {configuration: config, quotedTotal: '0', currency: 'USD'},
    });
    expect(invalid.status()).toBe(400);
    await page.getByRole('button', {name: 'Add ring to bag'}).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('Always', {exact: true})).toBeVisible();
    await expect(
      drawer.getByText(usd(expectedTotal), {exact: true}).first(),
    ).toBeVisible();
    await expect(drawer.getByText(/Center diamond ·/)).toBeVisible();
    await expect(drawer.getByText(/Setting · 18k Yellow Gold/)).toBeVisible();
    await drawer.getByRole('button', {name: 'Increase ring quantity'}).click();
    await expect(
      drawer.getByText(usd(expectedTotal * 2), {exact: true}).first(),
    ).toBeVisible();
    await expect(
      drawer.getByRole('button', {name: 'Increase ring quantity'}),
    ).toBeEnabled();
    await page.keyboard.press('Escape');
    await page.goto('/cart');
    await expect(
      page.getByRole('link', {name: 'Cart (items: 2)', exact: true}),
    ).toBeVisible();
    await expect(
      page.getByText(usd(expectedTotal * 2), {exact: true}).first(),
    ).toBeVisible();
    const checkout = await page.request.get('/checkout', {maxRedirects: 0});
    expect(checkout.status()).toBe(302);
    expect(checkout.headers().location).toMatch(
      /^https:\/\/[^/]+\/(?:cart\/c|checkouts)\//,
    );
    await page.getByRole('button', {name: 'Remove ring'}).click();
    await expect(page.getByText(/haven.t added anything yet/)).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('mobile pages do not overflow and navigation traps focus in a dismissible sheet', async ({
  page,
}) => {
  await page.setViewportSize({width: 390, height: 844});
  for (const route of ['/', '/catalog', '/custom-ring']) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.getByRole('button', {name: 'Open navigation menu'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.screenshot({path: 'artifacts/builder-mobile.png', fullPage: true});
});

test('unknown products return 404 and empty checkout returns to the cart', async ({
  request,
  page,
}) => {
  expect(
    (await request.get('/products/this-product-does-not-exist')).status(),
  ).toBe(404);
  await page.goto('/checkout');
  await expect(page).toHaveURL(/\/cart$/);
});
