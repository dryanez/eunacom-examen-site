export const BOOKS_COLLECTION = [
  // MÓDULO 1: MEDICINA INTERNA (Tomos 01 al 10)
  { ch: '01', key: 'cardiologia', title: 'Cardiología', sub: 'ECG, Arritmias, SCA & Falla Cardíaca', module: 'Módulo 1 · Medicina Interna', color: '#ea580c', chip: '#c2410c', clases: 23, pages: 71, freeSample: true },
  { ch: '02', key: 'infectologia', title: 'Infectología', sub: 'Sepsis, SNC, VIH, TBC & Antimicrobianos', module: 'Módulo 1 · Medicina Interna', color: '#4d7c0f', chip: '#3d6209', clases: 24, pages: 71 },
  { ch: '03', key: 'gastroenterologia', title: 'Gastroenterología', sub: 'Esófago, Hígado, Colon & Vía Biliar', module: 'Módulo 1 · Medicina Interna', color: '#15803d', chip: '#10602e', clases: 26, pages: 103 },
  { ch: '04', key: 'neumologia', title: 'Respiratorio', sub: 'Asma, EPOC, NAC, TEP & Derrame Pleural', module: 'Módulo 1 · Medicina Interna', color: '#0f766e', chip: '#0b5a54', clases: 24, pages: 90 },
  { ch: '05', key: 'nefrologia', title: 'Nefrología', sub: 'IRA KDIGO, ERC, Trastornos Hidroelectrolíticos', module: 'Módulo 1 · Medicina Interna', color: '#a16207', chip: '#7d4c05', clases: 22, pages: 84 },
  { ch: '06', key: 'diabetes', title: 'Diabetes Mellitus', sub: 'Tratamiento DM2 GES & Dislipidemias', module: 'Módulo 1 · Medicina Interna', color: '#0891b2', chip: '#06697f', clases: 24, pages: 95 },
  { ch: '07', key: 'endocrinologia', title: 'Endocrinología', sub: 'Tiroides, Suprarrenal, Calcio & Hipófisis', module: 'Módulo 1 · Medicina Interna', color: '#7c3aed', chip: '#5b21b6', clases: 20, pages: 70 },
  { ch: '08', key: 'hematologia', title: 'Hematología', sub: 'Anemias, Hemostasia, Leucemias & Transfusiones', module: 'Módulo 1 · Medicina Interna', color: '#be123c', chip: '#91092d', clases: 20, pages: 68 },
  { ch: '09', key: 'reumatologia', title: 'Reumatología', sub: 'AR, LES, Espondiloartritis & Vasculitis', module: 'Módulo 1 · Medicina Interna', color: '#9f1239', chip: '#7c0e2d', clases: 18, pages: 60 },
  { ch: '10', key: 'neurologia', title: 'Neurología', sub: 'ACV GES, Cefaleas, Epilepsia & Parkinson', module: 'Módulo 1 · Medicina Interna', color: '#6d28d9', chip: '#4c1d95', clases: 22, pages: 74 },

  // MÓDULO 2: CIRUGÍA & ESPECIALIDADES (Tomos 11 al 17)
  { ch: '11', key: 'cirugia', title: 'Cirugía General', sub: 'Abdomen Agudo, Hernias, Trauma & ATLS', module: 'Módulo 2 · Cirugía y Especialidades', color: '#334155', chip: '#1f2937', clases: 22, pages: 76 },
  { ch: '12', key: 'traumatologia', title: 'Traumatología', sub: 'Fracturas de Cadera, Expuestas & Columna', module: 'Módulo 2 · Cirugía y Especialidades', color: '#b45309', chip: '#8a3f06', clases: 18, pages: 60 },
  { ch: '13', key: 'urologia', title: 'Urología', sub: 'Litiasis, HPB, Cáncer Urológico & Escroto', module: 'Módulo 2 · Cirugía y Especialidades', color: '#0369a1', chip: '#024e79', clases: 16, pages: 54 },
  { ch: '14', key: 'otorrino', title: 'Otorrinolaringología', sub: 'Otitis, Hipoacusias, Vértigo & Epistaxis', module: 'Módulo 2 · Cirugía y Especialidades', color: '#4338ca', chip: '#312a99', clases: 16, pages: 52 },
  { ch: '15', key: 'oftalmologia', title: 'Oftalmología', sub: 'Ojo Rojo, Glaucoma, Retina & Trauma', module: 'Módulo 2 · Cirugía y Especialidades', color: '#0e7490', chip: '#0a5566', clases: 16, pages: 52 },
  { ch: '16', key: 'dermatologia', title: 'Dermatología', sub: 'Cáncer Piel, Psoriasis, NET & Farmacodermias', module: 'Módulo 2 · Cirugía y Especialidades', color: '#a21caf', chip: '#79148a', clases: 16, pages: 52 },
  { ch: '17', key: 'psiquiatria', title: 'Psiquiatría', sub: 'Depresión GES, Bipolar, Esquizofrenia & Urgencias', module: 'Módulo 2 · Cirugía y Especialidades', color: '#7e22ce', chip: '#5d189c', clases: 18, pages: 60 },

  // MÓDULO 3: MATERNO - INFANTIL (Tomos 18 al 20)
  { ch: '18', key: 'pediatria', title: 'Pediatría', sub: 'Control Niño Sano, PNI, IRA Baja & Diarrea', module: 'Módulo 3 · Materno - Infantil', color: '#c2410c', chip: '#93300a', clases: 26, pages: 88 },
  { ch: '19', key: 'obstetricia', title: 'Obstetricia', sub: 'Control Prenatal, SHE GES, Metrorragias & Parto', module: 'Módulo 3 · Materno - Infantil', color: '#9d174d', chip: '#76103a', clases: 22, pages: 76 },
  { ch: '20', key: 'ginecologia', title: 'Ginecología', sub: 'Cáncer Cervicouterino / Mama GES, SOP & HUA', module: 'Módulo 3 · Materno - Infantil', color: '#be185d', chip: '#8f1246', clases: 20, pages: 70 },

  // MÓDULO 4: SALUD PÚBLICA & GESTIÓN (Tomo 21)
  { ch: '21', key: 'saludpublica', title: 'Salud Pública', sub: 'Garantías GES, MAIS, Fonasa/Isapre & Bioética', module: 'Módulo 4 · Salud Pública', color: '#166534', chip: '#0f4a26', clases: 18, pages: 64 },
];

export const MODULES_COLLECTION = [
  {
    id: 'pase-convocatoria',
    slug: 'pase-convocatoria',
    kicker: 'Colección Completa · 21 Tomos & Clases',
    badge: '🏆 Pase Completo Convocatoria',
    destacado: true,
    nombre: 'Pase Convocatoria EUNACOM 2026',
    subtitulo: '21 Tomos + 468 videoclases + 6.000+ preguntas + 16 reconstrucciones',
    descripcion: 'El acceso más completo y de más alto rendimiento clínico: la colección íntegra de los 21 Manuales Oficiales EUNACOM en PDF de alta fidelidad para descarga, 468 clases en video modulares y acceso ilimitado al simulador de preguntas con justificaciones razonadas hasta la fecha de tu examen.',
    precioClpNum: 359000,
    precioPromoClpNum: 179500,
    precioClp: '.000',
    precioPromoClp: '.500',
    precioUsd: '≈ US$ 390',
    precioPromoUsd: '≈ US$ 195',
    precioNota: 'Mercado Pago (cuotas mensuales), PayPal o Transferencia directa.',
    tomosCount: 21,
    clasesCount: '468',
    tomosRange: 'Tomos 01 al 21 (Todos los módulos)',
    incluye: [
      'Colección completa de los 21 Manuales Oficiales EUNACOM 2026 (PDFs alta resolución estilo CTO / A4)',
      '468 clases en video (96 horas) organizadas por módulo y especialidad',
      'Más de 6.000 preguntas comentadas y 16 exámenes reales reconstruidos (2013-2025, 2.901 preguntas)',
      '21 libros de 90 preguntas tipo examen (1.890), Repaso Final, Atlas de imágenes y mazos Anki',
      'Pautas farmacológicas y algoritmos diagnósticos actualizados GES / MINSAL 2026',
      'Acceso ilimitado a la plataforma hasta el día de tu examen'
    ]
  },
  {
    id: 'modulo-1-medicina-interna',
    slug: 'modulo-1-medicina-interna',
    kicker: 'Módulo Troncal · 10 Tomos',
    badge: 'Módulo 1 · Medicina Interna',
    destacado: false,
    nombre: 'Módulo 1: Medicina Interna',
    subtitulo: '10 Tomos (Cardio, Neumo, Nefro, Digestivo, Diabetes...) + Clases',
    descripcion: 'Cubre el área de mayor ponderación del examen: Cardiología, Infectología, Gastroenterología, Respiratorio, Nefrología, Diabetes, Endocrino, Hematología, Reumatología y Neurología.',
    precioClpNum: 179000,
    precioPromoClpNum: 89500,
    precioClp: '.000',
    precioPromoClp: '.500',
    precioUsd: '≈ US$ 195',
    precioPromoUsd: '≈ US$ 98',
    precioNota: 'Mercado Pago en cuotas, PayPal o Transferencia.',
    tomosCount: 10,
    clasesCount: '260',
    tomosRange: 'Tomos 01 al 10',
    incluye: [
      '10 Manuales Oficiales EUNACOM en PDF (Cardio, Neumo, Nefro, Gastro, Diabetes, etc.)',
      'Trazados de ECG de alta resolución y algoritmos terapéuticos',
      'Clases en video modulares de Medicina Interna',
      'Casos clínicos reales EUNACOM resueltos y comentados'
    ]
  },
  {
    id: 'modulo-2-cirugia',
    slug: 'modulo-2-cirugia',
    kicker: 'Especialidades Quirúrgicas · 7 Tomos',
    badge: 'Módulo 2 · Cirugía y Especialidades',
    destacado: false,
    nombre: 'Módulo 2: Cirugía & Especialidades',
    subtitulo: '7 Tomos (Cirugía General, Trauma, Urología, ORL, Oftalmo, Derma, Psiquiatría)',
    descripcion: 'Preparación integral de Cirugía General, Abdomen Agudo, Trauma ATLS, Traumatología, Urología, Otorrino, Oftalmología, Dermatología y Psiquiatría.',
    precioClpNum: 149000,
    precioPromoClpNum: 74500,
    precioClp: '.000',
    precioPromoClp: '.500',
    precioUsd: '≈ US$ 160',
    precioPromoUsd: '≈ US$ 80',
    precioNota: 'Mercado Pago en cuotas, PayPal o Transferencia.',
    tomosCount: 7,
    clasesCount: '128',
    tomosRange: 'Tomos 11 al 17',
    incluye: [
      '7 Manuales Oficiales EUNACOM en PDF',
      'Algoritmos de conducta quirúrgica de urgencia y trauma',
      'Videoclases especializadas y preguntas de autoevaluación',
      'Normas GES en Patología Quirúrgica y Psiquiátrica'
    ]
  },
  {
    id: 'modulo-3-materno-infantil',
    slug: 'modulo-3-materno-infantil',
    kicker: 'Pediatría & Gineco-Obstetricia · 3 Tomos',
    badge: 'Módulo 3 · Materno - Infantil',
    destacado: false,
    nombre: 'Módulo 3: Materno - Infantil',
    subtitulo: '3 Tomos (Pediatría & Neonatología, Obstetricia, Ginecología)',
    descripcion: 'Especialidades prioritarias del temario ASOFAMECh: Control de niño sano, vacunas PNI, IRA infantil, SHE GES, parto, metrorragias, cáncer ginecológico y patología mamaria.',
    precioClpNum: 129000,
    precioPromoClpNum: 64500,
    precioClp: '.000',
    precioPromoClp: '.500',
    precioUsd: '≈ US$ 140',
    precioPromoUsd: '≈ US$ 70',
    precioNota: 'Mercado Pago en cuotas, PayPal o Transferencia.',
    tomosCount: 3,
    clasesCount: '65',
    tomosRange: 'Tomos 18 al 20',
    incluye: [
      '3 Manuales Oficiales EUNACOM en PDF',
      'Pautas pediátricas oficiales MINSAL y esquemas de vacunación',
      'Guías de alto rendimiento en emergencias obstétricas',
      'Simulacros y casos razonados de Pediatría y Gineco-Obstetricia'
    ]
  },
  {
    id: 'modulo-4-salud-publica',
    slug: 'modulo-4-salud-publica',
    kicker: 'Normativa Chilena & Gestión · Tomo 21',
    badge: 'Módulo 4 · Salud Pública & Bioética',
    destacado: false,
    nombre: 'Módulo 4: Salud Pública & Bioética',
    subtitulo: 'Tomo 21 (Garantías GES, MAIS, Fonasa/Isapre, Epidemiología, Bioética)',
    descripcion: 'El módulo con mayor rendimiento por página: garantiza el 10% del examen EUNACOM dominando la normativa legal y sanitaria chilena donde más médicos extranjeros fallan.',
    precioClpNum: 69000,
    precioPromoClpNum: 34500,
    precioClp: '.000',
    precioPromoClp: '.500',
    precioUsd: '≈ US$ 75',
    precioPromoUsd: '≈ US$ 38',
    precioNota: 'Mercado Pago en cuotas, PayPal o Transferencia.',
    tomosCount: 1,
    clasesCount: '15',
    tomosRange: 'Tomo 21',
    incluye: [
      'Manual Oficial Tomo 21: Salud Pública, MAIS y Bioética en PDF',
      'Matrices comparativas de Garantías Explícitas en Salud (GES)',
      'Clases de Epidemiología Clínica y Gestión en Atención Primaria',
      'Banco de preguntas reales de Salud Pública resueltas'
    ]
  }
];

