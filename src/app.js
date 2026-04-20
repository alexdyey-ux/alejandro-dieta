/* =============================================
   ALEJANDRO DELGADO — APP DE DIETA
   Nutrióloga: Lic. Angélica Palacio Escalante
   ============================================= */

const CONSULTAS_SEED = [
  {
    id: 1745020800,
    fecha: '2026-04-19',
    peso: '74.3', grasa: '18.5', musculo: '40.0',
    edadMeta: '30', cintura: '84', brazo: '29', pierna: '53', grasaVisc: '2',
  },
  {
    id: 1744243200,
    fecha: '2026-04-09',
    peso: '74.1', grasa: '19.9', musculo: '37.8',
    edadMeta: '36', cintura: '80', brazo: '28', pierna: '51', grasaVisc: '3',
  },
];

// ——— STATE ———
let dayOffset        = 0;
let weekOffset       = 0;
let calSelected      = null;
let checked          = {};
let consultas        = [];
let customDiet       = {};
let activeTab        = 'checklist';
let showConsultaForm = false;
let editingDiet      = false;

// ——— STORAGE ———
const KEYS = {
  checked:   'alex_checked_v1',
  consultas: 'alex_consultas_v1',
  diet:      'alex_diet_v1',
};

function loadStorage() {
  try { checked    = JSON.parse(localStorage.getItem(KEYS.checked)  || '{}'); } catch { checked = {}; }
  try { customDiet = JSON.parse(localStorage.getItem(KEYS.diet)     || '{}'); } catch { customDiet = {}; }
  try {
    const raw = localStorage.getItem(KEYS.consultas);
    consultas = raw ? JSON.parse(raw) : null;
    if (!consultas) { consultas = CONSULTAS_SEED; saveConsultas(); }
  } catch { consultas = CONSULTAS_SEED; saveConsultas(); }
}

function saveChecked()   { try { localStorage.setItem(KEYS.checked,   JSON.stringify(checked));   } catch(e) {} }
function saveConsultas() { try { localStorage.setItem(KEYS.consultas,  JSON.stringify(consultas)); } catch(e) {} }
function saveDiet()      { try { localStorage.setItem(KEYS.diet,       JSON.stringify(customDiet));} catch(e) {} }

// ——— HELPERS ———
function getDate(off = 0) { const d = new Date(); d.setDate(d.getDate() + off); return d; }
function dateKey(d)       { return d.toISOString().split('T')[0]; }
function todayKey()       { return dateKey(new Date()); }

function getEffectiveDiet() {
  const out = {};
  for (let d = 0; d <= 6; d++) out[d] = customDiet[d] || DIET[d] || DIET[1];
  return out;
}

function sortedConsultas() {
  return [...consultas].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

function formatFecha(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function calcDiff(curr, prev, key, higher) {
  const c = parseFloat(curr[key]);
  const p = parseFloat(prev[key]);
  if (isNaN(c) || isNaN(p) || Math.abs(c - p) < 0.01) return { diff: '', dir: 'neu' };
  const delta    = c - p;
  const decimals = (key === 'edadMeta' || key === 'grasaVisc') ? 0 : 1;
  const sign     = delta > 0 ? '+' : '';
  const diffStr  = `${sign}${delta.toFixed(decimals)}`;
  if (higher === null) return { diff: diffStr, dir: 'neu' };
  return { diff: diffStr, dir: (higher ? delta > 0 : delta < 0) ? 'up' : 'down' };
}

// ——— RENDER: HEADER ———
function renderHeader() {
  const latest = sortedConsultas()[0];
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
          <div class="header-stat-val">${latest ? latest.peso + ' kg' : '—'}</div>
        </div>
        <div class="header-stat">
          <div class="header-stat-label">% Músculo</div>
          <div class="header-stat-val">${latest ? latest.musculo + '%' : '—'}</div>
        </div>
        <div class="header-stat">
          <div class="header-stat-label">% Grasa</div>
          <div class="header-stat-val">${latest ? latest.grasa + '%' : '—'}</div>
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
  const diet  = getEffectiveDiet();
  const d     = getDate(dayOffset);
  const dow   = d.getDay();
  const key   = dateKey(d);
  const meals = diet[dow];
  const dc    = checked[key] || {};
  const done  = Object.values(dc).filter(Boolean).length;
  const pct   = Math.round((done / 5) * 100);

  if (editingDiet) return renderDietEditor(dow, meals);

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
          <button class="nav-btn" onclick="toggleEditDiet()" title="Editar dieta de este día">✏️</button>
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
            <div class="meal-card ${isDone ? 'done' : ''}" onclick="toggleMeal('${key}', ${i})">
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

function renderDietEditor(dow, meals) {
  return `
    <div class="view ${activeTab === 'checklist' ? 'active' : ''}" id="view-checklist">
      <div class="day-nav">
        <div>
          <div class="day-name">✏️ Editando ${DAYS_ES[dow]}</div>
          <div class="day-date">Modifica las comidas de este día</div>
        </div>
        <div class="nav-btns">
          <button class="nav-btn" onclick="changeDay(-1)">‹</button>
          <button class="nav-btn" onclick="changeDay(1)">›</button>
        </div>
      </div>
      <div class="edit-diet-form">
        ${meals.map((m, i) => `
          <div class="edit-meal-block">
            <div class="edit-meal-label">${ICONS[i]} ${TIMES[i]} · ${LABELS[i]}</div>
            <input class="edit-input" id="edit-n-${i}" value="${m.n.replace(/"/g, '&quot;')}" placeholder="Nombre del platillo">
            <textarea class="edit-textarea" id="edit-d-${i}" placeholder="Ingredientes / descripción">${m.d}</textarea>
          </div>`).join('')}
        <div class="edit-actions">
          <button class="btn-save" onclick="saveDietDay(${dow})">Guardar cambios</button>
          <button class="btn-cancel" onclick="toggleEditDiet()">Cancelar</button>
        </div>
      </div>
    </div>`;
}

// ——— RENDER: CALENDAR ———
function renderCalendar() {
  const diet    = getEffectiveDiet();
  const today   = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const weekEnd   = days[6];
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
      `<div class="cal-dot ${dc[j] ? 'done' : ''}"></div>`).join('');
    return `
      <div class="cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
        onclick="selectCalDay('${key}', ${d.getDay()})">
        <div class="cal-day-label">${DAYS_SHORT[d.getDay()]}</div>
        <div class="cal-day-num">${d.getDate()}</div>
        <div class="cal-dots">${dots}</div>
      </div>`;
  }).join('');

  let detailHtml = '';
  if (calSelected) {
    const selDate  = new Date(calSelected + 'T12:00:00');
    const selDow   = selDate.getDay();
    const selMeals = diet[selDow];
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
  const sorted = sortedConsultas();

  const FIELDS = [
    { label: 'Peso',        key: 'peso',      unit: ' kg',   higher: null  },
    { label: '% Grasa',     key: 'grasa',     unit: '%',     higher: false },
    { label: '% Músculo',   key: 'musculo',   unit: '%',     higher: true  },
    { label: 'Edad metab.', key: 'edadMeta',  unit: ' años', higher: false },
    { label: 'Cintura',     key: 'cintura',   unit: ' cm',   higher: false },
    { label: 'Brazo',       key: 'brazo',     unit: ' cm',   higher: true  },
    { label: 'Pierna',      key: 'pierna',    unit: ' cm',   higher: true  },
    { label: 'G. visceral', key: 'grasaVisc', unit: '',      higher: false },
  ];

  const cards = sorted.map((c, idx) => {
    const prev     = sorted[idx + 1];
    const isLatest = idx === 0;

    const metricsHtml = FIELDS.map(f => {
      const { diff, dir } = prev ? calcDiff(c, prev, f.key, f.higher) : { diff: '', dir: 'neu' };
      const arrow = diff ? (dir === 'up' ? '↑' : dir === 'down' ? '↓' : '') : '';
      return `
        <div class="metric-item">
          <div class="metric-label">${f.label}</div>
          <div class="metric-val">
            ${c[f.key]}${f.unit}
            ${diff ? `<span class="diff ${dir}">${arrow}${diff}</span>` : ''}
          </div>
        </div>`;
    }).join('');

    return `
      <div class="avance-card ${isLatest ? 'highlight' : ''}">
        <div class="avance-header">
          <div>
            <div class="avance-label">${isLatest ? '⭐ Consulta más reciente' : 'Consulta'}</div>
            <div class="avance-fecha">📅 ${formatFecha(c.fecha)}</div>
          </div>
          ${!isLatest ? `<button class="avance-del" onclick="deleteConsulta(${c.id})">🗑</button>` : ''}
        </div>
        <div class="metrics-grid">${metricsHtml}</div>
      </div>`;
  }).join('');

  const formHtml = showConsultaForm ? `
    <div class="consulta-form">
      <div class="form-title">Nueva consulta</div>
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" id="f-fecha" value="${todayKey()}">
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Peso (kg)</label>
          <input type="number" step="0.1" id="f-peso" placeholder="74.3">
        </div>
        <div class="form-group">
          <label>% Grasa</label>
          <input type="number" step="0.1" id="f-grasa" placeholder="18.5">
        </div>
        <div class="form-group">
          <label>% Músculo</label>
          <input type="number" step="0.1" id="f-musculo" placeholder="40.0">
        </div>
        <div class="form-group">
          <label>Edad metabólica</label>
          <input type="number" id="f-edadMeta" placeholder="30">
        </div>
        <div class="form-group">
          <label>Cintura (cm)</label>
          <input type="number" step="0.1" id="f-cintura" placeholder="84">
        </div>
        <div class="form-group">
          <label>Brazo (cm)</label>
          <input type="number" step="0.1" id="f-brazo" placeholder="29">
        </div>
        <div class="form-group">
          <label>Pierna (cm)</label>
          <input type="number" step="0.1" id="f-pierna" placeholder="53">
        </div>
        <div class="form-group">
          <label>Grasa visceral</label>
          <input type="number" id="f-grasaVisc" placeholder="2">
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-save" onclick="saveConsulta()">Guardar</button>
        <button class="btn-cancel" onclick="toggleConsultaForm()">Cancelar</button>
      </div>
    </div>` : `
    <button class="btn-add-consulta" onclick="toggleConsultaForm()">
      + Registrar nueva consulta
    </button>`;

  return `
    <div class="view ${activeTab === 'avances' ? 'active' : ''}" id="view-avances">
      <div class="section-title">Mis avances con la nutrióloga</div>
      ${formHtml}
      ${cards}
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
  activeTab   = tab;
  editingDiet = false;
  render();
  window.scrollTo(0, 0);
}

function changeDay(dir) {
  dayOffset += dir;
  activeTab  = 'checklist';
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
  activeTab   = 'calendar';
  render();
}

function selectCalDay(key) {
  calSelected = calSelected === key ? null : key;
  activeTab   = 'calendar';
  render();
}

function toggleConsultaForm() {
  showConsultaForm = !showConsultaForm;
  activeTab        = 'avances';
  render();
  if (showConsultaForm) window.scrollTo(0, 0);
}

function saveConsulta() {
  const get = id => document.getElementById(id)?.value.trim();
  const fecha = get('f-fecha');
  if (!fecha) { alert('Por favor ingresa la fecha'); return; }
  consultas.push({
    id:        Date.now(),
    fecha,
    peso:      get('f-peso'),
    grasa:     get('f-grasa'),
    musculo:   get('f-musculo'),
    edadMeta:  get('f-edadMeta'),
    cintura:   get('f-cintura'),
    brazo:     get('f-brazo'),
    pierna:    get('f-pierna'),
    grasaVisc: get('f-grasaVisc'),
  });
  saveConsultas();
  showConsultaForm = false;
  activeTab        = 'avances';
  render();
  window.scrollTo(0, 0);
}

function deleteConsulta(id) {
  if (!confirm('¿Eliminar este registro?')) return;
  consultas = consultas.filter(c => c.id !== id);
  saveConsultas();
  activeTab = 'avances';
  render();
}

function toggleEditDiet() {
  editingDiet = !editingDiet;
  activeTab   = 'checklist';
  render();
}

function saveDietDay(dow) {
  const get  = id => document.getElementById(id)?.value.trim() || '';
  customDiet[dow] = Array.from({ length: 5 }, (_, i) => ({
    n: get(`edit-n-${i}`),
    d: get(`edit-d-${i}`),
  }));
  saveDiet();
  editingDiet = false;
  activeTab   = 'checklist';
  render();
}

// ——— INIT ———
loadStorage();
render();
