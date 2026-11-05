// Builds public/banco/muestra.json: the free preview of the question bank (#banco).
// Only a small sample per specialty goes public; the full bank stays behind the purchase.
//   - Libro Gordo: books/dist/_datos_ensayos_90Q/ENSAYO_90Q_<ESP>.json (eunacom-fotos)
//   - Reconstrucciones: books/data/app_reconstrucciones/topic_index.json (+ index.json for exam names)
// Run: node scripts/export-bank-sample.mjs [path/to/eunacom-fotos]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const HUB = path.resolve(process.argv[2] || path.join(ROOT, '..', 'eunacom-fotos'));
const PER_SOURCE = 4;

const RECON_SUBJECT = {
  cardiologia: 'Cardiología', psiquiatria: 'Psiquiatría', neumologia: 'Enfermedades Respiratorias', infectologia: 'Enfermedades Infecciosas',
  obstetricia: 'Obstetricia y Ginecología', ginecologia: 'Obstetricia y Ginecología', gastroenterologia: 'Gastroenterología',
  endocrinologia: 'Endocrinología', nefrologia: 'Nefrología', pediatria: 'Pediatría', neurologia: 'Neurología', diabetes: 'Diabetes y Nutrición',
  saludpublica: 'Salud Pública', reumatologia: 'Reumatología', hematologia: 'Hematología / Oncología', oftalmologia: 'Oftalmología',
  cirugia: 'Cirugía', traumatologia: 'Traumatología', dermatologia: 'Dermatología', otorrino: 'ORL', urologia: 'Urología',
};
const GORDO_FILE = {};

// n items spread evenly over the list (deterministic), skipping a fixed offset per specialty.
const spread = (list, n, offset = 0) => list.length <= n ? list : Array.from({ length: n }, (_, i) => list[(Math.floor((i * list.length) / n) + offset) % list.length]);

const reconDir = path.join(HUB, 'books', 'data', 'app_reconstrucciones');
const exams = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(reconDir, 'index.json'), 'utf8')).exams.map(e => [e.id, e.name]));
const topics = JSON.parse(fs.readFileSync(path.join(reconDir, 'topic_index.json'), 'utf8'));
const gordoDir = path.join(HUB, 'books', 'dist', '_datos_ensayos_90Q');

const out = {};
Object.entries(RECON_SUBJECT).forEach(([key, subject], k) => {
  const qs = [];
  const gf = path.join(gordoDir, `ENSAYO_90Q_${GORDO_FILE[key] || key.toUpperCase()}.json`);
  if (fs.existsSync(gf)) {
    const good = JSON.parse(fs.readFileSync(gf, 'utf8')).filter(q => q.correcta && q.explicacion?.length > 60);
    spread(good, PER_SOURCE).forEach(q => qs.push({
      source: 'gordo', topic: q.topicTitle, code: q.perfilCode, stem: q.stem,
      options: q.options.map(o => o.text), correct: q.options.findIndex(o => o.id === q.correcta), why: q.explicacion,
    }));
  }
  const s = topics.find(t => t.subject === subject);
  const pool = s ? s.topics.flatMap(t => t.subtopics.flatMap(st => st.questions.map(q => ({ ...q, topic: t.name })))) : [];
  const good = pool.filter(q => !q.revisar && q.correctAnswer && q.explanation?.length > 60 && !/\bimagen\b/i.test(q.question));
  spread(good, PER_SOURCE, k * 7).forEach(q => qs.push({
    source: 'real', exam: exams[q.id.split('_q')[0]], topic: q.topic, stem: q.question,
    options: q.choices.map(c => c.text), correct: q.choices.findIndex(c => c.id.toLowerCase() === String(q.correctAnswer).toLowerCase()), why: q.explanation,
  }));
  out[key] = qs.filter(q => q.correct >= 0);
});

fs.mkdirSync(path.join(ROOT, 'public', 'banco'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'public', 'banco', 'muestra.json'), JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => `${k}: ${v.length}`).join(' · '));
