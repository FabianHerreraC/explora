-- Atomic, persistent quotas. No user data is deleted or changed.
create schema if not exists explora_private;
revoke all on schema explora_private from public, anon, authenticated;
grant usage on schema explora_private to service_role;
create table explora_private.invocacion_cuotas (
  bucket text primary key,
  ventana timestamptz not null,
  usos integer not null check (usos >= 0)
);
alter table explora_private.invocacion_cuotas enable row level security;
revoke all on explora_private.invocacion_cuotas from public, anon, authenticated;
grant select, insert, update on explora_private.invocacion_cuotas to service_role;

alter table public.criaturas enable row level security;
-- NOT VALID preserves old rows; PostgreSQL still enforces these checks on new writes.
alter table public.criaturas add constraint criaturas_nombre_seguro
  check (char_length(btrim(nombre)) between 1 and 40 and nombre !~ '[[:cntrl:]]') not valid;
alter table public.criaturas add constraint criaturas_catalogo_seguro
  check (personaje_id in ('quimera', 'gato-espiral', 'tigre-azul', 'ave-zopilote', 'bisonte', 'can-lengua', 'tigre-rayado', 'felino-limon', 'tigre-rosado', 'bestia-antenas', 'felino-agazapado', 'leopardo-lengua', 'gato-flaco', 'gatito-espiral', 'lince-naranja', 'gato-dientes', 'gato-peludo', 'can-manchado', 'perro-flaco', 'bulldog-verde', 'liebre-rosa', 'ave-verde', 'buitre-verde', 'liebre-azul', 'liebre-salto', 'loro-rosado', 'simio-verde', 'mono-verde', 'orangutan-rosa', 'mono-rosado', 'conejo-verde', 'liebre-carrera', 'elefante-rosa', 'elefante-trompa', 'mamut-rosa')) not valid;
alter table public.criaturas add constraint criaturas_respuestas_seguras check (
  instinto is not null and instinto in ('cazar','guardar','jugar','vagar') and
  mirada is not null and mirada in ('defrente','dereojo','arriba','adentro') and
  elemento is not null and elemento in ('fuego','agua','tierra','aire') and
  creacion is not null and creacion in ('viral','app','videojuego','marca')
) not valid;

-- Public visitors retain reading/realtime; only the server may write.
drop policy if exists "cualquiera puede invocar" on public.criaturas;
revoke all on public.criaturas from public, anon, authenticated;
grant select on public.criaturas to anon;
grant select, insert on public.criaturas to service_role;
revoke all on sequence public.criaturas_id_seq from public, anon, authenticated;
grant usage, select on sequence public.criaturas_id_seq to service_role;

create or replace function public.invocar_criatura_segura(p_datos jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  momento timestamptz;
  minuto timestamptz;
  dia timestamptz;
  espera integer;
  criatura public.criaturas;
begin
  -- Serializes quota reservation and insertion across all Edge instances.
  perform pg_advisory_xact_lock(1729470031);
  momento := clock_timestamp();
  minuto := date_trunc('minute', momento);
  dia := date_trunc('day', momento at time zone 'UTC') at time zone 'UTC';
  select greatest(1, ceil(extract(epoch from max(
    case when bucket = 'minuto' then ventana + interval '1 minute'
         else ventana + interval '1 day' end) - momento))::integer)
    into espera from explora_private.invocacion_cuotas
    where (bucket = 'minuto' and ventana = minuto and usos >= 120)
       or (bucket = 'dia' and ventana = dia and usos >= 5000);
  if exists (select 1 from explora_private.invocacion_cuotas
    where (bucket = 'minuto' and ventana = minuto and usos >= 120)
       or (bucket = 'dia' and ventana = dia and usos >= 5000)) then
    return jsonb_build_object('allowed', false, 'retry_after', espera);
  end if;
  insert into public.criaturas(nombre, personaje_id, instinto, mirada, elemento, creacion)
    values(p_datos->>'nombre', p_datos->>'personaje_id', p_datos->>'instinto',
      p_datos->>'mirada', p_datos->>'elemento', p_datos->>'creacion') returning * into criatura;
  insert into explora_private.invocacion_cuotas as cuotas(bucket, ventana, usos)
    values ('minuto', minuto, 1), ('dia', dia, 1)
    on conflict (bucket) do update set ventana = excluded.ventana,
      usos = case when cuotas.ventana = excluded.ventana then cuotas.usos + 1 else 1 end;
  return jsonb_build_object('allowed', true, 'criatura', to_jsonb(criatura));
end;
$$;
revoke all on function public.invocar_criatura_segura(jsonb) from public, anon, authenticated;
grant execute on function public.invocar_criatura_segura(jsonb) to service_role;
