// Writes api/_catalog.json: the server's own copy of every SKU (name, CLP price, what it unlocks) and the book
// files each SKU gives access to. Payments are created from THIS file, never from a price sent by the browser.
// Run after changing src/data/tienda.js, src/data/coursesData.js or the book files:
//   node scripts/export-server-catalog.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const vite = await createServer({ root: ROOT, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { PRODUCTS, SPECIALTIES } = await vite.ssrLoadModule('/src/data/tienda.js');
const { COURSES } = await vite.ssrLoadModule('/src/data/coursesData.js');
const tomos = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/tomosCatalog.json'), 'utf8'));
await vite.close();

const products = Object.fromEntries(Object.entries(PRODUCTS).map(([sku, p]) => [sku, { name: p.name, price: p.price, includes: p.includes }]));

// The full course unlocks everything Pack Total does (plus tutoring, handled by the team).
for (const c of COURSES) {
  products[`curso-${c.slug}`] = { name: c.nombre, price: Number(String(c.precioClp).replace(/\D/g, '')), includes: products['pack-total'].includes };
}

// Item SKU → readable files (path inside books/dist; stored in the private bucket as libros/<path>).
const LABEL = { tomo: 'Manual', gordo: 'Libro Gordo · 90 preguntas', repaso: 'Repaso Final', atlas: 'Atlas de imágenes', perfil: 'Perfil V3 código por código', anki: 'Mazo Anki' };
const files = {};
for (const s of SPECIALTIES) {
  const f = tomos.tomos[s.key].files;
  for (const type of Object.keys(LABEL)) if (f[type]) files[`${type}-${s.key}`] = [{ label: `${LABEL[type]} · ${s.title}`, file: f[type], download: type === 'anki' }];
}
files['gran-gordo'] = [{ label: 'El Gran Libro Gordo', file: tomos.extras['gran-libro-gordo'].file }];
files['gran-recons'] = [{ label: 'Reconstrucciones 2013–2025', file: tomos.extras.reconstrucciones.file }];
files['perfil-completo'] = [{ label: 'Perfil V3 completo', file: tomos.extras['perfil-v3-completo'].file }];

fs.writeFileSync(path.join(ROOT, 'api', '_catalog.json'), JSON.stringify({ products, files }));
console.log(`${Object.keys(products).length} SKUs, ${Object.keys(files).length} readable items`);
