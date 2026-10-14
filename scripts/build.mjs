import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const configPath = path.resolve(process.env.JCV_CONFIG || path.join(root, 'catalog.config.json'));
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const catalogPath = path.resolve(path.dirname(configPath), process.env.JCV_CATALOG || config.catalog);
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const mediaRoot = path.resolve(root, 'public/media');
const out = path.resolve(root, 'dist');

if (!Array.isArray(catalog.works) || !catalog.works.length) {
  throw new Error('El catálogo de data/catalog.json debe contener una colección de obras.');
}
const ids = new Set(catalog.works.map(work => work.id));
if (ids.size !== catalog.works.length) throw new Error('Hay identificadores de obra duplicados.');

const images = new Set();
for (const work of catalog.works) {
  for (const key of ['image', 'thumbnail']) {
    const name = work[key];
    if (typeof name !== 'string' || !/^[a-z0-9_-]+\.webp$/i.test(name)) {
      throw new Error(`${work.id}: nombre de imagen no válido.`);
    }
    if (!fs.statSync(path.join(mediaRoot, name), {throwIfNoEntry: false})?.isFile()) {
      throw new Error(`${work.id}: falta public/media/${name}.`);
    }
    images.add(name);
  }
}

fs.mkdirSync(out, {recursive: true});
for (const name of ['index.html', 'styles.css', 'app.js', 'catalog.js']) {
  fs.copyFileSync(path.join(root, 'src', name), path.join(out, name));
}
fs.cpSync(path.join(root, 'public'), out, {
  recursive: true,
  filter: source => path.resolve(source) !== mediaRoot,
});
fs.mkdirSync(path.join(out, 'media'), {recursive: true});
for (const name of images) {
  fs.copyFileSync(path.join(mediaRoot, name), path.join(out, 'media', name));
}

const data = {
  ...catalog,
  imageBaseUrl: config.imageBaseUrl || './media/',
  heroId: ids.has(config.heroId) ? config.heroId : catalog.works.at(-1).id,
  featuredIds: (config.featuredIds || []).filter(id => ids.has(id)),
  collectionCovers: Object.fromEntries(Object.entries(config.collectionCovers || {}).filter(([, id]) => ids.has(id))),
};
fs.writeFileSync(path.join(out, 'catalog.json'), JSON.stringify(data));
console.log(`Galería preparada: ${catalog.works.length} obras, ${images.size} imágenes. Salida: ${out}`);
