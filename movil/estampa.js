// La estampa que la persona se lleva: el animal, su nombre y la marca, en un PNG
// vertical pensado para compartir desde el teléfono.

const ANCHO = 1080;
const ALTO = 1350;
const NEGRO = '#0d0d0d';
const GRIS = '#ebebeb';
const AZUL = '#373df5';
const LIMON = '#d8f20a';
const RUTA_MARCA = '../assets/marca/cd-estampa.svg';

export async function componerEstampa({ nombre, especie, descripcion, spriteUrl }) {
  const lienzo = document.createElement('canvas');
  lienzo.width = ANCHO;
  lienzo.height = ALTO;
  const ctx = lienzo.getContext('2d');

  ctx.fillStyle = NEGRO;
  ctx.fillRect(0, 0, ANCHO, ALTO);

  // La tipografía tiene que estar cargada antes de medir o pintar: si no, el lienzo
  // dibuja con la de reserva y las líneas quedan descuadradas.
  await document.fonts.load('400 64px "DM Serif Text"');
  await document.fonts.load('italic 400 40px "DM Serif Text"');

  // Se compone de abajo hacia arriba: primero se reserva el sitio de la marca, y el
  // texto se acomoda en lo que queda. Si no, una descripción larga acaba debajo del
  // logo, que fue justo lo que pasó al principio.
  const anchoMarca = ANCHO * 0.5;
  const margenMarca = anchoMarca * 0.07;
  let topeTexto = ALTO - 70;

  let marca = null;
  try {
    marca = await cargar(RUTA_MARCA);
  } catch {
    // Sin logo la estampa sigue valiendo; no vale la pena perderla por eso.
  }

  if (marca) {
    const altoMarca = anchoMarca * (marca.height / marca.width);
    const x = (ANCHO - anchoMarca) / 2;
    const y = ALTO - altoMarca - margenMarca * 2 - 70;
    ctx.fillStyle = AZUL;
    redondeado(ctx, x - margenMarca, y - margenMarca,
      anchoMarca + margenMarca * 2, altoMarca + margenMarca * 2, 16);
    ctx.fill();
    ctx.drawImage(marca, x, y, anchoMarca, altoMarca);
    topeTexto = y - margenMarca - 48;
  }

  const animal = await cargar(spriteUrl);
  // El animal manda: ocupa la parte de arriba, entero y apoyado sobre el texto.
  const zona = { arriba: ALTO * 0.05, alto: ALTO * 0.47 };
  const escala = Math.min((ANCHO * 0.8) / animal.width, zona.alto / animal.height);
  const anchoAnimal = animal.width * escala;
  const altoAnimal = animal.height * escala;
  ctx.drawImage(animal, (ANCHO - anchoAnimal) / 2, zona.arriba + (zona.alto - altoAnimal),
    anchoAnimal, altoAnimal);

  ctx.textAlign = 'center';
  let y = zona.arriba + zona.alto + 96;

  ctx.fillStyle = GRIS;
  ctx.font = '400 74px "DM Serif Text"';
  y = escribir(ctx, nombre.toLowerCase(), ANCHO / 2, y, ANCHO * 0.84, 82);

  ctx.fillStyle = AZUL;
  ctx.font = 'italic 400 44px "DM Serif Text"';
  y = escribir(ctx, especie.toLowerCase(), ANCHO / 2, y + 58, ANCHO * 0.84, 52);

  // La descripción solo entra si de verdad cabe entre la especie y la marca.
  ctx.fillStyle = '#9a9a9a';
  ctx.font = '400 32px "DM Serif Text"';
  escribir(ctx, descripcion.toLowerCase(), ANCHO / 2, y + 52, ANCHO * 0.78, 42, topeTexto);

  return new Promise((resolve) => lienzo.toBlob(resolve, 'image/png'));
}

// Parte el texto en líneas que quepan y devuelve dónde terminó. Con tope, deja de
// escribir antes de invadir lo que venga debajo.
function escribir(ctx, texto, x, y, anchoMax, salto, tope = Infinity) {
  const palabras = texto.split(/\s+/);
  let linea = '';
  for (const palabra of palabras) {
    const intento = linea ? `${linea} ${palabra}` : palabra;
    if (ctx.measureText(intento).width > anchoMax && linea) {
      if (y + salto > tope) return y;
      ctx.fillText(linea, x, y);
      y += salto;
      linea = palabra;
    } else {
      linea = intento;
    }
  }
  if (linea && y <= tope) ctx.fillText(linea, x, y);
  return y;
}

function redondeado(ctx, x, y, ancho, alto, radio) {
  ctx.beginPath();
  ctx.moveTo(x + radio, y);
  ctx.arcTo(x + ancho, y, x + ancho, y + alto, radio);
  ctx.arcTo(x + ancho, y + alto, x, y + alto, radio);
  ctx.arcTo(x, y + alto, x, y, radio);
  ctx.arcTo(x, y, x + ancho, y, radio);
  ctx.closePath();
}

function cargar(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`no se pudo cargar ${src}`));
    img.src = src;
  });
}

// En el teléfono, la hoja de compartir es lo que de verdad guarda la imagen en el
// carrete; la descarga clásica queda de reserva para el escritorio y para iOS viejos.
export async function entregar(blob, nombreArchivo) {
  const archivo = new File([blob], nombreArchivo, { type: 'image/png' });
  if (navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo] });
      return 'compartido';
    } catch (error) {
      if (error.name === 'AbortError') return 'cancelado';
    }
  }
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return 'descargado';
}
