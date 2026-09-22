export const activities = [
  {
    id: "rapido",
    title: "Quiz rápido",
    description: "Un nuevo reto. Todo tu conocimiento.",
    icon: "Zap",
    color: "lime",
    label: "EL FAVORITO",
    detail: "Practica con una mezcla de las cuatro áreas del ENARM.",
  },
  {
    id: "repaso",
    title: "Quiz de repaso",
    description: "Convierte tus errores en aciertos.",
    icon: "RotateCcw",
    color: "pink",
    detail: "Vuelve a los temas que necesitan un poco más de práctica.",
  },
  {
    id: "inteligente",
    title: "Repaso inteligente",
    description: "Enfócate justo donde lo necesitas.",
    icon: "BrainCircuit",
    color: "cyan",
    detail: "Repasa tus errores anteriores sin modificar tu promedio.",
  },
  {
    id: "personalizado",
    title: "Quiz personalizado",
    description: "Tu entrenamiento, tus reglas.",
    icon: "SlidersHorizontal",
    color: "purple",
    detail: "Elige las áreas y los temas que quieres entrenar hoy.",
  },
  {
    id: "flashcards",
    title: "Flashcards",
    description: "Pequeñas tarjetas. Grandes avances.",
    icon: "Layers",
    color: "orange",
    detail:
      "Recuerda, revela y evalúa lo que aprendiste con tus preguntas marcadas.",
  },
  {
    id: "historial",
    title: "Tu historial",
    description: "Cada sesión cuenta tu historia.",
    icon: "History",
    color: "blue",
    detail: "Regresa a tus actividades y revisa tus resultados.",
  },
];

export const areas = [
  {
    name: "Medicina Interna",
    icon: "Stethoscope",
    color: "cyan",
    score: 82,
    short: "Medicina Interna",
  },
  {
    name: "Pediatría",
    icon: "Baby",
    color: "pink",
    score: 76,
    short: "Pediatría",
  },
  {
    name: "Ginecología y Obstetricia",
    icon: "HeartPulse",
    color: "purple",
    score: 68,
    short: "Gineco y Obstetricia",
  },
  {
    name: "Cirugía",
    icon: "Scissors",
    color: "lime",
    score: 88,
    short: "Cirugía",
  },
];

// These short, illustrative items demonstrate interaction; they are not a validated ENARM bank.
export const questions = [
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

export const missions = [
  "Diagnóstico global inicial",
  "Diagnóstico GyO",
  "Diagnóstico Pediatría",
  "Diagnóstico Cirugía",
  "Diagnóstico Medicina Interna",
  "Diagnóstico global de cierre",
  "Meta semanal",
];
export const sampleHistory = [
  {
    id: "sample1",
    title: "Quiz rápido",
    date: "Hoy, 09:40",
    total: 20,
    correct: 17,
    score: 85,
  },
  {
    id: "sample2",
    title: "Quiz de repaso",
    date: "Ayer, 18:15",
    total: 20,
    correct: 15,
    score: 75,
  },
  {
    id: "sample3",
    title: "Quiz personalizado",
    date: "20 sep, 10:30",
    total: 50,
    correct: 39,
    score: 78,
  },
];
