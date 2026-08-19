# Explora

Juego en tres frentes:

1. **móvil** — la persona responde cuatro preguntas, deja su nombre e invoca al animal
   que representa su espíritu creador *(en pie)*
2. **enlace** — reparte las criaturas del móvil al escenario, por Supabase *(en pie,
   entre dispositivos distintos)*
3. **escenario** — pantalla grande donde la criatura aparece en el paisaje *(en pie)*

## Estructura

```
index.html    portada con los dos enlaces
movil/        el creador: index.html, style.css, app.js
escenario/    la vista de proyección: index.html, style.css, app.js
comun/        recorte.js (quita el fondo) y enlace.js (el canal entre los dos)
datos/        catálogo de animales, preguntas y la función que las cruza
assets/       lo que sirve el sitio: fondo, personajes, opciones, tipografía
fuentes/      originales sin tocar (PNG de partida, TTF, JPEG de los animales)
```

Solo `assets/` se publica en el sitio; `fuentes/` está para poder rehacer cualquier
recorte o conversión más adelante.

## Publicado

- portada: https://fabianherrerac.github.io/explora/
- móvil: https://fabianherrerac.github.io/explora/movil/
- escenario: https://fabianherrerac.github.io/explora/escenario/

Repo `FabianHerreraC/explora`, Pages sobre `main` desde la raíz: cada push a `main`
republica el sitio.

## Correr en local

Necesita servidor (usa módulos ES). Desde `explora/`:

```bash
python3 -m http.server 5311
```

- escenario: `http://localhost:5311/escenario/`
- móvil: `http://localhost:5311/movil/`

Las dos páginas se hablan **dentro del mismo navegador**: dos pestañas del mismo equipo,
sí; dos dispositivos, todavía no. Eso llega con el servidor.

Teclas: **espacio** invoca un personaje, **d** dibuja la zona pisable para calibrar,
**c** limpia el claro.

## Cómo funciona hoy

- **Las cuatro preguntas** (`PREGUNTAS` en `datos/personajes.js`): instinto, mirada y
  elemento se eligen entre cuatro imágenes cada una; la última, sobre qué crearía la
  persona, entre seis textos. Las imágenes van en `assets/opciones/` con el id de la
  opción como nombre (`cazar.jpg`, `fuego.jpg`…); mientras un archivo no exista, esa
  casilla muestra solo la palabra y el formulario sigue funcionando.
- **De las respuestas al animal** (`elegirPersonaje`): cada animal tiene un valor en los
  cuatro ejes. Son once animales para 384 combinaciones, así que casi nunca hay calce
  perfecto: gana quien más coincida y el nombre desempata. La cuarta pregunta pesa doble,
  por ser la que habla de lo que la persona quiere crear. La misma persona con las mismas
  respuestas recibe siempre el mismo animal.
- **El enlace** (`comun/enlace.js`): `emitir` inserta una fila en la tabla `criaturas`
  de Supabase; `escuchar` entrega primero lo ya invocado y luego se suscribe a los INSERT.
  Es el único archivo que sabe de Supabase. La clave que lleva dentro es la pública: lo
  que protege los datos son las políticas de la tabla (`supabase/esquema.sql`), que
  permiten invocar y mirar pero no modificar ni borrar.
- **El escenario no arranca vacío**: repuebla el paisaje con lo que ya se invocó, así una
  recarga a mitad del evento no pierde nada.
- **Modo demo**: solo si la tabla está vacía. Cada 5 segundos entra una criatura al azar
  con un nombre de relleno; al llegar la primera de verdad se apaga y el rótulo pasa a
  «en vivo».

## Antes de un evento

Pulsar **reiniciar** en el escenario (abajo a la izquierda, pide confirmación). Abre
sesión nueva: el paisaje queda vacío, la numeración vuelve a 001 y lo invocado antes no
regresa ni recargando la página.

No borra nada: las filas siguen en la base como archivo de lo que pasó. Lo que hace es
guardar en ese navegador hasta dónde ya leyó. Dos consecuencias:

- Si la pantalla se abre en **otro equipo o navegador**, la marca no viaja con ella y el
  paisaje se repuebla con todo lo anterior. Hay que reiniciar de nuevo ahí.
- Para borrar de verdad, hay que ir al *Table Editor* de Supabase. Con la clave pública
  no se puede (es deliberado: si el escenario pudiera borrar, cualquiera con la URL
  también).

La tecla `c` es otra cosa: limpia la pantalla, pero al recargar vuelven.
- **Recorte de fondo** (`comun/recorte.js`): los personajes son JPEG con fondo plano,
  sin transparencia. El recorte se hace en el navegador al cargar, inundando desde los
  bordes. Cada región de fondo recuerda el color del borde donde nació, así el amarillo
  del fondo desaparece y el amarillo de un ojo se queda.
- **Ubicación**: el terreno pisable no se calibra a mano, se lee del propio fondo al
  arrancar (`mapearSuelo`). La imagen se reduce a celdas de 8 px y las que quedan por
  encima del umbral de brillo son blancas; solo cuenta como sitio la celda que además
  tiene blanco alrededor, así una raya clara entre dos manchas negras no sirve para
  pararse. Cambiar de paisaje no exige tocar números: el mapa sale solo. Los ajustes
  (`SUELO` en `escenario/app.js`) son el umbral, el margen y el techo, más el `alto`
  común de todos los personajes.
- **Zona vedada**: la esquina superior izquierda que ocupa la ficha queda fuera del mapa,
  descontando también el cuerpo y la etiqueta para que nadie se asome por debajo. La
  tecla `d` la pinta en amarillo y el resto del terreno pisable en rosa.
- **Profundidad**: quien pisa más abajo tapa a quien pisa más arriba. El tamaño no
  depende de la profundidad: todos miden igual.

## El catálogo

**35 animales** en `PERSONAJES`, todos de cuerpo entero: son los que pueden pararse en el
paisaje. Del primer lote quedaron fuera **5 bustos** que el marco corta a la altura del
pecho; están en `RETRATOS`, esperando otro uso.

Para que una imagen sirva: cuerpo entero con las patas dentro del cuadro, fondo plano (uno
o dos colores, sin degradado) y el animal sin tocar los bordes. Un fondo de dos tonos
—cielo y suelo— funciona: el recorte trata cada región por separado.

## Pendientes conocidos

- Las descripciones del catálogo son provisionales.
- En algunos personajes quedan restos de fondo bajo la panza, donde la sombra encierra el
  hueco y el color quedó a más de 4 unidades del que se muestreó en el borde. Al tamaño
  del escenario no se ven; en un primer plano sí. Desaparecen del todo si los personajes
  llegan en PNG con transparencia.
- El recorte se rehace en cada carga: con 11 imágenes tarda unos segundos. Conviene
  hornear los PNG una sola vez y guardarlos.
- `assets/fondo/land2.png` pesa 7,7 MB. Conviene reducirlo antes de publicar.
