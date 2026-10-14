import {test,expect} from '@playwright/test';
test('browse, filter, favorite, reload, zoom, deep link, and export the real collection',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('h1')).toContainText('Una forma de');
  await expect(page.locator('.hero-art img')).toBeVisible();
  await page.getByRole('link',{name:'Explorar las acuarelas'}).click();
  await expect(page.locator('#gallery .art-card')).toHaveCount(24);
  await page.getByRole('button',{name:'Seguir explorando'}).click();
  await expect(page.locator('#gallery .art-card')).toHaveCount(48);
  await page.locator('#search').fill('montanas');await page.locator('#year').selectOption('2026');
  await expect(page.locator('#gallery .art-card').first()).toBeVisible();
  await page.locator('#gallery .favorite-button').first().click();
  await expect(page.locator('#favorite-count')).toHaveText('1');
  await page.locator('#gallery .art-open').first().click();
  await expect(page.locator('#art-dialog')).toBeVisible();
  await page.locator('#zoom-toggle').click();await expect(page.locator('.detail-image-stage')).toHaveClass(/is-zoomed/);
  const title=await page.locator('#art-title').textContent();
  await page.reload();await expect(page.locator('#art-title')).toHaveText(title);
  const download=page.waitForEvent('download');await page.locator('#download-work').click();expect((await download).suggestedFilename()).toMatch(/AC\d+\.json/);
  await page.keyboard.press('Escape');await expect(page.locator('#art-dialog')).not.toBeVisible();
  await page.getByRole('link',{name:'Mis favoritas'}).click();await expect(page.locator('#gallery .art-card')).toHaveCount(1);
  const csv=page.waitForEvent('download');await page.locator('#export-data').click();expect((await csv).suggestedFilename()).toContain('.csv');
  await page.locator('#gallery .favorite-button').click();await expect(page.locator('.empty-state')).toContainText('Tu recorrido empieza');
  expect(errors).toEqual([]);
});
test('no results can be cleared and all themed routes work',async({page})=>{
  await page.goto('/#coleccion?q=doesnotexist');await expect(page.locator('.empty-state')).toContainText('Ninguna obra');
  await page.getByRole('button',{name:'Ver todas las obras'}).click();await expect(page.locator('#gallery .art-card')).toHaveCount(24);
  await page.goto('/#recorridos');await expect(page.locator('.journeys-grid .theme-card')).toHaveCount(16);
  await page.locator('.journeys-grid .theme-card').first().click();await expect(page.locator('#family')).not.toHaveValue('');
  await page.goto('/#archivo');await expect(page.locator('h1')).toContainText('Conservar las obras');
});
for(const width of [390,768,1440])test(`responsive pages and complete images at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:950});
  for(const route of ['inicio','coleccion','recorridos','archivo','favoritas']){
    await page.goto('/#'+route);await expect(page.locator('h1')).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  }
  await page.goto('/');await expect(page.locator('.hero-art img')).toBeVisible();
  for(const image of await page.locator('main img').all()){
    await image.scrollIntoViewIfNeeded();
    await expect.poll(()=>image.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
  }
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:`test-results/home-${width}.png`,fullPage:true});
  await page.locator('.hero-art-button').click();await expect(page.locator('#art-dialog')).toBeVisible();
  await expect.poll(()=>page.locator('#art-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  await page.screenshot({path:`test-results/detail-${width}.png`});
});
