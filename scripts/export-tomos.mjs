// Builds src/data/tomosCatalog.json (real per-tomo numbers) and public/covers/*.jpg (page 1 of each PDF)
// from the publishing hub's books/dist and the Aula catalog. Needs pdftoppm + pdfinfo (poppler).
//   node scripts/export-tomos.mjs [path/to/eunacom-fotos]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const HUB = path.resolve(process.argv[2] || path.join(ROOT, '..', 'eunacom-fotos'));
const DIST = path.join(HUB, 'books', 'dist');
const COVERS = path.join(ROOT, 'public', 'covers');
fs.mkdirSync(COVERS, { recursive: true });

// booksData key → [Aula specialty, file-name stem used in books/dist]
const TOMOS = {
  cardiologia: ['Cardiología', 'Cardiologia'], infectologia: ['Infectología', 'Infectologia'],
  gastroenterologia: ['Gastroenterología', 'Gastroenterologia'], neumologia: ['Neumología', 'Respiratorio'],
  nefrologia: ['Nefrología', 'Nefrologia'], diabetes: ['Diabetes y Dislipidemias', 'Diabetes'],
  endocrinologia: ['Endocrinología', 'Endocrinologia'], hematologia: ['Hematología', 'Hematologia'],
  reumatologia: ['Reumatología', 'Reumatologia'], neurologia: ['Neurología y Geriatría', 'Neurologia'],
  cirugia: ['Cirugía General', 'Cirugia'], traumatologia: ['Traumatología', 'Traumatologia'],
  urologia: ['Urología', 'Urologia'], otorrino: ['Otorrinolaringología', 'Otorrinolaringologia'],
  oftalmologia: ['Oftalmología', 'Oftalmologia'], dermatologia: ['Dermatología', 'Dermatologia'],
  psiquiatria: ['Psiquiatría', 'Psiquiatria'], pediatria: ['Pediatría', 'Pediatria'],
  obstetricia: ['Obstetricia', 'Obstetricia'], ginecologia: ['Ginecología', 'Ginecologia'],
  saludpublica: ['Salud Pública', 'SaludPublica'],
};

const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(DIST).filter(f => f.endsWith('.pdf'));
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const find = (folder, stem) => files.find(f => f.includes(`/${folder}/`) && norm(path.basename(f)).includes(norm(stem)));
const pages = f => Number(execFileSync('pdfinfo', [f]).toString().match(/Pages:\s+(\d+)/)[1]);
const cover = (f, name) => {
  const out = path.join(COVERS, name);
  if (!fs.existsSync(`${out}.jpg`)) execFileSync('pdftoppm', ['-f', '1', '-l', '1', '-r', '100', '-jpeg', '-jpegopt', 'quality=82', '-singlefile', f, out]);
  return `/covers/${name}.jpg`;
};

// A still from the specialty's first class video (16:9), taken 40 s in.
function frame(url, name) {
  const out = path.join(COVERS, `${name}.jpg`);
  if (!fs.existsSync(out)) execFileSync('ffmpeg', ['-loglevel', 'error', '-ss', '40', '-i', url, '-frames:v', '1', '-vf', 'scale=640:-2', '-q:v', '4', out]);
  return `/covers/${name}.jpg`;
}

// Perfil V3 guide per specialty (some guides cover two specialties).
const PERFIL = {
  cardiologia: 'Cardiología', infectologia: 'Enfermedades_Infecciosas', gastroenterologia: 'Gastroenterología', neumologia: 'Enfermedades_Respiratorias',
  nefrologia: 'Nefrología', diabetes: 'Diabetes_y_Nutrición', endocrinologia: 'Endocrinología', hematologia: 'Hemato-oncología',
  reumatologia: 'Reumatología', neurologia: 'Neurología', cirugia: 'Cirugía_General', traumatologia: 'Traumatología', urologia: 'Urología',
  otorrino: 'Otorrinolaringología', oftalmologia: 'Oftalmología', dermatologia: 'Dermatología', psiquiatria: 'Psiquiatría',
  pediatria: 'Pediatría', obstetricia: 'Obstetricia_y_Ginecología', ginecologia: 'Obstetricia_y_Ginecología', saludpublica: 'Salud_Pública',
};
const rel = f => f && path.relative(DIST, f);

const aula = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'aula', 'catalog.json'), 'utf8'));
const classCount = Object.fromEntries(aula.modules.flatMap(m => m.specialties.map(s => [s.name, s.lessons.length])));

const tomos = {};
for (const [key, [specialty, stem]] of Object.entries(TOMOS)) {
  const tomo = find('01_Tomos', stem.replace('Cirugia', 'Cirugia_General').replace('SaludPublica', 'Salud_Publica'));
  const gordo = find('02_Libros_Gordos_90Q', `Libro_Gordo_${stem}`);
  const repaso = find('05_Repaso_Final', `Repaso_Final_${stem}`);
  const atlas = find('06_Atlas', `Atlas_Imagenes_${stem}`);
  const firstClass = aula.modules.flatMap(m => m.specialties).find(s => s.name === specialty)?.lessons.find(l => l.video);
  tomos[key] = {
    cover: cover(tomo, `tomo_${key}`),
    pages: pages(tomo),
    clases: classCount[specialty] || 0,
    preguntas: gordo ? 90 : 0,
    repaso: !!repaso,
    guiaV3: true,
    atlas: !!atlas,
    anki: walk(path.join(DIST, '07_Anki')).some(f => f.endsWith('.apkg') && [stem, key].some(k => norm(path.basename(f)).includes(norm(k).slice(0, 7)))),
    // Book files inside books/dist (served to owners from the private bucket, key libros/<path>).
    files: {
      tomo: rel(tomo), gordo: rel(gordo), repaso: rel(repaso), atlas: rel(atlas),
      perfil: rel(find('04_Perfil_V3_Codigo_por_Codigo', `Perfil_V3_Codigo_por_Codigo_${PERFIL[key]}`)),
      anki: rel(walk(path.join(DIST, '07_Anki')).find(f => f.endsWith('.apkg') && [stem, key].some(k => norm(path.basename(f)).includes(norm(k).slice(0, 7))))),
    },
    // Each book has its own cover, so buyers see they are different books on the same topic.
    covers: {
      tomo: `/covers/tomo_${key}.jpg`,
      gordo: gordo && cover(gordo, `gordo_${key}`),
      repaso: repaso && cover(repaso, `repaso_${key}`),
      atlas: atlas && cover(atlas, `atlas_${key}`),
      perfil: `/covers/perfil_${key}.jpg`,
      clases: firstClass && frame(firstClass.video, `clase_${key}`),
    },
  };
}

// Collection-wide books
const extra = [
  ['gran-libro-gordo', '02_Libros_Gordos_90Q', 'El_Gran_Libro_Gordo_EUNACOM_1890Q_Actualizado'],
  ['reconstrucciones', '03_Reconstrucciones', 'El_Gran_Libro_EUNACOM_Reconstrucciones'],
  ['perfil-v3-completo', '04_Perfil_V3_Codigo_por_Codigo', 'Perfil_V3_Codigo_por_Codigo_Completo'],
].map(([id, folder, stem]) => {
  const f = find(folder, stem);
  return [id, { cover: cover(f, id), pages: pages(f), file: rel(f) }];
});

fs.writeFileSync(path.join(ROOT, 'src', 'data', 'tomosCatalog.json'), JSON.stringify({ tomos, extras: Object.fromEntries(extra) }, null, 1));
console.log(Object.entries(tomos).map(([k, t]) => `${k}: ${t.clases} clases, ${t.pages} págs, 90Q ${t.preguntas}, atlas ${t.atlas}, anki ${t.anki}`).join('\n'));
console.log(Object.fromEntries(extra));
