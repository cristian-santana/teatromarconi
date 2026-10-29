/* ============================================================
   MÓDULO CARTELERA — datos simulados, filtros y modal
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------
     1) "API" SIMULADA — datos placeholder de eventos
     ------------------------------------------------------------ */
  const EVENTOS = [
    {
      id: 'ev-1',
      titulo: 'proximamente',
      categoria: 'Teatro',
      fecha: '',
      hora: '',
      lugar: 'Teatro Marconi — Sala Principal',
      descripcion: 'En esta seccion se promocionaran obras y eventos futuros',
      detalle: '',
      cta: '',
    },
   
  ];

  /* ------------------------------------------------------------
     2) REFERENCIAS DEL DOM
     ------------------------------------------------------------ */
  const grid = document.getElementById('carteleraGrid');
  const emptyMsg = document.getElementById('carteleraEmpty');
  const statusMsg = document.getElementById('carteleraStatus');
  const form = document.getElementById('filtrosForm');
  const inputBusqueda = document.getElementById('busqueda');
  const selectCategoria = document.getElementById('categoria');
  const inputDesde = document.getElementById('fechaDesde');
  const inputHasta = document.getElementById('fechaHasta');
  const resetBtn = document.getElementById('resetFiltros');

  const modal = document.getElementById('eventoModal');
  const modalCat = document.getElementById('eventoModalCat');
  const modalTitle = document.getElementById('eventoModalTitle');
  const modalMeta = document.getElementById('eventoModalMeta');
  const modalDesc = document.getElementById('eventoModalDesc');
  const modalCta = document.getElementById('eventoModalCta');
  const modalClose = document.getElementById('eventoModalClose');

  if (!grid) return;

  let ultimoFoco = null;

  /* ------------------------------------------------------------
     3) UTILIDADES
     ------------------------------------------------------------ */
  const formatearFecha = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  /* ------------------------------------------------------------
     4) FILTRADO
     ------------------------------------------------------------ */
  function obtenerFiltrados() {
    const texto = (inputBusqueda.value || '').trim().toLowerCase();
    const cat = selectCategoria.value;
    const desde = inputDesde.value ? new Date(inputDesde.value + 'T00:00:00') : null;
    const hasta = inputHasta.value ? new Date(inputHasta.value + 'T23:59:59') : null;

    return EVENTOS.filter((ev) => {
      const coincideTexto =
        !texto ||
        ev.titulo.toLowerCase().includes(texto) ||
        ev.lugar.toLowerCase().includes(texto) ||
        ev.descripcion.toLowerCase().includes(texto);

      const coincideCat = !cat || ev.categoria === cat;

      const fechaEv = new Date(ev.fecha + 'T00:00:00');
      const coincideDesde = !desde || fechaEv >= desde;
      const coincideHasta = !hasta || fechaEv <= hasta;

      return coincideTexto && coincideCat && coincideDesde && coincideHasta;
    });
  }

  /* ------------------------------------------------------------
     5) RENDER
     ------------------------------------------------------------ */
  function renderEventos(lista) {
    grid.innerHTML = '';

    statusMsg.textContent = `${lista.length} evento${lista.length === 1 ? '' : 's'} encontrado${lista.length === 1 ? '' : 's'}.`;

    if (!lista.length) {
      emptyMsg.hidden = false;
      return;
    }
    emptyMsg.hidden = true;

    const fragment = document.createDocumentFragment();

    lista.forEach((ev) => {
      const article = document.createElement('article');
      article.className = 'evento';
      article.innerHTML = `
        <span class="evento__cat" data-cat="${ev.categoria}">${ev.categoria}</span>
        <h3 class="evento__title">${ev.titulo}</h3>
        <p class="evento__meta">
          <span>📅 ${formatearFecha(ev.fecha)} — ${ev.hora} hs</span>
          <span>📍 ${ev.lugar}</span>
        </p>
        <p class="evento__desc">${ev.descripcion}</p>
        <div class="evento__actions">
          <button type="button" class="btn btn--primary" data-action="detalle" data-id="${ev.id}">
            Ver Detalles
          </button>
          <a class="btn btn--accent" href="#colaborar" data-action="reservar" data-id="${ev.id}">
            Reservar
          </a>
        </div>
      `;
      fragment.appendChild(article);
    });

    grid.appendChild(fragment);
  }

  /* ------------------------------------------------------------
     6) MODAL DE DETALLE
     ------------------------------------------------------------ */
  function abrirModal(id, trigger) {
    const ev = EVENTOS.find((e) => e.id === id);
    if (!ev) return;

    ultimoFoco = trigger || document.activeElement;

    modalCat.textContent = ev.categoria;
    modalTitle.textContent = ev.titulo;
    modalMeta.textContent = `${formatearFecha(ev.fecha)} · ${ev.hora} hs · ${ev.lugar}`;
    modalDesc.textContent = `${ev.descripcion} ${ev.detalle}`;
    modalCta.textContent = ev.cta;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalClose.focus();
    document.addEventListener('keydown', manejarTeclasModal);
  }

  function cerrarModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', manejarTeclasModal);
    if (ultimoFoco && typeof ultimoFoco.focus === 'function') ultimoFoco.focus();
  }

  function manejarTeclasModal(e) {
    if (e.key === 'Escape') cerrarModal();
  }

  if (modalClose) modalClose.addEventListener('click', cerrarModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close-modal]') || e.target === modal) cerrarModal();
    });
  }

  /* ------------------------------------------------------------
     7) EVENTOS DE UI
     ------------------------------------------------------------ */
  // Delegación de clics en la grilla
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="detalle"]');
    if (btn) {
      e.preventDefault();
      abrirModal(btn.dataset.id, btn);
    }
  });

  // Filtros reactivos
  [inputBusqueda, selectCategoria, inputDesde, inputHasta].forEach((el) => {
    if (!el) return;
    const evento = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evento, () => renderEventos(obtenerFiltrados()));
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // El reset nativo ocurre después; usamos timeout para leer los valores limpios
      setTimeout(() => renderEventos(obtenerFiltrados()), 0);
    });
  }

  /* ------------------------------------------------------------
     8) INIT
     ------------------------------------------------------------ */
  renderEventos(EVENTOS);
});