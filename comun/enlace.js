// El enlace entre el móvil y el escenario, ahora por Supabase.
//
// El móvil invoca mediante una función con validación y cuotas. El escenario está
// suscrito a los INSERT y recibe cada criatura en el momento. Al arrancar, el escenario además lee lo que ya había: si hay que recargar la
// pantalla a mitad del evento, el paisaje se repuebla en vez de empezar vacío.
//
// Es el único archivo que sabe de Supabase. El móvil y el escenario siguen hablando de
// criaturas con nombre, igual que cuando esto viajaba por dentro del navegador.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PROYECTO = 'https://axkrrdxopkfbvfzpulom.supabase.co';
// Clave pública: está pensada para vivir dentro de una web abierta. Lo que protege los
// datos son las políticas de la tabla (ver supabase/esquema.sql), no el secreto de esto.
const CLAVE = 'sb_publishable_AFt5EB-Gs9LCV3C4S3yyAg__LVDfjbl';
const TABLA = 'criaturas';
// Hasta dónde llega lo ya invocado que este escenario da por visto. Reiniciar no borra
// nada: mueve esta marca al final, y lo anterior deja de repoblarse.
const MARCA = 'explora:desde';

const supabase = createClient(PROYECTO, CLAVE, {
  auth: { persistSession: false },
});

export async function emitir(datos) {
  const respuesta = await fetch(`${PROYECTO}/functions/v1/invocar`, {
    method: 'POST',
    headers: { apikey: CLAVE, 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
    signal: AbortSignal.timeout(15000),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) {
    const error = new Error(respuesta.status === 429
      ? 'El paisaje está recibiendo muchas criaturas. Espera un momento e inténtalo de nuevo.'
      : 'No llegó al paisaje. Revisa la conexión e inténtalo otra vez.');
    error.status = respuesta.status;
    throw error;
  }
  return aMensaje(data);
}

export async function escuchar(alLlegar) {
  const desde = Number(localStorage.getItem(MARCA) ?? 0);
  const vistos = new Set();
  const entregar = (fila) => {
    if (!fila || vistos.has(fila.id)) return;
    vistos.add(fila.id);
    alLlegar(aMensaje(fila));
  };

  // Primero lo que ya estaba en esta sesión, en orden de llegada.
  const { data, error } = await supabase.from(TABLA).select('*').gt('id', desde).order('id');
  if (error) console.warn('no se pudo leer lo ya invocado:', error.message);
  for (const fila of data ?? []) entregar(fila);

  // Si ni siquiera se pudo leer, el escenario necesita saberlo: con el servidor caído
  // seguiría mostrando el demo tan campante, y nadie en la sala notaría que los
  // teléfonos no están llegando.
  const hayEnlace = !error;

  // Y de aquí en adelante, en vivo.
  supabase
    .channel('criaturas-en-vivo')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLA }, (cambio) =>
      entregar(cambio.new)
    )
    .subscribe();

  return hayEnlace;
}

// Empieza una sesión nueva: lo invocado hasta ahora queda archivado en la base pero
// deja de aparecer en el paisaje, también si se recarga la página.
export async function reiniciarSesion() {
  const { data, error } = await supabase
    .from(TABLA)
    .select('id')
    .order('id', { ascending: false })
    .limit(1);

  if (error) throw new Error(`no se pudo reiniciar: ${error.message}`);
  const ultimo = data?.[0]?.id ?? 0;
  localStorage.setItem(MARCA, String(ultimo));
  return ultimo;
}

// De fila de base de datos a lo que el escenario espera.
function aMensaje(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    personajeId: fila.personaje_id,
    instinto: fila.instinto,
    mirada: fila.mirada,
    elemento: fila.elemento,
    creacion: fila.creacion,
    enviadoEn: fila.creado_en,
  };
}
