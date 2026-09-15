// Brand and contact details. The design bundle ships these as placeholders
// ([Nombre], [Apellido], contacto@[dominio].cl); the real values live here so
// there is exactly one place to change them.

export const BRAND = {
  nombre: 'Academia Examen EUNACOM',
  sigla: 'AEE',
  bajada: 'Prueba para el ejercicio\nde la Medicina en Chile',
  // Attribution for blog posts and course material. Never a personal name or
  // a professional registry number unless it can be substantiated.
  autor: 'Equipo académico AEE',
};

// Bank details shown on the transfer/deposit checkout step. The design ships
// dummy numbers (Cuenta corriente 000-00000-00); leaving these blank shows an
// instruction instead, so the site never displays an account that isn't real.
export const TRANSFERENCIA = {
  banco: '',
  titular: '',
};

export const CONTACTO = {
  // TODO: confirm these against the real lines before launch — they come from
  // the design bundle's defaults, not from a verified source.
  telefono: '+56 2 3263 2291 / +56 9 6663 5218',
  correo: 'contacto@eunacomapp.cl',
};
