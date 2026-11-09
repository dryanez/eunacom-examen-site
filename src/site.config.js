// Brand and contact details. The design bundle ships these as placeholders
// ([Nombre], [Apellido], contacto@[dominio].cl); the real values live here so
// there is exactly one place to change them.

export const BRAND = {
  nombre: 'Academia Examen EUNACOM',
  sigla: 'AEE',
  bajada: 'Cursos, Ensayos & Revalidación Médica en Chile',
  // Attribution for blog posts and course material. Felipe approved being named as author
  // (2026-11-09). Only verifiable facts (degree, university) — never a registry number or
  // a claim about his own EUNACOM result.
  autor: 'Dr. Felipe Yáñez',
  autorRol: 'Médico cirujano (Medical University of Lublin) · Fundador de AEE y EUNACOMapp',
  autorUrl: '/dr-felipe-yanez',
};

// Bank details shown on the transfer/deposit checkout step. The design ships
// dummy numbers (Cuenta corriente 000-00000-00); leaving these blank shows an
// instruction instead, so the site never displays an account that isn't real.
export const TRANSFERENCIA = {
  banco: 'BancoEstado',
  tipo: 'Cuenta RUT',
  numero: '18842443',
  titular: 'Felipe Yáñez',
  rut: '18.842.443-0',
};

export const CONTACTO = {
  // Felipe's US number, also on WhatsApp (confirmed 2026-11-09; the Chilean line may be gone).
  telefono: '+1 (929) 360-3799',
  correo: 'contacto@eunacomapp.cl',
  instagram: 'https://www.instagram.com/academiaeunacom/',
};
