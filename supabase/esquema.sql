-- Esquema de Explora. Se pega tal cual en el SQL Editor de Supabase y se ejecuta una vez.

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

-- El móvil y el escenario entran sin cuenta, con la clave pública. RLS activo y dos
-- permisos explícitos: cualquiera puede invocar y cualquiera puede mirar el paisaje.
-- Nadie puede modificar ni borrar lo ya invocado.
alter table public.criaturas enable row level security;

drop policy if exists "cualquiera puede mirar" on public.criaturas;
create policy "cualquiera puede mirar"
  on public.criaturas for select to anon using (true);

drop policy if exists "cualquiera puede invocar" on public.criaturas;
create policy "cualquiera puede invocar"
  on public.criaturas for insert to anon with check (true);

-- Para que el escenario reciba los INSERT en el momento, sin preguntar.
alter publication supabase_realtime add table public.criaturas;
