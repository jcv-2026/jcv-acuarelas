import {test, expect} from '@playwright/test';
import fs from 'node:fs/promises';

const locales = [
  {locale:'es-ES', language:'es', heading:'Una forma de', navigation:'Navegación principal', family:'Bosques y jardines'},
  {locale:'en-GB', language:'en', heading:'A way of', navigation:'Main navigation', family:'Woods and gardens'},
  {locale:'it-IT', language:'it', heading:'Un modo di', navigation:'Navigazione principale', family:'Boschi e giardini'},
];
for (const settings of locales) {
  test.describe(settings.language, () => {
    test.use({locale:settings.locale, colorScheme:'dark'});
    test('browser language and device appearance apply automatically to the complete site', async ({page}) => {
      const errors=[];page.on('pageerror', error=>errors.push(error.message));
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('lang', settings.language);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await expect(page.locator('h1')).toContainText(settings.heading);
      await expect(page.getByRole('navigation', {name:settings.navigation})).toBeVisible();
      await page.locator('#preferences-toggle').click();
      await expect(page.locator('#language')).toHaveValue('auto');
      await expect(page.locator('[name="theme"][value="system"]')).toBeChecked();
      await page.keyboard.press('Escape');
      await expect(page.locator('#preferences-toggle')).toBeFocused();
      await page.goto('/#coleccion?familia=Bosques%20y%20jardines&ano=2013&obra=AC0006');
      await expect(page.locator('#family')).toHaveValue('Bosques y jardines');
      await expect(page.locator('.detail-info .eyebrow')).toHaveText(settings.family);
      await expect(page.locator('#art-title')).toHaveText({es:'Sendero entre abedules', en:'Path among birches', it:'Sentiero tra le betulle'}[settings.language]);
      await page.locator('.documentation summary').click();
      await expect(page.locator('.documentation')).toContainText({es:'octubre', en:'October', it:'ottobre'}[settings.language]);
      expect(errors).toEqual([]);
    });
    for (const width of [320, 768, 1440]) test(`preferences and all pages fit with large text at ${width}px`, async ({page}) => {
      await page.setViewportSize({width,height:950});
      await page.goto('/');
      await page.locator('#preferences-toggle').click();
      await page.locator('#text-size').click();
      if (width === 320) {
        const control=await page.locator('#preferences-toggle').boundingBox();
        const favourites=await page.locator('.favorites-link').boundingBox();
        expect(favourites.y).toBe(control.y);
      }
      const panel=page.locator('#preferences-panel');
      await expect(panel).toBeVisible();
      const bounds=await panel.boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x+bounds.width).toBeLessThanOrEqual(width);
      await expect.poll(()=>panel.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
      await page.screenshot({path:`test-results/preferences-${settings.language}-${width}.png`});
      await page.keyboard.press('Escape');
      for (const route of ['inicio','coleccion','cronologia','recorridos','javier','archivo','favoritas']) {
        await page.goto('/#'+route);await expect(page.locator('h1')).toBeVisible();
        await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      }
      await page.goto('/#coleccion?obra=AC1450');
      await expect(page.locator('#art-dialog')).toBeVisible();
      await expect.poll(()=>page.locator('#art-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    });
  });
}

test('language changes preserve filters, loaded works, favourites and stable links; downloads use the chosen language', async ({page}) => {
  await page.goto('/#coleccion?familia=Campos%20y%20monta%C3%B1as&orden=title');
  await expect(page.locator('#gallery .art-card')).toHaveCount(24);
  await page.locator('#load-more').click();
  await page.locator('#gallery .favorite-button').first().click();
  const url=page.url();
  await page.locator('#preferences-toggle').click();
  await page.locator('#language').focus();
  await page.locator('#language').selectOption('it');
  await expect(page.locator('#language')).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute('lang','it');
  await expect(page.locator('#gallery .art-card')).toHaveCount(48);
  await expect(page.locator('#family')).toHaveValue('Campos y montañas');
  await expect(page.locator('#sort')).toHaveValue('title');
  await expect(page.locator('#favorite-count')).toHaveText('1');
  expect(page.url()).toBe(url);
  await page.keyboard.press('Escape');
  await page.locator('[data-filter="Bosques y jardines"]').click();
  await expect(page.locator('#results-count')).toContainText('Boschi e giardini');
  await page.locator('#search').fill('Sentiero tra le betulle');
  await expect(page.locator('#gallery .art-card')).toHaveCount(1);
  const csvPromise=page.waitForEvent('download');await page.locator('#export-data').click();
  const csv=await csvPromise;
  const csvText=await fs.readFile(await csv.path(),'utf8');
  expect(csvText).toContain('"Titolo"');expect(csvText).toContain('Sentiero tra le betulle');expect(csvText).toContain('Boschi e giardini');
  await page.locator('#gallery .art-open').click();
  const jsonPromise=page.waitForEvent('download');await page.locator('#download-work').click();
  const record=JSON.parse(await fs.readFile(await (await jsonPromise).path(),'utf8'));
  expect(record.title).toBe('Sentiero tra le betulle');expect(record.family).toBe('Boschi e giardini');expect(record.searchText).toBeUndefined();
  await page.reload();await expect(page.locator('#art-title')).toHaveText('Sentiero tra le betulle');
  await expect(page.locator('#favorite-count')).toHaveText('1');
});

test('device changes remain live in automatic mode and manual theme overrides persist', async ({page}) => {
  await page.emulateMedia({colorScheme:'dark'});await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.emulateMedia({colorScheme:'light'});
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.locator('#preferences-toggle').click();
  await page.locator('[name="theme"][value="dark"]').check();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#191f1c');
  await page.locator('#preferences-toggle').click();
  await page.locator('[name="theme"][value="system"]').check();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.emulateMedia({colorScheme:'dark'});
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('[name="theme"][value="light"]').check();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

test('language detection scans browser preferences and falls back safely; storage is optional', async ({page}) => {
  const errors=[];page.on('pageerror', error=>errors.push(error.message));
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'languages',{value:['fr-FR','it-CH','en-US']});
    Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Unavailable','SecurityError');}});
  });
  await page.goto('/');await expect(page.locator('html')).toHaveAttribute('lang','it');
  await page.locator('#preferences-toggle').click();await page.locator('#language').selectOption('en');
  await expect(page.locator('h1')).toContainText('A way of');
  await page.locator('[name="theme"][value="dark"]').check();await page.locator('#text-size').click();
  await expect(page.locator('html')).toHaveClass(/large-text/);
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.keyboard.press('Escape');
  await page.getByRole('link',{name:'Explore the watercolours'}).click();
  await expect(page.locator('#gallery .art-card')).toHaveCount(24);
  expect(errors).toEqual([]);
});

test('unsupported browser languages and corrupt saved preferences use defaults', async ({page}) => {
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'languages',{value:['fr-FR','de-DE']});
    localStorage.setItem('jcv-language-v1','unknown');localStorage.setItem('jcv-theme-v1','unknown');
  });
  await page.emulateMedia({colorScheme:'light'});await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','es');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

test('manual language overrides the browser until automatic mode is restored', async ({browser}) => {
  const context=await browser.newContext({locale:'it-IT'});
  const page=await context.newPage();await page.goto('http://127.0.0.1:4173/');
  await page.locator('#preferences-toggle').click();await page.locator('#language').selectOption('en');
  await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','en');
  await page.locator('#preferences-toggle').click();await page.locator('#language').selectOption('auto');
  await expect(page.locator('html')).toHaveAttribute('lang','it');
  await expect(page.locator('h1')).toContainText('Un modo di');
  await context.close();
});

test('preferences sync across tabs without losing an open artwork or zoom', async ({context, page}) => {
  await page.goto('/#coleccion?obra=AC0006');await page.locator('#zoom-toggle').click();
  const other=await context.newPage();await other.goto('/');
  await other.locator('#preferences-toggle').click();await other.locator('#language').selectOption('it');
  await other.locator('[name="theme"][value="dark"]').check();await other.locator('#text-size').click();
  await expect(page.locator('#art-title')).toHaveText('Sentiero tra le betulle');
  await expect(page.locator('#art-dialog')).toBeVisible();
  await expect(page.locator('.detail-image-stage')).toHaveClass(/is-zoomed/);
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(page.locator('html')).toHaveClass(/large-text/);
  await page.keyboard.press('Escape');await expect(page).toHaveURL(/#coleccion$/);
  await other.close();
});
