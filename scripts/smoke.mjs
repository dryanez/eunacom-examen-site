// Renders every section and modal, and fails if a doctor reference,
// an unsubstantiated statistic, or an undefined value reaches the markup.
import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import React from 'react';

const server = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: 'custom' });
const load = (p) => server.ssrLoadModule(p);

const { default: App } = await load('/src/App.jsx');
const { COURSES } = await load('/src/data/coursesData.js');
const { BLOG_ARTICLES } = await load('/src/data/blogArticlesData.js');
const { default: CourseDetailModal } = await load('/src/components/CourseDetailModal.jsx');
const { default: EnrollmentModal } = await load('/src/components/EnrollmentModal.jsx');
const { default: BlogArticleModalOrPage } = await load('/src/components/BlogArticleModalOrPage.jsx');
const { default: DoctorMentorshipModal } = await load('/src/components/DoctorMentorshipModal.jsx');
const { default: BlogTopicProposer } = await load('/src/components/BlogTopicProposer.jsx');
const { default: CursoTeoricoPage } = await load('/src/components/CursoTeoricoPage.jsx');
const { default: CursoPracticoPage } = await load('/src/components/CursoPracticoPage.jsx');

const noop = () => {};
const cases = [['App', React.createElement(App)]];
for (const c of COURSES) {
  cases.push([`CourseDetailModal:${c.slug}`, React.createElement(CourseDetailModal, { course: c, onClose: noop, onEnroll: noop })]);
  cases.push([`EnrollmentModal:${c.slug}`, React.createElement(EnrollmentModal, { course: c, onClose: noop })]);
}
for (const a of BLOG_ARTICLES) {
  cases.push([`BlogArticle:${a.slug}`, React.createElement(BlogArticleModalOrPage, { article: a, onClose: noop, onSelectCourse: noop, onOpenMentorship: noop })]);
}
cases.push(['DoctorMentorshipModal', React.createElement(DoctorMentorshipModal, { onClose: noop })]);
cases.push(['BlogTopicProposer', React.createElement(BlogTopicProposer, { onClose: noop })]);
cases.push(['CursoTeoricoPage', React.createElement(CursoTeoricoPage, { onNavigateHome: noop, onEnroll: noop })]);
cases.push(['CursoPracticoPage', React.createElement(CursoPracticoPage, { onNavigateHome: noop, onOpenMentorship: noop })]);

let failed = 0, html = '';
for (const [name, el] of cases) {
  try {
    const out = renderToString(el);
    html += out;
    console.log(`ok   ${name} (${out.length})`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: ${e.message}`);
  }
}
await server.close();

const banned = [/Felipe/, /Yáñez/, /642819/, /USACH/, /Director Académico/, /94\.2%/, /undefined/, /\[object Object\]/];
for (const re of banned) {
  if (re.test(html)) { failed++; console.log(`BANNED PRESENT  ${re}`); }
}
console.log(failed ? `\n${failed} PROBLEMS` : `\nall sections render clean (${cases.length} cases), no doctor references`);
process.exit(failed ? 1 : 0);
