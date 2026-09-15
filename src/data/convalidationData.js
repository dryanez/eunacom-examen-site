export const CONVALIDATION_PATHWAYS = [
  {
    id: "asofamech",
    number: "1",
    title: "Rendición Directa EUNACOM (ASOFAMECH)",
    subtitle: "Vía más utilizada por médicos generales formados en el extranjero",
    description: "Ley Nº 20.261. La aprobación de las dos secciones del EUNACOM (Teórico-ST y Práctico-SP) equivale legalmente a la revalidación automática del título de Médico Cirujano para todos los efectos legales en Chile.",
    pros: "Habilita tanto para el ejercicio público (FONASA, Hospitales, CESFAM) como privado (Clínicas, Isapres), además de permitir postular a becas de especialidad médica (EDF/CONISS).",
    steps: [
      "Inscripción en ASOFAMECH presentando documentos debidamente legalizados/apostillados.",
      "Rendición y aprobación del EUNACOM Teórico (EUNACOM-ST) de 180 preguntas (mínimo 51 puntos).",
      "Inscripción y aprobación de las 4 etapas del EUNACOM Práctico (EUNACOM-SP: Medicina, Cirugía, Pediatría y Gineco-Obstetricia).",
      "Emisión del Certificado Oficial EUNACOM e inscripción en el Registro Nacional de Prestadores Individuales (RNPI) de la Superintendencia de Salud."
    ],
    exemptions: "Médicos egresados de universidades chilenas acreditadas rinden automáticamente el práctico durante su internado de 7º año."
  },
  {
    id: "tratados",
    number: "2",
    title: "Reconocimiento por Tratados Bilaterales (MINREL)",
    subtitle: "Convenios diplomáticos con países específicos",
    description: "Vía administrativa a través del Ministerio de Relaciones Exteriores de Chile (MINREL). Aplica únicamente a egresados de países con tratados bilaterales vigentes.",
    pros: "Trámite puramente documental que no exige rendir el examen práctico para la convalidación del título.",
    cons: "OJO: Aunque convalida el título, la Ley exige de todas formas aprobar el EUNACOM para ser contratado en cargos médicos del Sistema Nacional de Servicios de Salud (FONASA/CESFAM/Hospitales Públicos) o emitir bonos.",
    countries: [
      { name: "Uruguay", treaty: "Convenio Bilateral de Reconocimiento Mutuo de Títulos Profesionales" },
      { name: "Colombia", treaty: "Convenio Bilateral de Reconocimiento de Títulos" },
      { name: "Ecuador", treaty: "Convenio Bilateral de Reconocimiento Mutuo" },
      { name: "España", treaty: "Convenio Bilateral de Doble Reconocimiento" },
      { name: "Perú", treaty: "Tratado Bilateral de Reconocimiento" },
      { name: "Brasil", treaty: "Convenio Cultural y Profesional" }
    ],
    steps: [
      "Legalización o Apostilla de La Haya del título y certificados de calificaciones en el país de origen.",
      "Solicitud de reconocimiento en el Departamento de Títulos del MINREL en Santiago.",
      "Inscripción en el Registro de la Superintendencia de Salud.",
      "Rendición del EUNACOM Teórico si se desea trabajar en el sistema público o postular a cargos públicos."
    ]
  },
  {
    id: "conacem",
    number: "3",
    title: "Certificación de Especialidad Médica (CONACEM)",
    subtitle: "Vía de homologación directa para médicos especialistas",
    description: "Ley Nº 20.985 (modificatoria). Permite a médicos especialistas formados y acreditados en el extranjero certificar directamente su especialidad ante la Corporación Nacional Autónoma de Certificación de Especialidades Médicas (CONACEM).",
    pros: "La certificación CONACEM habilita legalmente para ejercer la especialidad en el sector público y privado SIN necesidad de rendir el EUNACOM Práctico general.",
    steps: [
      "Postulación de antecedentes formativos y asistenciales de la especialidad ante el comité técnico de CONACEM.",
      "Examen teórico de la especialidad (escrito de opción múltiple).",
      "Examen práctico/oral ante comisión de especialistas universitarios.",
      "Obtención del certificado de especialista e inscripción automática en el RNPI."
    ]
  },
  {
    id: "uchile",
    number: "4",
    title: "Revalidación Académica Tradicional (Universidad de Chile)",
    subtitle: "Vía universitaria histórica establecida en el DFL Nº 3 de 2006",
    description: "La Universidad de Chile es el organismo rector encargado de homologar planes de estudio y grados académicos extranjeros en su Facultad de Medicina.",
    pros: "Otorga el diploma universitario de Médico Cirujano conferido por la Universidad de Chile.",
    cons: "Proceso prolongado que incluye revisión curricular exhaustiva y exámenes de reválida teóricos y prácticos administrados por comisiones de la Facultad.",
    steps: [
      "Ingreso de expediente académico en la Oficina de Revalidación de la Casa Central U. de Chile.",
      "Estudio comparativo de malla curricular, créditos y carga horaria asistencial.",
      "Rendición de exámenes teóricos y de internado práctico en el Hospital Clínico U. de Chile.",
      "Colación del título oficial de Médico Cirujano."
    ]
  }
];

export const DOCUMENT_CHECKLIST = [
  {
    id: "titulo",
    title: "Título Profesional Original o Copia Legalizada",
    description: "Debe estar debidamente legalizado o contar con la Apostilla de La Haya del país emisor.",
    mandatory: true
  },
  {
    id: "notas",
    title: "Certificado Oficial de Calificaciones / Concentración de Notas",
    description: "Detalle de asignaturas cursadas, escala de notas y ponderación final, apostillado.",
    mandatory: true
  },
  {
    id: "habilitacion",
    title: "Certificado de Habilitación para el Ejercicio Profesional",
    description: "Emitido por el Ministerio de Salud o Colegio Médico del país de origen, acreditando que no existen sanciones deontológicas (Certificado de Good Standing).",
    mandatory: true
  },
  {
    id: "malla",
    title: "Plan de Estudios / Carga Horaria",
    description: "Programa académico con desglose de horas teóricas y prácticas (internado rotatorio).",
    mandatory: false
  },
  {
    id: "identidad",
    title: "Cédula de Identidad Chilena (RUT) o Pasaporte Vigente",
    description: "Documento oficial con el cual el postulante se registra ante ASOFAMECH y la Superintendencia de Salud.",
    mandatory: true
  }
];
