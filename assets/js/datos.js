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
    /* "general" es la que enlazan los botones sin valor en data-presentacion:
       los de cierre del recorrido y de la pagina de contratacion. Separarla de
       "autogestion" evita que esos botones hereden el texto de un modelo. */
    general: {
      url: "https://docs.google.com/presentation/d/1x56L3mKWzkHD5oDqd1VOCkv04t1oXbut5fmfln7MAjk/preview",
      texto: "Ver la presentación completa"
    },
    autogestion: {
      url: "https://docs.google.com/presentation/d/1x56L3mKWzkHD5oDqd1VOCkv04t1oXbut5fmfln7MAjk/preview",
      texto: "Descubre el modelo Arbitrade"
    },
    ametller: {
      url: "https://docs.google.com/presentation/d/1snA9x6OPckMfcblX6bZ9dxsgJNU4aM3cipMY53DxbmA/preview",
      texto: "Descubre el modelo Ametller Origen"
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
     Cada clave se corresponde con un data-video="..." del HTML (o, en los
     de Ametller, con el data-idioma del selector).
     Una entrada lleva 'id' (identificador de YouTube) O 'src' (archivo propio
     en assets/video/), nunca las dos. El de YouTube NO se carga hasta que el
     usuario pulsa, y lo hace contra youtube-nocookie; el propio tampoco
     descarga nada hasta entonces y no llama a ningún tercero.
     'vertical' a true para los Shorts, que se encuadran en 9:16.
     'poster' es la imagen de portada; sin ella la caja queda en el color de
     fondo del reproductor hasta que se pulsa. */
  videos: {
    entornoLaboral: {
      id: "8QLeAxdFQgw",
      titulo: "La forma más fácil de comer bien en tu espacio de trabajo",
      vertical: true,
      poster: "assets/img/poster-video-entorno.jpg"
    },

    /* El vídeo del modelo Ametller Origen, una entrada por idioma. La clave es
       el data-idioma del selector del panel de Ametller ("es", "ca"); el texto
       del botón sale de 'idioma'. Son la misma pieza (37 s, vertical 9:16)
       recomprimida a 720×1280: el original en español pesaba 134 MB y GitHub no
       admite archivos de más de 100 MB. Las dos versiones son la misma variante
       (con música, sin subtítulos), así que el poster —un fotograma sin texto—
       sirve a las dos. */
    es: {
      src: "assets/video/ametller-origen-es.mp4",
      titulo: "Modelo Ametller Origen, en español",
      idioma: "Español",
      vertical: true,
      poster: "assets/img/poster-ametller-origen.jpg"
    },
    ca: {
      src: "assets/video/ametller-origen-ca.mp4",
      titulo: "Modelo Ametller Origen, en catalán",
      idioma: "Català",
      vertical: true,
      poster: "assets/img/poster-ametller-origen.jpg"
    }
  },


  /* ---------- La foto de cada modelo ----------
     La clave se corresponde con el data-foto-modelo de la tarjeta, que es el
     mismo vocabulario que usan data-presentacion y presentaciones. Si un modelo
     no tiene entrada, se queda la que hubiera puesta en el HTML. Las dos
     fotos actuales son exactamente 2:1 y llevan los productos centrados (ver
     README), asi que la tarjeta, que es 2:1, no recorta nada. */
  fotosModelo: {
    autogestion: {
      src: "assets/img/gama-productos.jpg",
      alt: "Surtido de una SmartShop: chocolatinas, un bol de ensalada, un yogur con frutos rojos, un sándwich de jamón y queso, un tarro de yogur natural, jamón serrano, patatas fritas, dos aguas embotelladas y dos refrescos."
    },
    ametller: {
      src: "assets/img/gama-ametller.jpg",
      alt: "Surtido del modelo Ametller Origen: macarrones boloñesa, un plato único de salmón con cuscús y verduras, arroz con verduras al curry verde, un bol de macarrones, una crema de verduras, un tomate y un gazpacho embotellado."
    }
  },

  /* ---------- Galería de puntos de venta ----------
     Solo instalaciones: las fotos de uso se han repartido por el recorrido
     (los cuatro pasos de "¿Cómo funciona?"), así no se repite ninguna.
     Con src a null se pinta un marcador a rayas en su lugar. */
  /* ---------- El carrusel de "Así queda en su sitio" ----------
     Orden de aparición. Solo la línea de básculas: nada de RFID (Selfly,
     Pickio). Aquí el cliente entiende que eso es lo que le van a instalar, así
     que una foto de la otra línea enseñaría un producto que no se vende en
     esta página.
     Cada entrada admite "encuadre" (object-position): el marco del carrusel es
     fijo y las fotos no comparten forma, así que se recortan al centro salvo
     que se diga otra cosa. Hace falta en las muy apaisadas, donde el equipo
     queda en un extremo y un recorte centrado lo dejaría fuera. Ahora mismo no
     lo usa ninguna. */
  galeria: [
    { src: "assets/img/pv-oficina-bascula.jpg", ancho: 933, alto: 525,
      alt: "Dos SmartShops de básculas en la zona de descanso de una oficina, con butacas azules; una persona abre una de las puertas" },
    { src: "assets/img/pv-hotel-cafe.jpg", ancho: 1122, alto: 701,
      alt: "Rincón de hotel con máquina de café y una SmartShop encastrada en un mueble de madera, junto a la zona de sofás" },
    { src: "assets/img/pv-coworking.jpg", ancho: 1400, alto: 1048,
      alt: "Máquina de café y SmartShop en un espacio de coworking, con personas trabajando con portátiles al fondo" },
    { src: "assets/img/pv-office-empresa.jpg", ancho: 1900, alto: 1329,
      alt: "SmartShop instalada junto al office de una oficina, encastrada en un mueble negro" },
    { src: "assets/img/pv-hotel-grabandgo.jpg", ancho: 1600, alto: 1029,
      alt: "Rincón Grab and Go de un hotel con dos SmartShops, cafetera y jardín vertical" },
    { src: "assets/img/pv-oficina-maurice.jpg", ancho: 1536, alto: 1024,
      alt: "Rincón de office con una SmartShop encastrada junto a una máquina de café y una pared vegetal con el rótulo Maurice" }
  ]
};
