// Consejos de salud (Miembro 4). Cada consejo indica a quién le sirve en `para`:
// un objetivo del perfil ('Perder peso', 'Ganar músculo'...) o una condición calculada
// ('menor', 'mayor', 'imc-bajo', 'imc-alto'). Los que dicen 'todos' son generales.

export const CATEGORIAS_CONSEJO = ['Dieta', 'Sueño', 'Ejercicio', 'Bienestar'];

export const CONSEJOS = [
  // ---------- Dieta ----------
  {
    id: 'd1', categoria: 'Dieta', titulo: 'Hidrátate durante el día',
    texto: 'Toma agua a lo largo del día y reduce las bebidas azucaradas. Llevar siempre una botella contigo ayuda a crear el hábito.',
    para: ['Perder peso', 'Mejorar resistencia', 'Mantener peso'],
  },
  {
    id: 'd2', categoria: 'Dieta', titulo: 'Proteína en cada comida',
    texto: 'Incluye fuentes de proteína como huevos, frijoles, pollo o pescado para ayudar a la recuperación y al desarrollo muscular.',
    para: ['Ganar músculo'],
  },
  {
    id: 'd3', categoria: 'Dieta', titulo: 'Porciones moderadas',
    texto: 'Sirve porciones del tamaño de tu puño y come despacio. Llegar a la mesa sin mucha hambre ayuda a no excederte.',
    para: ['Perder peso', 'imc-alto'],
  },
  {
    id: 'd4', categoria: 'Dieta', titulo: 'Más verduras y frutas',
    texto: 'Llena la mitad de tu plato con verduras y frutas de distintos colores. Aportan fibra y vitaminas con pocas calorías.',
    para: ['Perder peso', 'Mantener peso'],
  },
  {
    id: 'd5', categoria: 'Dieta', titulo: 'Come con regularidad',
    texto: 'Haz tres comidas principales y colaciones saludables, como frutas, yogur o frutos secos, para mantener la energía.',
    para: ['Ganar músculo', 'imc-bajo'],
  },
  // ---------- Sueño ----------
  {
    id: 's1', categoria: 'Sueño', titulo: 'Horario fijo para dormir',
    texto: 'Acuéstate y levántate a la misma hora, incluso los fines de semana, para regular tu reloj biológico.',
    para: ['Dormir mejor', 'Reducir estrés'],
  },
  {
    id: 's2', categoria: 'Sueño', titulo: 'Pantallas fuera de la cama',
    texto: 'Deja el celular al menos 30 minutos antes de dormir: la luz de la pantalla dificulta conciliar el sueño.',
    para: ['Dormir mejor'],
  },
  {
    id: 's3', categoria: 'Sueño', titulo: 'Cuántas horas necesitas',
    texto: 'A tu edad se recomienda dormir entre 8 y 10 horas para rendir en los estudios y en el deporte.',
    para: ['menor'],
  },
  {
    id: 's4', categoria: 'Sueño', titulo: 'Duerme al menos 7 horas',
    texto: 'Los adultos necesitan alrededor de 7 horas o más de sueño para recuperarse del ejercicio y mantener la energía.',
    para: ['Ganar músculo', 'Mejorar resistencia'],
  },
  {
    id: 's5', categoria: 'Sueño', titulo: 'Cena ligera',
    texto: 'Cena unas dos horas antes de acostarte y evita comidas muy pesadas, el café o los refrescos con cafeína por la noche.',
    para: ['Dormir mejor', 'Perder peso'],
  },
  // ---------- Ejercicio ----------
  {
    id: 'e1', categoria: 'Ejercicio', titulo: 'Camina todos los días',
    texto: 'Empieza con 20 a 30 minutos de caminata diaria y aumenta el tiempo poco a poco.',
    para: ['Perder peso', 'Mantener peso', 'imc-alto'],
  },
  {
    id: 'e2', categoria: 'Ejercicio', titulo: 'Entrena fuerza 2 o 3 veces por semana',
    texto: 'Trabaja los grandes grupos musculares, aumenta la carga de forma progresiva y deja un día de descanso entre sesiones.',
    para: ['Ganar músculo'],
  },
  {
    id: 'e3', categoria: 'Ejercicio', titulo: 'Sube la resistencia poco a poco',
    texto: 'Aumenta la duración o la intensidad de tu cardio como máximo un 10 % por semana para evitar lesiones.',
    para: ['Mejorar resistencia'],
  },
  {
    id: 'e4', categoria: 'Ejercicio', titulo: 'Calienta y estira',
    texto: 'Dedica de 5 a 10 minutos a calentar antes de entrenar y a estirar después.',
    para: ['todos'],
  },
  {
    id: 'e5', categoria: 'Ejercicio', titulo: 'Actividad suave y constante',
    texto: 'Combina caminatas, ejercicios de equilibrio y estiramientos suaves. Consulta a tu médico antes de aumentar la intensidad.',
    para: ['mayor'],
  },
  // ---------- Bienestar ----------
  {
    id: 'b1', categoria: 'Bienestar', titulo: 'Respira profundo',
    texto: 'Practica respiración lenta durante 5 minutos: inhala por 4 segundos y exhala por 6.',
    para: ['Reducir estrés', 'Dormir mejor'],
  },
  {
    id: 'b2', categoria: 'Bienestar', titulo: 'Pausas activas',
    texto: 'Cada hora sentado, levántate y muévete un par de minutos. Mejora la circulación y despeja la mente.',
    para: ['Reducir estrés', 'Mejorar resistencia'],
  },
  {
    id: 'b3', categoria: 'Bienestar', titulo: 'Habla con alguien',
    texto: 'Compartir cómo te sientes con amigos, familia o con la comunidad de la app ayuda a manejar el estrés.',
    para: ['Reducir estrés'],
  },
  {
    id: 'b4', categoria: 'Bienestar', titulo: 'Habla con un profesional',
    texto: 'Un médico o nutricionista puede darte un plan adaptado a tu peso y a tus objetivos.',
    para: ['imc-bajo', 'imc-alto'],
  },
  {
    id: 'b5', categoria: 'Bienestar', titulo: 'Chequeos médicos',
    texto: 'Visita a un profesional de salud de forma periódica. Estos consejos son generales y no sustituyen una consulta.',
    para: ['todos'],
  },
];

const aNumero = (v) => Number(String(v ?? '').replace(',', '.'));

// Etiquetas del usuario: sus objetivos y condiciones calculadas de su perfil.
export function etiquetasDe(perfil) {
  const etiquetas = new Set(perfil?.objetivos ?? []);
  const edad = aNumero(perfil?.edad);
  const peso = aNumero(perfil?.peso);
  const altura = aNumero(perfil?.altura);

  if (edad > 0 && edad < 18) etiquetas.add('menor');
  if (edad >= 60) etiquetas.add('mayor');

  // El IMC solo es una referencia y solo se usa en adultos.
  if (edad >= 18 && peso > 0 && altura > 0) {
    const imc = peso / (altura / 100) ** 2;
    if (imc < 18.5) etiquetas.add('imc-bajo');
    else if (imc >= 25) etiquetas.add('imc-alto');
  }
  return etiquetas;
}

// Consejos que le sirven a este usuario según su perfil.
export function consejosParaTi(perfil) {
  const etiquetas = etiquetasDe(perfil);
  return CONSEJOS.filter((c) => c.para.some((t) => etiquetas.has(t)));
}