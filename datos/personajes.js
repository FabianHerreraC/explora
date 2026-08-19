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

  {
    id: 'leopardo-lengua',
    archivo: 'leopardo-lengua.jpeg',
    especie: 'Leopardo de Lengua Larga',
    instinto: 'cazar',
    mirada: 'defrente',
    elemento: 'fuego',
    creacion: 'viral',
    descripcion:
      'Se le derrite la cara cuando alguien lo nombra. La lengua le llega al suelo y por ahí se entera de todo.',
  },
  {
    id: 'gato-flaco',
    archivo: 'gato-flaco.jpeg',
    especie: 'Gato de Alambre',
    instinto: 'vagar',
    mirada: 'dereojo',
    elemento: 'aire',
    creacion: 'videojuego',
    descripcion:
      'No pesa nada y aun así hunde el pasto donde pisa. Los bigotes le siguen creciendo hacia el pasado.',
  },
  {
    id: 'gatito-espiral',
    archivo: 'gatito-espiral.jpeg',
    especie: 'Gato Recién Hecho',
    instinto: 'jugar',
    mirada: 'defrente',
    elemento: 'fuego',
    creacion: 'viral',
    descripcion:
      'Todavía no sabe para qué sirve la lengua y la lleva afuera por si acaso. Se ríe de cosas que nadie más ve.',
  },
  {
    id: 'lince-naranja',
    archivo: 'lince-naranja.jpeg',
    especie: 'Lince de Ojos Girados',
    instinto: 'cazar',
    mirada: 'dereojo',
    elemento: 'fuego',
    creacion: 'marca',
    descripcion:
      'Vigila dos horizontes al tiempo. Sus manchas cambian de sitio cuando nadie lo mira.',
  },
  {
    id: 'gato-dientes',
    archivo: 'gato-dientes.jpeg',
    especie: 'Gato de Mil Dientes',
    instinto: 'cazar',
    mirada: 'defrente',
    elemento: 'fuego',
    creacion: 'videojuego',
    descripcion:
      'Se despierta con hambre de algo que no existe. El pelo se le eriza antes de que pase lo que va a pasar.',
  },
  {
    id: 'gato-peludo',
    archivo: 'gato-peludo.jpeg',
    especie: 'Gato de Ovillo',
    instinto: 'jugar',
    mirada: 'adentro',
    elemento: 'aire',
    creacion: 'marca',
    descripcion:
      'Se enreda en su propio pelo cada noche y amanece deshecho. Ronronea en una frecuencia que atrasa los relojes.',
  },
  {
    id: 'can-manchado',
    archivo: 'can-manchado.jpeg',
    especie: 'Can de Hocico Negro',
    instinto: 'cazar',
    mirada: 'dereojo',
    elemento: 'tierra',
    creacion: 'app',
    descripcion:
      'Huele lo que uno pensó ayer. Ladra hacia adentro para no delatar dónde está.',
  },
  {
    id: 'perro-flaco',
    archivo: 'perro-flaco.jpeg',
    especie: 'Perro de Patas Largas',
    instinto: 'vagar',
    mirada: 'arriba',
    elemento: 'aire',
    creacion: 'app',
    descripcion:
      'Camina sobre el mundo sin llegar a tocarlo. Siempre llega antes que su sombra.',
  },
  {
    id: 'bulldog-verde',
    archivo: 'bulldog-verde.jpeg',
    especie: 'Guardián de Mandíbula',
    instinto: 'guardar',
    mirada: 'defrente',
    elemento: 'tierra',
    creacion: 'marca',
    descripcion:
      'No deja pasar a nadie que venga con prisa. Lo que muerde no lo suelta ni dormido.',
  },
  {
    id: 'liebre-rosa',
    archivo: 'liebre-rosa.jpeg',
    especie: 'Liebre de Orejas Altas',
    instinto: 'vagar',
    mirada: 'dereojo',
    elemento: 'aire',
    creacion: 'viral',
    descripcion:
      'Oye crecer la maleza a tres valles de distancia. Nunca está donde uno la vio.',
  },
  {
    id: 'ave-verde',
    archivo: 'ave-verde.jpeg',
    especie: 'Ave de Pico Rosa',
    instinto: 'guardar',
    mirada: 'arriba',
    elemento: 'aire',
    creacion: 'app',
    descripcion:
      'Se para en una sola pata para no gastar el suelo. Canta únicamente cuando nadie puede repetirlo.',
  },
  {
    id: 'buitre-verde',
    archivo: 'buitre-verde.jpeg',
    especie: 'Buitre de Espalda Curva',
    instinto: 'guardar',
    mirada: 'arriba',
    elemento: 'tierra',
    creacion: 'app',
    descripcion:
      'Espera con una paciencia que da miedo. Sabe el final de historias que apenas empiezan.',
  },
  {
    id: 'liebre-azul',
    archivo: 'liebre-azul.jpeg',
    especie: 'Liebre de Dientes Blancos',
    instinto: 'jugar',
    mirada: 'defrente',
    elemento: 'agua',
    creacion: 'videojuego',
    descripcion:
      'Corre para que no la alcancen sus propias ideas. Se ríe mientras huye.',
  },
  {
    id: 'liebre-salto',
    archivo: 'liebre-salto.jpeg',
    especie: 'Liebre de Salto Largo',
    instinto: 'vagar',
    mirada: 'adentro',
    elemento: 'agua',
    creacion: 'videojuego',
    descripcion:
      'Salta antes de decidir hacia dónde. En el aire cambia de opinión y aun así cae de pie.',
  },
  {
    id: 'loro-rosado',
    archivo: 'loro-rosado.jpeg',
    especie: 'Loro de Ojos Vueltos',
    instinto: 'jugar',
    mirada: 'dereojo',
    elemento: 'aire',
    creacion: 'viral',
    descripcion:
      'Repite lo que todavía no se ha dicho. Le sale una pluma nueva cada vez que acierta.',
  },
  {
    id: 'simio-verde',
    archivo: 'simio-verde.jpeg',
    especie: 'Simio de Un Solo Ojo',
    instinto: 'guardar',
    mirada: 'adentro',
    elemento: 'tierra',
    creacion: 'app',
    descripcion:
      'Mira una cosa a la vez, pero la mira entera. Con las manos rosadas ordena lo que los demás desordenan.',
  },
  {
    id: 'mono-verde',
    archivo: 'mono-verde.jpeg',
    especie: 'Mono de Bostezo Azul',
    instinto: 'jugar',
    mirada: 'adentro',
    elemento: 'agua',
    creacion: 'videojuego',
    descripcion:
      'Se le sale el sueño por la boca. Anda en cuatro patas para no perderse nada del suelo.',
  },
  {
    id: 'orangutan-rosa',
    archivo: 'orangutan-rosa.jpeg',
    especie: 'Orangután de Tres Ojos',
    instinto: 'guardar',
    mirada: 'adentro',
    elemento: 'tierra',
    creacion: 'marca',
    descripcion:
      'Con el tercero mira hacia atrás en el tiempo. Camina despacio porque carga todo lo que ha visto.',
  },
  {
    id: 'mono-rosado',
    archivo: 'mono-rosado.jpeg',
    especie: 'Mono de Risa Roja',
    instinto: 'cazar',
    mirada: 'defrente',
    elemento: 'fuego',
    creacion: 'viral',
    descripcion:
      'Enseña los dientes cuando algo le gusta. La cola le dibuja en el aire lo que no sabe decir.',
  },
  {
    id: 'conejo-verde',
    archivo: 'conejo-verde.jpeg',
    especie: 'Conejo de Espiral',
    instinto: 'jugar',
    mirada: 'adentro',
    elemento: 'tierra',
    creacion: 'app',
    descripcion:
      'Se queda quieto hasta que el paisaje se acostumbra a él. Después se mueve y todo empieza de nuevo.',
  },
  {
    id: 'liebre-carrera',
    archivo: 'liebre-carrera.jpeg',
    especie: 'Liebre de Dientes Largos',
    instinto: 'cazar',
    mirada: 'dereojo',
    elemento: 'fuego',
    creacion: 'videojuego',
    descripcion:
      'Corre con la boca abierta para llegar con algo que contar. Nadie la ha visto detenerse.',
  },
  {
    id: 'elefante-rosa',
    archivo: 'elefante-rosa.jpeg',
    especie: 'Elefante de Orejas Anchas',
    instinto: 'guardar',
    mirada: 'arriba',
    elemento: 'agua',
    creacion: 'marca',
    descripcion:
      'Recuerda por todos los demás. Las orejas se le mueven con noticias que aún no llegan.',
  },
  {
    id: 'elefante-trompa',
    archivo: 'elefante-trompa.jpeg',
    especie: 'Elefante de Trompa Larga',
    instinto: 'vagar',
    mirada: 'arriba',
    elemento: 'agua',
    creacion: 'marca',
    descripcion:
      'Toca las cosas antes de verlas. Va despacio porque el suelo le va contando cosas.',
  },
  {
    id: 'mamut-rosa',
    archivo: 'mamut-rosa.jpeg',
    especie: 'Mamut de Pelo Rosa',
    instinto: 'vagar',
    mirada: 'arriba',
    elemento: 'agua',
    creacion: 'viral',
    descripcion:
      'Viene de un frío que ya no existe. Sigue caminando por pura costumbre.',
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

