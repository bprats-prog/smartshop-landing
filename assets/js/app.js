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
     data-presentacion="autogestion|ametller" elige cuál; sin valor, la del modelo
     de autogestión, que es la que enlaza el recorrido.
     Si no hay URL configurada, el botón se retira en vez de quedar muerto. */
  function presentacion() {
    var P = D.presentaciones || {};
    $$("[data-presentacion]").forEach(function (el) {
      var p = P[el.getAttribute("data-presentacion") || "autogestion"];
      if (!p || !p.url) { el.remove(); return; }
      el.href = p.url;
      var etiqueta = $(".etiqueta-presentacion", el);
      if (etiqueta) { texto(etiqueta, p.texto); }
    });
  }

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
      if (p) { deck.scrollTo({ top: p.offsetTop, behavior: "smooth" }); }
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
    var enDisco = window.location.protocol === "file:";
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

      caja.addEventListener("click", function () {
        if (enDisco) {
          window.open("https://www.youtube.com/watch?v=" + v.id, "_blank", "noopener");
          return;
        }
        var marco = document.createElement("iframe");
        /* nocookie: no deja rastro de YouTube hasta que el usuario decide ver el vídeo */
        marco.src = "https://www.youtube-nocookie.com/embed/" + v.id + "?autoplay=1&rel=0";
        marco.title = v.titulo;
        marco.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen";
        marco.setAttribute("allowfullscreen", "");
        marco.loading = "lazy";
        caja.innerHTML = "";
        caja.appendChild(marco);
        caja.style.cursor = "default";
      }, { once: !enDisco });
    });
  }

  /* ========================================================
     5. Galería y visor a pantalla completa
     ======================================================== */
  function galeria() {
    var cont = $("[data-galeria]");
    if (!cont || !D.galeria) { return; }

    var pesos = [];

    D.galeria.forEach(function (foto) {
      var fig = document.createElement("figure");
      if (foto.src) {
        var img = document.createElement("img");
        img.src = foto.src;
        img.alt = foto.alt || "";
        img.loading = "lazy";
        img.decoding = "async";
        /* Ancho y alto reales para reservar el hueco antes de que cargue y para
           que la rejilla reparta las columnas segun la forma de cada foto. */
        if (foto.ancho && foto.alto) {
          img.width = foto.ancho;
          img.height = foto.alto;
          fig.style.setProperty("--proporcion", foto.ancho + "/" + foto.alto);
          pesos.push((foto.ancho / foto.alto).toFixed(3) + "fr");
        } else {
          pesos.push("1fr");
        }
        fig.appendChild(img);
        fig.addEventListener("click", function () { abrirVisor(foto.src, foto.alt); });
      } else {
        var hueco = document.createElement("div");
        hueco.className = "hueco";
        hueco.textContent = foto.alt || "Foto pendiente";
        fig.appendChild(hueco);
        fig.style.cursor = "default";
        pesos.push("1fr");
      }
      cont.appendChild(fig);
    });

    cont.style.setProperty("--columnas", pesos.join(" "));
  }

  function abrirVisor(src, alt) {
    var visor = $(".visor");
    if (!visor) { return; }
    $("img", visor).src = src;
    $("img", visor).alt = alt || "";
    visor.classList.add("abierto");
    $(".cerrar", visor).focus();
  }

  function visor() {
    var visor = $(".visor");
    if (!visor) { return; }
    function cerrar() { visor.classList.remove("abierto"); }
    $(".cerrar", visor).addEventListener("click", cerrar);
    visor.addEventListener("click", function (e) { if (e.target === visor) { cerrar(); } });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && visor.classList.contains("abierto")) { cerrar(); }
    });
  }


  /* ========================================================
     6. Los dos modelos de surtido: pestañas
     ======================================================== */
  /* Sin JS los dos paneles se ven uno tras otro, cada uno con su nombre: el
     CSS solo esconde el inactivo cuando hay script (clase .js en <html>). */
  function modelos() {
    var caja = $("[data-modelos]");
    if (!caja) { return; }

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
    pintarContacto();
    presentacion();
    recorrido();
    animarEntradas();
    video();
    galeria();
    visor();
    modelos();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
