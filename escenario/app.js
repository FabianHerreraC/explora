// Escenario: recibe personajes y los pone a vivir en el claro.
// Por ahora nadie los envía todavía, así que se alimenta solo (modo demo).

import { PERSONAJES, NOMBRES_DEMO } from '../datos/personajes.js';
import { recortar } from '../comun/recorte.js';
import { escuchar, reiniciarSesion } from '../comun/enlace.js';
import { sonido, desbloquearSonido } from '../comun/campana.js';

const RUTA_PERSONAJES = '../assets/personajes/';

// El suelo pisable no se calibra a mano: se lee del propio paisaje. Todo lo blanco es
// pisable, y lo blanco se decide sobre la imagen reducida, así una maraña de líneas
// negras finas cuenta como zona oscura aunque tenga huecos claros entre trazo y trazo.
const SUELO = {
  alto: 0.055,   // todos miden lo mismo, en fracción del escenario
  paso: 8,       // píxeles del fondo por celda del mapa
  umbral: 205,   // a partir de este brillo (0-255) la celda es blanca
  margen: 2,     // celdas blancas alrededor que se exigen: descarta motas y filos
  techo: 0.10,   // nadie nace tan arriba que su etiqueta se salga del cuadro
  // Esquina superior izquierda que ocupa la ficha: ahí no habita nadie. Se descuenta
  // contando el cuerpo y la etiqueta, no solo las patas, para que ninguno se asome.
  vedado: { ancho: 0.19, alto: 0.34 },
  etiqueta: 0.045,
};

const INTERVALO_DEMO = 5000;
const DURACION_FICHA = 9000;

const capa = document.getElementById('capa');
const ficha = document.getElementById('ficha');
const estado = document.getElementById('estado');
const zona = document.getElementById('zona');
const botonReiniciar = document.getElementById('reiniciar');

const enEscena = [];
const sprites = new Map();
let pisable = [];  // celdas blancas del fondo, en fracciones del escenario
let temporizadorFicha = null;
let generados = 0; // orden de generación: el número que lleva cada criatura encima
let demo = null;   // el reloj del modo demo, hasta que llegue la primera de verdad

async function arrancar() {
  estado.textContent = 'leyendo el terreno…';
  pisable = await mapearSuelo();

  estado.textContent = 'recortando fondos…';
  await Promise.all(
    PERSONAJES.map(async (p) => {
      sprites.set(p.id, await recortar(RUTA_PERSONAJES + p.archivo));
    })
  );

  window.__explora = { sprites, SUELO, pisable, invocar, limpiar }; // para calibrar
  desbloquearSonido();

  // La campana solo anuncia a quien llega en vivo: ni el repoblado inicial —serían doce
  // campanadas de golpe— ni las criaturas de relleno del demo.
  let enVivo = false;

  // Primero se escucha: escuchar() entrega lo ya invocado antes de resolver. Así el
  // demo solo arranca si de verdad no hay nadie, y la pantalla del evento no se estrena
  // con una criatura inventada.
  let recibidos = 0;
  await escuchar((mensaje) => {
    const personaje = PERSONAJES.find((p) => p.id === mensaje.personajeId);
    if (!personaje || !mensaje.nombre) return;
    recibidos++;
    // La primera de verdad se lleva por delante el demo: el paisaje se vacía de relleno
    // y la numeración empieza en 001 con ella, no detrás de criaturas inventadas.
    if (demo) {
      clearInterval(demo);
      demo = null;
      limpiar();
      generados = 0;
    }
    estado.textContent = 'en vivo';
    if (enVivo) sonido();
    invocar({ personaje, nombre: mensaje.nombre });
  });

  enVivo = true;

  if (recibidos === 0) arrancarDemo();

  prepararReinicio();

  // Pulsar sobre una criatura la agranda mientras se mantenga el dedo o el botón.
  capa.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.personaje');
    if (el) el.classList.add('ampliado');
  });
  for (const fin of ['pointerup', 'pointercancel']) {
    window.addEventListener(fin, () => {
      for (const el of capa.querySelectorAll('.ampliado')) el.classList.remove('ampliado');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); invocar(); }
    if (e.key === 'd') { dibujarZona(); zona.hidden = !zona.hidden; }
    if (e.key === 'c') limpiar();
  });
}

function arrancarDemo() {
  if (demo) return;
  estado.textContent = 'demo';
  invocar();
  demo = setInterval(invocar, INTERVALO_DEMO);
}

// Reiniciar de verdad: el paisaje queda vacío, la numeración vuelve a 001 y lo invocado
// antes no regresa ni recargando. No se borra nada de la base: sigue archivado.
// Pide confirmación porque un clic suelto en pleno evento se llevaría la sesión.
function prepararReinicio() {
  let armado = null;
  botonReiniciar.hidden = false;

  const desarmar = () => {
    clearTimeout(armado);
    armado = null;
    botonReiniciar.textContent = 'reiniciar';
    botonReiniciar.classList.remove('armado');
  };

  botonReiniciar.addEventListener('click', async () => {
    if (!armado) {
      botonReiniciar.textContent = '¿seguro?';
      botonReiniciar.classList.add('armado');
      armado = setTimeout(desarmar, 4000);
      return;
    }

    desarmar();
    botonReiniciar.disabled = true;
    try {
      await reiniciarSesion();
      limpiar();
      generados = 0;
      // Después de reiniciar el paisaje se queda vacío y esperando, sin demo: si el
      // público ya está en la sala, unas criaturas de relleno con nombres inventados
      // hacen creer que la pieza está ocupada. El demo vuelve recargando la página.
      if (demo) { clearInterval(demo); demo = null; }
      estado.textContent = 'en espera';
    } catch (error) {
      estado.textContent = 'no se pudo reiniciar';
      console.error(error);
    }
    botonReiniciar.disabled = false;
  });
}

// --- entrada de personajes -------------------------------------------------

function invocar(datos) {
  const personaje = datos?.personaje ?? azar(PERSONAJES);
  const nombre = datos?.nombre ?? azar(NOMBRES_DEMO);
  aparecer(personaje, nombre);
}

function aparecer(personaje, nombre) {
  const sprite = sprites.get(personaje.id);
  if (!sprite) return;

  const sitio = buscarSitio();
  const alto = SUELO.alto;

  const el = document.createElement('div');
  el.className = 'personaje';
  el.style.left = `${sitio.x * 100}%`;
  el.style.top = `${sitio.y * 100}%`;
  el.style.height = `${alto * 100}%`;
  el.style.zIndex = String(Math.round(sitio.t * 1000));

  const entrada = document.createElement('div');
  entrada.className = 'entrada';
  // Cada uno respira a su propio ritmo y arranca en un punto distinto del ciclo,
  // para que el claro no lata al unísono.
  const ritmo = 3.6 + Math.random() * 2.8;
  const flotar = document.createElement('div');
  flotar.className = 'flotar';
  flotar.style.setProperty('--ritmo', `${ritmo.toFixed(2)}s`);
  flotar.style.animationDelay = `${(-Math.random() * ritmo).toFixed(2)}s`;

  const img = document.createElement('img');
  img.src = sprite.url;
  img.alt = personaje.especie;

  const numero = String(++generados).padStart(3, '0');
  const etiqueta = document.createElement('span');
  etiqueta.className = 'etiqueta';
  etiqueta.innerHTML = '<b class="numero"></b><b class="nombre"></b>';
  etiqueta.querySelector('.numero').textContent = numero;
  etiqueta.querySelector('.nombre').textContent = nombre;

  flotar.append(img);
  entrada.append(flotar);
  el.append(entrada, etiqueta);
  capa.append(el);

  // Nadie se va: el paisaje se va poblando. Solo la tecla c lo vacía.
  enEscena.push({ el, x: sitio.x, y: sitio.y });

  mostrarFicha(personaje, nombre);
}

function despedir(habitante) {
  habitante.el.classList.add('saliendo');
  setTimeout(() => habitante.el.remove(), 700);
}

function limpiar() {
  while (enEscena.length) despedir(enEscena.shift());
}

// Busca una celda blanca que no quede encima de alguien que ya está. La profundidad es
// la altura en pantalla: quien pisa más abajo tapa a quien pisa más arriba.
function buscarSitio() {
  let mejor = null;
  let mejorDistancia = -1;

  for (let intento = 0; intento < 20; intento++) {
    const celda = azar(pisable);
    const { x, y } = celda;

    let distancia = Infinity;
    for (const otro of enEscena) {
      const d = Math.hypot(x - otro.x, (y - otro.y) * 1.6);
      if (d < distancia) distancia = d;
    }
    if (distancia > mejorDistancia) {
      mejorDistancia = distancia;
      mejor = { x, y, t: y };
    }
    if (distancia > 0.12) break;
  }
  return mejor;
}

// --- lectura del terreno ---------------------------------------------------

async function mapearSuelo() {
  const img = document.getElementById('fondo');
  // Esperar por el evento load y no por decode(): sobre el PNG grande del fondo, la
  // promesa de decode() se queda sin resolver y el escenario no arranca nunca.
  if (!img.complete || !img.naturalWidth) {
    await new Promise((listo, falla) => {
      img.addEventListener('load', listo, { once: true });
      img.addEventListener('error', () => falla(new Error('no se pudo cargar el fondo')), { once: true });
    });
  }

  const ancho = Math.floor(img.naturalWidth / SUELO.paso);
  const alto = Math.floor(img.naturalHeight / SUELO.paso);
  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, ancho, alto); // al reducir, el promedio ya oscurece el rayado
  const px = ctx.getImageData(0, 0, ancho, alto).data;

  const blanco = new Uint8Array(ancho * alto);
  for (let i = 0; i < ancho * alto; i++) {
    const p = i * 4;
    const luz = 0.299 * px[p] + 0.587 * px[p + 1] + 0.114 * px[p + 2];
    blanco[i] = luz >= SUELO.umbral ? 1 : 0;
  }

  // Solo cuenta como zona lo que tiene blanco alrededor: una raya blanca de un píxel
  // entre dos manchas negras no es sitio donde pararse.
  const m = SUELO.margen;
  const celdas = [];
  const desde = Math.max(m, Math.ceil(SUELO.techo * alto));
  const vedadoHasta = SUELO.vedado.alto + SUELO.alto + SUELO.etiqueta;
  for (let y = desde; y < alto - m; y++) {
    for (let x = m; x < ancho - m; x++) {
      const fx = (x + 0.5) / ancho;
      const fy = (y + 0.5) / alto;
      if (fx <= SUELO.vedado.ancho && fy <= vedadoHasta) continue;

      let limpio = true;
      for (let dy = -m; dy <= m && limpio; dy++) {
        for (let dx = -m; dx <= m; dx++) {
          if (!blanco[(y + dy) * ancho + (x + dx)]) { limpio = false; break; }
        }
      }
      if (limpio) celdas.push({ x: fx, y: fy });
    }
  }
  return celdas;
}

// --- ficha -----------------------------------------------------------------

function mostrarFicha(personaje, nombre) {
  const retrato = ficha.querySelector('.ficha-animal');
  retrato.src = sprites.get(personaje.id)?.url ?? '';
  retrato.alt = personaje.especie;
  ficha.querySelector('.ficha-nombre').textContent = nombre;
  ficha.querySelector('.ficha-especie').textContent = personaje.especie;
  ficha.querySelector('.ficha-descripcion').textContent = personaje.descripcion;
  ficha.hidden = false;

  // Reiniciar la animación de entrada aunque la ficha ya estuviera visible.
  ficha.style.animation = 'none';
  void ficha.offsetWidth;
  ficha.style.animation = '';

  clearTimeout(temporizadorFicha);
  temporizadorFicha = setTimeout(() => { ficha.hidden = true; }, DURACION_FICHA);
}

// --- calibración -----------------------------------------------------------

// Pinta de rosa lo que el escenario considera pisable (tecla d).
function dibujarZona() {
  if (zona.firstChild) return;
  const escena = document.getElementById('escena'); // zona puede estar oculta y medir 0
  const lienzo = document.createElement('canvas');
  lienzo.width = 400;
  lienzo.height = Math.round(400 * escena.clientHeight / escena.clientWidth);
  lienzo.style.cssText = 'width:100%;height:100%';
  const ctx = lienzo.getContext('2d');
  ctx.fillStyle = 'rgba(216, 242, 10, .25)';
  ctx.fillRect(0, 0, SUELO.vedado.ancho * lienzo.width,
    (SUELO.vedado.alto + SUELO.alto + SUELO.etiqueta) * lienzo.height);
  ctx.fillStyle = 'rgba(255, 45, 149, .55)';
  const lado = Math.max(1, lienzo.width * SUELO.paso / 2688);
  for (const c of pisable) {
    ctx.fillRect(c.x * lienzo.width - lado / 2, c.y * lienzo.height - lado / 2, lado, lado);
  }
  zona.append(lienzo);
}

// --- auxiliares ------------------------------------------------------------

const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];

arrancar();
