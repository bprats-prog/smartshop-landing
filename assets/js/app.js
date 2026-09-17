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
      /* El espacio activa el elemento enfocado. Desde que las pestañas de los
         modelos viven dentro del recorrido, capturarlo aqui haria avanzar de
         pantalla en vez de cambiar de panel. Solo se exime el espacio: si se
         eximiera cualquier tecla, tras pulsar una flecha .avanzar con el raton
         el foco se quedaria ahi y la flecha abajo dejaria de funcionar. */
      if (e.key === " " && (t === "BUTTON" || t === "A")) { return; }
      /* Las pestañas de los modelos gobiernan sus propias flechas, y Home/End
         mueven entre pestañas: capturarlas aqui sacaba al usuario del selector. */
      if (e.target.closest && e.target.closest('[role="tablist"]')) { return; }
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
        if (enDisco) {
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
    hueco.appendChild(marcoDeVideo(v));
    caja.classList.toggle("horizontal", !v.vertical);
    caja.classList.add("abierto");
    inertizarFondo(true);
    $(".cerrar", caja).focus();
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
    caja.addEventListener("click", function (e) { if (e.target === caja) { cerrar(); } });
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
    function actual() {
      /* El ancho exacto de una foto sale de la pista, no de clientWidth: con
         anchos fraccionarios los dos no coinciden y el indice bailaba. */
      var ancho = (pista.scrollWidth / total) || 1;
      return Math.max(0, Math.min(total - 1, Math.round(pista.scrollLeft / ancho)));
    }
    function irA(i) {
      var p = piezas[Math.max(0, Math.min(total - 1, i))];
      if (p) { pista.scrollTo({ left: p.offsetLeft, behavior: "smooth" }); }
    }
    function pintar() {
      var i = actual();
      bolas.forEach(function (b, n) {
        if (n === i) { b.setAttribute("aria-current", "true"); }
        else { b.removeAttribute("aria-current"); }
      });
      /* En los extremos la flecha se esconde en vez de quedarse apagada: con
         tres fotos, media docena de pixeles grises no dicen nada. */
      ant.disabled = i === 0;
      sig.disabled = i === total - 1;
    }
    ant.addEventListener("click", function () { irA(actual() - 1); });
    sig.addEventListener("click", function () { irA(actual() + 1); });
    pista.addEventListener("scroll", pintar, { passive: true });
    window.addEventListener("resize", pintar);
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
     6. Los dos modelos de surtido: pestañas
     ======================================================== */
  /* Sin JS los dos paneles se ven uno tras otro, cada uno con su nombre: el
     CSS solo esconde el inactivo cuando hay script (clase .js en <html>). */
  function modelos() {
    /* Recorre todas las cajas, no solo la primera: si alguna vez hay dos
       selectores en la misma pagina, con querySelector el segundo se quedaria
       en blanco (el CSS esconde los paneles inactivos en cuanto hay JS). */
    $$("[data-modelos]").forEach(montarSelector);
  }

  /* La foto que acompaña al selector cambia con el modelo elegido. La clave
     sale del id del panel sin el prefijo "panel-", que es el mismo vocabulario
     de data-presentacion y de presentaciones: asi no hay una lista de modelos
     repartida por el codigo. Sin entrada en datos.js se queda la del HTML. */
  function pintarFotoDelModelo(caja, panel) {
    var seccion = caja.closest ? caja.closest("section") : null;
    var fig = seccion && $("[data-foto-modelo]", seccion);
    if (!fig || !panel) { return; }
    var clave = (panel.id || "").replace(/^panel-/, "");
    var foto = (D.fotosModelo || {})[clave];
    var img = $("img", fig);
    if (!foto || !foto.src || !img) { return; }
    if (img.getAttribute("src") !== foto.src) { img.src = foto.src; }
    img.alt = foto.alt || "";
    /* El fondo de la tarjeta es la propia foto, ampliada y desenfocada: asi el
       rectangulo continua el fondo del bodegon en vez de imponerle un color.
       Se pasa por variable y no por regla fija porque cambia con el modelo, y
       desde aqui y no desde el CSS porque la ruta de datos.js es relativa al
       documento (y es la que reescribe el script de empaquetado). */
    var tarjeta = fig.closest && fig.closest(".gama");
    if (tarjeta) {
      tarjeta.style.setProperty("--gama-foto", 'url("' + foto.src + '")');
      /* Fotos compuestas con el producto a un lado y el fondo libre al otro:
         en escritorio la foto pasa a ocupar el rectangulo entero y el texto se
         coloca sobre esa zona vacia. Lo declara datos.js, no el CSS, porque
         depende de la foto que haya puesta. */
      tarjeta.classList.toggle("con-hueco", !!foto.hueco);
    }
  }

  function montarSelector(caja) {
    var pestanas = $$(".pestana", caja);
    var paneles  = $$(".panel", caja);
    if (!pestanas.length || pestanas.length !== paneles.length) { return; }

    function activar(i, moverFoco) {
      pestanas.forEach(function (p, n) {
        var elegida = n === i;
        p.setAttribute("aria-selected", elegida ? "true" : "false");
        /* Solo la pestaña activa entra en el tabulador: el panel es el
           siguiente destino natural, no la otra pestaña. */
        p.tabIndex = elegida ? 0 : -1;
        paneles[n].classList.toggle("activo", elegida);
      });
      pintarFotoDelModelo(caja, paneles[i]);
      if (moverFoco) { pestanas[i].focus(); }
    }

    pestanas.forEach(function (pestana, i) {
      pestana.addEventListener("click", function () { activar(i, false); });
      pestana.addEventListener("keydown", function (e) {
        var salto = 0;
        if (e.key === "ArrowRight") { salto = 1; }
        else if (e.key === "ArrowLeft") { salto = -1; }
        if (!salto) { return; }
        e.preventDefault();
        activar((i + salto + pestanas.length) % pestanas.length, true);
      });
    });

    activar(0, false);
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
    galeria();
    visor();
    visorVideo();
    visorDoc();
    modelos();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
