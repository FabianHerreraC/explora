-- Base para instalaciones nuevas. Después aplicar las migraciones y desplegar invocar.
-- Ver SEGURIDAD.md. Este archivo por sí solo NO habilita invocaciones.

-- Cada fila es una criatura invocada desde el móvil.
create table if not exists public.criaturas (
  id            bigint generated always as identity primary key,
  creado_en     timestamptz not null default now(),
  nombre        text not null check (char_length(nombre) between 1 and 40),
  personaje_id  text not null check (char_length(personaje_id) <= 40),
  instinto      text,
  mirada        text,
  elemento      text,
  creacion      text
);

-- El escenario lee sin cuenta. Las escrituras pasan por la función de servidor.
alter table public.criaturas enable row level security;

drop policy if exists "cualquiera puede mirar" on public.criaturas;
create policy "cualquiera puede mirar"
  on public.criaturas for select to anon using (true);

drop policy if exists "cualquiera puede invocar" on public.criaturas;
revoke all on public.criaturas from public, anon, authenticated;
grant select on public.criaturas to anon;

-- Para que el escenario reciba los INSERT en el momento, sin preguntar.
alter publication supabase_realtime add table public.criaturas;
