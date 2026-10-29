/* ============================================================
   MÓDULO MICRO CINE — carrusel, grilla y modal de trailer
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------
     1) DATOS PLACEHOLDER DE PELÍCULAS
     ------------------------------------------------------------ */
  const PELICULAS = [
    {
      id: 'pel-1',
      titulo: 'PROXIMAMENTE',
      genero: '',
      duracion: '',
      clasificacion: '',
      sinopsis: '',
      poster: 'data:image/jpeg;base64,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',
      trailer: '',
      destacada: true,
    },
    {
      id: '',
      titulo: 'PROXIMAMENTE',
      genero: '',
      duracion: '',
      clasificacion: '',
      sinopsis: '.',
      poster: 'data:image/jpeg;base64,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',
      trailer: '',
      destacada: true,
    },
    {
      id: '',
      titulo: 'PROXIMAMENTE',
      genero: '',
      duracion: '',
      clasificacion: '',
      sinopsis:'',
      poster: 'data:image/jpeg;base64,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',
      trailer: '',
      destacada: false,
    },
  ];

  /* ------------------------------------------------------------
     2) REFERENCIAS DEL DOM
     ------------------------------------------------------------ */
  const track = document.getElementById('carruselTrack');
  const dots = document.getElementById('carruselDots');
  const prevBtn = document.getElementById('carruselPrev');
  const nextBtn = document.getElementById('carruselNext');
  const grid = document.getElementById('microcineGrid');

  const modal = document.getElementById('trailerModal');
  const modalTitle = document.getElementById('trailerModalTitle');
  const frame = document.getElementById('trailerFrame');
  const modalClose = document.getElementById('trailerModalClose');

  if (!grid || !track) return;

  let indiceActual = 0;
  let intervaloAuto = null;
  let ultimoFoco = null;

  const destacadas = PELICULAS.filter((p) => p.destacada);

  /* ------------------------------------------------------------
     3) CARRUSEL
     ------------------------------------------------------------ */
  function renderCarrusel() {
    track.innerHTML = '';
    dots.innerHTML = '';

    destacadas.forEach((pel, i) => {
      const li = document.createElement('li');
      li.className = 'carrusel__slide';
      li.setAttribute('role', 'group');
      li.setAttribute('aria-roledescription', 'diapositiva');
      li.setAttribute('aria-label', `${i + 1} de ${destacadas.length}: ${pel.titulo}`);
      li.innerHTML = `
        <img src="${pel.poster}" alt="Póster de ${pel.titulo}" loading="lazy" decoding="async" />
        <div class="carrusel__caption">
          <h3>${pel.titulo}</h3>
          <p>${pel.genero} · ${pel.duracion} · ${pel.clasificacion}</p>
        </div>
      `;
      track.appendChild(li);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carrusel__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.setAttribute('aria-label', `Ir a ${pel.titulo}`);
      dot.addEventListener('click', () => irASlide(i));
      dots.appendChild(dot);
    });

    irASlide(0, false);
    iniciarAuto();
  }

  function irASlide(i, animar = true) {
    if (!destacadas.length) return;
    indiceActual = (i + destacadas.length) % destacadas.length;
    track.style.transition = animar ? 'transform .5s ease' : 'none';
    track.style.transform = `translateX(-${indiceActual * 100}%)`;

    dots.querySelectorAll('.carrusel__dot').forEach((d, idx) => {
      d.setAttribute('aria-selected', idx === indiceActual ? 'true' : 'false');
    });
  }

  function iniciarAuto() {
    detenerAuto();
    if (destacadas.length < 2) return;
    intervaloAuto = setInterval(() => irASlide(indiceActual + 1), 6000);
  }
  function detenerAuto() {
    if (intervaloAuto) clearInterval(intervaloAuto);
    intervaloAuto = null;
  }

  prevBtn?.addEventListener('click', () => { irASlide(indiceActual - 1); iniciarAuto(); });
  nextBtn?.addEventListener('click', () => { irASlide(indiceActual + 1); iniciarAuto(); });

  // Pausar auto al pasar el mouse (mejor UX)
  const carrusel = document.querySelector('.carrusel');
  carrusel?.addEventListener('mouseenter', detenerAuto);
  carrusel?.addEventListener('mouseleave', iniciarAuto);
  carrusel?.addEventListener('focusin', detenerAuto);
  carrusel?.addEventListener('focusout', iniciarAuto);

  /* ------------------------------------------------------------
     4) GRILLA DE PELÍCULAS
     ------------------------------------------------------------ */
  function renderGrid() {
    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    PELICULAS.forEach((pel) => {
      const article = document.createElement('article');
      article.className = 'pelicula';
      article.innerHTML = `
        <div class="pelicula__poster">
          <img src="${pel.poster}" alt="Póster de ${pel.titulo}" loading="lazy" decoding="async" />
          <span class="pelicula__clasif">${pel.clasificacion}</span>
        </div>
        <div class="pelicula__body">
          <h3 class="pelicula__title">${pel.titulo}</h3>
          <p class="pelicula__meta">${pel.genero} · ${pel.duracion}</p>
          <p class="pelicula__sinopsis">${pel.sinopsis}</p>
          <div class="pelicula__actions">
            <button type="button" class="btn btn--accent" data-trailer="${pel.id}">
              Ver Trailer
            </button>
            <a class="btn btn--primary" href="index.html#colaborar">Reservar</a>
          </div>
        </div>
      `;
      fragment.appendChild(article);
    });

    grid.appendChild(fragment);
  }

  /* ------------------------------------------------------------
     5) MODAL DE TRAILER
     ------------------------------------------------------------ */
  function abrirTrailer(id, trigger) {
    const pel = PELICULAS.find((p) => p.id === id);
    if (!pel) return;

    ultimoFoco = trigger || document.activeElement;
    modalTitle.textContent = `${pel.titulo} — Trailer`;
    frame.src = pel.trailer;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalClose.focus();
    document.addEventListener('keydown', manejarTeclasModal);
  }

  function cerrarTrailer() {
    modal.hidden = true;
    frame.src = ''; // detiene el video
    document.body.style.overflow = '';
    document.removeEventListener('keydown', manejarTeclasModal);
    if (ultimoFoco && typeof ultimoFoco.focus === 'function') ultimoFoco.focus();
  }

  function manejarTeclasModal(e) {
    if (e.key === 'Escape') cerrarTrailer();
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-trailer]');
    if (btn) abrirTrailer(btn.dataset.trailer, btn);
  });

  modalClose?.addEventListener('click', cerrarTrailer);
  modal?.addEventListener('click', (e) => {
    if (e.target.matches('[data-close-trailer]') || e.target === modal) cerrarTrailer();
  });

  /* ------------------------------------------------------------
     6) INIT
     ------------------------------------------------------------ */
  renderCarrusel();
  renderGrid();
});