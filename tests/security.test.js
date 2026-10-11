import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createHandler, validar, PUBLIC_KEY } from '../supabase/functions/invocar/handler.js';
import { PERSONAJES, PREGUNTAS, elegirPersonaje } from '../datos/personajes.js';

const valid = { nombre: 'Prueba', instinto: 'cazar', mirada: 'defrente', elemento: 'fuego', creacion: 'app' };
valid.personajeId = elegirPersonaje(valid).id;
const req = (datos = valid, headers = {}, method = 'POST') => new Request('https://example.test/invocar', {
  method, headers: { apikey: PUBLIC_KEY, 'Content-Type': 'application/json', ...headers },
  ...(method === 'POST' ? { body: typeof datos === 'string' ? datos : JSON.stringify(datos) } : {}),
});

test('validación estricta, catálogo compartido y nombres Unicode', () => {
  assert.equal(validar(valid).nombre, 'Prueba');
  for (const bad of [null, [], { ...valid, nombre: '' }, { ...valid, nombre: 'x'.repeat(41) },
    { ...valid, nombre: 'a\u0000b' }, { ...valid, nombre: 'a\u202eb' }, { ...valid, instinto: 'inventado' },
    { ...valid, personajeId: '../../archivo' }, { ...valid, id: 1 }, { ...valid, creado_en: '2020-01-01' }]) {
    assert.throws(() => validar(bad));
  }
  const emoji = { ...valid, nombre: '🦊'.repeat(40) };
  emoji.personajeId = elegirPersonaje(emoji).id;
  assert.equal([...validar(emoji).nombre].length, 40);
  for (const p of PREGUNTAS) for (const o of p.opciones) {
    const datos = { ...valid, [p.id]: o.id }; datos.personajeId = elegirPersonaje(datos).id;
    assert.doesNotThrow(() => validar(datos));
  }
});

test('HTTP: rechaza entradas antes de tocar DB; cuotas, fallo cerrado y secretos', async () => {
  let calls = 0; let rpcResult = { allowed: true, criatura: { id: 1, ...validar(valid) } };
  const handle = createHandler({ projectUrl: 'https://db.test', serviceKey: 'sb_secret_fixture', fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, 'https://db.test/rest/v1/rpc/invocar_criatura_segura');
    assert.equal(options.headers.Authorization, undefined);
    assert.deepEqual(JSON.parse(options.body), { p_datos: validar(valid) });
    return Response.json(rpcResult);
  }});
  for (const [request, status] of [
    [req(valid, { apikey: 'wrong' }), 401], [req(valid, { origin: 'https://evil.test' }), 403],
    [req(valid, {}, 'GET'), 405], [req(valid, { 'Content-Type': 'text/plain' }), 415],
    [req({ ...valid, nombre: '' }), 400], [req('{'), 400], [req(' '.repeat(2049)), 400],
    [req(valid, { 'Content-Length': '3000' }), 413],
  ]) assert.equal((await handle(request)).status, status);
  assert.equal(calls, 0);
  assert.equal((await handle(req(valid, {}, 'OPTIONS'))).status, 204);
  const ok = await handle(req()); assert.equal(ok.status, 201);
  assert.ok(!(await ok.text()).includes('sb_secret'));
  rpcResult = { allowed: false, retry_after: 23 };
  const limited = await handle(req()); assert.equal(limited.status, 429); assert.equal(limited.headers.get('Retry-After'), '23');
  const failed = createHandler({ projectUrl: 'https://db.test', serviceKey: 'secret', fetchImpl: async () => { throw new Error('secret DB detail'); } });
  const response = await failed(req()); assert.equal(response.status, 503); assert.ok(!(await response.text()).includes('secret'));
  assert.equal((await createHandler({})(req())).status, 503);
});

test('PostgreSQL: bloquea escrituras/RPC públicos; conserva lectura y cuotas atómicas', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      grant usage on schema public to anon, authenticated, service_role;
      create publication supabase_realtime;
    `);
    await db.exec(await readFile(new URL('../supabase/esquema.sql', import.meta.url), 'utf8'));
    await db.exec(`create policy "cualquiera puede invocar" on public.criaturas for insert to anon with check (true);
      grant all on public.criaturas to anon, authenticated;
      grant all on sequence public.criaturas_id_seq to anon, authenticated;
      insert into public.criaturas(nombre, personaje_id, instinto) values ('Histórico','viejo','valor antiguo');`);
    const migration = await readFile(new URL('../supabase/migrations/20261011013727_secure_creature_submissions.sql', import.meta.url), 'utf8');
    for (const personaje of PERSONAJES) assert.ok(migration.includes("'" + personaje.id + "'"));
    await db.exec(migration);
    const invoke = async (data = validar(valid)) => (await db.query('select public.invocar_criatura_segura($1::jsonb) as result', [JSON.stringify(data)])).rows[0].result;
    for (const role of ['anon', 'authenticated']) {
      await db.exec('set role ' + role);
      await assert.rejects(invoke(), /permission denied/);
      await assert.rejects(db.exec("insert into public.criaturas(nombre, personaje_id) values ('Ataque','quimera')"), /permission denied/);
      await assert.rejects(db.exec("update public.criaturas set nombre='Ataque'"), /permission denied/);
      await assert.rejects(db.exec('delete from public.criaturas'), /permission denied/);
      await assert.rejects(db.exec('select * from explora_private.invocacion_cuotas'), /permission denied/);
      if (role === 'anon') assert.equal((await db.query('select count(*)::int n from public.criaturas')).rows[0].n, 1);
      await db.exec('reset role');
    }
    await db.exec('set role service_role');
    await assert.rejects(invoke({ ...validar(valid), creacion: 'x'.repeat(10000) }), /check constraint/);
    assert.equal((await db.query('select count(*)::int n from explora_private.invocacion_cuotas')).rows[0].n, 0);
    // PGlite serializes these on one connection; the advisory lock protects separate production connections.
    const responses = await Promise.all(Array.from({ length: 121 }, () => invoke()));
    assert.equal(responses.filter(r => r.allowed).length, 120);
    assert.equal(responses.filter(r => !r.allowed).length, 1);
    assert.ok(responses.find(r => !r.allowed).retry_after > 0);
    assert.equal((await db.query('select count(*)::int n from public.criaturas')).rows[0].n, 121);
    await db.exec("update explora_private.invocacion_cuotas set ventana = ventana - interval '1 day'");
    assert.equal((await invoke()).allowed, true);
    await db.exec("update explora_private.invocacion_cuotas set usos = 5000 where bucket = 'dia'");
    assert.equal((await invoke()).allowed, false);
    await db.exec('reset role');
    assert.equal((await db.query("select nombre from public.criaturas where id = 1")).rows[0].nombre, 'Histórico');
  } finally { await db.close(); }
});
