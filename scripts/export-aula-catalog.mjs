// Builds public/aula/catalog.json for the Aula (course) view from the publishing hub:
//   - class list, titles and chapters: classes/decks/Reproductor_Suiza_Oficial.html (build_swiss_player.cjs)
//   - which classes have a video on R2:  classes/scripts/jsvideo/out/r2_subidos.txt (Clases_V3/<esp>/<id>.mp4)
// Run after rebuilding the player or uploading new videos:
//   node scripts/export-aula-catalog.mjs [path/to/eunacom-fotos]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const HUB = path.resolve(process.argv[2] || path.join(ROOT, '..', 'eunacom-fotos'));
const R2_PUBLIC = 'https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev';

const MODULES = [
  { id: 'm1', name: 'Módulo 1 · Medicina Interna', specialties: ['Cardiología', 'Gastroenterología', 'Neumología', 'Nefrología', 'Diabetes y Dislipidemias', 'Endocrinología', 'Hematología', 'Infectología', 'Reumatología', 'Neurología y Geriatría'] },
  { id: 'm2', name: 'Módulo 2 · Cirugía y Especialidades', specialties: ['Cirugía General', 'Traumatología', 'Urología', 'Otorrinolaringología', 'Oftalmología', 'Dermatología', 'Psiquiatría'] },
  { id: 'm3', name: 'Módulo 3 · Materno-Infantil', specialties: ['Pediatría', 'Obstetricia', 'Ginecología'] },
  { id: 'm4', name: 'Módulo 4 · Salud Pública', specialties: ['Salud Pública'] },
];

const html = fs.readFileSync(path.join(HUB, 'classes', 'decks', 'Reproductor_Suiza_Oficial.html'), 'utf8');
const CLASSES = JSON.parse(html.match(/const CLASSES = (\[.*?\]);\n/s)[1]);

// id → R2 key, from the upload log ("<id>\t<bytes>\teunacomvideos/Clases_V3/<esp>/<id>.mp4")
const videos = {};
fs.readFileSync(path.join(HUB, 'classes', 'scripts', 'jsvideo', 'out', 'r2_subidos.txt'), 'utf8')
  .split('\n').filter(Boolean).forEach(line => {
    const [id, , key] = line.split('\t');
    if (id && key) videos[id] = key.replace(/^eunacomvideos\//, '');
  });

// Real video length (seconds), probed once per class from R2 and cached in scripts/aula-durations.json.
const DUR_FILE = path.join(ROOT, 'scripts', 'aula-durations.json');
const durations = fs.existsSync(DUR_FILE) ? JSON.parse(fs.readFileSync(DUR_FILE, 'utf8')) : {};
const probe = promisify(execFile);
const pending = Object.entries(videos).filter(([id]) => !durations[id]);
for (let i = 0; i < pending.length; i += 12) {
  await Promise.all(pending.slice(i, i + 12).map(async ([id, key]) => {
    try {
      const { stdout } = await probe('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `${R2_PUBLIC}/${key.split('/').map(encodeURIComponent).join('/')}`]);
      durations[id] = Math.round(Number(stdout));
    } catch { console.warn('sin duración:', id); }
  }));
}
fs.writeFileSync(DUR_FILE, JSON.stringify(durations, null, 0));

const known = new Set(MODULES.flatMap(m => m.specialties));
const lessonOf = c => {
  const [, num = '', title = c.title] = c.title.match(/^[^:]*?(\d+\.\d+):\s*(.*)$/) || [];
  const key = videos[c.id];
  const minutes = durations[c.id] ? Math.round(durations[c.id] / 60) : null;
  return {
    id: c.id, num, title, code: c.code || '', minutes,
    chapters: (c.chapters || []).map(ch => ch.name),
    video: key ? `${R2_PUBLIC}/${key.split('/').map(encodeURIComponent).join('/')}` : null,
  };
};

const bySpecialty = {};
CLASSES.forEach(c => {
  if (!known.has(c.specialty) || c.id.startsWith('cardio-v1-')) return; // induction deck and old cardio decks have no video
  (bySpecialty[c.specialty] ||= { name: c.specialty, accent: c.accent, lessons: [] }).lessons.push(lessonOf(c));
});

const catalog = {
  generated: new Date().toISOString(),
  modules: MODULES.map(m => ({
    id: m.id, name: m.name,
    specialties: m.specialties.filter(s => bySpecialty[s]).map(s => bySpecialty[s]),
  })),
};

const all = catalog.modules.flatMap(m => m.specialties.flatMap(s => s.lessons));
fs.mkdirSync(path.join(ROOT, 'public', 'aula'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'public', 'aula', 'catalog.json'), JSON.stringify(catalog));
console.log(`${all.length} clases, ${all.filter(l => l.video).length} con video`);
const missing = all.filter(l => !l.video).map(l => l.id);
if (missing.length) console.log('Sin video:', missing.join(' '));
