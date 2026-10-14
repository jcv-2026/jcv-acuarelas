import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {t, localizeWork} from '../src/i18n.js';
import {artworkTitles} from '../src/artwork-translations.js';
import {messages} from '../src/translations.js';
import {editorialMessages} from '../src/editorial-translations.js';
import {periods, biography, biographySources, artworkNote, imageNote} from '../src/editorial.js';
import {filterWorks} from '../src/catalog.js';
const works = JSON.parse(fs.readFileSync(new URL('../data/catalog.json', import.meta.url), 'utf8')).works;

test('every artwork, editorial text and family has complete English and Italian translations', () => {
  assert.deepEqual(Object.keys(artworkTitles).sort(), works.map(w => w.id).sort());
  for (const language of ['en', 'it']) {
    for (const work of works) {
      const localized = localizeWork(work, language);
      assert.notEqual(localized.title, work.title, work.id);
      assert.notEqual(t(work.family, {}, language), work.family, work.family);
      assert.notEqual(localized.technique, work.technique);
      assert.notEqual(localized.cycle, work.cycle);
      if (work.notes) assert.notEqual(t(artworkNote(work), {}, language), artworkNote(work), work.id);
      if (work.limitation) assert.notEqual(t(imageNote(work), {}, language), imageNote(work), work.id);
      assert.equal(localized.family, work.family); // Existing URLs retain their catalogue values.
    }
    for (const text of [...periods.flatMap(p => [p.title, p.text, p.detail]), ...biography, ...biographySources.map(s => s.label)]) {
      assert.ok(Object.hasOwn(editorialMessages, text), text);
      assert.ok(editorialMessages[text].every(Boolean), text);
    }
  }
  for (const [source, values] of Object.entries(messages)) {
    assert.equal(values.length, 2, source);
    assert.ok(values.every(Boolean), source);
    const placeholders = text => [...text.matchAll(/\{\w+\}/g)].map(m => m[0]).sort();
    values.forEach(value => assert.deepEqual(placeholders(value), placeholders(source), source));
  }
});

test('translated and original search terms find the same artwork and retain family and year filters', () => {
  const localized = works.map(w => localizeWork(w, 'it'));
  for (const query of ['Sendero entre abedules', 'Path among birches', 'Sentiero tra le betulle']) {
    const result = filterWorks(localized, {query, family:'Bosques y jardines', year:'2013'});
    assert.deepEqual(result.map(w => w.id), ['AC0006']);
  }
  const originalCycleResults = filterWorks(works, {query:'Nieve y paisaje invernal'}).map(w => w.id);
  assert.ok(originalCycleResults.length > 0);
  assert.deepEqual(filterWorks(localized, {query:'Nieve y paisaje invernal'}).map(w => w.id), originalCycleResults);
  assert.equal(t('Has visto {shown} de {total} obras', {shown:24, total:409}, 'en'), 'You’ve seen 24 of 409 works');
  assert.equal(localizeWork(works[0], 'es').title, works[0].title);
});
