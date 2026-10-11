# Invocaciones controladas

## Qué cierra

- `anon` y `authenticated` no pueden insertar, actualizar, borrar, truncar ni usar la
  secuencia de `criaturas`. La lectura anónima y Realtime se conservan deliberadamente:
  el escenario es público. Nombres y respuestas siguen siendo información pública;
  usar un alias y no ingresar información sensible.
- Solo `service_role` puede ejecutar `invocar_criatura_segura(jsonb)`. Es una función
  `SECURITY INVOKER` con `search_path` vacío, sin elevación de privilegios.
- La Edge Function acepta solo POST JSON de hasta 2048 bytes; comprueba la clave
  pública, el origen (cuando existe), el nombre de 1–40 caracteres y las opciones del
  catálogo. Recalcula el personaje en servidor. Rechaza campos adicionales.
- PostgreSQL aplica límites globales de **120 criaturas/minuto** y **5000/día UTC**
  en ventanas fijas. Un bloqueo de transacción serializa reserva e inserción entre
  instancias. Los rechazos no insertan registros ni consumen cuota adicional. Solo hay
  dos contadores, por lo que su tabla no crece con los visitantes.
- Los límites son globales, no por persona ni IP. CORS y la clave pública no detienen
  bots. Un atacante aún puede consumir el cupo y causar denegaciones temporales, pero
  no puede eludirlo cambiando de IP o cliente. Para eventos abiertos a abuso sostenido,
  añadir un desafío antibot validado en servidor o códigos de acceso de evento.
- Las cuotas limitan escrituras, no el número de solicitudes entrantes ni lecturas.
- No se borran registros históricos. Las restricciones nuevas son `NOT VALID` para no
  bloquear la migración por datos anteriores; sí se aplican a todos los nuevos envíos.
  La conservación/borrado del archivo requiere una decisión del propietario.

## Aplicar a un proyecto existente

1. Revisar esquema, grants y políticas del proyecto y respaldar según su política.
   Si está pausado, reactivarlo antes de inspeccionar/aplicar cambios.
2. Desplegar `supabase/functions/invocar/index.ts`, incluyendo `handler.js` y su
   dependencia relativa `datos/personajes.js`. `verify_jwt = false` es intencional:
   este juego no usa sesiones, y la función verifica la clave pública `apikey`.
   La credencial de servidor se toma del entorno de Supabase; nunca del navegador.
3. Aplicar `migrations/20261011013727_secure_creature_submissions.sql`.
   El cliente antiguo dejará de poder escribir desde este momento.
4. Publicar inmediatamente el cliente actualizado de GitHub Pages.
5. Verificar denegación de INSERT directo/RPC con `anon`, respuesta 400 para datos
   inválidos, invocación válida y recepción en el escenario; consultar Security Advisor.
   No agotar cuotas de producción como prueba: eso se verifica localmente.

Planificar pasos 3–4 juntos fuera de un evento activo. No restaurar la política de
INSERT abierto como rollback: preferir corregir la función/cliente manteniendo cerrada
la escritura directa. Un despliegue incompleto falla cerrado y muestra error al móvil.

Para una instalación nueva, aplicar `esquema.sql` antes de la migración.

## Pruebas

`npm ci && npm test`: motor PostgreSQL PGlite aislado, roles anon/authenticated/service,
permisos, datos históricos, restricciones, cuota agotada, renovación y respuestas HTTP.
PGlite usa una conexión; las llamadas simultáneas prueban la reserva serializada, no
reproducen múltiples conexiones Postgres de producción. El bloqueo transaccional es
el que protege ese caso. No se crea ni se borra información en la base del evento.
