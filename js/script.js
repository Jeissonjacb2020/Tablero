/* ==========================================================================
   WideServices Dashboard — script.js
   Vanilla JS. Sin dependencias.
   Funcionalidad: filtro por estado + búsqueda en vivo (combinados),
   modal de detalle con timeline, panel de notificaciones.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. DATOS DE EJEMPLO
     ------------------------------------------------------------------ */
  const SERVICES = [
    {
      id: 'WS-1042',
      name: 'Reparación de fuga en tubería',
      category: 'Plomería',
      tech: 'Carlos Rendón',
      status: 'en-curso',
      date: '19 jun 2026 · 2:00 p. m.',
      dateValue: '2026-06-19T14:00',
      cost: 180000,
      address: 'Cra 45 #12-30, Bogotá',
      history: [
        { text: 'Técnico en camino', time: '19 jun · 1:42 p. m.' },
        { text: 'Servicio confirmado', time: '19 jun · 9:10 a. m.' },
        { text: 'Solicitud creada', time: '18 jun · 6:55 p. m.' }
      ]
    },
    {
      id: 'WS-1041',
      name: 'Instalación de tomacorrientes',
      category: 'Electricidad',
      tech: 'Laura Gómez',
      status: 'pendiente',
      date: '21 jun 2026 · 9:00 a. m.',
      dateValue: '2026-06-21T09:00',
      cost: 95000,
      address: 'Calle 80 #20-15, Bogotá',
      history: [
        { text: 'Servicio confirmado, en espera de técnico', time: '18 jun · 4:20 p. m.' },
        { text: 'Solicitud creada', time: '18 jun · 4:05 p. m.' }
      ]
    },
    {
      id: 'WS-1038',
      name: 'Limpieza profunda apartamento',
      category: 'Limpieza',
      tech: 'Equipo Brillo Total',
      status: 'completado',
      date: '15 jun 2026 · 10:00 a. m.',
      dateValue: '2026-06-15T10:00',
      cost: 130000,
      address: 'Cra 7 #45-60, Bogotá',
      history: [
        { text: 'Servicio completado', time: '15 jun · 1:30 p. m.' },
        { text: 'Técnico en sitio', time: '15 jun · 10:05 a. m.' },
        { text: 'Técnico en camino', time: '15 jun · 9:30 a. m.' },
        { text: 'Solicitud creada', time: '13 jun · 8:00 p. m.' }
      ]
    },
    {
      id: 'WS-1035',
      name: 'Mantenimiento de aire acondicionado',
      category: 'Mantenimiento',
      tech: 'Andrés Pinzón',
      status: 'completado',
      date: '12 jun 2026 · 3:00 p. m.',
      dateValue: '2026-06-12T15:00',
      cost: 150000,
      address: 'Av. 19 #104-22, Bogotá',
      history: [
        { text: 'Servicio completado', time: '12 jun · 4:15 p. m.' },
        { text: 'Técnico en sitio', time: '12 jun · 3:05 p. m.' },
        { text: 'Solicitud creada', time: '10 jun · 11:00 a. m.' }
      ]
    },
    {
      id: 'WS-1033',
      name: 'Cambio de cerradura puerta principal',
      category: 'Mantenimiento',
      tech: 'Por asignar',
      status: 'cancelado',
      date: '11 jun 2026 · 5:00 p. m.',
      dateValue: '2026-06-11T17:00',
      cost: 60000,
      address: 'Cra 50 #98-10, Bogotá',
      history: [
        { text: 'Cancelado por el cliente', time: '10 jun · 6:40 p. m.' },
        { text: 'Solicitud creada', time: '10 jun · 6:00 p. m.' }
      ]
    },
    {
      id: 'WS-1029',
      name: 'Revisión eléctrica general',
      category: 'Electricidad',
      tech: 'Laura Gómez',
      status: 'en-curso',
      date: '19 jun 2026 · 4:30 p. m.',
      dateValue: '2026-06-19T16:30',
      cost: 110000,
      address: 'Calle 127 #15-40, Bogotá',
      history: [
        { text: 'Técnico en sitio', time: '19 jun · 4:35 p. m.' },
        { text: 'Técnico en camino', time: '19 jun · 4:00 p. m.' },
        { text: 'Servicio confirmado', time: '17 jun · 9:00 a. m.' },
        { text: 'Solicitud creada', time: '16 jun · 7:20 p. m.' }
      ]
    }
  ];

  const STATUS_LABELS = {
    'pendiente': 'Pendiente',
    'en-curso': 'En curso',
    'completado': 'Completado',
    'cancelado': 'Cancelado'
  };

  const NOTIFICATIONS = [
    { text: 'Tu técnico Carlos Rendón va en camino para "Reparación de fuga en tubería".', time: 'Hace 18 min' },
    { text: 'El servicio "Limpieza profunda apartamento" fue marcado como completado.', time: 'Hace 4 horas' },
    { text: 'Tu solicitud "Cambio de cerradura puerta principal" fue cancelada.', time: 'Ayer' }
  ];

  /* ------------------------------------------------------------------
     2. UTILIDADES
     ------------------------------------------------------------------ */
  const formatCOP = (value) => {
    const withThousands = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return '$' + withThousands + ' COP';
  };

  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));

  /* ------------------------------------------------------------------
     3. ESTADO DE LA APP (filtro activo + término de búsqueda + vista forzada)
     ------------------------------------------------------------------ */
  const state = {
    activeFilter: 'todos',
    searchTerm: '',
    view: 'data', // 'data' | 'loading' | 'error' | 'empty'
    display: 'cards', // 'cards' | 'table'
    sort: { key: null, dir: 'asc' } // solo aplica en vista tabla
  };

  /* ------------------------------------------------------------------
     4. RENDER: TARJETAS DE SERVICIO
     ------------------------------------------------------------------ */
  const serviceListEl = $('#serviceList');
  const serviceTableWrapEl = $('#serviceTableWrap');
  const serviceTableBodyEl = $('#serviceTableBody');
  const resultCountEl = $('#resultCount');
  const emptyStateEl = $('#emptyState');
  const loadingStateEl = $('#loadingState');
  const errorStateEl = $('#errorState');

  function metaIcon(name) {
    const icons = {
      tech: '<svg class="service-card__meta-icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>',
      date: '<svg class="service-card__meta-icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    };
    return icons[name] || '';
  }

  function createCard(service) {
    const li = document.createElement('li');
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'service-card';
    card.dataset.id = service.id;
    card.setAttribute('aria-haspopup', 'dialog');

    card.innerHTML = `
      <div class="service-card__top">
        <div>
          <h3 class="service-card__name">${service.name}</h3>
          <p class="service-card__category">${service.category} · ${service.id}</p>
        </div>
        <span class="badge badge--${service.status}">${STATUS_LABELS[service.status]}</span>
      </div>
      <div class="service-card__meta">
        <p class="service-card__meta-item">${metaIcon('tech')}<strong>${service.tech}</strong></p>
        <p class="service-card__meta-item">${metaIcon('date')}${service.date}</p>
      </div>
      <div class="service-card__footer">
        <span class="service-card__cost">${formatCOP(service.cost)}</span>
        <span class="service-card__cta">Ver detalle →</span>
      </div>
    `;

    card.addEventListener('click', () => openModal(service));
    li.appendChild(card);
    return li;
  }

  function createTableRow(service) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <p class="service-table__name">${service.name}</p>
        <p class="service-table__id">${service.category} · ${service.id}</p>
      </td>
      <td>${service.tech}</td>
      <td><span class="badge badge--${service.status}">${STATUS_LABELS[service.status]}</span></td>
      <td>${service.date}</td>
      <td class="service-table__cost">${formatCOP(service.cost)}</td>
      <td><button type="button" class="service-table__row-btn">Ver detalle</button></td>
    `;
    $('.service-table__row-btn', tr).addEventListener('click', () => openModal(service));
    return tr;
  }

  function getFilteredServices() {
    const term = state.searchTerm.toLowerCase();
    return SERVICES.filter((s) => {
      const matchesFilter = state.activeFilter === 'todos' || s.status === state.activeFilter;
      if (!matchesFilter) return false;
      if (!term) return true;

      const haystack = [
        s.name,
        s.category,
        s.tech,
        s.date,
        s.id,
        STATUS_LABELS[s.status],
        s.address
      ].join(' ').toLowerCase();

      return haystack.includes(term);
    });
  }

  // Solo aplica en vista tabla. Las cards mantienen el orden natural de los datos.
  function sortServices(services) {
    const { key, dir } = state.sort;
    if (!key) return services;

    const sorted = [...services].sort((a, b) => {
      let valA, valB;
      switch (key) {
        case 'name':   valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
        case 'tech':   valA = a.tech.toLowerCase(); valB = b.tech.toLowerCase(); break;
        case 'status': valA = STATUS_LABELS[a.status]; valB = STATUS_LABELS[b.status]; break;
        case 'date':   valA = a.dateValue; valB = b.dateValue; break;
        case 'cost':   valA = a.cost; valB = b.cost; break;
        default: return 0;
      }
      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  function renderServices() {
    // Vistas forzadas por el demo switcher: cargando y error reemplazan todo el panel.
    if (state.view === 'loading') {
      loadingStateEl.hidden = false;
      errorStateEl.hidden = true;
      emptyStateEl.hidden = true;
      serviceListEl.hidden = true;
      serviceTableWrapEl.hidden = true;
      resultCountEl.textContent = 'Cargando…';
      return;
    }
    if (state.view === 'error') {
      loadingStateEl.hidden = true;
      errorStateEl.hidden = false;
      emptyStateEl.hidden = true;
      serviceListEl.hidden = true;
      serviceTableWrapEl.hidden = true;
      resultCountEl.textContent = '—';
      return;
    }

    loadingStateEl.hidden = true;
    errorStateEl.hidden = true;

    // Vista normal: 'data', o 'empty' forzado desde el switcher (lista vacía a propósito).
    const filtered = state.view === 'empty' ? [] : getFilteredServices();
    const isEmpty = filtered.length === 0;
    emptyStateEl.hidden = !isEmpty;

    if (state.display === 'table') {
      serviceListEl.hidden = true;
      serviceTableWrapEl.hidden = isEmpty;

      const sorted = sortServices(filtered);
      serviceTableBodyEl.innerHTML = '';
      sorted.forEach((service) => serviceTableBodyEl.appendChild(createTableRow(service)));
    } else {
      serviceTableWrapEl.hidden = true;
      serviceListEl.hidden = isEmpty;

      serviceListEl.innerHTML = '';
      filtered.forEach((service) => serviceListEl.appendChild(createCard(service)));
    }

    resultCountEl.textContent = isEmpty
      ? '0 servicios'
      : `${filtered.length} servicio${filtered.length === 1 ? '' : 's'}`;
  }

  /* ------------------------------------------------------------------
     4.7 VIEW TOGGLE — alternar tarjetas / tabla
     ------------------------------------------------------------------ */
  const viewCardsBtn = $('#viewCardsBtn');
  const viewTableBtn = $('#viewTableBtn');

  function setDisplay(display) {
    state.display = display;
    viewCardsBtn.classList.toggle('is-active', display === 'cards');
    viewCardsBtn.setAttribute('aria-pressed', String(display === 'cards'));
    viewTableBtn.classList.toggle('is-active', display === 'table');
    viewTableBtn.setAttribute('aria-pressed', String(display === 'table'));
    renderServices();
  }

  viewCardsBtn.addEventListener('click', () => setDisplay('cards'));
  viewTableBtn.addEventListener('click', () => setDisplay('table'));

  /* ------------------------------------------------------------------
     4.8 SORTING DE TABLA — clic en cabecera ordena por esa columna
     ------------------------------------------------------------------ */
  $$('.sortable-th').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (state.sort.key === key) {
        state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sort.key = key;
        state.sort.dir = 'asc';
      }

      $$('.sortable-th').forEach((other) => {
        other.classList.remove('is-sorted');
        $('.sortable-th__icon', other).textContent = '↕';
      });
      th.classList.add('is-sorted');
      $('.sortable-th__icon', th).textContent = state.sort.dir === 'asc' ? '↑' : '↓';

      renderServices();
    });
  });

  /* ------------------------------------------------------------------
     4.5 DEMO SWITCHER — fuerza cada estado visual para poder evaluarlos
     ------------------------------------------------------------------ */
  const demoButtons = $$('.demo-switcher__btn');

  function setView(view) {
    state.view = view;
    demoButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.view === view));
    renderServices();
  }

  demoButtons.forEach((btn) => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });

  $('#retryBtn').addEventListener('click', () => {
    showToast('Reintentando…');
    setView('data');
  });

  /* ------------------------------------------------------------------
     5. CONTADORES POR ESTADO (chips de filtro)
     ------------------------------------------------------------------ */
  function renderCounts() {
    $('#count-todos').textContent = SERVICES.length;
    ['pendiente', 'en-curso', 'completado', 'cancelado'].forEach((status) => {
      const count = SERVICES.filter((s) => s.status === status).length;
      $(`#count-${status}`).textContent = count;
    });
  }

  /* ------------------------------------------------------------------
     5.5 ESTADÍSTICAS — resumen en números (sin librerías de gráficos)
     ------------------------------------------------------------------ */
  function renderStats() {
    const byStatus = (status) => SERVICES.filter((s) => s.status === status);

    const total = SERVICES.length;
    const enCurso = byStatus('en-curso').length;
    const pendiente = byStatus('pendiente').length;
    const completado = byStatus('completado').length;
    const cancelado = byStatus('cancelado').length;

    // Costo total facturado: solo servicios ya completados (dinero efectivamente cobrado)
    const costoTotal = byStatus('completado').reduce((sum, s) => sum + s.cost, 0);

    $('#statTotal').textContent = total;
    $('#statEnCurso').textContent = enCurso;
    $('#statPendiente').textContent = pendiente;
    $('#statCompletado').textContent = completado;
    $('#statCancelado').textContent = cancelado;
    $('#statCostoTotal').textContent = formatCOP(costoTotal);
  }

  /* ------------------------------------------------------------------
     6. FILTROS (chips) — interacción principal en JS
     ------------------------------------------------------------------ */
  const filterChips = $$('.filter-chip');

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      state.activeFilter = chip.dataset.filter;
      renderServices();
    });
  });

  /* ------------------------------------------------------------------
     7. BÚSQUEDA EN VIVO
     ------------------------------------------------------------------ */
  const searchInput = $('#searchInput');
  searchInput.addEventListener('input', (e) => {
    state.searchTerm = e.target.value.trim();
    renderServices();
  });

  $('#clearFiltersBtn').addEventListener('click', () => {
    state.activeFilter = 'todos';
    state.searchTerm = '';
    searchInput.value = '';
    filterChips.forEach((c) => c.classList.remove('is-active'));
    $('.filter-chip[data-filter="todos"]').classList.add('is-active');
    setView('data');
  });

  /* ------------------------------------------------------------------
     8. MODAL DE DETALLE
     ------------------------------------------------------------------ */
  const modalOverlay = $('#modalOverlay');
  const modal = $('#serviceModal');
  let lastFocusedEl = null;

  const STEP_ORDER = ['pendiente', 'en-curso', 'completado'];

  function buildProgressTrack(status) {
    const track = $('#modalProgress');
    track.classList.toggle('is-cancelled', status === 'cancelado');
    track.setAttribute('aria-label', `Estado actual: ${STATUS_LABELS[status]}`);

    const currentIndex = status === 'cancelado' ? 0 : STEP_ORDER.indexOf(status);

    $$('.progress-track__step', track).forEach((stepEl, i) => {
      stepEl.classList.remove('is-done', 'is-current');
      if (status === 'cancelado') {
        if (i === 0) stepEl.classList.add('is-current');
        return;
      }
      if (i < currentIndex) stepEl.classList.add('is-done');
      if (i === currentIndex) stepEl.classList.add('is-current');
    });
  }

  function buildTimeline(history) {
    const timelineEl = $('#modalTimeline');
    timelineEl.innerHTML = '';
    history.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'timeline__item';
      li.innerHTML = `
        <span class="timeline__dot" aria-hidden="true"></span>
        <p class="timeline__text">${item.text}</p>
        <p class="timeline__time">${item.time}</p>
      `;
      timelineEl.appendChild(li);
    });
  }

  function openModal(service) {
    lastFocusedEl = document.activeElement;

    $('#modalCategory').textContent = service.category + " - " + service.id;
    $('#modalTitle').textContent = service.name;
    $('#modalTech').textContent = service.tech;
    $('#modalDate').textContent = service.date;
    $('#modalCost').textContent = formatCOP(service.cost);
    $('#modalAddress').textContent = service.address;

    buildProgressTrack(service.status);
    buildTimeline(service.history);

    modalOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.focus();

    document.addEventListener('keydown', handleModalKeydown);
  }

  function closeModal() {
    modalOverlay.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleModalKeydown);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function handleModalKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    // Trampa de foco simple dentro del modal
    if (e.key === 'Tab') {
      const focusable = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', modal)
        .filter((el) => !el.disabled);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  $('#modalCloseBtn').addEventListener('click', closeModal);
  $('#modalCloseBtn2').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  /* ------------------------------------------------------------------
     9. NOTIFICACIONES
     ------------------------------------------------------------------ */
  const notifBtn = $('#notifBtn');
  const notifPanel = $('#notifPanel');
  const notifList = $('#notifList');

  function renderNotifications() {
    notifList.innerHTML = '';
    NOTIFICATIONS.forEach((n) => {
      const li = document.createElement('li');
      li.className = 'notif-list__item';
      li.innerHTML = `
        <span class="notif-list__dot" aria-hidden="true"></span>
        <div>
          <p class="notif-list__text">${n.text}</p>
          <p class="notif-list__time">${n.time}</p>
        </div>
      `;
      notifList.appendChild(li);
    });
  }

  function toggleNotifPanel(forceClose) {
    const isOpen = !notifPanel.hidden;
    const next = forceClose ? false : !isOpen;
    notifPanel.hidden = !next;
    notifBtn.setAttribute('aria-expanded', String(next));
  }

  notifBtn.addEventListener('click', () => toggleNotifPanel());
  $('#notifCloseBtn').addEventListener('click', () => toggleNotifPanel(true));

  document.addEventListener('click', (e) => {
    if (!notifPanel.hidden && !notifPanel.contains(e.target) && e.target !== notifBtn && !notifBtn.contains(e.target)) {
      toggleNotifPanel(true);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !notifPanel.hidden) toggleNotifPanel(true);
  });

  /* ------------------------------------------------------------------
     9.7 VISIBILITY TOGGLE — botón simple para ocultar/mostrar una sección
     ------------------------------------------------------------------ */
  function setupVisibilityToggle(btnId, sectionId) {
    const btn = $(`#${btnId}`);
    const section = $(`#${sectionId}`);
    const label = $('.visibility-btn__label', btn);

    btn.addEventListener('click', () => {
      const isHidden = section.classList.toggle('is-collapsed');
      btn.setAttribute('aria-expanded', String(!isHidden));
      label.textContent = isHidden ? 'Mostrar' : 'Ocultar';
    });
  }

  setupVisibilityToggle('pageIntroToggleBtn', 'pageIntro');
  setupVisibilityToggle('statsToggleBtn', 'statsSection');

  /* ------------------------------------------------------------------
     9.5 TOAST — feedback para acciones sin backend en esta demo
     ------------------------------------------------------------------ */
  const toastEl = $('#toast');
  let toastTimer = null;

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3000);
  }

  $('#navRequestService').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Esta demo no incluye backend: aquí se abriría el formulario de nueva solicitud.');
  });

  $('#navHelp').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Esta demo no incluye backend: aquí se abriría el centro de ayuda.');
  });

  $('#modalContactBtn').addEventListener('click', () => {
    showToast('Esta demo no incluye backend: aquí se iniciaría el chat con el técnico.');
  });

  /* ------------------------------------------------------------------
     9.7 MODO OSCURO — switch simple, sin dependencias
     ------------------------------------------------------------------ */
  const themeToggleBtn = $('#themeToggle');
  const htmlEl = document.documentElement;

  function applyTheme(isDark) {
    htmlEl.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeToggleBtn.setAttribute('aria-pressed', String(isDark));
    themeToggleBtn.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
  }

  // Respeta la preferencia del sistema operativo como punto de partida.
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark);

  themeToggleBtn.addEventListener('click', () => {
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
  });

  /* ------------------------------------------------------------------
     10. INICIALIZACIÓN
     ------------------------------------------------------------------ */
  renderCounts();
  renderStats();
  renderServices();
  renderNotifications();
})();
