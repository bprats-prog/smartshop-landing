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
  portada (con `null` se dibuja el rótulo de marca).
- **Cambiar una foto** → bloque `galeria`: cada entrada es una ruta `src` y su
  `alt`. Poniendo `src: null` vuelve a verse un marcador a rayas con el texto del
  `alt`, útil mientras esperas una foto nueva.

Los textos de las secciones sí están en el HTML, con un comentario por bloque
para localizarlos rápido. Eso incluye las características de cada modelo de
surtido: viven en la pantalla `QUÉ HAY DENTRO` de `index.html`, un panel por
modelo.

## Los dos modelos de surtido

Los dos modelos con los que se trabaja —el de **autogestión** y el de
**Ametller**— se comparan en un selector de dos pestañas que vive en la
**pantalla 3 del recorrido**, "¿Qué hay dentro?", junto a la foto del surtido.
El equipo, la instalación y todo lo que incluye el servicio son idénticos: lo
único que cambia es el surtido, y así se dice.

**Están en la home a propósito, y conviene no moverlos de ahí.** Antes vivían
en `como-se-contrata.html`, y para verlos había que cambiar de página. Además
el surtido se contaba dos veces: "¿Qué puedo encontrar dentro?" en el recorrido
y "Elige el surtido" en la otra página. Al fusionarlos, el selector queda en el
camino que recorre todo el mundo y el contenido deja de estar en dos sitios. En
`como-se-contrata.html` queda un bloque puente que conserva el `id="modelos"`,
porque hay enlaces con ese fragmento circulando por WhatsApp.

**Esa pantalla va al límite de alto y hay que tratarla con cuidado.** Mide
exactamente 100svh con los dos paneles: 812 px en un móvil estándar y 667 en un
iPhone SE, sin un píxel de sobra. Por eso:

- Cada panel lleva una lista `.puntos` de tres líneas, no tarjetas: una
  `.tarjeta` ocupa unos 108 px y un punto unos 38.
- El `.panel-nombre` se esconde cuando hay JavaScript (`.js .pantalla
  .panel-nombre`): ya lo dice la pestaña activa. Sin JS reaparece, que es
  cuando hace falta para distinguir los dos paneles apilados.
- La foto se encoge **por ancho**, nunca por alto: la caja mantiene la
  proporción 1400/869 de la imagen y así no se recorta ningún producto.
- Si añades una línea, mide antes de subirlo. Cualquier texto que pase de una
  línea a dos cuesta unos 20 px y saca el botón de la presentación fuera de
  la pantalla.

**Nada con clase `.entra` dentro de un `.panel`.** Un panel oculto no interseca
nunca, así que el observador que revela las animaciones no llegaría a mostrarlo
y quedaría invisible para siempre. La clase va en el envoltorio `.modelos`.

**Las dos URLs de `presentaciones` son provisionales.** Hoy apuntan al deck
general de Empresas y al de Ametller Origen, pero los definitivos de cada
modelo están pendientes. Cuando lleguen, se cambian en `datos.js` y no hay que
tocar nada más.

Para añadir un tercer modelo: duplica una pestaña y su panel en el HTML
(cuidando que `aria-controls` y `aria-labelledby` se apunten entre sí) y añade
su entrada en `presentaciones`. El script no lleva la lista de modelos: recorre
las pestañas y los paneles que encuentre, en orden. Con tres modelos la
pantalla ya no cabrá: habrá que quitar la foto o mover el selector.

Sin JavaScript los dos paneles se muestran uno tras otro, cada uno con su
nombre visible. El CSS solo esconde el panel inactivo cuando el script ha
cargado (clase `js` en `<html>`), así que no hay forma de que quede un panel en
blanco.

## De dónde salen las imágenes

Están extraídas de las presentaciones de Google Slides y reescaladas a 1400 px
de lado mayor con calidad 80, para que la web entera pese menos de 2 MB y no
castigue una conexión móvil.

- `hero-lobby.jpg` — la foto de portada.
- `equipo-smartshop.jpg` — el equipo entero, en "¿Qué es una SmartShop?".
- `gama-productos.jpg` — el bodegón de "¿Qué hay dentro?". Está
  recortado para dejar la cerveza fuera de cuadro; con ella se van también el
  agua y la Coca-Cola que había a su derecha, así que la sección no muestra
  ninguna bebida. La caja respeta la proporción exacta de la foto, de modo que
  no se recorta nada al mostrarla. El original venía a 959 px de ancho:
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
  miniatura de YouTube. El vídeo horizontal no lleva foto: su portada es un
  rótulo de marca que dibuja el propio HTML.
- `arbitrade-wordmark.svg` — el wordmark de la barra superior. Venía con
  `fill="currentColor"`; se le fijó el tinta de marca (`#38191A`) porque dentro
  de un `<img>` no hereda el color de la página.

## Qué va en la web y qué en la presentación

La web convence en noventa segundos en un móvil; la presentación es la
profundidad. Por eso el recorrido son ocho pantallas —qué es, cómo funciona,
qué hay dentro y con qué modelo, qué aporta, el vídeo, dónde está instalada—
y todo lo demás (requisitos de instalación, medidas completas, cifras de
solvencia del grupo) vive en la presentación enlazada.

Si vuelves a añadir contenido a la home, comprueba que las pantallas siguen
cabiendo en un móvil de 812 px de alto: es el criterio que mantiene la
sensación de pase de diapositivas.

## Decisiones que conviene no romper

- **La web no publica precios.** Ni cuota mensual, ni precios de producto, ni
  planogramas. El alquiler del equipo se menciona como obligatorio y se remite
  al gestor, porque la tarifa se revisa cada ejercicio. Esto vale también para
  el modelo Ametller: su presentación sí lleva una tarifa mensual por SmartShop,
  y aquí se deja fuera a propósito. De ese deck solo se recoge la condición que
  no caduca —los productos de Ametller cuestan lo mismo que en sus tiendas—, no
  la cifra.
- **Sin alcohol y solo marcas que están de verdad en las máquinas.** Las que se
  pueden verificar contra los planogramas de los decks son Bien Aparecida,
  Danet, Salgot, Activia, Florette, Jabugo, Natwins, Lay's y Milka. La foto de
  bebidas es una balda del interior de una SmartShop, que es la prueba más
  directa. Tampoco se cita ninguna marca de partner ni de cliente.
- **Los vídeos no cargan hasta que se pulsan**, y lo hacen contra
  `youtube-nocookie.com`. Así la página no llama a Google sin que el visitante
  lo decida, y no gasta datos de más en móvil.
- **El contenido es visible sin JavaScript.** Las animaciones de entrada solo se
  activan si el script carga (clase `js` en `<html>`). No quites ese script del
  `<head>` o la página aparecerá en blanco cuando falle el JS.
- **Los halos de color de las tarjetas son estáticos.** Animarlos costaba
  batería en móvil sin ganancia visible; el movimiento se reserva al degradado
  de las portadas.

## Pendiente

- **Los metadatos al cambiar de dominio.** `og:url` y `og:image` ya son URLs
  absolutas, apuntando a GitHub Pages. Cuando la web se mueva al hosting de
  Arbitrade hay que actualizarlas a mano en los dos HTML: no se ajustan solas, y
  si apuntan al dominio viejo WhatsApp y LinkedIn seguirán mostrando esa
  miniatura.
