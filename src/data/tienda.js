// Tienda: every product, its price and what each pack contains. Prices live only here.
// Price ladder: the Manual is the most expensive single item; every pack is clearly cheaper than its parts;
// Curso Teórico (359.000, in coursesData) sits above Pack Total because it adds tutoring.
// TODO(precios): proposed by Claude on 2026-10-27, pending Felipe's confirmation.
import { BOOKS_COLLECTION } from './booksData';
import TOMOS_DATA from './tomosCatalog.json';

export const PRICES = {
  tomo: 29990,
  clases: 24990,
  gordo: 14990,
  repaso: 12990,
  atlas: 12990,
  perfil: 9990,
  anki: 9990,
  rec: 9990,
  banco: 9990,
  bancoCompleto: 49990,
  especialidad: 99990,
};
// Bigger specialties cost more as a pack.
const PACK_PRICE_BY_KEY = { cardiologia: 129990 };

// What each kind of product is for. Shown in the store so buyers see these are different books.
export const TYPES = {
  tomo: { short: 'Manual', name: 'Manual', blurb: 'La teoría completa de la especialidad.', bullets: ['Todo el Perfil V3 de la especialidad', 'Algoritmos, tablas y perlas EUNACOM', 'Fotos clínicas en contexto'] },
  clases: { short: 'Clases', name: 'Clases en video', blurb: 'Una clase por tema, con casos tipo examen.', bullets: ['Clases de 6 a 20 minutos', 'Diapositivas animadas y anatomía real', 'Casos clínicos EUNACOM al final'] },
  gordo: { short: '90 preguntas', name: 'Libro Gordo · 90 preguntas', blurb: 'Práctica tipo examen con explicación.', bullets: ['90 preguntas por especialidad', 'Clave y explicación de cada una', 'Código del Perfil V3 en cada pregunta'] },
  repaso: { short: 'Repaso Final', name: 'Repaso Final', blurb: 'Un tema por página para la última semana.', bullets: ['Lo que más se pregunta', 'Plan de repaso de 7 días', 'Ideal la semana antes del examen'] },
  perfil: { short: 'Perfil V3', name: 'Perfil V3 código por código', blurb: 'Cada código del Perfil explicado.', bullets: ['Qué nivel exige el examen', 'Dónde está en los libros', 'Resumen y una pregunta por código'] },
  atlas: { short: 'Atlas', name: 'Atlas de imágenes', blurb: 'Lo que tienes que ver en cada foto.', bullets: ['ECG, radiografías, fotos clínicas', 'Hallazgos marcados y comentados', 'Qué hacer después de verla'] },
  anki: { short: 'Anki', name: 'Mazo Anki', blurb: 'Repetición espaciada con los códigos del Perfil.', bullets: ['Tarjetas estilo AnKing', 'Etiquetadas por código', 'Para estudiar en el celular'] },
};

export const CLP_PER_USD = 920;
export const fmtClp = n => `$${Math.round(n).toLocaleString('es-CL')}`;
export const fmtUsd = n => `≈ US$ ${Math.round(n / CLP_PER_USD)}`;

export const MODULES = [
  { id: 1, name: 'Medicina Interna', match: 'Medicina Interna' },
  { id: 2, name: 'Cirugía y especialidades', match: 'Cirugía' },
  { id: 3, name: 'Materno-infantil', match: 'Materno' },
  { id: 4, name: 'Salud Pública', match: 'Salud Pública' },
];

// One row per specialty, with the products that really exist for it.
export const SPECIALTIES = BOOKS_COLLECTION.map(b => {
  const t = TOMOS_DATA.tomos[b.key];
  const items = [
    { type: 'tomo', label: `Manual (${t.pages} págs.)` },
    t.clases && { type: 'clases', label: `${t.clases} clases en video` },
    t.preguntas && { type: 'gordo', label: `${t.preguntas} preguntas tipo examen` },
    t.repaso && { type: 'repaso', label: 'Repaso Final' },
    t.guiaV3 && { type: 'perfil', label: 'Perfil V3 código por código' },
    t.atlas && { type: 'atlas', label: 'Atlas de imágenes' },
    t.anki && { type: 'anki', label: 'Mazo Anki' },
  ].filter(Boolean).map(i => ({ ...i, sku: `${i.type}-${b.key}`, price: PRICES[i.type], cover: t.covers[i.type] || (i.type === 'anki' ? '/covers/anki.jpg' : null) }));
  return {
    key: b.key, n: b.ch, title: b.title, sub: b.sub, color: b.color, cover: t.cover,
    module: MODULES.find(m => b.module.includes(m.match)).id,
    pages: t.pages, // real page count of the manual PDF (scripts/export-tomos.mjs)
    items,
    pack: { sku: `esp-${b.key}`, price: PACK_PRICE_BY_KEY[b.key] || PRICES.especialidad, includes: [...items.map(i => i.sku), `banco-${b.key}`] },
  };
});

// The 21 manuals by module, with real page counts (shown when someone opens «Los 21 Manuales AEE»).
export const MANUALES_POR_MODULO = MODULES.map(m => {
  const specs = SPECIALTIES.filter(s => s.module === m.id);
  return { ...m, specs: specs.map(s => ({ title: s.title, pages: s.pages })), pages: specs.reduce((n, s) => n + s.pages, 0) };
});
export const MANUALES_PAGINAS = MANUALES_POR_MODULO.reduce((n, m) => n + m.pages, 0);
const fmtN = n => n.toLocaleString('es-CL');

const REC_LIST = [
  ['JUL', 2013], ['JUL', 2015], ['JUL', 2016], ['JUL', 2017], ['DIC', 2017], ['JUL', 2018], ['DIC', 2018], ['JUL', 2019],
  ['DIC', 2019], ['AGO', 2021], ['', 2022], ['ENE', 2023], ['JUL', 2024], ['DIC', 2024], ['JUL', 2025], ['DIC', 2025],
];
export const RECONS = REC_LIST.map(([month, year]) => ({
  sku: `rec-${month}${year}`, month, year, questions: 180, price: PRICES.rec,
  name: `Reconstrucción ${month ? month[0] + month.slice(1).toLowerCase() + ' ' : ''}${year}`,
}));

const all = type => SPECIALTIES.flatMap(s => s.items.filter(i => i.type === type).map(i => i.sku));
const cov = n => SPECIALTIES[n - 1].cover;

// Collection packs, biggest first. `includes` lists every single SKU the pack unlocks.
export const PACKS = [
  {
    sku: 'pack-total', name: 'Pack Total EUNACOM', price: 299990, star: true,
    desc: 'Todo junto: los 21 manuales, las 468 clases y todos los libros de preguntas y repaso.',
    covers: [cov(1), '/covers/q_repaso.jpg', '/covers/q_atlas.jpg', '/covers/q_gordo.jpg', '/covers/q_recons.jpg'],
    features: ['468 clases en video (96 horas)', 'Banco completo: más de 10.800 preguntas', `Los 21 manuales AEE (${fmtN(MANUALES_PAGINAS)} páginas)`, '21 Repaso Final + 19 Atlas de imágenes + 21 mazos Anki', '1.890 preguntas tipo examen (Libros Gordos)', 'Perfil V3 código por código', '16 reconstrucciones 2013–2025'],
    includes: [...all('tomo'), ...all('clases'), ...all('gordo'), ...all('repaso'), ...all('perfil'), ...all('atlas'), ...all('anki'), ...RECONS.map(r => r.sku), 'gran-gordo', 'gran-recons', 'perfil-completo', ...SPECIALTIES.map(s => `banco-${s.key}`)],
  },
  {
    sku: 'biblioteca', name: 'Biblioteca completa', price: 199990, best: true,
    desc: 'Todos los libros: teoría, repaso, imágenes, Anki y todas las preguntas.',
    covers: [cov(1), '/covers/q_repaso.jpg', '/covers/q_atlas.jpg', '/covers/q_gordo.jpg', '/covers/q_perfil.jpg'],
    features: [`Los 21 manuales AEE (${fmtN(MANUALES_PAGINAS)} páginas)`, '21 libros Repaso Final', '19 Atlas de imágenes', '21 mazos Anki', 'Gran Libro Gordo + 21 Libros Gordos (1.890 preguntas)', 'Perfil V3 código por código', 'Gran Libro de Reconstrucciones 2013–2025'],
    includes: [...all('tomo'), ...all('gordo'), ...all('repaso'), ...all('perfil'), ...all('atlas'), ...all('anki'), ...RECONS.map(r => r.sku), 'gran-gordo', 'gran-recons', 'perfil-completo'],
  },
  {
    sku: 'pack-tomos', name: 'Los 21 Manuales AEE', price: 149990,
    desc: 'Toda la teoría del Perfil V3, especialidad por especialidad.',
    covers: [1, 5, 8, 11, 18].map(cov),
    features: [`Los 21 manuales: 4 módulos, ${fmtN(MANUALES_PAGINAS)} páginas`, 'Algoritmos, tablas y perlas EUNACOM', 'Actualizados 2026'],
    includes: all('tomo'),
  },
];

// Smaller collections: one of each product type, all specialties.
export const COLLECTIONS = [
  { sku: 'pack-clases', name: 'Las 468 clases en video', price: 199990, cover: cov(1), video: true, desc: 'El Aula completa: 21 especialidades, 96 horas.', includes: all('clases') },
  { sku: 'pack-repasos', name: '21 Repaso Final', price: 79990, cover: '/covers/q_repaso.jpg', desc: 'Un libro de repaso de última hora por especialidad.', includes: all('repaso') },
  { sku: 'pack-atlas', name: '19 Atlas de imágenes', price: 69990, cover: '/covers/q_atlas.jpg', desc: '1.144 imágenes comentadas: ECG, radiografías, fondo de ojo, piel.', includes: all('atlas') },
  { sku: 'pack-anki', name: '21 mazos Anki', price: 49990, cover: '/covers/anki.jpg', desc: 'Tarjetas estilo AnKing con los códigos del Perfil V3.', includes: all('anki') },
  { sku: 'pack-gordos', name: 'Gran Libro Gordo + 21 Libros Gordos', price: 79990, cover: '/covers/q_gordo.jpg', desc: '1.890 preguntas tipo examen, 90 por especialidad.', includes: [...all('gordo'), 'gran-gordo'] },
  { sku: 'pack-perfil', name: 'Perfil V3 código por código', price: 49990, cover: '/covers/q_perfil.jpg', desc: 'Los 1.569 códigos del Perfil V3 explicados.', includes: [...all('perfil'), 'perfil-completo'] },
  { sku: 'pack-recons', name: 'Gran Libro de Reconstrucciones', price: 59990, cover: '/covers/q_recons.jpg', desc: 'Los 16 EUNACOM desde 2013, pregunta por pregunta.', includes: [...RECONS.map(r => r.sku), 'gran-recons'] },
];

export const MODULE_PACKS = [
  { sku: 'mod-1', module: 1, name: 'Módulo 1 entero · Medicina Interna', price: 249990 },
  { sku: 'mod-2', module: 2, name: 'Módulo 2 entero · Cirugía y especialidades', price: 199990 },
  { sku: 'mod-3', module: 3, name: 'Módulo 3 entero · Materno-infantil', price: 149990 },
].map(m => {
  const specs = SPECIALTIES.filter(s => s.module === m.module);
  return { ...m, specs, includes: specs.flatMap(s => s.pack.includes), clases: specs.reduce((n, s) => n + (s.items.find(i => i.type === 'clases') ? TOMOS_DATA.tomos[s.key].clases : 0), 0) };
});

// ── Question bank (online, inside the account) ───────────────────────────────
// Per specialty: eunacomapp bank questions + real EUNACOM questions (reconstructions) + its 90 Libro Gordo questions.
// ~1,900 bank questions still sit in mixed buckets ("Medicina Interna", "Pediatría y Ginecología", "Especialidades")
// and get added once they're re-sorted by Perfil V3 code, so the numbers are shown as "más de N".
const BANK_COUNTS = {
  cardiologia: [321, 455], infectologia: [292, 313], gastroenterologia: [346, 245], neumologia: [216, 358],
  nefrologia: [216, 224], diabetes: [0, 181], endocrinologia: [434, 240], hematologia: [259, 148],
  reumatologia: [132, 161], neurologia: [207, 192], cirugia: [288, 114], traumatologia: [93, 107],
  urologia: [23, 79], otorrino: [20, 82], oftalmologia: [153, 117], dermatologia: [187, 94],
  psiquiatria: [161, 425], pediatria: [418, 222], obstetricia: [132, 137], ginecologia: [190, 136], saludpublica: [142, 170],
};
export const BANK = {
  total: 10890, exams: 16, examQuestions: 2901,
  specialties: SPECIALTIES.map(s => {
    const [bank, real] = BANK_COUNTS[s.key];
    return { key: s.key, title: s.title, color: s.color, cover: s.cover, sku: `banco-${s.key}`, price: PRICES.banco, total: bank + real + 90, real };
  }),
};

const TYPE_NAMES = Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [k, v.short]));

// sku → { name, price, includes, cover }
export const PRODUCTS = Object.fromEntries([
  ...PACKS.map(p => [p.sku, { name: p.name, price: p.price, includes: p.includes, cover: p.covers[0] }]),
  ...COLLECTIONS.map(c => [c.sku, { name: c.name, price: c.price, includes: c.includes, cover: c.cover }]),
  ...MODULE_PACKS.map(m => [m.sku, { name: m.name, price: m.price, includes: m.includes, cover: m.specs[0].cover }]),
  ...SPECIALTIES.map(s => [s.pack.sku, { name: `Pack ${s.title}`, price: s.pack.price, includes: s.pack.includes, cover: s.cover }]),
  ...SPECIALTIES.flatMap(s => s.items.map(i => [i.sku, { name: `${TYPE_NAMES[i.type]} · ${s.title}`, price: i.price, includes: [i.sku], cover: s.cover }])),
  ...RECONS.map(r => [r.sku, { name: r.name, price: r.price, includes: [r.sku], cover: null }]),
  ...BANK.specialties.map(b => [b.sku, { name: `Banco de preguntas · ${b.title}`, price: b.price, includes: [b.sku], cover: b.cover }]),
  ['banco-completo', { name: 'Banco de preguntas completo', price: PRICES.bancoCompleto, includes: [...BANK.specialties.map(b => b.sku), ...RECONS.map(r => r.sku)], cover: '/covers/q_gordo.jpg' }],
]);

// What a pack is compared against to show the saving: the next level down (collections for the big packs,
// specialty packs for a module, single items for everything else). Comparing against ~150 single items made
// the crossed-out prices unbelievable.
const COMPARE = {
  'pack-total': ['pack-tomos', ...COLLECTIONS.map(c => c.sku)],
  biblioteca: ['pack-tomos', ...COLLECTIONS.filter(c => c.sku !== 'pack-clases').map(c => c.sku)],
  ...Object.fromEntries(MODULE_PACKS.map(m => [m.sku, m.specs.map(s => s.pack.sku)])),
};
export const looseValue = sku => (COMPARE[sku] || PRODUCTS[sku].includes).reduce((n, i) => n + (PRODUCTS[i]?.price || 0), 0);
