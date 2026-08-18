// Recorte de fondo en tiempo de carga.
//
// Los personajes vienen en JPEG con fondo plano (rojo, amarillo, a veces dos zonas).
// En vez de buscar "todos los píxeles de color X" —que borraría también los colores
// del personaje— inundamos desde los bordes: un píxel es fondo solo si es parecido a
// su vecino y hay un camino de parecidos hasta el borde de la imagen. Así el amarillo
// del fondo desaparece y el amarillo de un ojo se queda.

const cache = new Map();

/**
 * @returns {Promise<{url: string, ancho: number, alto: number}>} sprite recortado y
 * recortado también a su caja, para poder anclarlo por las patas.
 */
export async function recortar(src, opciones = {}) {
  if (cache.has(src)) return cache.get(src);
  const promesa = procesar(src, opciones);
  cache.set(src, promesa);
  return promesa;
}

async function procesar(src, { tolerancia = 38, continuidad = 22, exacto = 4, erosion = 2 } = {}) {
  const img = await cargar(src);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const lienzo = document.createElement('canvas');
  lienzo.width = w;
  lienzo.height = h;
  const ctx = lienzo.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);

  const imagen = ctx.getImageData(0, 0, w, h);
  const px = imagen.data;

  const { fondo: mascara, paleta } = inundarDesdeBordes(px, w, h, tolerancia, continuidad);
  rellenarBolsas(px, w, h, mascara, paleta, exacto);
  let fondo = mascara;
  for (let i = 0; i < erosion; i++) fondo = dilatar(fondo, w, h);
  descartarIslas(fondo, w, h);

  // Aplicar transparencia y medir la caja de lo que queda.
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let i = 0; i < w * h; i++) {
    if (fondo[i]) {
      px[i * 4 + 3] = 0;
    } else {
      const x = i % w;
      const y = (i / w) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { url: src, ancho: w, alto: h }; // no quedó nada: devolver original
  ctx.putImageData(imagen, 0, 0);

  const ancho = maxX - minX + 1;
  const alto = maxY - minY + 1;
  const recortado = document.createElement('canvas');
  recortado.width = ancho;
  recortado.height = alto;
  recortado.getContext('2d').drawImage(lienzo, minX, minY, ancho, alto, 0, 0, ancho, alto);

  return { url: recortado.toDataURL('image/png'), ancho, alto };
}

// Cada región de fondo recuerda el color del borde donde nació. Un píxel entra si se
// parece a ESE color (tolerancia) y además a su vecino inmediato (continuidad); con solo
// lo segundo, una cadena de parecidos atraviesa el contorno negro y se come al personaje.
function inundarDesdeBordes(px, w, h, tolerancia, continuidad) {
  const total = w * h;
  const fondo = new Uint8Array(total);
  const cola = new Int32Array(total);
  const refR = new Uint8Array(total);
  const refG = new Uint8Array(total);
  const refB = new Uint8Array(total);
  let fin = 0;

  const encolar = (i, r, g, b) => {
    if (!fondo[i]) {
      fondo[i] = 1;
      refR[i] = r;
      refG[i] = g;
      refB[i] = b;
      cola[fin++] = i;
    }
  };

  const paleta = [];
  const sembrar = (i) => {
    const p = i * 4;
    const r = px[p], g = px[p + 1], b = px[p + 2];
    if (!paleta.some((c) => Math.abs(c[0] - r) < 12 && Math.abs(c[1] - g) < 12 && Math.abs(c[2] - b) < 12)) {
      paleta.push([r, g, b]);
    }
    encolar(i, r, g, b);
  };
  for (let x = 0; x < w; x++) {
    sembrar(x);
    sembrar((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    sembrar(y * w);
    sembrar(y * w + w - 1);
  }

  const vecinos = new Int32Array(4);
  let ini = 0;
  while (ini < fin) {
    const i = cola[ini++];
    const p = i * 4;
    const r = px[p], g = px[p + 1], b = px[p + 2];
    const rr = refR[i], rg = refG[i], rb = refB[i];
    const x = i % w;
    const y = (i / w) | 0;

    let n = 0;
    if (x > 0) vecinos[n++] = i - 1;
    if (x < w - 1) vecinos[n++] = i + 1;
    if (y > 0) vecinos[n++] = i - w;
    if (y < h - 1) vecinos[n++] = i + w;

    for (let k = 0; k < n; k++) {
      const j = vecinos[k];
      if (fondo[j]) continue;
      const q = j * 4;
      const jr = px[q], jg = px[q + 1], jb = px[q + 2];
      if (
        Math.abs(jr - rr) <= tolerancia &&
        Math.abs(jg - rg) <= tolerancia &&
        Math.abs(jb - rb) <= tolerancia &&
        Math.abs(jr - r) <= continuidad &&
        Math.abs(jg - g) <= continuidad &&
        Math.abs(jb - b) <= continuidad
      ) {
        encolar(j, rr, rg, rb);
      }
    }
  }
  return { fondo, paleta };
}

// Las bolsas de fondo que el personaje encierra con su propio cuerpo (entre las patas,
// bajo la panza, cuando la sombra cierra el hueco) nunca se tocan con el borde, así que
// la inundación no llega. Se reconocen porque son EXACTAMENTE el color del fondo: por eso
// aquí la tolerancia es estrecha, y un ojo amarillo que solo se parece al fondo amarillo
// se queda donde está. El mínimo de tamaño evita picar agujeros de un píxel.
function rellenarBolsas(px, w, h, fondo, paleta, exacto, minimo = 300) {
  const total = w * h;
  const candidato = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    if (fondo[i]) continue;
    const p = i * 4;
    const r = px[p], g = px[p + 1], b = px[p + 2];
    for (const c of paleta) {
      if (Math.abs(r - c[0]) <= exacto && Math.abs(g - c[1]) <= exacto && Math.abs(b - c[2]) <= exacto) {
        candidato[i] = 1;
        break;
      }
    }
  }

  const visto = new Uint8Array(total);
  const pila = new Int32Array(total);
  const bolsa = new Int32Array(total);
  for (let s = 0; s < total; s++) {
    if (!candidato[s] || visto[s]) continue;
    let cima = 0, n = 0;
    pila[cima++] = s;
    visto[s] = 1;
    while (cima > 0) {
      const i = pila[--cima];
      bolsa[n++] = i;
      const x = i % w;
      const y = (i / w) | 0;
      if (x > 0 && candidato[i - 1] && !visto[i - 1]) { visto[i - 1] = 1; pila[cima++] = i - 1; }
      if (x < w - 1 && candidato[i + 1] && !visto[i + 1]) { visto[i + 1] = 1; pila[cima++] = i + 1; }
      if (y > 0 && candidato[i - w] && !visto[i - w]) { visto[i - w] = 1; pila[cima++] = i - w; }
      if (y < h - 1 && candidato[i + w] && !visto[i + w]) { visto[i + w] = 1; pila[cima++] = i + w; }
    }
    if (n >= minimo) for (let k = 0; k < n; k++) fondo[bolsa[k]] = 1;
  }
}

// Se queda con el cuerpo del personaje y tira lo que anda suelto: firmas, marcas de agua,
// motas de compresión, trozos de sombra desprendidos. Sobrevive lo más grande y cualquier
// parte que llegue al 2% de eso (una pata separada, un apéndice).
function descartarIslas(fondo, w, h, minimo = 0.02) {
  const total = w * h;
  const visto = new Uint8Array(total);
  const pila = new Int32Array(total);
  const piezas = [];

  for (let s = 0; s < total; s++) {
    if (fondo[s] || visto[s]) continue;
    let cima = 0;
    pila[cima++] = s;
    visto[s] = 1;
    const pieza = [];
    while (cima > 0) {
      const i = pila[--cima];
      pieza.push(i);
      const x = i % w;
      const y = (i / w) | 0;
      if (x > 0 && !fondo[i - 1] && !visto[i - 1]) { visto[i - 1] = 1; pila[cima++] = i - 1; }
      if (x < w - 1 && !fondo[i + 1] && !visto[i + 1]) { visto[i + 1] = 1; pila[cima++] = i + 1; }
      if (y > 0 && !fondo[i - w] && !visto[i - w]) { visto[i - w] = 1; pila[cima++] = i - w; }
      if (y < h - 1 && !fondo[i + w] && !visto[i + w]) { visto[i + w] = 1; pila[cima++] = i + w; }
    }
    piezas.push(pieza);
  }

  if (!piezas.length) return;
  const mayor = piezas.reduce((a, b) => (b.length > a.length ? b : a));
  const corte = mayor.length * minimo;
  for (const pieza of piezas) {
    if (pieza.length >= corte) continue;
    for (const i of pieza) fondo[i] = 1;
  }
}

// Crece la máscara de fondo un píxel hacia adentro: se come el halo de compresión JPEG
// que queda pegado al contorno.
function dilatar(fondo, w, h) {
  const salida = new Uint8Array(fondo);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (fondo[i]) continue;
      if (
        (x > 0 && fondo[i - 1]) ||
        (x < w - 1 && fondo[i + 1]) ||
        (y > 0 && fondo[i - w]) ||
        (y < h - 1 && fondo[i + w])
      ) {
        salida[i] = 1;
      }
    }
  }
  return salida;
}

function cargar(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
}
