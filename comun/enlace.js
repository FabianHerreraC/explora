// El enlace entre el móvil y el escenario.
//
// Hoy viaja por dentro del navegador: BroadcastChannel para las pestañas vivas y una
// copia en localStorage para las que abran después. Eso alcanza para trabajar en un solo
// equipo, no para dos dispositivos distintos.
//
// Cuando exista el servidor, este archivo es lo único que cambia: emitir() manda por
// WebSocket y escuchar() se suscribe. Ni el móvil ni el escenario se enteran.

const CANAL = 'explora';
const CLAVE = 'explora:ultimo';

let canal = null;
try {
  canal = new BroadcastChannel(CANAL);
} catch {
  canal = null; // navegador sin BroadcastChannel: queda el localStorage
}

export function emitir(datos) {
  const mensaje = { ...datos, id: identificador(), enviadoEn: Date.now() };
  canal?.postMessage(mensaje);
  try {
    localStorage.setItem(CLAVE, JSON.stringify(mensaje));
  } catch {
    // navegación privada sin almacenamiento: el canal ya hizo su parte
  }
  return mensaje;
}

export function escuchar(alLlegar) {
  // Los dos caminos pueden traer el mismo mensaje: se entrega una sola vez.
  const vistos = new Set();
  const recibir = (mensaje) => {
    if (!mensaje?.id || vistos.has(mensaje.id)) return;
    vistos.add(mensaje.id);
    alLlegar(mensaje);
  };

  canal?.addEventListener('message', (e) => recibir(e.data));
  window.addEventListener('storage', (e) => {
    if (e.key !== CLAVE || !e.newValue) return;
    try {
      recibir(JSON.parse(e.newValue));
    } catch {
      // mensaje ilegible: se ignora
    }
  });
}

function identificador() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
