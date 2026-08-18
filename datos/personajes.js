// Catálogo de personajes preestablecidos.
// Las descripciones son provisionales: están para probar el escenario, no son el texto final.

// Las cuatro preguntas del móvil. Las tres primeras se eligen por imagen; la cuarta, por
// texto. Cada animal responde a un valor de cada eje, y la suma de coincidencias decide
// cuál se invoca.
//
// Las imágenes van en assets/opciones/ con el id como nombre: cazar.jpg, guardar.jpg…
// Mientras no estén, la casilla muestra la palabra y todo sigue funcionando.
export const PREGUNTAS = [
  {
    id: 'instinto',
    titulo: '¿Qué instinto te mueve?',
    porImagen: true,
    opciones: [
      { id: 'cazar', nombre: 'Cazar' },
      { id: 'guardar', nombre: 'Guardar' },
      { id: 'jugar', nombre: 'Jugar' },
      { id: 'vagar', nombre: 'Vagar' },
    ],
  },
  {
    id: 'mirada',
    titulo: '¿Cómo miras el mundo?',
    porImagen: true,
    opciones: [
      { id: 'defrente', nombre: 'De frente' },
      { id: 'dereojo', nombre: 'De reojo' },
      { id: 'arriba', nombre: 'Desde arriba' },
      { id: 'adentro', nombre: 'Hacia adentro' },
    ],
  },
  {
    id: 'elemento',
    titulo: '¿Qué elemento te habita?',
    porImagen: true,
    opciones: [
      { id: 'fuego', nombre: 'Fuego' },
      { id: 'agua', nombre: 'Agua' },
      { id: 'tierra', nombre: 'Tierra' },
      { id: 'aire', nombre: 'Aire' },
    ],
  },
  {
    id: 'creacion',
    titulo: 'Si pudieras crear cualquier cosa, ¿qué sería?',
    porImagen: false,
    opciones: [
      { id: 'viral', nombre: 'Contenido que se vuelva viral en redes' },
      { id: 'app', nombre: 'Una app que organice o gobierne algo del mundo' },
      { id: 'videojuego', nombre: 'Un videojuego épico donde la gente se pierda' },
      { id: 'marca', nombre: 'Una marca que se vuelva una obsesión colectiva' },
    ],
  },
];

// Los que pisan el paisaje: figuras de cuerpo entero, con sus patas dentro del cuadro.
export const PERSONAJES = [
  {
    id: 'quimera',
    archivo: 'quimera.jpeg',
    especie: 'Quimera de Ojos Girados',
    instinto: 'guardar',
    mirada: 'dereojo',
    elemento: 'aire',
    creacion: 'videojuego',
    descripcion:
      'Mira dos veces cada cosa y nunca al mismo tiempo. Dicen que carga en la boca todo lo que no dijo.',
  },
  {
    id: 'gato-espiral',
    archivo: 'gato-espiral.jpeg',
    especie: 'Gato Espiral',
    instinto: 'jugar',
    mirada: 'adentro',
    elemento: 'fuego',
    creacion: 'videojuego',
    descripcion:
      'Ríe antes de que ocurra el chiste. Sus rayas siguen creciendo cuando duerme.',
  },
  {
    id: 'tigre-azul',
    archivo: 'tigre-azul.jpeg',
    especie: 'Tigre de Agua Fría',
    instinto: 'vagar',
    mirada: 'dereojo',
    elemento: 'agua',
    creacion: 'viral',
    descripcion:
      'Corre siempre de perfil. La lengua le pesa más que las patas y por eso llega tarde.',
  },
  {
    id: 'ave-zopilote',
    archivo: 'ave-zopilote.jpeg',
    especie: 'Ave de Mal Agüero',
    instinto: 'guardar',
    mirada: 'arriba',
    elemento: 'aire',
    creacion: 'app',
    descripcion:
      'Anuncia cosas que ya pasaron. Se para en un solo lugar del claro y desde ahí lo vigila todo.',
  },
  {
    id: 'bisonte',
    archivo: 'bisonte.jpeg',
    especie: 'Búfalo de Ojos Fijos',
    instinto: 'guardar',
    mirada: 'defrente',
    elemento: 'tierra',
    creacion: 'marca',
    descripcion:
      'Nadie lo ha visto moverse. Los cuernos le crecen hacia adentro cuando alguien lo mira de frente.',
  },
  {
    id: 'can-lengua',
    archivo: 'can-lengua.jpeg',
    especie: 'Can de Lengua Larga',
    instinto: 'vagar',
    mirada: 'defrente',
    elemento: 'aire',
    creacion: 'viral',
    descripcion:
      'Le cuelga la lengua desde antes de nacer. Con ella prueba el aire y averigua quién acaba de llegar.',
  },
  {
    id: 'tigre-rayado',
    archivo: 'tigre-rayado.jpeg',
    especie: 'Tigre de Patas Rosadas',
    instinto: 'jugar',
    mirada: 'defrente',
    elemento: 'tierra',
    creacion: 'viral',
    descripcion:
      'Camina sin hacer ruido por culpa de sus patas blandas. Saluda enseñando la lengua.',
  },
  {
    id: 'felino-limon',
    archivo: 'felino-limon.jpeg',
    especie: 'Felino de Limón',
    instinto: 'cazar',
    mirada: 'adentro',
    elemento: 'fuego',
    creacion: 'videojuego',
    descripcion:
      'Mitad incendio, mitad planta. Deja un olor ácido en el pasto donde se sienta.',
  },
  {
    id: 'tigre-rosado',
    archivo: 'tigre-rosado.jpeg',
    especie: 'Tigre Rosado',
    instinto: 'cazar',
    mirada: 'defrente',
    elemento: 'fuego',
    creacion: 'marca',
    descripcion:
      'Enseña los dientes para saludar y no entiende por qué todos se apartan. Las uñas se le enfrían de noche.',
  },
  {
    id: 'bestia-antenas',
    archivo: 'bestia-antenas.jpeg',
    especie: 'Bestia de Antenas',
    instinto: 'cazar',
    mirada: 'arriba',
    elemento: 'aire',
    creacion: 'app',
    descripcion:
      'Escucha con los cuernos. Sabe quién viene por el claro mucho antes de que aparezca.',
  },
  {
    id: 'felino-agazapado',
    archivo: 'felino-agazapado.jpeg',
    especie: 'Felino Agazapado',
    instinto: 'guardar',
    mirada: 'adentro',
    elemento: 'agua',
    creacion: 'app',
    descripcion:
      'No se levanta nunca. Dicen que sigue esperando algo que ya ocurrió hace mucho.',
  },
];

// Bustos: el marco los corta a la altura del pecho, así que no pueden pararse en el
// paisaje. Quedan aquí para lo que venga después (la ficha, el selector del móvil).
export const RETRATOS = [
  { id: 'retrato-melena', archivo: 'retrato-melena.jpeg', especie: 'Rostro de Melena Rosada' },
  { id: 'retrato-toro', archivo: 'retrato-toro.jpeg', especie: 'Toro de Lengua Roja' },
  { id: 'retrato-leopardo', archivo: 'retrato-leopardo.jpeg', especie: 'Leopardo Azul' },
  { id: 'retrato-aullador', archivo: 'retrato-aullador.jpeg', especie: 'Felino Aullador' },
  { id: 'retrato-hocico', archivo: 'retrato-hocico.jpeg', especie: 'Hocico de Mil Dientes' },
];

// Elige animal a partir de lo que la persona marcó. Son once animales para 384
// combinaciones, así que casi nunca hay un calce perfecto: gana quien más coincida, y
// entre los empatados decide el nombre. La última pregunta pesa doble porque es la que
// habla de lo que la persona quiere crear.
//
// La misma persona con las mismas respuestas recibe siempre el mismo animal.
export function elegirPersonaje({ instinto, mirada, elemento, creacion, nombre = '' }) {
  let mejor = [];
  let mejorPuntaje = -1;

  for (const p of PERSONAJES) {
    const puntaje =
      (p.instinto === instinto ? 1 : 0) +
      (p.mirada === mirada ? 1 : 0) +
      (p.elemento === elemento ? 1 : 0) +
      (p.creacion === creacion ? 2 : 0);
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = [p];
    } else if (puntaje === mejorPuntaje) {
      mejor.push(p);
    }
  }

  return mejor[huella(`${nombre}|${instinto}|${mirada}|${elemento}|${creacion}`) % mejor.length];
}

function huella(texto) {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h;
}

// Nombres de relleno para el modo demo (en la pieza real llegan desde el móvil).
export const NOMBRES_DEMO = [
  'Camila', 'Andrés', 'Valentina', 'Tomás', 'Mariana', 'Julián',
  'Lucía', 'Samuel', 'Antonia', 'Emilio', 'Salomé', 'Martín',
];

