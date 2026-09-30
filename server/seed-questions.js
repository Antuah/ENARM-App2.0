// Illustrative development bank. Load validated content before releasing the app.
export const sampleQuestions = [
  {
    id: 1,
    area: "Medicina Interna",
    topic: "Farmacología",
    text: "¿Cuál es el mecanismo de acción de las fluoroquinolonas como el ciprofloxacino?",
    options: [
      "Interferencia en la síntesis de ácido fólico",
      "Inhibición de la síntesis de la pared celular",
      "Inhibición de las topoisomerasas II y IV",
      "Bloqueo de la subunidad ribosomal 30S",
    ],
    answer: 2,
    explanation:
      "En este ejemplo, la opción C corresponde a la inhibición de la ADN girasa (topoisomerasa II) y de la topoisomerasa IV bacterianas.",
  },
  {
    id: 2,
    area: "Pediatría",
    topic: "Neonatología",
    text: "¿Cuál de los siguientes parámetros forma parte de la valoración de Apgar?",
    options: [
      "Peso al nacimiento",
      "Perímetro cefálico",
      "Frecuencia cardíaca",
      "Edad gestacional",
    ],
    answer: 2,
    explanation:
      "Apgar incluye frecuencia cardíaca, esfuerzo respiratorio, tono muscular, respuesta refleja y coloración.",
  },
  {
    id: 3,
    area: "Ginecología y Obstetricia",
    topic: "Anatomía",
    text: "¿En qué segmento de la trompa uterina ocurre con mayor frecuencia la fecundación?",
    options: ["Porción intramural", "Ampolla", "Istmo", "Infundíbulo"],
    answer: 1,
    explanation:
      "La ampolla es el segmento de la trompa uterina donde ocurre habitualmente la fecundación.",
  },
  {
    id: 4,
    area: "Cirugía",
    topic: "Anatomía",
    text: "¿Qué estructura conecta la vesícula biliar con la vía biliar principal?",
    options: [
      "Conducto cístico",
      "Conducto pancreático",
      "Conducto hepático izquierdo",
      "Vena porta",
    ],
    answer: 0,
    explanation:
      "El conducto cístico conecta la vesícula biliar con el conducto hepático común.",
  },
  {
    id: 5,
    area: "Medicina Interna",
    topic: "Cardiología",
    text: "¿Qué estructura inicia normalmente el impulso eléctrico cardíaco?",
    options: [
      "Nodo auriculoventricular",
      "Haz de His",
      "Fibras de Purkinje",
      "Nodo sinoauricular",
    ],
    answer: 3,
    explanation:
      "El nodo sinoauricular es el marcapasos fisiológico habitual del corazón.",
  },
];
