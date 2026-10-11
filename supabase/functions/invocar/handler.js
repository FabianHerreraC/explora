import { PREGUNTAS, elegirPersonaje } from '../../../datos/personajes.js';

// Pública: identifica la aplicación; no sustituye las cuotas ni autentica personas.
export const PUBLIC_KEY = 'sb_publishable_AFt5EB-Gs9LCV3C4S3yyAg__LVDfjbl';
const ORIGIN = 'https://fabianherrerac.github.io';
const MAX_BYTES = 2048;

export function validar(datos) {
  const campos = ['nombre', 'personajeId', ...PREGUNTAS.map(p => p.id)];
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)
      || Object.keys(datos).some(k => !campos.includes(k))) throw new Error('datos inválidos');
  if (typeof datos.nombre !== 'string') throw new Error('nombre inválido');
  const nombre = datos.nombre.trim();
  if ([...nombre].length < 1 || [...nombre].length > 40 || /[\p{Cc}\p{Cf}]/u.test(nombre)) {
    throw new Error('nombre inválido');
  }
  for (const pregunta of PREGUNTAS) {
    if (!pregunta.opciones.some(o => o.id === datos[pregunta.id])) throw new Error('respuesta inválida');
  }
  const personaje = elegirPersonaje({ ...datos, nombre });
  if (datos.personajeId !== personaje.id) throw new Error('personaje inválido');
  return { nombre, personaje_id: personaje.id, ...Object.fromEntries(PREGUNTAS.map(p => [p.id, datos[p.id]])) };
}

async function leerJson(req) {
  if (!req.body) throw new Error('cuerpo vacío');
  const reader = req.body.getReader();
  const chunks = []; let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) { await reader.cancel(); throw new Error('cuerpo demasiado grande'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(bytes); let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body));
}

export function createHandler({ projectUrl, serviceKey, fetchImpl = fetch, allowedOrigin = ORIGIN }) {
  return async (req) => {
    const headers = {
      'Content-Type': 'application/json', 'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': allowedOrigin, 'Vary': 'Origin',
      'Access-Control-Allow-Headers': 'apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Expose-Headers': 'Retry-After',
    };
    const reply = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } });
    // CORS solo limita navegadores: la protección frente a clientes arbitrarios está en SQL.
    if (req.headers.has('origin') && req.headers.get('origin') !== allowedOrigin) return reply(403, { error: 'origen no permitido' });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (req.method !== 'POST') return reply(405, { error: 'método no permitido' }, { Allow: 'POST, OPTIONS' });
    if (req.headers.get('apikey') !== PUBLIC_KEY) return reply(401, { error: 'clave pública inválida' });
    if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply(415, { error: 'se requiere JSON' });
    if (Number(req.headers.get('content-length')) > MAX_BYTES) return reply(413, { error: 'envío demasiado grande' });
    let criatura;
    try { criatura = validar(await leerJson(req)); }
    catch { return reply(400, { error: 'revisa el nombre y las cuatro respuestas' }); }
    if (!projectUrl || !serviceKey) return reply(503, { error: 'invocación no disponible' });
    try {
      const result = await fetchImpl(`${projectUrl}/rest/v1/rpc/invocar_criatura_segura`, {
        method: 'POST',
        headers: { apikey: serviceKey, ...(serviceKey.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${serviceKey}` }), 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_datos: criatura }),
        signal: AbortSignal.timeout(10000),
      });
      if (!result.ok) return reply(503, { error: 'invocación no disponible' });
      const data = await result.json();
      if (data.allowed === false) {
        const retry = Math.max(1, Number(data.retry_after) || 60);
        return reply(429, { error: 'el paisaje está recibiendo muchas criaturas; inténtalo más tarde', retry_after: retry }, { 'Retry-After': String(retry) });
      }
      if (data.allowed !== true || !data.criatura?.id) return reply(503, { error: 'invocación no disponible' });
      return reply(201, data.criatura);
    } catch { return reply(503, { error: 'invocación no disponible' }); }
  };
}
