import {test,expect} from '@playwright/test';
test.use({locale:'es-ES',colorScheme:'light'});
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
for(const width of [320,390,768,1440])test(`responsive pages and complete images at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:950});
  for(const route of ['inicio','coleccion','cronologia','recorridos','javier','archivo','favoritas']){
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

test('chronology covers the collection and opens dated works and linked periods',async({page})=>{
  const response=await page.request.get('/catalog.json');const catalog=await response.json();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/#cronologia');
  await expect(page.locator('.timeline-period')).toHaveCount(7);
  await expect(page.locator('.timeline-works .art-card')).toHaveCount(21);
  const references=await page.locator('.timeline-works [data-open].art-open').evaluateAll(buttons=>buttons.map(b=>({id:b.dataset.open,period:b.closest('.timeline-period').id.replace('etapa-','')})));
  for(const {id,period} of references){
    const [start,end=start]=period.split('-').map(Number);const work=catalog.works.find(w=>w.id===id);
    expect(work).toBeTruthy();expect(Number(work.year)).toBeGreaterThanOrEqual(start);expect(Number(work.year)).toBeLessThanOrEqual(end);
  }
  const counts=await page.locator('.period-date>span:last-child').allTextContents();
  expect(counts.reduce((sum,text)=>sum+parseInt(text,10),0)).toBe(catalog.works.length);
  await page.locator('.period-nav').getByRole('link',{name:'2022',exact:true}).click();
  await expect(page).toHaveURL(/#cronologia\?etapa=2022$/);
  await expect(page.locator('#heading-2022')).toBeFocused();
  await page.reload();await expect(page.locator('#heading-2022')).toBeFocused();
  await page.locator('#etapa-2022 .art-open').first().click();await expect(page.locator('#art-dialog')).toBeVisible();
  await expect(page).toHaveURL(/etapa=2022&obra=AC0610$/);
  await page.keyboard.press('Escape');
  await page.getByRole('link',{name:'Ver las obras de 2022',exact:true}).click();
  await expect(page.locator('#year')).toHaveValue('2022');
  await expect(page.locator('#results-count')).toContainText('86');
  expect(errors).toEqual([]);
});

for(const width of [320,768,1440])test(`large text persists and every page reflows at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:950});
  await page.goto('/');
  const control=page.getByRole('button',{name:'Letra grande'});
  const before=await page.locator('.hero-description').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
  await page.locator('#preferences-toggle').click();
  await control.click();await expect(control).toHaveAttribute('aria-pressed','true');
  const after=await page.locator('.hero-description').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
  expect(after/before).toBeCloseTo(1.25);
  for(const route of ['inicio','coleccion','cronologia','recorridos','javier','archivo','favoritas']){
    await page.goto('/#'+route);await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/large-text/);
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(await page.locator('body').innerText()).not.toMatch(/en construcción|aproximad[oa]s?|aprox\.|atribución provisional|atribuciones en revisión/i);
  }
  await page.goto('/#coleccion?obra=AC1450');await expect(page.locator('#art-dialog')).toBeVisible();
  await expect.poll(()=>page.locator('#art-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await page.locator('#preferences-toggle').click();
  await control.click();await expect(control).toHaveAttribute('aria-pressed','false');
  await page.reload();await expect(page.locator('html')).not.toHaveClass(/large-text/);
});

test('biography presents the memorial dates and links its sources',async({page})=>{
  await page.goto('/#javier');
  await expect(page.locator('h1')).toContainText('Javier Cotelo');
  await expect(page.locator('h1')).toContainText('Villarreal');
  await expect(page).toHaveTitle(/Javier Cotelo Villarreal/);
  const portrait=page.getByRole('img',{name:'Javier Cotelo Villarreal durante un paseo por un jardín'});
  await expect(portrait).toBeVisible();
  await expect.poll(()=>portrait.evaluate(img=>img.complete&&img.naturalWidth===960)).toBe(true);
  await expect(page.locator('.artist-dates')).toContainText('10 de octubre de 2026');
  await expect(page.locator('.artist-prose')).toContainText('arquitecto',{ignoreCase:true});
  await expect(page.locator('.bio-sources a')).toHaveCount(4);
  await expect(page.locator('.bio-sources a').first()).toHaveAttribute('href','https://opusdei.org/es/article/javier-cotelo/');
  await expect(page.locator('.bio-sources a').nth(1)).toHaveAttribute('href','https://opusdei.org/es/article/javier-cotelo-recuerdos-josemaria-escriva/');
  await expect(page.locator('.bio-sources a').nth(2)).toHaveAttribute('href','https://opusdei.org/it/article/intervista-a-javier-cotelo-autista-di-san-josemaria-storie-stra-ordinarie/');
});

test('mobile navigation supports touch, keyboard, route changes and resizing',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const menu=page.getByRole('button',{name:'Menú',exact:true});
  const nav=page.getByRole('navigation',{name:'Navegación principal'});
  await expect(menu).toHaveAttribute('aria-expanded','false');
  await expect(nav).not.toBeVisible();
  await expect(page.getByRole('button',{name:'Preferencias',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Mis favoritas'})).toBeVisible();
  expect(await page.locator('.site-header').evaluate(el=>el.getBoundingClientRect().height)).toBeLessThan(170);
  await menu.click();await expect(nav).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Tab');await expect(nav.getByRole('link',{name:'Inicio',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');await expect(menu).toBeFocused();await expect(nav).not.toBeVisible();
  await menu.click();await nav.getByRole('link',{name:'Javier',exact:true}).click();
  await expect(page.locator('h1')).toContainText('Villarreal');await expect(page.locator('h1')).toBeFocused();
  await expect(nav).not.toBeVisible();
  const portrait=await page.locator('.artist-portrait').boundingBox();
  const prose=await page.locator('.artist-prose').boundingBox();
  expect(portrait.y).toBeLessThan(450);expect(portrait.y+portrait.height).toBeLessThan(prose.y);
  await menu.click();await nav.getByRole('link',{name:'Javier',exact:true}).click();
  await expect(menu).toBeFocused();await expect(nav).not.toBeVisible();
  await page.setViewportSize({width:1440,height:950});await expect(nav).toBeVisible();await expect(menu).not.toBeVisible();
  await page.setViewportSize({width:390,height:844});await expect(nav).not.toBeVisible();
});

test('reading controls and collection remain usable when storage is unavailable',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Unavailable','SecurityError');}});});
  await page.goto('/');await page.locator('#preferences-toggle').click();await page.getByRole('button',{name:'Letra grande'}).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveClass(/large-text/);
  await page.getByRole('link',{name:'Explorar las acuarelas'}).click();
  await expect(page.locator('#gallery .art-card')).toHaveCount(24);
  expect(errors).toEqual([]);
});

test('skip link reaches the current page content without changing the route',async({page})=>{
  await page.goto('/#cronologia');await expect(page.locator('h1')).toBeVisible();
  await page.keyboard.press('Tab');await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
  await expect(page).toHaveURL(/#cronologia$/);
});
