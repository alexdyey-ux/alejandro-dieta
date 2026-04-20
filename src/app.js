/* =============================================
   ALEJANDRO DELGADO — APP DE DIETA
   Nutrióloga: Lic. Angélica Palacio Escalante
   ============================================= */

// ——— STATE ———
let dayOffset   = 0;
let weekOffset  = 0;
let calSelected = null;
let checked     = {};
let avancesUser = [];
let activeTab   = 'checklist';

// ——— STORAGE ———
const KEYS = { checked: 'alex_checked_v1', avances: 'alex_avances_v1' };

function loadStorage() {
  try { checked     = JSON.parse(localStorage.getItem(KEYS.checked)  || '{}'); } catch { checked = {}; }
  try { avancesUser = JSON.parse(localStorage.getItem(KEYS.avances)  || '[]'); } catch { avancesUser = []; }
}
function saveChecked() {
  try { localStorage.setItem(KEYS.checked, JSON.stringify(checked)); } catch(e) { console.warn('Storage error', e); }
}
function saveAvances() {
  try { localStorage.setItem(KEYS.avances, JSON.stringify(avancesUser)); } catch(e) { console.warn('Storage error', e); }
}

// ——— HELPERS ———
function getDate(off = 0) { const d = new Date(); d.setDate(d.getDate() + off); return d; }
function dateKey(d)       { return d.toISOString().split('T')[0]; }
function todayKey()       { return dateKey(new Date()); }

// ——— RENDER: HEADER ———
function renderHeader() {
  return `
    <div class="header">
      <div class="header-top">
        <div>
          <div class="header-greeting">Hola, Alejandro 👋</div>
          <div class="header-name">Tu dieta semanal</div>
        </div>
        <div class="header-emoji">🥗</div>
      </div>
      <div class="header-stats">
        <div class="header-stat">
          <div class="header-stat-label">Peso actual</div>
          <div class="header-stat-val">74.3 kg</div>
        </div>
        <div class="header-stat">
          <div class="header-stat-label">% Músculo</div>
          <div class="header-stat-val">40.0%</div>
        </div>
        <div class="header-stat">
          <div class="header-stat-label">% Grasa</div>
          <div class="header-stat-val">18.5%</div>
        </div>
      </div>
    </div>`;
}

// ——— RENDER: TABS ———
function renderTabs() {
  const tabs = [
    { id: 'checklist', label: '🥦 Hoy' },
    { id: 'calendar',  label: '📅 Semana' },
    { id: 'avances',   label: '📈 Avances' },
  ];
  return `
    <div class="tab-bar">
      ${tabs.map(t => `
        <button class="tab ${activeTab === t.id ? 'active' : ''}"
          onclick="switchTab('${t.id}')">${t.label}</button>
      `).join('')}
    </div>`;
}

// ——— RENDER: CHECKLIST ———
function renderChecklist() {
  const d   = getDate(dayOffset);
  const dow = d.getDay();
  const key = dateKey(d);
  const meals = DIET[dow] || DIET[1];
  const dc    = checked[key] || {};
  const done  = Object.values(dc).filter(Boolean).length;
  const pct   = Math.round((done / 5) * 100);

  return `
    <div class="view ${activeTab === 'checklist' ? 'active' : ''}" id="view-checklist">
      <div class="day-nav">
        <div>
          <div class="day-name">${DAYS_ES[dow]}</div>
          <div class="day-date">${d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>
        <div class="nav-btns">
          <button class="nav-btn" onclick="changeDay(-1)">‹</button>
          <button class="nav-btn" onclick="changeDay(1)">›</button>
        </div>
      </div>

      <div class="prog-strip">
        <span class="prog-label">Progreso del día</span>
        <div class="prog-right">
          <div class="prog-track">
            <div class="prog-fill" style="width:${pct}%"></div>
          </div>
          <span class="prog-count">${done}/5</span>
        </div>
      </div>

      <div class="meals-list">
        ${meals.map((m, i) => {
          const isDone = !!dc[i];
          return `
            <div class="meal-card ${isDone ? 'done' : ''}"
              onclick="toggleMeal('${key}', ${i})">
              <div class="meal-icon">${ICONS[i]}</div>
              <div class="meal-body">
                <div class="meal-meta">${TIMES[i]} &nbsp;·&nbsp; ${LABELS[i]}</div>
                <div class="meal-name">${m.n}</div>
                <div class="meal-detail">${m.d}</div>
              </div>
              <div class="check-circle">${isDone ? '✓' : ''}</div>
            </div>`;
        }).join('')}
      </div>

      <div class="tip-box">
        <div class="tip-title">💡 Notas de tu nutrióloga</div>
        <div class="tip-text">
          Comer cada 3–4 hrs &nbsp;·&nbsp; Mínimo 2L de agua &nbsp;·&nbsp;
          Ejercicio 30 min/día &nbsp;·&nbsp; Shake: ½ agua + ½ leche deslactosada
        </div>
      </div>
    </div>`;
}

// ——— RENDER: CALENDAR ———
function renderCalendar() {
  const today = new Date();
  const dow0  = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dow0 + weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const weekEnd = days[6];
  const weekLabel = weekStart.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    + ' – ' + weekEnd.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

  let totalDone = 0, fullDays = 0;
  const todayStr = dateKey(today);

  const daysHtml = days.map(d => {
    const key  = dateKey(d);
    const dc   = checked[key] || {};
    const done = Object.values(dc).filter(Boolean).length;
    totalDone += done;
    if (done === 5) fullDays++;
    const isToday    = key === todayStr;
    const isSelected = key === calSelected;

    const dots = Array.from({ length: 5 }, (_, j) =>
      `<div class="cal-dot ${dc[j] ? 'done' : ''}"></div>`
    ).join('');

    return `
      <div class="cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
        onclick="selectCalDay('${key}', ${d.getDay()}, ${d.getDate()})">
        <div class="cal-day-label">${DAYS_SHORT[d.getDay()]}</div>
        <div class="cal-day-num">${d.getDate()}</div>
        <div class="cal-dots">${dots}</div>
      </div>`;
  }).join('');

  let detailHtml = '';
  if (calSelected) {
    const selDate  = new Date(calSelected + 'T12:00:00');
    const selDow   = selDate.getDay();
    const selMeals = DIET[selDow] || DIET[1];
    const selDc    = checked[calSelected] || {};
    const selDone  = Object.values(selDc).filter(Boolean).length;
    detailHtml = `
      <div class="day-detail">
        <div class="day-detail-title">${DAYS_ES[selDow]} — ${selDone}/5 comidas</div>
        ${selMeals.map((m, i) => `
          <div class="mini-meal">
            <div class="mini-dot ${selDc[i] ? 'done' : ''}"></div>
            <div class="mini-name">${m.n}</div>
            <div class="mini-time">${TIMES[i]}</div>
          </div>`).join('')}
      </div>`;
  }

  return `
    <div class="view ${activeTab === 'calendar' ? 'active' : ''}" id="view-calendar">
      <div class="week-nav">
        <button class="nav-btn" onclick="changeWeek(-1)">‹</button>
        <span class="week-label">${weekLabel}</span>
        <button class="nav-btn" onclick="changeWeek(1)">›</button>
      </div>
      <div class="week-grid">${daysHtml}</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Comidas esta semana</div>
          <div class="stat-val">${totalDone}</div>
          <div class="stat-sub">de 35 posibles</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Días completos</div>
          <div class="stat-val">${fullDays}</div>
          <div class="stat-sub">de 7 días</div>
        </div>
      </div>
      ${detailHtml}
    </div>`;
}

// ——— RENDER: AVANCES ———
function renderAvances() {
  const allEvol = [...EVOLUCIONES_INICIALES, ...avancesUser];

  const fixedCards = EVOLUCIONES_INICIALES.map((ev, idx) => `
    <div class="avance-card ${idx === 0 ? 'highlight' : ''}">
      <div class="avance-header">
        <div>
          <div class="avance-label">${ev.label}</div>
          <div class="avance-fecha">📅 ${ev.fecha}</div>
        </div>
      </div>
      <div class="metrics-grid">
        ${Object.entries({
          'Peso':       ev.datos.peso,
          '% Grasa':    ev.datos.grasa,
          '% Músculo':  ev.datos.musculo,
          'Edad metab.':ev.datos.edadMeta,
          'Cintura':    ev.datos.cintura,
          'Brazo':      ev.datos.brazo,
          'Pierna':     ev.datos.pierna,
          'G. visceral':ev.datos.grasaVisc,
        }).map(([label, item]) => `
          <div class="metric-item">
            <div class="metric-label">${label}</div>
            <div class="metric-val">
              ${item.val}
              ${item.diff ? `<span class="diff ${item.dir}">${item.dir === 'up' ? '↑' : item.dir === 'down' ? '↓' : ''}${item.diff}</span>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('');

  const userCards = avancesUser.map(a => `
    <div class="avance-card">
      <div class="avance-header">
        <div>
          <div class="avance-label">📎 ${a.name}</div>
          <div class="avance-fecha">${a.fecha}</div>
        </div>
        <button class="avance-del" onclick="deleteAvance(${a.id})">🗑</button>
      </div>
      ${a.type.startsWith('image/')
        ? `<img class="avance-img" src="${a.data}" alt="Avance">`
        : `<div class="avance-pdf">📄 PDF guardado correctamente<br><small>${a.name}</small></div>`}
    </div>`).join('');

  return `
    <div class="view ${activeTab === 'avances' ? 'active' : ''}" id="view-avances">
      <div class="section-title">Mis avances con la nutrióloga</div>
      ${fixedCards}
      <div class="upload-area" onclick="document.getElementById('file-input').click()">
        <div class="upload-icon">📋</div>
        <div class="upload-text">Agregar nuevo avance</div>
        <div class="upload-sub">Foto o PDF de tu consulta</div>
      </div>
      <input type="file" id="file-input" accept="image/*,application/pdf"
        style="display:none" onchange="handleUpload(event)">
      ${userCards ? `<div class="section-title">Archivos subidos</div>${userCards}` : ''}
    </div>`;
}

// ——— FULL RENDER ———
function render() {
  document.getElementById('app').innerHTML =
    renderHeader() +
    renderTabs() +
    renderChecklist() +
    renderCalendar() +
    renderAvances();
}

// ——— ACTIONS ———
function switchTab(tab) {
  activeTab = tab;
  render();
  window.scrollTo(0, 0);
}

function changeDay(dir) {
  dayOffset += dir;
  activeTab = 'checklist';
  render();
}

function toggleMeal(key, idx) {
  if (!checked[key]) checked[key] = {};
  checked[key][idx] = !checked[key][idx];
  saveChecked();
  activeTab = 'checklist';
  render();
}

function changeWeek(dir) {
  weekOffset += dir;
  activeTab = 'calendar';
  render();
}

function selectCalDay(key, dow, date) {
  calSelected = calSelected === key ? null : key;
  activeTab = 'calendar';
  render();
}

function handleUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    avancesUser.unshift({
      id:    Date.now(),
      name:  file.name,
      type:  file.type,
      fecha: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
      data:  ev.target.result,
    });
    saveAvances();
    activeTab = 'avances';
    render();
  };
  reader.readAsDataURL(file);
}

function deleteAvance(id) {
  if (!confirm('¿Eliminar este archivo?')) return;
  avancesUser = avancesUser.filter(a => a.id !== id);
  saveAvances();
  activeTab = 'avances';
  render();
}

// ——— INIT ———
loadStorage();
render();
