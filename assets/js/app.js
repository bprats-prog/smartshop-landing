/* ============================================================
   SmartShops Arbitrade — comportamiento compartido
   Sin dependencias. Script clásico (no módulo) para que la web
   funcione también abierta con doble clic desde el escritorio.
   ============================================================ */
(function () {
  "use strict";

  var D = window.SMARTSHOP || {};
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Utilidad: texto seguro ---------- */
  function texto(el, valor) { if (el) { el.textContent = valor; } }

  /* ========================================================
     1. Datos de contacto (teléfono y tienda) en toda la web
     ======================================================== */
  function pintarContacto() {
    var c = D.contacto; if (!c) { return; }
    $$("[data-telefono]").forEach(function (el) {
      texto(el, c.telefono);
      if (el.tagName === "A") { el.href = c.telefonoEnlace; }
    });
    $$("[data-tel-enlace]").forEach(function (el) { el.href = c.telefonoEnlace; });
    $$("[data-tienda]").forEach(function (el) {
      texto(el, c.tiendaTexto);
      if (el.tagName === "A") { el.href = c.tienda; }
    });
  }

  /* ---------- Enlaces a las presentaciones completas ----------
     data-presentacion="autogestion|ametller" elige cuál; sin valor se usa la
     entrada "general", para que los botones de cierre no hereden el texto de
     un modelo concreto.
     Si no hay URL configurada, el botón se retira en vez de quedar muerto. */
  function presentacion() {
    var P = D.presentaciones || {};
    $$("[data-presentacion]").forEach(function (el) {
      var p = P[el.getAttribute("data-presentacion") || "general"];
      if (!p || !p.url) { el.remove(); return; }
      el.href = p.url;
      var etiqueta = $(".etiqueta-presentacion", el);
      if (etiqueta) { texto(etiqueta, p.texto); }

      /* La presentación se abre dentro de la web, con un botón de volver. El
         href se deja puesto: sirve para "abrir en pestaña nueva", para cuando
         no hay JS, y para el caso de disco, donde Google no deja incrustar. */
      el.addEventListener("click", function (e) {
        if (desdeDisco() || !$(".visor-doc")) { return; }
        e.preventDefault();
        abrirVisorDoc(p, el);
      });
    });
  }

  /* YouTube y Google rechazan incrustarse en una pagina abierta desde el disco:
     sin dominio, el origen es "null". Ahi todo se abre fuera. */
  function desdeDisco() { return window.location.protocol === "file:"; }

  /* ========================================================
     2. El recorrido: progreso, flechas y teclado
     ======================================================== */
  function recorrido() {
    var deck = $(".deck");
    if (!deck) { return; }

    var pantallas = $$(".pantalla", deck);
    var barra = $(".progreso");

    function actualizarProgreso() {
      if (!barra) { return; }
      var alcance = deck.scrollHeight - deck.clientHeight;
      var pct = alcance > 0 ? (deck.scrollTop / alcance) * 100 : 0;
      barra.style.width = pct.toFixed(2) + "%";
    }

    function pantallaActual() {
      var mejor = 0, dist = Infinity;
      pantallas.forEach(function (p, i) {
        var d = Math.abs(p.offsetTop - deck.scrollTop);
        if (d < dist) { dist = d; mejor = i; }
      });
      return mejor;
    }

    function irA(i) {
      var p = pantallas[Math.max(0, Math.min(pantallas.length - 1, i))];
      if (!p) { return; }
      deck.scrollTo({ top: p.offsetTop, behavior: "smooth" });
      /* El foco viaja con la vista: sin esto un lector de pantalla no anuncia
         nada al avanzar, y el siguiente tabulador devolvia al usuario a la
         pantalla anterior. Las secciones llevan tabindex="-1" en el HTML. */
      p.focus({ preventScroll: true });
    }

    deck.addEventListener("scroll", actualizarProgreso, { passive: true });
    window.addEventListener("resize", actualizarProgreso);
    actualizarProgreso();

    /* Flecha de avance al pie de cada pantalla */
    $$(".avanzar", deck).forEach(function (b) {
      b.addEventListener("click", function () { irA(pantallaActual() + 1); });
    });

    /* Enlaces internos dentro del recorrido */
    $$('a[href^="#"]', deck).forEach(function (a) {
      a.addEventListener("click", function (e) {
        var destino = $(a.getAttribute("href"));
        if (destino) { e.preventDefault(); deck.scrollTo({ top: destino.offsetTop, behavior: "smooth" }); }
      });
    });
    $$('.barra a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var destino = $(a.getAttribute("href"));
        if (destino) { e.preventDefault(); deck.scrollTo({ top: destino.offsetTop, behavior: "smooth" }); }
      });
    });

    /* Teclado: útil al proyectar en una sala */
    document.addEventListener("keydown", function (e) {
      if ($(".visor.abierto")) { return; }
      var t = e.target.tagName;
      if (t === "INPUT" || t === "TEXTAREA") { return; }
      /* El espacio activa el elemento enfocado: sobre un boton (el selector de
         idioma del video, por ejemplo), capturarlo aqui haria avanzar de
         pantalla en vez de pulsarlo. Solo se exime el espacio: si se
         eximiera cualquier tecla, tras pulsar una flecha .avanzar con el raton
         el foco se quedaria ahi y la flecha abajo dejaria de funcionar. */
      if (e.key === " " && (t === "BUTTON" || t === "A")) { return; }
      /* Un <video> con controles gobierna sus propias teclas: el espacio lo
         pone y lo para, y las flechas avanzan y retroceden. Si se capturaran
         aqui, un espacio sobre el video saltaria a la pantalla siguiente. */
      if (t === "VIDEO") { return; }
      /* Si la pantalla no cabe entera —a zoom 200 %, o en un movil bajo— el
         scroll nativo es la unica forma de leer su mitad inferior. Secuestrar
         las flechas ahi deja contenido inalcanzable con teclado. */
      var actual = pantallas[pantallaActual()];
      if (actual && actual.offsetHeight > deck.clientHeight + 4 &&
          (e.key === "ArrowDown" || e.key === "ArrowUp" ||
           e.key === "PageDown" || e.key === "PageUp" || e.key === " ")) { return; }
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault(); irA(pantallaActual() + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault(); irA(pantallaActual() - 1);
      } else if (e.key === "Home") {
        e.preventDefault(); irA(0);
      } else if (e.key === "End") {
        e.preventDefault(); irA(pantallas.length - 1);
      }
    });
  }

  /* ========================================================
     3. Animación de entrada
     ======================================================== */
  function animarEntradas() {
    var elems = $$(".entra");
    if (!elems.length) { return; }

    if (!("IntersectionObserver" in window)) {
      elems.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var algunoVisible = false;
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); algunoVisible = true; }
      });
    }, { threshold: 0.15, root: $(".deck") || null });
    elems.forEach(function (el) { obs.observe(el); });

    /* Red de seguridad: si a los 2,5 s el observador no ha revelado nada
       (contextos donde no llega a dispararse), se muestra todo. Mas vale
       perder la animacion que dejar la pagina en blanco. */
    window.setTimeout(function () {
      if (!algunoVisible) {
        elems.forEach(function (el) { el.classList.add("visible"); });
      }
    }, 2500);
  }

  /* ========================================================
     4. Vídeo: no se carga el reproductor hasta pulsar
     ======================================================== */
  function video() {
    if (!D.videos) { return; }

    /* YouTube rechaza los reproductores incrustados en paginas abiertas desde
       el disco: sin dominio, el origen es "null" y devuelve el error 153. Con
       el archivo suelto (doble clic) el video se abre en una pestana; servido
       por HTTP se reproduce dentro de la pagina, como debe ser. */
    var enDisco = desdeDisco();
    if (enDisco) {
      var aviso = $("#video .nota");
      if (aviso) { aviso.textContent = "Los vídeos se abren en YouTube, en una pestaña nueva."; }
    }

    $$("[data-video]").forEach(function (caja) {
      var v = D.videos[caja.getAttribute("data-video")];
      if (!v) { return; }

      caja.setAttribute("aria-label", "Reproducir el vídeo: " + v.titulo);
      if (v.vertical) { caja.classList.add("vertical"); }

      if (v.poster) {
        var img = document.createElement("img");
        img.src = v.poster;
        img.alt = "";
        caja.appendChild(img);
      }

      /* Sin { once }: en movil el visor se puede abrir y cerrar las veces que
         haga falta. En escritorio el boton se sustituye por el reproductor, asi
         que el oyente muere con el nodo y no hace falta desengancharlo. */
      caja.addEventListener("click", function () {
        /* Solo el de YouTube se manda fuera: un archivo propio es una ruta
           relativa y se reproduce igual abierto con doble clic. */
        if (enDisco && !v.src) {
          window.open("https://www.youtube.com/watch?v=" + v.id, "_blank", "noopener");
          return;
        }
        if (enMovil()) { abrirVisorVideo(v, caja); return; }

        var marco = marcoDeVideo(v, true);   /* escritorio: arranca solo, con sonido */
        /* El reproductor sustituye al boton en vez de meterse dentro: un
           iframe dentro de un <button> es HTML invalido y un lector de
           pantalla anuncia todos los controles de YouTube como "boton". El
           div hereda las clases, asi que se ve exactamente igual. */
        var hueco = document.createElement("div");
        hueco.className = caja.className;
        hueco.appendChild(marco);
        caja.parentNode.replaceChild(hueco, caja);
        marco.focus();
      });
    });
  }

  function enMovil() {
    return window.matchMedia("(max-width:820px)").matches;
  }

  function marcoDeVideo(v, arrancarSolo) {
    /* Archivo propio: un <video> nativo, sin tercero de por medio.
       preload="none" mantiene la regla de la web: no se descarga nada hasta que
       el visitante pulsa. Quien lo monte llama a play() dentro del clic: asi el
       navegador lo cuenta como gesto del usuario y lo deja sonar con audio, tambien
       en movil (el iframe de YouTube no puede aprovechar eso). */
    if (v.src) {
      var vid = document.createElement("video");
      vid.src = v.src;
      vid.controls = true;
      vid.preload = "none";
      vid.setAttribute("playsinline", "");   /* iOS: dentro del visor, no a su reproductor nativo */
      if (v.poster) { vid.poster = v.poster; }
      vid.setAttribute("aria-label", v.titulo);
      return vid;
    }

    var marco = document.createElement("iframe");
    /* nocookie: no deja rastro de YouTube hasta que el usuario decide ver el
       vídeo. playsinline evita que iOS se lleve el vídeo a su reproductor
       nativo y se salte el visor.

       El arranque automatico solo se pide donde el navegador lo permite con
       sonido, es decir en escritorio. En movil NO se pide, y es deliberado:
       Chrome y Safari bloquean el autoplay con audio, pero YouTube no se queda
       quieto ante ese bloqueo — se silencia solo y se pone a reproducir. El
       resultado era un video en marcha y mudo. Sin pedir autoplay, el
       reproductor muestra su boton de play y ese toque es un gesto directo del
       usuario: sonido garantizado. */
    marco.src = "https://www.youtube-nocookie.com/embed/" + v.id +
                "?rel=0&playsinline=1" + (arrancarSolo ? "&autoplay=1" : "");
    marco.title = v.titulo;
    marco.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen";
    marco.setAttribute("allowfullscreen", "");
    return marco;
  }

  /* ---------- Visor de vídeo a pantalla completa (móvil) ----------
     Un Short dentro de su marco mide poco mas de 200 px de ancho en un
     telefono. Aqui ocupa la pantalla y se cierra con la X o con Escape. */
  function abrirVisorVideo(v, origen) {
    var caja = $(".visor-video");
    if (!caja) { return; }
    ultimoFoco = origen || document.activeElement;
    var hueco = $(".marco-video", caja);
    hueco.innerHTML = "";
    var marco = marcoDeVideo(v);
    hueco.appendChild(marco);
    caja.classList.toggle("horizontal", !v.vertical);
    caja.classList.add("abierto");
    inertizarFondo(true);
    $(".cerrar", caja).focus();
    /* Un <video> propio arranca aqui, dentro del clic. Si el navegador lo
       rechazara, quedan los controles con su boton de play. */
    if (marco.play) { var p = marco.play(); if (p && p.catch) { p.catch(function () {}); } }
  }

  /* ---------- Vídeo del modelo Ametller Origen ----------
     El <video> va escrito en el HTML con el español (se reproduce aunque no
     cargue el script) y aqui se le añade el selector de idioma: cada boton
     (data-idioma) cambia el archivo por el de datos.js. Las claves de
     data-idioma son las de D.videos, y solo valen las entradas con "src". Un
     idioma sin video configurado se retira, y sin ninguno desaparece el bloque
     entero (data-video-modelo), como los botones de presentacion sin URL: nunca
     queda un control muerto.
     Si se esta reproduciendo al cambiar de idioma, el nuevo arranca solo: el
     clic en el selector es un gesto del usuario, asi que el navegador lo deja
     sonar. Si estaba parado, queda parado en su portada. */
  function videoModelo() {
    var bloque = $("[data-video-modelo]");
    if (!bloque) { return; }
    var grupo = $("[data-idiomas]", bloque);
    var player = $("[data-video-player]", bloque);
    var V = D.videos || {};
    if (!grupo || !player) { return; }

    var opciones = $$("[data-idioma]", grupo).filter(function (b) {
      var v = V[b.getAttribute("data-idioma")];
      var hay = !!(v && v.src);
      if (!hay) { b.remove(); }
      return hay;
    });
    if (!opciones.length) { bloque.remove(); return; }

    function elegir(clave) {
      var v = V[clave];
      opciones.forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-idioma") === clave ? "true" : "false");
      });
      if (player.getAttribute("src") === v.src) { return; }
      var sonaba = !player.paused && !player.ended;
      player.pause();
      player.setAttribute("src", v.src);
      if (v.poster) { player.setAttribute("poster", v.poster); }
      if (v.titulo) { player.setAttribute("aria-label", v.titulo); }
      /* preload="none": load() vuelve a la portada y no descarga nada hasta
         que se le da a reproducir. */
      player.load();
      if (sonaba) {
        var p = player.play();
        if (p && p.catch) { p.catch(function () {}); }
      }
    }
    opciones.forEach(function (b) {
      b.addEventListener("click", function () { elegir(b.getAttribute("data-idioma")); });
    });
    elegir(opciones[0].getAttribute("data-idioma"));
  }

  /* ---------- Visor de presentaciones ---------- */
  function abrirVisorDoc(p, origen) {
    var caja = $(".visor-doc");
    if (!caja) { return; }
    ultimoFoco = origen || document.activeElement;
    var marco = document.createElement("iframe");
    marco.src = p.url;
    marco.title = p.texto || "Presentación";
    marco.setAttribute("allowfullscreen", "");
    var hueco = $(".marco-doc", caja);
    hueco.innerHTML = "";
    hueco.appendChild(marco);
    caja.classList.add("abierto");
    inertizarFondo(true);
    $(".cerrar", caja).focus();
  }

  function visorDoc() {
    var caja = $(".visor-doc");
    if (!caja) { return; }

    function cerrar() {
      caja.classList.remove("abierto");
      $(".marco-doc", caja).innerHTML = "";
      inertizarFondo(false);
      if (ultimoFoco && document.contains(ultimoFoco)) { ultimoFoco.focus(); }
      ultimoFoco = null;
    }

    $(".cerrar", caja).addEventListener("click", cerrar);
    document.addEventListener("keydown", function (e) {
      if (!caja.classList.contains("abierto")) { return; }
      if (e.key === "Escape") { cerrar(); }
    });
  }

  function visorVideo() {
    var caja = $(".visor-video");
    if (!caja) { return; }

    function cerrar() {
      caja.classList.remove("abierto");
      /* Destruir el iframe, no solo esconderlo: si no, el vídeo sigue sonando. */
      $(".marco-video", caja).innerHTML = "";
      inertizarFondo(false);
      if (ultimoFoco && document.contains(ultimoFoco)) { ultimoFoco.focus(); }
      ultimoFoco = null;
    }

    $(".cerrar", caja).addEventListener("click", cerrar);
    /* Cuenta como "fuera" tanto el borde del visor como el hueco que rodea al
       vídeo (.marco-video ocupa todo el visor, y un vídeo vertical en una
       ventana ancha deja bandas a los lados). */
    caja.addEventListener("click", function (e) {
      if (e.target === caja || e.target.classList.contains("marco-video")) { cerrar(); }
    });
    document.addEventListener("keydown", function (e) {
      if (!caja.classList.contains("abierto")) { return; }
      if (e.key === "Escape") { cerrar(); return; }
      if (e.key === "Tab") { e.preventDefault(); $(".cerrar", caja).focus(); }
    });
  }

  /* ========================================================
     5. Galería y visor a pantalla completa
     ======================================================== */
  /* ---------- Carrusel de instalaciones ----------
     Una foto por vista. El desplazamiento es scroll-snap nativo, asi que en un
     movil se pasa con el dedo sin una linea de JavaScript; las flechas y los
     puntos son para raton y teclado. El numero de fotos lo pone datos.js: los
     puntos y los topes de las flechas salen de ahi, asi que anadir una foto es
     anadir una entrada a la lista y nada mas. */
  function galeria() {
    var cont = $("[data-galeria]");
    if (!cont || !D.galeria || !D.galeria.length) { return; }

    var total = D.galeria.length;

    /* El marco envuelve la pista y las flechas para que estas se centren sobre
       la foto y no sobre el conjunto foto + puntos, que las dejaria bajas. */
    var marco = document.createElement("div");
    marco.className = "marco-carrusel";
    var pista = document.createElement("div");
    pista.className = "pista";

    D.galeria.forEach(function (foto, i) {
      /* Con foto es un <button>: colgar el clic de un <figure> dejaba la
         galeria sin abrir con teclado, que es como se navega al proyectar. */
      var pieza = document.createElement(foto.src ? "button" : "div");
      pieza.className = "pieza";
      if (foto.src) {
        pieza.type = "button";
        pieza.setAttribute("aria-label",
          "Foto " + (i + 1) + " de " + total + ". Ampliar: " + (foto.alt || ""));
        var img = document.createElement("img");
        img.src = foto.src;
        img.alt = "";
        /* La primera entra en la primera pantalla de la seccion; las demas
           solo cuando el visitante llega a ellas. */
        img.loading = i === 0 ? "eager" : "lazy";
        img.decoding = "async";
        if (foto.ancho && foto.alto) { img.width = foto.ancho; img.height = foto.alto; }
        /* El marco es fijo y las fotos no tienen todas la misma forma, asi que
           se recortan. Con encuadre ("center top", "left center"...) se elige
           que parte manda; sin el, el centro. */
        if (foto.encuadre) { img.style.objectPosition = foto.encuadre; }
        pieza.appendChild(img);
        pieza.addEventListener("click", function () { abrirVisor(foto.src, foto.alt, pieza); });
      } else {
        var hueco = document.createElement("div");
        hueco.className = "hueco";
        hueco.textContent = foto.alt || "Foto pendiente";
        pieza.appendChild(hueco);
      }
      pista.appendChild(pieza);
    });

    marco.appendChild(pista);
    cont.appendChild(marco);

    /* Con una sola foto no hay nada que pasar: ni flechas ni puntos. */
    if (total < 2) { return; }

    function flecha(clase, etiqueta, trazo) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "flecha " + clase;
      b.setAttribute("aria-label", etiqueta);
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
        ' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"' +
        ' aria-hidden="true"><path d="' + trazo + '"/></svg>';
      return b;
    }
    var ant = flecha("ant", "Foto anterior", "m15 18-6-6 6-6");
    var sig = flecha("sig", "Foto siguiente", "m9 18 6-6-6-6");
    marco.appendChild(ant);
    marco.appendChild(sig);

    var puntitos = document.createElement("div");
    puntitos.className = "puntitos";
    var bolas = D.galeria.map(function (foto, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "bola";
      b.setAttribute("aria-label", "Ir a la foto " + (i + 1) + " de " + total);
      b.addEventListener("click", function () { irA(i); });
      puntitos.appendChild(b);
      return b;
    });
    cont.appendChild(puntitos);

    var piezas = $$(".pieza", pista);
    /* La foto que toca se guarda, no se deduce de la posicion en cada clic:
       leyendola en marcha, dos toques seguidos en la flecha calculaban el mismo
       destino y el segundo se perdia. La posicion real solo manda cuando el
       visitante pasa la foto con el dedo, y se recoge al pararse. */
    var indice = 0;
    var reposo = null;

    function medida() {
      /* El ancho exacto de una foto sale de la pista, no de clientWidth: con
         anchos fraccionarios los dos no coinciden y el indice bailaba. */
      var ancho = (pista.scrollWidth / total) || 1;
      return Math.max(0, Math.min(total - 1, Math.round(pista.scrollLeft / ancho)));
    }
    function pintar() {
      bolas.forEach(function (b, n) {
        if (n === indice) { b.setAttribute("aria-current", "true"); }
        else { b.removeAttribute("aria-current"); }
      });
      /* En los extremos la flecha se esconde en vez de quedarse apagada: con
         tres fotos, media docena de pixeles grises no dicen nada. */
      ant.disabled = indice === 0;
      sig.disabled = indice === total - 1;
    }
    function irA(i) {
      indice = Math.max(0, Math.min(total - 1, i));
      var p = piezas[indice];
      if (p) { pista.scrollTo({ left: p.offsetLeft, behavior: "smooth" }); }
      pintar();
    }

    ant.addEventListener("click", function () { irA(indice - 1); });
    sig.addEventListener("click", function () { irA(indice + 1); });

    /* ---- Flechas del teclado ----
       Se escucha en el documento y no en el carrusel. Al llegar a esta pantalla
       el foco está en el <body>, o en la <section> si se ha llegado con la
       flecha de avance: ninguno de los dos pasa por dentro del carrusel, así que
       un listener colgado de él solo respondía después de hacer clic o tabular
       dentro. Lo que manda es lo que se está viendo, no dónde está el foco.
       Arriba y abajo se dejan en paz a propósito: son las del recorrido, y
       secuestrarlas aquí dejaría al visitante encerrado en esta pantalla.
       Con una tecla modificadora tampoco se toca nada, que Alt+Izquierda es el
       "atrás" del navegador. */
    cont.setAttribute("role", "group");
    cont.setAttribute("aria-roledescription", "carrusel");
    cont.setAttribute("aria-label", "Instalaciones reales");

    function aLaVista() {
      var r = cont.getBoundingClientRect();
      var alto = window.innerHeight || document.documentElement.clientHeight;
      var visible = Math.min(r.bottom, alto) - Math.max(r.top, 0);
      return r.height > 0 && visible > r.height / 2;
    }

    document.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") { return; }
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) { return; }
      /* Con una foto abierta a pantalla completa manda el visor, no el fondo. */
      if ($(".visor.abierto")) { return; }
      var t = e.target.tagName;
      if (t === "INPUT" || t === "TEXTAREA") { return; }
      /* Un <video> usa izquierda y derecha para avanzar y retroceder. */
      if (t === "VIDEO") { return; }
      if (!aLaVista()) { return; }
      e.preventDefault();
      irA(indice + (e.key === "ArrowRight" ? 1 : -1));
    });

    pista.addEventListener("scroll", function () {
      window.clearTimeout(reposo);
      reposo = window.setTimeout(function () { indice = medida(); pintar(); }, 120);
    }, { passive: true });
    window.addEventListener("resize", function () { indice = medida(); pintar(); });
    pintar();
  }

  /* Desde donde se abrio el visor, para devolver el foco al cerrarlo. */
  var ultimoFoco = null;

  function abrirVisor(src, alt, origen) {
    var caja = $(".visor");
    if (!caja) { return; }
    ultimoFoco = origen || document.activeElement;
    $("img", caja).src = src;
    $("img", caja).alt = alt || "";
    caja.classList.add("abierto");
    /* El resto de la pagina queda inerte: sin esto el tabulador se escapaba
       del visor hacia las ocho pantallas de detras y el usuario lo perdia de
       vista sin poder cerrarlo. */
    inertizarFondo(true);
    $(".cerrar", caja).focus();
  }

  function inertizarFondo(inerte) {
    ["header.barra", ".deck", ".doc", "footer.pie"].forEach(function (sel) {
      var el = $(sel);
      if (!el) { return; }
      el.inert = inerte;
      if (inerte) { el.setAttribute("aria-hidden", "true"); }
      else { el.removeAttribute("aria-hidden"); }
    });
  }

  function visor() {
    var caja = $(".visor");
    if (!caja) { return; }

    function cerrar() {
      caja.classList.remove("abierto");
      inertizarFondo(false);
      if (ultimoFoco && document.contains(ultimoFoco)) { ultimoFoco.focus(); }
      ultimoFoco = null;
    }

    $(".cerrar", caja).addEventListener("click", cerrar);
    caja.addEventListener("click", function (e) { if (e.target === caja) { cerrar(); } });
    document.addEventListener("keydown", function (e) {
      if (!caja.classList.contains("abierto")) { return; }
      if (e.key === "Escape") { cerrar(); return; }
      /* Solo hay un elemento enfocable dentro: el tabulador se queda en el. */
      if (e.key === "Tab") { e.preventDefault(); $(".cerrar", caja).focus(); }
    });
  }


  /* ========================================================
     6. Los dos modelos: fotos
     ======================================================== */
  /* Cada tarjeta lleva en el HTML su foto por defecto (para que se vea sin JS)
     y datos.js puede sustituirla. La clave de data-foto-modelo es la misma que
     usan data-presentacion y "presentaciones": asi no hay una lista de modelos
     repartida por el codigo. Sin entrada en datos.js se queda la del HTML. */
  function fotosModelo() {
    var F = D.fotosModelo || {};
    $$("[data-foto-modelo]").forEach(function (fig) {
      var f = F[fig.getAttribute("data-foto-modelo")];
      var img = $("img", fig);
      if (!f || !f.src || !img) { return; }
      if (img.getAttribute("src") !== f.src) { img.src = f.src; }
      if (f.alt) { img.alt = f.alt; }
    });
  }

  /* ---------- Arranque ---------- */
  function iniciar() {
    /* Le dice al script del <head> que el comportamiento esta vivo: sin esto
       retira la clase anim a los 3 s y el contenido se muestra sin animar. */
    document.documentElement.classList.add("app-ok");
    pintarContacto();
    presentacion();
    recorrido();
    animarEntradas();
    video();
    videoModelo();
    galeria();
    visor();
    visorVideo();
    visorDoc();
    fotosModelo();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
