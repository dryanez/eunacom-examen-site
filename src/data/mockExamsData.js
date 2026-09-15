export const DIAGNOSTIC_QUESTIONS = [
  {
    id: 1,
    area: "Cardiología",
    question: "Hombre de 62 años, hipertenso y fumador, consulta en urgencias por dolor torácico retroesternal opresivo de 45 minutos de evolución, irradiado a mandíbula y brazo izquierdo, acompañado de diaforesis. ECG muestra supradesnivel del segmento ST de 3 mm en derivaciones V1 a V4. La presión arterial es 130/80 mmHg y FC 88 lpm. SatO2 96% ambiental. ¿Cuál es la conducta inicial prioritaria de elección si se encuentra en un centro con laboratorio de hemodinamia disponible?",
    options: [
      "Aspirina 300 mg + Clopidogrel 300-600 mg VO y traslado inmediato a Angioplastia Primaria (PCI) con objetivo puerta-balón < 90 minutos.",
      "Administración inmediata de trombolíticos con Alteplasa (rtPA) endovenosa en bolo y goteo.",
      "Solicitar troponinas ultrasensibles y esperar el resultado en 60 minutos para confirmar necrosis.",
      "Iniciar infusión de Nitroglicerina EV y realizar ecocardiograma transtorácico de urgencia previo a definir reperfusión."
    ],
    correctIndex: 0,
    explanation: "En IAM con supradesnivel del ST (IAMCEST), la estrategia de reperfusión de elección es la Angioplastia Primaria (PCI) siempre que el tiempo puerta-balón sea < 90 minutos en centro con hemodinamia (o < 120 min con traslado). Debe iniciarse de inmediato doble antiagregación plaquetaria (AAS + inhibidor P2Y12) y anticoagulación sin retrasar el traslado. No se debe esperar troponinas para definir la conducta en presencia de ECG diagnóstico.",
    pearl: "En IAMCEST con clínica y ECG concluyentes, el tiempo es miocardio: NUNCA esperar biomarcadores para decidir la reperfusión."
  },
  {
    id: 2,
    area: "Salud Pública & GES",
    question: "Una mujer de 54 años beneficiaria de FONASA B consulta en su CESFAM con glicemia de ayuno repetida de 142 mg/dL y 156 mg/dL en días distintos, confirmándose el diagnóstico de Diabetes Mellitus tipo 2. Respecto a las Garantías Explícitas en Salud (GES), ¿cuál es el plazo máximo de garantía de acceso para su primera atención con médico/equipo de salud desde la sospecha o confirmación?",
    options: [
      "Atención médica dentro de 45 días desde la confirmación diagnóstica.",
      "Atención médica dentro de 24 horas solo si presenta HbA1c > 10%.",
      "Atención dentro de 90 días con entrega diferida de metformina.",
      "No corresponde a patología GES si el paciente es asintomático."
    ],
    correctIndex: 0,
    explanation: "La Diabetes Mellitus tipo 2 es el Problema de Salud GES Nº 7. La garantía de oportunidad establece que todo beneficiario con confirmación diagnóstica tendrá acceso a tratamiento médico integral dentro de 45 días desde la confirmación en atención primaria (CESFAM/Posta).",
    pearl: "DM2 en GES: Confirmación y tratamiento integral garantizado en plazo máximo de 45 días desde la confirmación."
  },
  {
    id: 3,
    area: "Pediatría",
    question: "Lactante de 3 meses es traído a control de salud. Al examen físico usted nota asimetría marcada de pliegues en muslos y al realizar maniobra de abducción de caderas se percibe un resalto palpable y audible en la cadera izquierda (signo de Ortolani positivo). ¿Cuál es el examen confirmatorio de elección a esta edad y la conducta inmediata?",
    options: [
      "Ecografía de caderas (método de Graf) e indicación inmediata de correas de Pavlik por traumatólogo infantil.",
      "Radiografía de pelvis anteroposterior con líneas de Shenton y esperar control a los 6 meses.",
      "Tomografía computarizada de pelvis con reconstrucción tridimensional.",
      "Kinesioterapia motora y control radiológico al cumplir 1 año de vida."
    ],
    correctIndex: 0,
    explanation: "En lactantes menores de 3-4 meses con sospecha de displasia del desarrollo de la cadera (DDC) o signos clínicos de inestabilidad (Ortolani/Barlow), el examen de elección es la Ecografía de caderas, ya que los núcleos de osificación femoral aún son cartilaginosos y radiolúcidos. La DDC es patología GES Nº 21 y requiere derivación expedita para tratamiento ortopédico precoz (correas de Pavlik).",
    pearl: "DDC: Antes de los 3 meses el examen de elección es ecografía. A partir de los 3 meses se realiza Rx de pelvis AP (screening GES al 3er mes)."
  },
  {
    id: 4,
    area: "Cirugía General",
    question: "Mujer de 42 años, multípara y con sobrepeso, consulta por dolor abdominal cólico intenso en hipocondrio derecho de 14 horas de evolución que no cede con antiespasmódicos, asociado a náuseas, vómitos y sensación febril. Al examen: Tº 38.3ºC, dolor intenso a la palpación en hipocondrio derecho que detiene la inspiración profunda (signo de Murphy positivo). Hemograma con 14.500 leucocitos/mm3. ¿Cuál es el diagnóstico más probable y la conducta definitiva?",
    options: [
      "Colecistitis aguda litiásica; hospitalización, antibióticos EV y colecistectomía laparoscópica precoz.",
      "Cólico biliar simple; analgesia con AINEs IM y alta con régimen cero grasas.",
      "Coledocolitiasis obstructiva; indicación inmediata de CPRE de urgencia sin antibióticos.",
      "Hepatitis aguda viral; reposo en cama y control de transaminasas ambulatorio."
    ],
    correctIndex: 0,
    explanation: "El cuadro de dolor biliar prolongado (> 6 horas) acompañado de fiebre, leucocitosis y signo de Murphy positivo es diagnóstico clínico de Colecistitis Aguda. El tratamiento de elección es la colecistectomía laparoscópica precoz (dentro de las primeras 72 horas del inicio de los síntomas), previo inicio de hidratación y cobertura antibiótica endovenosa.",
    pearl: "Dolor biliar > 6 horas + Murphy positivo + fiebre/leucocitosis = Colecistitis Aguda. Tratamiento: Colelap precoz."
  },
  {
    id: 5,
    area: "Ginecología y Obstetricia",
    question: "Primigesta de 34 semanas de gestación acude a urgencias por cefalea holocránea intensa y visión borrosa (escotomas). Al ingreso se constata Presión Arterial de 165/110 mmHg repetida a los 15 minutos. Proteinuria en tirita reactiva (+++). Latidos cardiofetales normales. ¿Cuál es el fármaco de primera línea para la prevención de eclampsia en esta paciente y cuál es su antídoto en caso de intoxicación?",
    options: [
      "Sulfato de magnesio EV (esquema de Zuspan o Pritchard); Antídoto: Gluconato de calcio 10% EV.",
      "Diazepam EV en bolo lento; Antídoto: Flumazenil EV.",
      "Fenitoína sódica en infusión continua; Antídoto: Bicarbonato de sodio.",
      "Labetalol EV exclusivamente, sin necesidad de neuroprotección materna."
    ],
    correctIndex: 0,
    explanation: "La paciente presenta Preeclampsia Severa con criterios de gravedad (PA ≥ 160/110 mmHg y síntomas premonitorios neurológicos). El fármaco de elección indiscutido para la profilaxis de convulsiones eclámpticas es el Sulfato de Magnesio (dosis de carga 4-5 g EV en 15-20 min, seguida de mantención 1-2 g/h). El antídoto ante signos de toxicidad (abolición de reflejo rotuliano, bradipnea < 12 rpm) es el Gluconato de Calcio al 10% 1 g EV lento.",
    pearl: "Preeclampsia severa = Sulfato de Magnesio para prevenir eclampsia. Antídoto obligado a mano: Gluconato de Calcio al 10%."
  }
];
