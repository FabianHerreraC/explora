// La campana que suena cuando llega una criatura nueva.
//
// Sintetizada, sin archivo: una campana es un golpe seco y un montón de armónicos que se
// apagan a distinta velocidad. Los parciales no son múltiplos enteros de la fundamental
// —por eso una campana no suena a nota limpia sino a metal.

const PARCIALES = [
  { razon: 1.00, volumen: 1.00, cola: 2.6 },
  { razon: 2.00, volumen: 0.55, cola: 1.9 },
  { razon: 2.41, volumen: 0.42, cola: 1.5 }, // el parcial que da el sabor metálico
  { razon: 3.02, volumen: 0.28, cola: 1.1 },
  { razon: 4.48, volumen: 0.18, cola: 0.7 },
];

const FUNDAMENTAL = 784; // sol5: alta, para que se oiga sobre el ruido de una sala
const VOLUMEN = 0.18;

let contexto = null;

function abrir() {
  if (!contexto) {
    const Audio = window.AudioContext ?? window.webkitAudioContext;
    if (!Audio) return null;
    contexto = new Audio();
  }
  return contexto;
}

// Los navegadores no dejan sonar nada hasta que alguien toque la página. En la pantalla
// del evento eso lo resuelve el primer clic del equipo; hasta entonces, silencio.
export function desbloquearSonido() {
  const ctx = abrir();
  if (!ctx) return;
  const despertar = () => ctx.resume();
  for (const evento of ['pointerdown', 'keydown']) {
    window.addEventListener(evento, despertar, { once: false });
  }
}

export function sonido() {
  const ctx = abrir();
  if (!ctx || ctx.state !== 'running') return false;

  const ahora = ctx.currentTime;
  const salida = ctx.createGain();
  salida.gain.value = VOLUMEN;
  salida.connect(ctx.destination);

  for (const p of PARCIALES) {
    const osc = ctx.createOscillator();
    const sobre = ctx.createGain();
    osc.type = 'sine';
    // Un pelo de desafinación entre parciales: sin ella suena a sintetizador, no a metal.
    osc.frequency.value = FUNDAMENTAL * p.razon * (1 + (Math.random() - 0.5) * 0.004);
    sobre.gain.setValueAtTime(0, ahora);
    sobre.gain.linearRampToValueAtTime(p.volumen, ahora + 0.004); // el golpe
    sobre.gain.exponentialRampToValueAtTime(0.0001, ahora + p.cola);
    osc.connect(sobre).connect(salida);
    osc.start(ahora);
    osc.stop(ahora + p.cola + 0.1);
  }
  return true;
}

export function sonidoDisponible() {
  return contexto?.state === 'running';
}
