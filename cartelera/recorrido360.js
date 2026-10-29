/* ============================================================
   RECORRIDO 360° — Teatro Marconi
   ------------------------------------------------------------
   El video original se convirtió en una secuencia de 240 imágenes
   (carpeta ./360/). Este visor las dibuja en un <canvas>:

   · Flecha derecha  → mantené el clic: gira hacia la derecha.
   · Flecha izquierda → mantené el clic: gira hacia la izquierda.
   · Al soltar el clic, el giro se detiene al instante.

   Uso: en cartelera.html agregar, antes de </body>:
        <script src="recorrido360.js" defer></script>
   El visor se inserta solo al final de la página (debajo de la
   cartelera y de los eventos). Si preferís elegir el lugar exacto,
   poné <div id="recorrido-360"></div> donde quieras y se usa ese.
   ============================================================ */
(function () {
  'use strict';

  var TOTAL_FRAMES = 240;       // Cantidad de imágenes de la secuencia
  var SEGUNDOS_VUELTA = 8;      // Duración de una vuelta completa (igual al video original)

  /* ---------- Ubicación de los archivos (relativa a este script) ---------- */
  var scriptEl = document.currentScript || document.querySelector('script[src*="recorrido360.js"]');
  var base = scriptEl ? new URL('.', scriptEl.src).href : './';
  var carpetaFrames = base + '360/';

  function urlFrame(i) {
    return carpetaFrames + 'frame-' + String(i + 1).padStart(3, '0') + '.webp';
  }

  /* ---------- Estilos ---------- */
  if (!document.querySelector('link[data-r360]')) {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = base + 'recorrido360.css';
    css.setAttribute('data-r360', '');
    document.head.appendChild(css);
  }

  /* ---------- Marcado ---------- */
  var FLECHA_IZQ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4 7 12l8 8"/></svg>';
  var FLECHA_DER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 4 8 8-8 8"/></svg>';

  function construir() {
    var seccion = document.createElement('section');
    seccion.className = 'r360';
    seccion.setAttribute('aria-labelledby', 'r360-titulo');
    seccion.innerHTML =
      '<h2 class="r360__titulo" id="r360-titulo">Recorré el Teatro Marconi en 360°</h2>' +
      '<p class="r360__subtitulo">Mirá la sala principal desde el escenario. Mantené presionada una flecha para girar.</p>' +
      '<div class="r360__visor">' +
        '<canvas class="r360__canvas" width="768" height="576" role="img" aria-label="Vista panorámica 360 grados de la sala del Teatro Marconi"></canvas>' +
        '<span class="r360__insignia">360°</span>' +
        '<button type="button" class="r360__flecha r360__flecha--izq" aria-label="Girar hacia la izquierda (mantené presionado)" disabled>' + FLECHA_IZQ + '</button>' +
        '<button type="button" class="r360__flecha r360__flecha--der" aria-label="Girar hacia la derecha (mantené presionado)" disabled>' + FLECHA_DER + '</button>' +
        '<div class="r360__cargando" role="status" aria-live="polite"><span class="r360__txt">Cargando recorrido…</span><span class="r360__barra"><span></span></span></div>' +
        '<div class="r360__giro" aria-hidden="true"><span></span></div>' +
      '</div>' +
      '<p class="r360__ayuda">Mantené presionada la flecha ◀ o ▶ para girar. Al soltar, se detiene.</p>';
    return seccion;
  }

  function insertar(seccion) {
    var destino = document.getElementById('recorrido-360');
    if (destino) { destino.appendChild(seccion); return; }
    var main = document.querySelector('main');
    if (main) { main.appendChild(seccion); return; }
    var footer = document.querySelector('footer');
    if (footer && footer.parentNode) { footer.parentNode.insertBefore(seccion, footer); return; }
    document.body.appendChild(seccion);
  }

  /* ---------- Lógica del visor ---------- */
  function iniciar() {
    var seccion = construir();
    insertar(seccion);

    var canvas = seccion.querySelector('.r360__canvas');
    var ctx = canvas.getContext('2d');
    var btnIzq = seccion.querySelector('.r360__flecha--izq');
    var btnDer = seccion.querySelector('.r360__flecha--der');
    var panelCarga = seccion.querySelector('.r360__cargando');
    var txtCarga = seccion.querySelector('.r360__txt');
    var barra = seccion.querySelector('.r360__barra > span');
    var marcador = seccion.querySelector('.r360__giro > span');

    var frames = new Array(TOTAL_FRAMES);
    var cargados = 0;
    var listo = false;

    var posicion = 0;          // Posición (en frames, con decimales) dentro de la vuelta
    var direccion = 0;         // -1 izquierda, 0 detenido, +1 derecha
    var ultimoTiempo = 0;
    var rafId = null;
    var dibujado = -1;

    function dibujar() {
      var idx = ((Math.round(posicion) % TOTAL_FRAMES) + TOTAL_FRAMES) % TOTAL_FRAMES;
      if (idx !== dibujado && frames[idx] && frames[idx].complete && frames[idx].naturalWidth) {
        ctx.drawImage(frames[idx], 0, 0, canvas.width, canvas.height);
        dibujado = idx;
      }
      marcador.style.left = (idx / TOTAL_FRAMES * 100) + '%';
    }

    function paso(ahora) {
      if (!direccion) { rafId = null; return; }       // Soltó el clic: se detiene
      var dt = Math.min((ahora - ultimoTiempo) / 1000, 0.1);
      ultimoTiempo = ahora;
      posicion += direccion * dt * (TOTAL_FRAMES / SEGUNDOS_VUELTA);
      dibujar();
      rafId = requestAnimationFrame(paso);
    }

    function empezar(dir, boton) {
      if (!listo) return;
      direccion = dir;
      boton.classList.add('is-activa');
      ultimoTiempo = performance.now();
      if (!rafId) rafId = requestAnimationFrame(paso);
    }

    function detener() {
      direccion = 0;
      btnIzq.classList.remove('is-activa');
      btnDer.classList.remove('is-activa');
    }

    function enlazar(boton, dir) {
      boton.addEventListener('pointerdown', function (e) {
        if (e.button !== undefined && e.button !== 0) return;   // Solo botón principal
        e.preventDefault();
        try { boton.setPointerCapture(e.pointerId); } catch (_) {}
        empezar(dir, boton);
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) {
        boton.addEventListener(ev, detener);
      });
      boton.addEventListener('blur', detener);
      boton.addEventListener('contextmenu', function (e) { e.preventDefault(); }); // Evita menú al mantener en celular

      // Teclado: mantener Enter o Espacio equivale a mantener el clic
      boton.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!e.repeat) empezar(dir, boton);
        }
      });
      boton.addEventListener('keyup', function (e) {
        if (e.key === 'Enter' || e.key === ' ') detener();
      });
    }
    enlazar(btnIzq, -1);
    enlazar(btnDer, +1);

    // Si la pestaña pierde el foco o se suelta el mouse fuera de la ventana, también se detiene
    window.addEventListener('blur', detener);
    document.addEventListener('visibilitychange', function () { if (document.hidden) detener(); });
    window.addEventListener('pointerup', detener);

    /* ---------- Carga de imágenes (recién cuando la sección está cerca de verse) ---------- */
    var cargaIniciada = false;
    function cargar() {
      if (cargaIniciada) return;
      cargaIniciada = true;

      function alTerminarUna() {
        cargados++;
        var pct = Math.round(cargados / TOTAL_FRAMES * 100);
        barra.style.width = pct + '%';
        txtCarga.textContent = 'Cargando recorrido… ' + pct + '%';
        if (cargados === TOTAL_FRAMES) {
          listo = true;
          panelCarga.hidden = true;
          btnIzq.disabled = false;
          btnDer.disabled = false;
        }
      }

      for (var i = 0; i < TOTAL_FRAMES; i++) {
        (function (n) {
          var img = new Image();
          img.decoding = 'async';
          img.onload = function () {
            if (n === 0) dibujar();      // Muestra la primera imagen apenas llega
            alTerminarUna();
          };
          img.onerror = alTerminarUna;   // Un frame faltante no bloquea el visor
          img.src = urlFrame(n);
          frames[n] = img;
        })(i);
      }
    }

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entradas) {
        if (entradas.some(function (en) { return en.isIntersecting; })) { cargar(); obs.disconnect(); }
      }, { rootMargin: '600px 0px' });
      obs.observe(seccion);
    } else {
      cargar();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
