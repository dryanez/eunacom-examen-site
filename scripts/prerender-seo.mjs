// SEO prerender: after `vite build`, writes real HTML pages (readable without JavaScript) for the
// content that only existed behind #hash views, plus sitemap.xml and llms.txt. The SPA is untouched:
// every page links back into it (/#tienda, /#curso-teorico…) to buy or study.
//
// Pages: /blog, /blog/<slug>, /curso-eunacom, /manuales-eunacom, /banco-de-preguntas-eunacom,
// /preguntas-eunacom/<especialidad> (free sample questions from public/banco/muestra.json),
// /preguntas-frecuentes. Data comes from src/data (loaded through Vite so its imports resolve).
import { createServer } from 'vite';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://eunacom-examen.cl';
const TODAY = new Date().toISOString().slice(0, 10);
const WHATSAPP = '+56976694606';
const SAME_AS = ['https://www.instagram.com/academiaeunacom/', 'https://www.youtube.com/@academiaeunacom'];
const ORG_ID = `${SITE}/#organizacion`;

const vite = await createServer({ root: ROOT, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
const load = p => vite.ssrLoadModule(p);
const { BLOG_ARTICLES } = await load('/src/data/blogArticlesData.js');
const { GENERAL_FAQS } = await load('/src/data/faqsData.js');
const { COURSES } = await load('/src/data/coursesData.js');
const T = await load('/src/data/tienda.js');
const { BRAND } = await load('/src/site.config.js');
await vite.close();
const MUESTRA = JSON.parse(readFileSync(join(ROOT, 'public/banco/muestra.json'), 'utf8'));

// ── helpers ──────────────────────────────────────────────────────────────────
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const clp = n => `$${Math.round(n).toLocaleString('es-CL')}`;
const N = n => n.toLocaleString('es-CL');
const MESES = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 };
const isoDate = s => { const m = /(\d+)\s+([a-záéíóú]+),?\s+(\d{4})/i.exec(s || ''); return m ? `${m[3]}-${String(MESES[m[2].toLowerCase()]).padStart(2, '0')}-${m[1].padStart(2, '0')}` : TODAY; };
const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
const LETTERS = 'ABCDE';
const fit = t => (t.length > 60 && t.endsWith(' | AEE') ? t.slice(0, -6) : t);
// SEO titles for the blog (the headlines are too long for a <title>), aimed at what people search.
const BLOG_TITLES = {
  'cardiologia-eunacom-claves': 'Cardiología EUNACOM: los 5 temas que más se preguntan',
  'como-estudiar-teorico': 'Cómo estudiar para el EUNACOM Teórico: plan paso a paso',
  'errores-comunes-eunacom': '8 errores comunes al preparar el EUNACOM',
  'eunacom-st-vs-eunacom-sp': 'EUNACOM ST vs SP: diferencias entre Teórico y Práctico',
  'fechas-eunacom-2027': 'Fechas EUNACOM 2026–2027: inscripción y plazos',
  'perfil-y-puntajes': 'Puntaje de corte EUNACOM: cuánto necesitas para aprobar',
  'practico-ecoe': 'EUNACOM Práctico (ECOE): estaciones, pautas y cómo prepararlo',
  'revalidacion-titulo-medico-chile': 'Cómo revalidar el título de médico en Chile (2026–2027)',
  'salud-publica-ges-guia': 'Salud Pública y GES para el EUNACOM: guía de estudio',
  'sedes-y-logistica': 'Sedes y logística del día del examen EUNACOM',
  'trabajar-como-medico-en-chile': 'Trabajar como médico en Chile: FONASA, sistema público y privado',
};
// Titles: whole headline when it fits, else the part before ':' if it says enough, else cut at a word.
const shortTitle = t => t.length <= 62 ? t : (t.split(':')[0].length >= 30 ? t.split(':')[0] : t.slice(0, 62).replace(/\s+\S*$/, '').replace(/[,:;\-\s]+$/, ''));

const pages = []; // { path, lastmod, priority }

const CSS = `*{box-sizing:border-box}body{margin:0;font:16px/1.65 'Open Sans',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1f2937;background:#f8fafc}
a{color:#0b5cad}header.top{background:#0b1f3a;color:#fff}header.top .in,main,footer .in{max-width:880px;margin:0 auto;padding:0 20px}
header.top .in{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;min-height:60px}header.top a{color:#fff;text-decoration:none;font-size:14px}
header.top .brand{font:800 17px Montserrat,system-ui,sans-serif;margin-right:auto}main{padding:28px 20px 48px;background:#fff;min-height:60vh}
h1,h2,h3{font-family:Montserrat,system-ui,sans-serif;line-height:1.25;color:#0b1f3a}h1{font-size:30px;margin:.2em 0 .5em}h2{font-size:22px;margin:1.6em 0 .5em}h3{font-size:18px}
.crumbs{font-size:13px;color:#64748b}.crumbs a{color:#64748b}.lead{font-size:18px;color:#334155}.meta{font-size:13px;color:#64748b}
.cta{display:inline-block;background:#e11d48;color:#fff!important;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px;margin:6px 8px 6px 0}
.cta.alt{background:#0b5cad}.box{background:#f1f5f9;border-radius:12px;padding:16px 20px;margin:18px 0}
table{width:100%;border-collapse:collapse;font-size:15px}td,th{border-bottom:1px solid #e2e8f0;padding:8px 6px;text-align:left;vertical-align:top}td.r,th.r{text-align:right;white-space:nowrap}
h2{font-size:22px}.q h2{font-size:18px;margin:.2em 0 .5em}.q{border:1px solid #e2e8f0;border-radius:12px;padding:14px 18px;margin:16px 0}.q ol{padding-left:22px}.q details{margin-top:8px}.q summary{cursor:pointer;font-weight:700;color:#0b5cad}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;padding:0;list-style:none}.grid li{background:#f1f5f9;border-radius:10px;padding:10px 14px}
footer{background:#0b1f3a;color:#cbd5e1;font-size:14px;padding:24px 0}footer a{color:#fff}`;

const NAV = [['/curso-eunacom', 'Curso'], ['/manuales-eunacom', 'Manuales'], ['/banco-de-preguntas-eunacom', 'Banco de preguntas'], ['/blog', 'Guías'], ['/preguntas-frecuentes', 'Preguntas frecuentes']];

function page({ path, title, description, h1, body, schema = [], crumbs = [], ogType = 'website', priority = 0.7, lastmod = TODAY }) {
  const url = `${SITE}${path}`;
  const bc = [['/', 'Inicio'], ...crumbs];
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: bc.map(([p, n], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: `${SITE}${p}` })) };
  const html = `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(fit(title))}</title>
<meta name="description" content="${esc(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<link rel="canonical" href="${url}" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta property="og:type" content="${ogType}" />
<meta property="og:site_name" content="${esc(BRAND.nombre)}" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${esc(fit(title))}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${SITE}/og-banner.jpg" />
<meta property="og:locale" content="es_CL" />
<meta name="twitter:card" content="summary_large_image" />
<style>${CSS}</style>
${[...schema, breadcrumb].map(ld).join('\n')}
</head>
<body>
<header class="top"><div class="in"><a class="brand" href="/">Academia Examen EUNACOM</a>${NAV.map(([p, n]) => `<a href="${p}">${n}</a>`).join('')}</div></header>
<main>
<nav class="crumbs" aria-label="Ruta">${bc.map(([p, n], i) => i < bc.length - 1 ? `<a href="${p}">${esc(n)}</a> › ` : esc(n)).join('')}</nav>
<h1>${esc(h1 || title)}</h1>
${body}
</main>
<footer><div class="in">
<p><b>${esc(BRAND.nombre)} (${esc(BRAND.sigla)})</b>: preparación online para el EUNACOM Teórico (ST) y Práctico (ECOE) en Chile. Clases en video, manuales por especialidad, banco de preguntas comentadas y reconstrucciones de exámenes.</p>
<p><a href="/">Inicio</a> · ${NAV.map(([p, n]) => `<a href="${p}">${n}</a>`).join(' · ')} · <a href="/#tienda">Tienda</a> · <a href="https://wa.me/56976694606">WhatsApp</a> · <a href="${SAME_AS[0]}">Instagram</a> · <a href="${SAME_AS[1]}">YouTube</a> · <a href="https://www.eunacomapp.cl">App EUNACOMapp</a></p>
<p>Información oficial del examen: <a href="https://www.eunacom.cl" rel="noopener">eunacom.cl (ASOFAMECH)</a>. <a href="/privacidad">Privacidad</a> · <a href="/terminos">Términos</a></p>
</div></footer>
</body>
</html>
`;
  const file = path.endsWith('/') ? join(DIST, path, 'index.html') : join(DIST, `${path}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  pages.push({ path, lastmod, priority });
}

const PUBLISHER = { '@type': 'EducationalOrganization', '@id': ORG_ID, name: BRAND.nombre, url: `${SITE}/`, logo: `${SITE}/logo.png` };
const offer = (price, path) => ({ '@type': 'Offer', price: String(price), priceCurrency: 'CLP', availability: 'https://schema.org/InStock', url: `${SITE}${path}` });

// ── Blog ─────────────────────────────────────────────────────────────────────
for (const a of BLOG_ARTICLES) {
  const path = `/blog/${a.slug}`;
  const date = isoDate(a.date);
  const body = `<p class="meta">${esc(a.cat)} · ${esc(a.author)} · <time datetime="${date}">${esc(a.date)}</time> · ${esc(a.readTime)}</p>
<p class="lead">${esc(a.excerpt)}</p>
${a.keyTakeaways?.length ? `<div class="box"><h2 style="margin-top:0">Lo clave</h2><ul>${a.keyTakeaways.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}
${a.sections.map(s => `<h2>${esc(s.h)}</h2>${(Array.isArray(s.p) ? s.p : [s.p]).map(p => `<p>${esc(p)}</p>`).join('')}`).join('\n')}
${a.faqs?.length ? `<h2>Preguntas frecuentes</h2>${a.faqs.map(f => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}` : ''}
<div class="box"><b>¿Te estás preparando para el EUNACOM?</b> Mira el <a href="/curso-eunacom">Curso Teórico EUNACOM</a>, practica gratis con <a href="/banco-de-preguntas-eunacom">preguntas por especialidad</a> o revisa los <a href="/manuales-eunacom">manuales</a>.<br/><a class="cta" href="/#curso-teorico">Ver el curso</a><a class="cta alt" href="/#tienda">Ir a la tienda</a></div>
<p class="meta">Fechas, requisitos y puntajes oficiales: confirma siempre en <a href="https://www.eunacom.cl">eunacom.cl</a>.</p>
<h2>Otras guías</h2><ul>${BLOG_ARTICLES.filter(b => b.slug !== a.slug).slice(0, 5).map(b => `<li><a href="/blog/${b.slug}">${esc(b.title)}</a></li>`).join('')}</ul>`;
  const schema = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.excerpt, datePublished: date, dateModified: date, inLanguage: 'es-CL', mainEntityOfPage: `${SITE}${path}`, image: `${SITE}/og-banner.jpg`, keywords: (a.keywords || []).join(', '), author: { '@type': 'Organization', name: a.author || BRAND.autor, url: `${SITE}/` }, publisher: PUBLISHER },
    a.faqs?.length && { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: a.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ].filter(Boolean);
  page({ path, title: `${BLOG_TITLES[a.slug] || shortTitle(a.title)} | AEE`, description: a.excerpt, h1: a.title, body, schema, crumbs: [['/blog', 'Guías EUNACOM'], [path, a.title]], ogType: 'article', priority: 0.7, lastmod: date });
}
page({
  path: '/blog', title: 'Guías EUNACOM 2026–2027: fechas, puntajes, ECOE y revalidación | AEE',
  description: 'Guías gratis del EUNACOM: fechas e inscripción, puntaje de corte, cómo estudiar el Teórico y el Práctico (ECOE) y cómo revalidar el título de médico en Chile.',
  h1: 'Guías EUNACOM', crumbs: [['/blog', 'Guías EUNACOM']], priority: 0.8,
  body: `<p class="lead">Todo lo que necesitas saber para rendir el EUNACOM, escrito por el equipo académico de AEE.</p><ul>${BLOG_ARTICLES.map(a => `<li><a href="/blog/${a.slug}"><b>${esc(a.title)}</b></a><br/><span class="meta">${esc(a.cat)} · ${esc(a.date)}</span><br/>${esc(a.excerpt)}</li>`).join('')}</ul>`,
});

// ── Curso ────────────────────────────────────────────────────────────────────
{
  const c = COURSES[0];
  const path = '/curso-eunacom';
  const body = `<p class="lead">${esc(c.resumen)}</p>
<div class="box"><b>Precio:</b> ${esc(c.precioClp)} CLP (${esc(c.precioUsd)}) · <b>Duración:</b> ${esc(c.duracion)} · <b>Modalidad:</b> ${esc(c.modalidad)} · <b>Examen:</b> ${esc(c.examen)}<br/><a class="cta" href="/#curso-teorico">Inscribirme</a><a class="cta alt" href="https://wa.me/56976694606">Preguntar por WhatsApp</a></div>
<h2>Qué incluye</h2><ul>${c.incluye.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
<h2>Cómo funciona</h2><ol>${c.comoFunciona.map(i => `<li>${esc(i)}</li>`).join('')}</ol>
<h2>Para quién es</h2><p>${esc(c.paraQuien)}</p>
<h2>Temario</h2><p>${esc(c.temarioNota)}</p><table>${c.temario.map(m => `<tr><th>${esc(m.s)}</th><td><b>${esc(m.t)}</b><br/>${esc(m.d)}</td></tr>`).join('')}</table>
<h2>¿Prefieres estudiar por tu cuenta?</h2><p>También puedes comprar por separado las <a href="/manuales-eunacom">clases, manuales y libros de preguntas</a> de cada especialidad, o el <a href="/banco-de-preguntas-eunacom">banco de preguntas</a>.</p>
<p><a class="cta" href="/#curso-teorico">Ver el curso y pagar</a></p>`;
  const schema = [{ '@context': 'https://schema.org', '@type': 'Course', name: c.nombre, description: c.resumen, inLanguage: 'es', url: `${SITE}${path}`, provider: PUBLISHER,
    offers: { ...offer(359000, path), category: 'Paid' },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: 'PT96H', startDate: '2026-09-14' },
    teaches: c.temario.map(m => m.t) }];
  page({ path, title: 'Curso EUNACOM online 2026–2027: 468 clases y simulacros | AEE', description: `Curso EUNACOM online: 468 clases en video (96 h), exámenes tipo EUNACOM con feedback, manuales PDF, simulacros de 180 preguntas. ${c.precioClp} CLP.`, h1: 'Curso EUNACOM online (Teórico ST)', body, schema, crumbs: [[path, 'Curso EUNACOM']], priority: 0.9 });
}

// ── Manuales / tienda ────────────────────────────────────────────────────────
{
  const path = '/manuales-eunacom';
  const row = (name, desc, price, href) => `<tr><td><b>${esc(name)}</b>${desc ? `<br/><span class="meta">${esc(desc)}</span>` : ''}</td><td class="r">${clp(price)}</td><td><a href="${href}">Comprar</a></td></tr>`;
  const body = `<p class="lead">Los 21 manuales AEE (${N(T.MANUALES_PAGINAS)} páginas) cubren todo el Perfil EUNACOM V3, especialidad por especialidad. Además: clases en video, Libros Gordos de preguntas, Repaso Final, Atlas de imágenes, mazos Anki y reconstrucciones de exámenes 2013–2025.</p>
<h2>Packs</h2><table><tr><th>Pack</th><th class="r">Precio (CLP)</th><th></th></tr>${[...T.PACKS, ...T.COLLECTIONS].map(p => row(p.name, p.desc, p.price, '/#tienda')).join('')}</table>
<h2>Por especialidad</h2><table><tr><th>Especialidad</th><th class="r">Pack completo</th><th></th></tr>${T.SPECIALTIES.map(s => row(s.title, `${s.sub}. Incluye: ${s.items.map(i => i.label).join(', ')}.`, s.pack.price, `/#tienda/${s.key}`)).join('')}</table>
<h2>Qué es cada libro</h2><ul>${Object.values(T.TYPES).map(t => `<li><b>${esc(t.name)}</b>: ${esc(t.blurb)} ${esc(t.bullets.join('. '))}.</li>`).join('')}</ul>
<p><a class="cta" href="/#tienda">Ir a la tienda</a></p>`;
  const items = [...T.PACKS, ...T.COLLECTIONS].map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Product', name: p.name, description: p.desc, image: p.covers?.[0] || p.cover ? `${SITE}${p.covers?.[0] || p.cover}` : `${SITE}/og-banner.jpg`, brand: { '@type': 'Brand', name: BRAND.nombre }, offers: offer(p.price, '/manuales-eunacom') } }));
  page({ path, title: 'Manuales EUNACOM por especialidad (Perfil V3) y libros de preguntas | AEE', description: `21 manuales EUNACOM (${N(T.MANUALES_PAGINAS)} páginas) del Perfil V3, 1.890 preguntas tipo examen, Atlas, Repaso Final, Anki y reconstrucciones 2013–2025. Precios en CLP.`, h1: 'Manuales y libros EUNACOM', body, schema: [{ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Manuales y packs EUNACOM', itemListElement: items }], crumbs: [[path, 'Manuales EUNACOM']], priority: 0.9 });
}

// ── Banco + preguntas por especialidad ──────────────────────────────────────
const specPages = T.SPECIALTIES.filter(s => MUESTRA[s.key]?.length).map(s => ({ s, slug: slugify(s.title), qs: MUESTRA[s.key], bank: T.BANK.specialties.find(b => b.key === s.key) }));
{
  const path = '/banco-de-preguntas-eunacom';
  const body = `<p class="lead">Más de ${N(T.BANK.total)} preguntas EUNACOM con explicación, separadas por especialidad, más ${T.BANK.exams} reconstrucciones de exámenes reales (${N(T.BANK.examQuestions)} preguntas). Practica gratis con preguntas de muestra de cada especialidad:</p>
<ul class="grid">${specPages.map(p => `<li><a href="/preguntas-eunacom/${p.slug}"><b>Preguntas EUNACOM de ${esc(p.s.title)}</b></a><br/><span class="meta">${p.qs.length} gratis · más de ${N(p.bank?.total || 0)} en el banco</span></li>`).join('')}</ul>
<h2>Precios</h2><table><tr><td>Banco de preguntas por especialidad</td><td class="r">${clp(T.PRICES.banco)}</td></tr><tr><td>Banco de preguntas completo (21 especialidades + reconstrucciones)</td><td class="r">${clp(T.PRICES.bancoCompleto)}</td></tr></table>
<p><a class="cta" href="/#banco">Practicar en el banco</a><a class="cta alt" href="/#tienda">Comprar acceso</a></p>`;
  page({ path, title: `Banco de preguntas EUNACOM: +${N(T.BANK.total)} preguntas comentadas | AEE`, description: `Preguntas EUNACOM por especialidad con explicación y código del Perfil V3, más ${T.BANK.exams} reconstrucciones de exámenes reales. Preguntas de muestra gratis.`, h1: 'Banco de preguntas EUNACOM', body, crumbs: [[path, 'Banco de preguntas']], priority: 0.9,
    schema: [{ '@context': 'https://schema.org', '@type': 'Product', name: 'Banco de preguntas EUNACOM completo', description: `Más de ${N(T.BANK.total)} preguntas EUNACOM comentadas por especialidad y ${T.BANK.exams} reconstrucciones de exámenes.`, image: `${SITE}/covers/q_gordo.jpg`, brand: { '@type': 'Brand', name: BRAND.nombre }, offers: offer(T.PRICES.bancoCompleto, path) }] });
}
for (const { s, slug, qs, bank } of specPages) {
  const path = `/preguntas-eunacom/${slug}`;
  const qHtml = qs.map((q, i) => `<div class="q"><h2>Pregunta ${i + 1}${q.topic ? `: ${esc(q.topic)}` : ''}</h2><p>${esc(q.stem)}</p><ol type="A">${q.options.map(o => `<li>${esc(o)}</li>`).join('')}</ol><details><summary>Ver respuesta y explicación</summary><p><b>Respuesta correcta: ${LETTERS[q.correct]}.</b> ${esc(q.why || '')}</p>${q.code ? `<p class="meta">Código Perfil EUNACOM V3: ${esc(q.code)}</p>` : ''}</details></div>`).join('');
  const body = `<p class="lead">${qs.length} preguntas tipo EUNACOM de ${esc(s.title)} (${esc(s.sub)}) con respuesta y explicación. Son una muestra del banco AEE, que tiene más de ${N(bank?.total || 0)} preguntas de ${esc(s.title)}${bank?.real ? `, ${N(bank.real)} de ellas de exámenes reales reconstruidos` : ''}.</p>
${qHtml}
<div class="box"><b>Sigue practicando ${esc(s.title)}</b><br/>Banco de ${esc(s.title)}: ${clp(T.PRICES.banco)} · Pack ${esc(s.title)} (manual, clases y libros): ${clp(s.pack.price)}<br/><a class="cta" href="/#tienda/${s.key}">Ver todo de ${esc(s.title)}</a><a class="cta alt" href="/#banco">Banco de preguntas</a></div>
<h2>Otras especialidades</h2><p>${specPages.filter(p => p.slug !== slug).map(p => `<a href="/preguntas-eunacom/${p.slug}">${esc(p.s.title)}</a>`).join(' · ')}</p>`;
  const schema = [{ '@context': 'https://schema.org', '@type': 'Quiz', name: `Preguntas EUNACOM de ${s.title}`, about: { '@type': 'Thing', name: s.title }, educationalLevel: 'Médico cirujano', inLanguage: 'es', provider: PUBLISHER,
    hasPart: qs.map(q => ({ '@type': 'Question', eduQuestionType: 'Multiple choice', text: q.stem, acceptedAnswer: { '@type': 'Answer', text: q.options[q.correct] }, suggestedAnswer: q.options.filter((_, i) => i !== q.correct).map(o => ({ '@type': 'Answer', text: o })) })) }];
  page({ path, title: `Preguntas EUNACOM de ${s.title} con respuestas`, description: `${qs.length} preguntas tipo EUNACOM de ${s.title} gratis, con respuesta correcta, explicación y código del Perfil V3. Más de ${N(bank?.total || 0)} en el banco AEE.`, h1: `Preguntas EUNACOM de ${s.title}`, body, schema, crumbs: [['/banco-de-preguntas-eunacom', 'Banco de preguntas'], [path, s.title]], priority: 0.8 });
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
page({
  path: '/preguntas-frecuentes', title: 'Preguntas frecuentes sobre el EUNACOM | AEE',
  description: 'Qué es el EUNACOM, quién debe rendirlo, cuántas preguntas tiene, cómo se aprueba y cómo prepararlo. Respuestas claras del equipo académico AEE.',
  h1: 'Preguntas frecuentes sobre el EUNACOM', crumbs: [['/preguntas-frecuentes', 'Preguntas frecuentes']], priority: 0.7,
  body: `${GENERAL_FAQS.map(f => `<h2>${esc(f.q)}</h2><p>${esc(f.a)}</p>`).join('')}<p class="meta">Información oficial: <a href="https://www.eunacom.cl">eunacom.cl</a>.</p><p><a class="cta" href="/curso-eunacom">Ver el curso</a></p>`,
  schema: [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: GENERAL_FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }],
});

// ── sitemap.xml ──────────────────────────────────────────────────────────────
const urls = [{ path: '/', lastmod: TODAY, priority: 1.0 }, ...pages];
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}${u.path}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority.toFixed(1)}</priority></url>`).join('\n')}
</urlset>
`);

// ── llms.txt ─────────────────────────────────────────────────────────────────
const c0 = COURSES[0];
writeFileSync(join(DIST, 'llms.txt'), `# ${BRAND.nombre} (${BRAND.sigla})

> Academia online chilena para preparar el EUNACOM (Examen Único Nacional de Conocimientos de Medicina), Teórico (ST) y Práctico (ECOE), para médicos egresados en Chile y médicos extranjeros que revalidan su título. Sitio: ${SITE}

Datos clave:
- Curso Teórico EUNACOM online: 468 clases en video (96 horas), exámenes tipo EUNACOM con feedback, simulacros de 180 preguntas, manuales PDF y reconstrucciones de exámenes pasados. Precio ${c0.precioClp} CLP.
- 21 manuales por especialidad (${N(T.MANUALES_PAGINAS)} páginas) que siguen el Perfil EUNACOM V3; Libros Gordos con 1.890 preguntas tipo examen; Atlas, Repaso Final y mazos Anki.
- Banco de preguntas: más de ${N(T.BANK.total)} preguntas comentadas por especialidad y ${T.BANK.exams} reconstrucciones de exámenes reales (${N(T.BANK.examQuestions)} preguntas). ${clp(T.PRICES.banco)} por especialidad o ${clp(T.PRICES.bancoCompleto)} el banco completo.
- Pack Total (todo): ${clp(T.PACKS[0].price)} CLP.
- Contacto: WhatsApp ${WHATSAPP}. Instagram y YouTube: @academiaeunacom.
- App de preguntas hermana: EUNACOMapp (https://www.eunacomapp.cl).
- La información oficial del examen (fechas, inscripción, puntaje de corte) la publica ASOFAMECH en https://www.eunacom.cl.

## Páginas principales
- [Curso EUNACOM online](${SITE}/curso-eunacom): contenido, temario y precio del curso teórico.
- [Manuales EUNACOM](${SITE}/manuales-eunacom): manuales y packs por especialidad con precios.
- [Banco de preguntas EUNACOM](${SITE}/banco-de-preguntas-eunacom): banco por especialidad y preguntas gratis.
- [Preguntas frecuentes](${SITE}/preguntas-frecuentes)

## Preguntas EUNACOM gratis por especialidad
${specPages.map(p => `- [${p.s.title}](${SITE}/preguntas-eunacom/${p.slug}): ${p.qs.length} preguntas con explicación`).join('\n')}

## Guías
${BLOG_ARTICLES.map(a => `- [${a.title}](${SITE}/blog/${a.slug}): ${a.excerpt}`).join('\n')}
`);

console.log(`prerender-seo: ${pages.length} páginas + sitemap.xml (${urls.length} URLs) + llms.txt`);
