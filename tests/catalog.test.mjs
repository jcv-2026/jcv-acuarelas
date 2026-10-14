import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {filterWorks,parseFavorites} from '../src/catalog.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../dist/catalog.json',import.meta.url),'utf8'));
test('published catalog contains selected works with valid complete images and stable IDs',()=>{
  assert.ok(catalog.works.length>0);
  assert.equal(new Set(catalog.works.map(w=>w.id)).size,catalog.works.length);
  for(const w of catalog.works){assert.ok(w.width>0&&w.height>0);assert.ok(w.attribution);assert.equal(typeof w.titleProposed,'boolean');for(const key of ['image','thumbnail'])assert.ok(fs.existsSync(new URL('../dist/media/'+w[key],import.meta.url)),w.id);}
  assert.ok(catalog.works.some(w=>w.id===catalog.heroId));
});
test('search ignores accents and combines year, family, and multiple words',()=>{
  const result=filterWorks(catalog.works,{query:'MONTANAS 2026',family:'Campos y montañas',year:'2026'});
  assert.ok(result.length>0);assert.ok(result.every(w=>w.family==='Campos y montañas'&&w.year==='2026'));
  assert.equal(filterWorks(catalog.works,{query:'xyz-impossible'}).length,0);
});
test('favorite data is robust to malformed, stale, and unexpected local storage',()=>{
  const valid=new Set(catalog.works.map(w=>w.id));const id=catalog.works[0].id;
  for(const raw of ['bad','null','{}','42'])assert.equal(parseFavorites(raw,valid).size,0);
  assert.deepEqual([...parseFavorites(JSON.stringify([id,id,'missing',null,42]),valid)],[id]);
  assert.equal(filterWorks(catalog.works,{favorites:new Set()}).length,0);
});
test('curated ordering does not mutate the source and date orders are consistent',()=>{
  const before=catalog.works.map(w=>w.id);
  assert.equal(filterWorks(catalog.works,{featuredIds:catalog.featuredIds})[0].id,catalog.featuredIds[0]);
  const recent=filterWorks(catalog.works,{sort:'recent'});
  for(let i=1;i<recent.length;i++)assert.ok((recent[i-1].date||'')>=(recent[i].date||''));
  assert.deepEqual(catalog.works.map(w=>w.id),before);
});
