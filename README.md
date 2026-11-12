# Landing SmartShops — Arbitrade

Web de dos páginas que explica qué es una SmartShop y cómo se contrata.
Pensada para el móvil del comercial y para proyectarse en una reunión.

**Publicada en:** https://bprats-prog.github.io/smartshop-landing/

Ese enlace lo sirve GitHub Pages desde la rama `main`, así que se actualiza
solo con cada `git push`. Es la copia buena mientras no esté en el hosting de
Arbitrade: los vídeos se reproducen incrustados y las vistas previas al
compartir el enlace salen con imagen.

Dos advertencias sobre las copias sueltas:

- Abriendo `index.html` con **doble clic** la web funciona, pero YouTube se
  niega a incrustarse en una página sin dominio (error 153). En ese caso los
  vídeos se abren en una pestaña, y la nota bajo el reproductor lo avisa.
- Si la web cambia de dominio hay que actualizar `og:url` y `og:image` en las
  dos páginas: son rutas absolutas y no se ajustan solas.

## Cómo subirla

Copia la carpeta entera al hosting. No hay que compilar nada ni instalar
dependencias: son archivos estáticos.

```
smartshop-landing/
├── index.html              El recorrido: qué es, cómo funciona, qué hay dentro…
├── como-se-contrata.html   El modelo de negocio y qué incluye el servicio
└── assets/
    ├── css/arbitrade.css   Colores, tipografías y componentes (compartido)
    ├── js/app.js           Comportamiento (compartido)
    ├── js/datos.js         ← LOS DATOS EDITABLES
    ├── video/              Vídeos propios (Ametller Origen, en español y catalán)
    └── img/                Fotos, alzado técnico y wordmark
```

También funciona abriendo `index.html` con doble clic, sin servidor: todo son
rutas relativas y scripts clásicos, sin módulos ni `fetch`.

## Qué se toca para actualizarla

Casi todo está en **`assets/js/datos.js`**. No hace falta abrir el HTML para:

- **Cambiar el teléfono o la tienda** → bloque `contacto`.
- **Cambiar una presentación enlazada** → bloque `presentaciones`, que tiene una
  entrada por modelo (`autogestion` y `ametller`), cada una con su `url` y el texto
  del botón. Van en formato `/preview` (solo lectura), no `/edit`. Dejando
  `url: ""` los botones que la enlazan desaparecen solos.
  En el HTML se elige cuál con `data-presentacion="autogestion|ametller"`; sin
  valor se enlaza la del modelo de autogestión, que es la que usa el recorrido.
- **Cambiar o añadir un vídeo** → bloque `videos`. Cada clave se corresponde
  con un `data-video="..."` del HTML. `id` es el identificador de YouTube,
  `vertical: true` encuadra los Shorts en 9:16, y `poster` es la imagen de
  portada.
  Una entrada lleva `id` (YouTube) **o** `src` (un archivo de `assets/video/`),
  nunca las dos. Los del modelo Ametller Origen son de `src` y sus claves, `es`
  y `ca`, son las del selector de idioma del bloque de Ametller. Para cambiar
  uno, sustituye el MP4 (ver «Los vídeos de Ametller Origen») y, si cambia su
  forma o su duración, nada más: el visor se adapta solo.
- **Cambiar una foto** → bloque `galeria`: cada entrada es una ruta `src` y su
  `alt`. Poniendo `src: null` vuelve a verse un marcador a rayas con el texto del
  `alt`, útil mientras esperas una foto nueva.

Los textos de las secciones sí están en el HTML, con un comentario por bloque
para localizarlos rápido. Eso incluye las características de cada modelo de
surtido: viven en la pantalla `LOS DOS MODELOS` de `index.html`, una tarjeta y
un bloque por modelo.

## Los dos modelos de surtido

Los dos modelos con los que se trabaja —el **Arbitrade** (clave interna
`autogestion`) y el **Ametller Origen**— se presentan a la vez en la **pantalla 3
del recorrido**, "Dos modelos. La misma gestión.". Cada uno tiene dos piezas:

- Una **tarjeta** (`.modelo-tarjeta`) con su foto y dos líneas de resumen.
- Debajo, un **bloque** (`.modelo-detalle`) que desarrolla el modelo con una
  lista (`.detalle-lista`) y el botón de su presentación. El de Ametller lleva
  además el vídeo, con el selector de idioma.

El equipo, la instalación y todo lo que incluye el servicio son idénticos: lo
único que cambia es el surtido, y así se dice.

**No hay pestañas: los dos modelos se ven a la vez**, para poder compararlos sin
pulsar nada. Antes eran un selector de dos pestañas que mostraba un panel cada
vez, y el vídeo de Ametller quedaba escondido tras la pestaña que no se abría
por defecto.

**Están en la home a propósito, y conviene no moverlos de ahí.** Antes vivían
en `como-se-contrata.html`, y para verlos había que cambiar de página. Hoy esa
página solo redirige: quien traiga el fragmento `#modelos` (hay enlaces con él
circulando por WhatsApp) aterriza en `index.html#productos`.

**La rejilla.** En escritorio (≥ 901 px) son dos columnas, cada tarjeta sobre su
bloque: `.modelos-duo` coloca los cuatro elementos con `grid-template-areas`, y
las áreas están asignadas por `id` (`#modelo-arbitrade`, `#detalle-arbitrade`…).
En móvil es una sola columna con el orden del HTML —tarjeta A, bloque A,
tarjeta B, bloque B—, que es el que une a cada modelo con su desarrollo. Por eso
el HTML está escrito en ese orden y no "todas las tarjetas y luego todos los
bloques".

**Es una pantalla alta a propósito.** Mide unos 1350 px a 1280×800 y unos
2400 px en un móvil de 375×812: no se intenta que quepa en 100svh. El recorrido
ya trata las pantallas más altas que el viewport (con teclado, las flechas y el
espacio dejan de saltar de pantalla; con el dedo es scroll libre). Como nada
está oculto, **ya no hay restricción sobre dónde poner `.entra`**.

- Las listas del bloque son `.detalle-lista` y **no** `.puntos`. `.puntos` está
  pensada para pantallas apretadas y varias reglas de alto la encogen (12,5 px
  en móviles bajos); aquí no hay límite de alto y no debe heredarlas.
- La foto de cada tarjeta se recorta a 2:1 (las dos actuales miden 2,2 y 2,3).
  Se cambia en `fotosModelo` de `datos.js`, con la misma clave que
  `data-foto-modelo` en el HTML (`autogestion`, `ametller`). Sin entrada en
  `datos.js` se queda la que lleva el HTML.
- Cada modelo tiene su acento: naranja el Arbitrade y verde el Ametller
  (`--ac`, que pinta la rayita bajo el nombre y los puntos de la lista).
- El botón de la presentación va siempre al final del bloque (`margin-top:auto`),
  así los dos quedan a la misma altura aunque un bloque lleve más contenido.

**El copy de los bloques sale de las presentaciones, pero es un primer
borrador.** Las líneas de los bloques desarrollan lo que ya decían las viñetas
con datos de los decks (más de 30 variedades, 24 horas, planograma conjunto…).
No lleva ninguna cifra, ni la tarifa de Ametller ni los precios de producto: ver
«La web no publica precios». La única referencia a precios es la condición del
bloque de Ametller —sus productos cuestan lo mismo que en sus tiendas físicas—,
que sale tal cual de su presentación y no lleva importe. Se edita directamente
en `index.html`.

**Las dos URLs de `presentaciones` son provisionales.** Hoy apuntan al deck
general de Empresas y al de Ametller Origen, pero los definitivos de cada
modelo están pendientes. Cuando lleguen, se cambian en `datos.js` y no hay que
tocar nada más.

Para añadir un tercer modelo: duplica una tarjeta y su bloque en el HTML, ponles
`id` nuevos y ajusta `.modelos-duo` (las áreas del grid están puestas a mano
para dos modelos), y añade su entrada en `presentaciones` y en `fotosModelo`.

Sin JavaScript se ve todo: no hay nada oculto. Lo único que desaparece es el
selector de idioma del vídeo, que sin script no cambiaría nada; el vídeo sigue
ahí, en español y con sus controles.

## Los vídeos de Ametller Origen

El bloque de «Modelo Ametller Origen», en la pantalla *Gama y modelos*, lleva el
vídeo con un selector **Español | Català**. Son la misma pieza (37 s, vertical
9:16) en dos idiomas, y viven en `assets/video/`.

El `<video>` va escrito en el HTML con el español, así que se reproduce aunque no
cargue el script, y lleva `preload="none"` y su portada. `app.js` (`videoModelo`)
añade el selector: cada botón (`data-idioma`) cambia el archivo por el de
`datos.js` (claves `es` y `ca` de `videos`). Si el vídeo estaba sonando al
cambiar de idioma, el nuevo arranca solo desde el principio; si estaba parado,
se queda parado en su portada. La portada del HTML y la de `datos.js` son la
misma: si cambias una, cambia la otra.

Los archivos:

- `ametller-origen-es.mp4` — versión con música y sin subtítulos.
- `ametller-origen-ca.mp4` — versión con música y sin subtítulos.

Son la misma variante en los dos idiomas, elegida entre las cuatro que hay de
cada uno en la carpeta de vídeos de Ametller (con/sin música, con/sin
subtítulos). Si se quiere otra combinación, hay que recomprimir la variante
correspondiente y sustituir el archivo. Ojo: el catalán se cambió una vez; las
dos primeras versiones no coincidían (el catalán llevaba subtítulos y no música).

**Por qué están recomprimidos.** GitHub rechaza cualquier archivo de más de
100 MB y el original en español pesa 134 MB (el catalán, 37 MB). Se recomprimen
los dos con la misma receta para que se vean y pesen igual: unos 8 MB cada uno.
Los originales no se tocan: se parte siempre de ellos, nunca del archivo ya
comprimido.

**La receta** (ffmpeg; H.264 a 720×1280 con un techo de bitrate, que a un
vídeo de móvil le sobra):

```
ffmpeg -i ORIGINAL.mp4 \
  -vf "scale=720:1280:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -profile:v high -level 4.0 -crf 25 \
  -maxrate 3500k -bufsize 7000k \
  -c:a aac -b:a 128k -ar 48000 \
  -movflags +faststart ametller-origen-XX.mp4
```

`-movflags +faststart` mueve el índice al principio del archivo: el navegador
puede empezar a reproducir y saltar a un punto sin descargarlo entero. Conviene
mirar el resultado antes de publicarlo, sobre todo los subtítulos. Y mantén cada
archivo muy por debajo de los 100 MB de GitHub (el límite que obligó a todo
esto); GitHub Pages sirve los MP4 con soporte de `Range`.

La portada (`poster-ametller-origen.jpg`) se saca de un fotograma sin texto:

```
ffmpeg -ss 1.5 -i ametller-origen-es.mp4 -frames:v 1 \
  -vf "scale=540:960:flags=lanczos" -q:v 4 poster-ametller-origen.jpg
```

## De dónde salen las imágenes

Están extraídas de las presentaciones de Google Slides y reescaladas a 1400 px
de lado mayor con calidad 80, para que la web entera pese menos de 2 MB y no
castigue una conexión móvil.

- `hero-lobby.jpg` — **sin usar desde que el vídeo ocupa la portada.** Se
  conserva porque es la única foto con una persona dentro y es la mejor
  candidata a miniatura al compartir el enlace.
- `equipo-smartshop.jpg` — el equipo entero, en "¿Qué es una SmartShop?".
- `gama-ametller.jpg` — el surtido del modelo Ametller Origen, en su tarjeta.
  Es una **fotografía real** de producto, no una imagen generada. La tarjeta la
  recorta a 2:1, así que pierde un poco por los lados; el producto está en el
  centro y a la izquierda, y no se toca.
- `gama-productos.jpg` — el bodegón de la tarjeta del modelo Arbitrade. Está
  recortado para dejar la cerveza fuera de cuadro; con ella se van también el
  agua y la Coca-Cola que había a su derecha, así que la sección no muestra
  ninguna bebida. La tarjeta la recorta a 2:1, un poco por los lados. El original venía a 959 px de ancho:
  suficiente para el tamaño al que se ve, pero si aparece la versión de estudio
  en alta, conviene sustituirlo.
- `pv-desbloqueo-movil`, `pv-lector-pantalla`, `pv-fila-smartshops` y
  `pv-puerta-abierta-carrito` — las cuatro miniaturas de "¿Cómo funciona?".
- `pv-office-empresa`, `pv-hotel-grabandgo` y `pv-lounge` — la galería de
  instalaciones. Ninguna foto se repite entre secciones. Las columnas de la
  galería se reparten según la forma de cada foto —el script lee `ancho` y
  `alto` de `datos.js` y los escribe en la rejilla—, de modo que las alturas
  coinciden solas y ninguna se recorta. Si cambias una foto, actualiza también
  su `ancho` y `alto` o el hueco quedará mal calculado.
- `poster-video-entorno.jpg` — la portada del Short, recortada a 9:16 desde la
  miniatura de YouTube. Es lo primero que se ve del recorrido: el Short abre la
  portada en lugar de una foto fija.
- `poster-ametller-origen.jpg` — la portada de los dos vídeos de Ametller
  Origen: un fotograma a 1,5 s de la versión en español, que es la que no lleva
  subtítulos. Sirve a las dos versiones, así no hay una portada con texto en un
  idioma y el vídeo en otro. 540×960, unos 55 KB.
- `arbitrade-wordmark.svg` — el wordmark de la barra superior. Venía con
  `fill="currentColor"`; se le fijó el tinta de marca (`#38191A`) porque dentro
  de un `<img>` no hereda el color de la página.

## Qué va en la web y qué en la presentación

La web convence en noventa segundos en un móvil; la presentación es la
profundidad. Por eso el recorrido son siete pantallas —la portada, qué es, cómo
funciona, los dos modelos, qué aporta, dónde está instalada y el cierre— y
todo lo demás (requisitos de instalación, medidas completas, cifras de
solvencia del grupo) vive en la presentación enlazada.

Si vuelves a añadir contenido a la home, comprueba que las pantallas siguen
cabiendo en un móvil de 812 px de alto: es el criterio que mantiene la
sensación de pase de diapositivas.

## Decisiones que conviene no romper

- **La web no publica precios.** Ni cuota mensual, ni precios de producto, ni
  planogramas. El alquiler del equipo se menciona como obligatorio y se remite
  al gestor, porque la tarifa se revisa cada ejercicio. De los decks solo se
  recoge la condición que no caduca —los productos de Ametller cuestan lo mismo
  que en sus tiendas—, nunca la cifra.

  Los dos decks enlazados cumplen ahora la misma regla: desde el 15 de
  septiembre de 2026 su diapositiva de "Oferta económica" termina en *"Consulta
  condiciones con tu comercial"* y ya no llevan tarifa mensual ni tabla de
  precios de producto. Antes sí, y era la contradicción más visible de la
  pieza. Si alguien sustituye esas presentaciones por otras, hay que volver a
  comprobarlo: el botón de cada modelo abre el deck dentro de la propia web, así
  que lo que diga el deck lo dice la web.
- **Sin alcohol y solo marcas que están de verdad en las máquinas.** Las que se
  pueden verificar contra los planogramas de los decks son Bien Aparecida,
  Danet, Salgot, Activia, Florette, Jabugo, Natwins, Lay's y Milka. La foto de
  bebidas es una balda del interior de una SmartShop, que es la prueba más
  directa. Tampoco se cita ninguna marca de partner ni de cliente.
- **Los vídeos no cargan hasta que se pulsan.** Los de YouTube lo hacen contra
  `youtube-nocookie.com`, así la página no llama a Google sin que el visitante
  lo decida. Los propios llevan `preload="none"`: ni siquiera piden el MP4 hasta
  el clic, y no llaman a ningún tercero. En los dos casos, nada de datos de más
  en móvil.
- **En móvil el vídeo de YouTube se abre a pantalla completa**, en el visor
  `.visor-video`, y en escritorio se incrusta en su sitio. El corte está en
  820 px. Al cerrar se **destruye el iframe** (o el `<video>`), no se esconde:
  si solo se oculta, el vídeo sigue sonando por detrás. Los vídeos de Ametller
  Origen no pasan por ese visor: son un `<video>` dentro de su bloque, con los
  controles nativos del navegador.
- **El visor de vídeo fija su fila de grid** (`grid-template: minmax(0,1fr)`).
  No lo quites: sin ello, un `<video>` abierto en el visor aporta su tamaño
  intrínseco al cálculo del grid y se sale de la ventana (un iframe no tiene
  tamaño intrínseco y por eso nunca pasó). Hoy ningún vídeo abre el visor con un
  `<video>`, pero `marcoDeVideo` lo sigue soportando para las entradas de
  `datos.js` con `src` que se asocien a un `data-video`.
- **El selector de idioma del vídeo solo existe con el script vivo**
  (`app-ok`). Sin JS no cambiaría nada, y la web no deja controles muertos; el
  `<video>` sí va en el HTML y se reproduce igual.
- **El texto de móvil es deliberadamente grande y corto.** El bloque
  "TIPOGRAFÍA EN MÓVIL" del final del CSS sube los tamaños, y lo que lo paga es
  el recorte de los párrafos. Si vuelves a alargar un texto, mide: las ocho
  pantallas caben hoy al píxel en 375×812 y en 375×667.
- **El contenido es visible aunque `app.js` no llegue.** El script del `<head>`
  pone dos clases: `js` y `anim`, que juntas activan las animaciones de entrada
  (`.js.anim .entra`). Si `app.js` no confirma que ha
  arrancado —añade `app-ok`— ese mismo script retira `anim` a los tres segundos
  y el contenido aparece sin animar. No toques ese bloque: sin él, un 404 o un
  proxy corporativo dejan la web en blanco, porque quien revela los `.entra` es
  el script.
- **Atenúa el texto con `color`, nunca con `opacity`.** `opacity` crea un grupo
  de composición y un hijo no puede recuperarla: por eso el enlace del teléfono
  dentro de una `.nota` se quedaba en 2,72:1 de contraste y `.apoyo strong{opacity:1}`
  no hace nada. Con `color:rgba(56,25,26,α)` los `<b>`, `<strong>` y `<a>` sí
  pueden volver a tinta plena.
- **Las imágenes se encogen por alto o por ancho, nunca con `max-height` sobre
  una caja de ancho fijo.** Eso rompe el `aspect-ratio` y `object-fit:cover`
  recorta. Pasó con la foto vertical de la galería, que perdía el 39 %.
- **Cada pantalla del recorrido debe caber en el viewport**, y hay que
  comprobarlo en cuatro sitios, no en uno: 375×812, 375×667, 1366×768 y
  1920×1080. Los `clamp` suben al máximo en escritorio, así que una pantalla
  calibrada solo para móvil se desborda en un portátil — que es donde se
  proyecta en las reuniones.
- **Los halos de color de las tarjetas son estáticos.** Animarlos costaba
  batería en móvil sin ganancia visible; el movimiento se reserva al degradado
  de las portadas.

## Pendiente

- **Los metadatos al cambiar de dominio.** `og:url` y `og:image` ya son URLs
  absolutas, apuntando a GitHub Pages. Cuando la web se mueva al hosting de
  Arbitrade hay que actualizarlas a mano en los dos HTML: no se ajustan solas, y
  si apuntan al dominio viejo WhatsApp y LinkedIn seguirán mostrando esa
  miniatura.
