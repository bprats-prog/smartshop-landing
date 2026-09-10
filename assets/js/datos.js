/* ============================================================
   SmartShops Arbitrade — datos editables
   ------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE HACE FALTA TOCAR para actualizar
   el teléfono, el vídeo o las fotos. No hay que editar HTML.

   Se carga con una etiqueta <script src> normal (no es un módulo),
   así la web también funciona abriendo el index.html con doble clic.
   ============================================================ */

window.SMARTSHOP = {

  /* ---------- Presentaciones completas ----------
     Una por modelo de surtido. Cada clave se corresponde con un
     data-presentacion="..." del HTML; sin valor, se enlaza la de autogestión.
     Se enlazan en formato /preview (solo lectura) en vez de /edit, para que se
     abran sin la barra de edición de Google y se lean bien en el móvil.
     Con url en "" los botones que la enlazan desaparecen solos. */
  presentaciones: {
    autogestion: {
      url: "https://docs.google.com/presentation/d/1x56L3mKWzkHD5oDqd1VOCkv04t1oXbut5fmfln7MAjk/preview",
      texto: "Ver la presentación completa"
    },
    ametller: {
      url: "https://docs.google.com/presentation/d/1ozZ4GSvKPfxAZi_QNogMI2KyLYJ93dSbl_X4jNWXwlA/preview",
      texto: "Ver la presentación de Ametller"
    }
  },

  /* ---------- Contacto ---------- */
  contacto: {
    telefono: "900 264 134",
    telefonoEnlace: "tel:+34900264134",
    tienda: "https://arbitrade.tienda",
    tiendaTexto: "arbitrade.tienda"
  },

  /* ---------- Vídeos ----------
     Cada clave se corresponde con un data-video="..." del HTML.
     'id' es el identificador de YouTube. El reproductor NO se carga hasta que
     el usuario pulsa, y lo hace contra youtube-nocookie.
     'vertical' a true para los Shorts, que se encuadran en 9:16.
     'poster' es opcional: con null se pinta el degradado de marca, para no
     llamar a Google antes de que el visitante lo decida. */
  videos: {
    principal: {
      id: "8mZNGqLMprg",
      titulo: "Así funciona una SmartShop",
      vertical: false,
      /* Sin poster: la portada es el rotulo de marca que dibuja el propio HTML. */
      poster: null
    },
    entornoLaboral: {
      id: "8QLeAxdFQgw",
      titulo: "La forma más fácil de comer bien en tu espacio de trabajo",
      vertical: true,
      poster: "assets/img/poster-video-entorno.jpg"
    }
  },


  /* ---------- Galería de puntos de venta ----------
     Solo instalaciones: las fotos de uso se han repartido por el recorrido
     (los cuatro pasos de "¿Cómo funciona?"), así no se repite ninguna.
     Con src a null se pinta un marcador a rayas en su lugar. */
  galeria: [
    { src: "assets/img/pv-office-empresa.jpg", ancho: 1900, alto: 1329,
      alt: "SmartShop instalada junto al office de una oficina, encastrada en un mueble negro" },
    { src: "assets/img/pv-hotel-grabandgo.jpg", ancho: 1600, alto: 1029,
      alt: "Rincón Grab and Go de un hotel con dos SmartShops, cafetera y jardín vertical" },
    { src: "assets/img/pv-lounge.jpg", ancho: 1241, alto: 1600,
      alt: "Dos SmartShops en la zona de estar de un hotel, junto a butacas y plantas" }
  ]
};
