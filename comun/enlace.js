// El enlace entre el móvil y el escenario, ahora por Supabase.
//
// El móvil inserta una fila; el escenario está suscrito a los INSERT y la recibe en el
// momento. Al arrancar, el escenario además lee lo que ya había: si hay que recargar la
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

const supabase = createClient(PROYECTO, CLAVE, {
  auth: { persistSession: false },
});

export async function emitir(datos) {
  const { data, error } = await supabase
    .from(TABLA)
    .insert({
      nombre: datos.nombre,
      personaje_id: datos.personajeId,
      instinto: datos.instinto ?? null,
      mirada: datos.mirada ?? null,
      elemento: datos.elemento ?? null,
      creacion: datos.creacion ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`no se pudo invocar: ${error.message}`);
  return aMensaje(data);
}

export async function escuchar(alLlegar) {
  const vistos = new Set();
  const entregar = (fila) => {
    if (!fila || vistos.has(fila.id)) return;
    vistos.add(fila.id);
    alLlegar(aMensaje(fila));
  };

  // Primero lo que ya estaba, en orden de llegada.
  const { data, error } = await supabase.from(TABLA).select('*').order('id');
  if (error) console.warn('no se pudo leer lo ya invocado:', error.message);
  for (const fila of data ?? []) entregar(fila);

  // Y de aquí en adelante, en vivo.
  supabase
    .channel('criaturas-en-vivo')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLA }, (cambio) =>
      entregar(cambio.new)
    )
    .subscribe();
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
