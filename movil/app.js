// El creador: la persona deja su nombre, contesta cuatro preguntas y su animal aparece
// aquí y en el paisaje. Los animales ya existen; lo que hacen las respuestas es decidir
// cuál de ellos le corresponde.

import { PREGUNTAS, elegirPersonaje } from '../datos/personajes.js';
import { recortar } from '../comun/recorte.js';
import { emitir } from '../comun/enlace.js';

const RUTA_PERSONAJES = '../assets/personajes/';
const RUTA_OPCIONES = '../assets/opciones/';

const formulario = document.getElementById('formulario');
const resultado = document.getElementById('resultado');
const nombreEl = document.getElementById('nombre');
const generarEl = document.getElementById('generar');
const avisoEl = document.getElementById('aviso');

const eleccion = {};

pintarPreguntas();
nombreEl.addEventListener('input', revisar);
generarEl.addEventListener('click', generar);
document.getElementById('otra').addEventListener('click', reiniciar);

function pintarPreguntas() {
  const contenedor = document.getElementById('preguntas');

  PREGUNTAS.forEach((pregunta, i) => {
    const seccion = document.createElement('section');
    seccion.className = 'paso';

    const titulo = document.createElement('h2');
    titulo.innerHTML = `<span class="cifra">${i + 1}</span> `;
    titulo.append(pregunta.titulo);
    seccion.append(titulo);

    const opciones = document.createElement('div');
    opciones.className = pregunta.porImagen ? 'opciones opciones-imagen' : 'opciones opciones-texto';

    for (const opcion of pregunta.opciones) {
      opciones.append(crearOpcion(pregunta, opcion, opciones));
    }

    seccion.append(opciones);
    contenedor.append(seccion);
  });
}

function crearOpcion(pregunta, opcion, contenedor) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'opcion';
  boton.setAttribute('aria-pressed', 'false');

  if (pregunta.porImagen) {
    boton.classList.add('con-imagen');
    const img = document.createElement('img');
    img.src = `${RUTA_OPCIONES}${opcion.id}.jpg`;
    img.alt = '';
    // Mientras no exista la imagen, la casilla se queda con la palabra sola.
    img.addEventListener('error', () => {
      boton.classList.add('sin-imagen');
      img.remove();
    });
    boton.append(img);
  }

  const texto = document.createElement('span');
  texto.textContent = opcion.nombre;
  boton.append(texto);

  boton.addEventListener('click', () => {
    eleccion[pregunta.id] = opcion.id;
    for (const otro of contenedor.children) otro.setAttribute('aria-pressed', 'false');
    boton.setAttribute('aria-pressed', 'true');
    revisar();
  });

  return boton;
}

function revisar() {
  const listo =
    nombreEl.value.trim() &&
    PREGUNTAS.every((p) => eleccion[p.id]);
  generarEl.disabled = !listo;
  return listo;
}

async function generar() {
  if (!revisar()) return;

  generarEl.disabled = true;
  avisoEl.textContent = 'Invocando…';

  const nombre = nombreEl.value.trim();
  const personaje = elegirPersonaje({ ...eleccion, nombre });

  // El recorte tarda un momento la primera vez: se hace antes de mostrar nada, para que
  // el animal no aparezca con su fondo de estudio a cuestas.
  const sprite = await recortar(RUTA_PERSONAJES + personaje.archivo);

  emitir({ tipo: 'animal', nombre, personajeId: personaje.id, ...eleccion });

  document.getElementById('criatura').src = sprite.url;
  document.getElementById('criatura').alt = personaje.especie;
  document.getElementById('especie').textContent = personaje.especie;
  document.getElementById('portador').textContent = `de ${nombre}`;
  document.getElementById('descripcion').textContent = personaje.descripcion;

  avisoEl.textContent = '';
  formulario.hidden = true;
  resultado.hidden = false;
  window.scrollTo(0, 0);
}

function reiniciar() {
  nombreEl.value = '';
  for (const clave of Object.keys(eleccion)) delete eleccion[clave];
  for (const boton of document.querySelectorAll('.opcion')) {
    boton.setAttribute('aria-pressed', 'false');
  }
  revisar();
  resultado.hidden = true;
  formulario.hidden = false;
  window.scrollTo(0, 0);
  nombreEl.focus();
}
