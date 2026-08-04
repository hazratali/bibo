/* BIBO project page behaviour. No dependencies, no external requests. */

/* ------------------------------------------------------------------
 * EDIT ME. Roles below are taken from the repository README and from the
 * manuscript review record. The final author list and author ORDER are not
 * settled, so this is presented as contributors, not as an author line.
 * Add `photo: 'assets/img/team/name.jpg'` to any entry to replace the
 * monogram with a headshot.
 * ---------------------------------------------------------------- */
const TEAM = [
  { name: 'Dr. Hazrat Ali', org: 'University of Stirling' },
  { name: 'Baqar Jafri', org: 'University of Stirling' },
  { name: 'Muhammad Muneeb Saad', org: '', pending: 'affiliation to confirm' }
];

/* The three images that open the Evidence section. All are the adversarial
   ordering, meaning the prompt named the European second. */
const LEAD = ['scene_07', 'scene_02', 'scene_05'];

const GROUPS = [
  { key: 'all', label: 'All 48' },
  { key: 'baseline', label: 'No race named' },
  { key: 'flip', label: 'Order flip pairs' },
  { key: 'spread', label: 'One per scene' },
  { key: 'failure', label: 'Fidelity failures' },
  { key: 'counter', label: 'Counter-examples' }
];

const $ = s => document.querySelector(s);
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------- figures ---------------- */
function renderFigures() {
  const F = window.BIBO_FIGURES;
  ['fig1', 'fig2', 'fig3', 'fig4', 'fig5', 'fig6', 'tab1', 'tab2'].forEach(id => {
    const host = document.getElementById(id);
    if (host && F[id]) host.innerHTML = F[id].render();
  });
}

/* ---------------- team ---------------- */
function renderTeam() {
  const host = $('#team'); if (!host) return;
  host.innerHTML = '';
  TEAM.forEach(p => {
    const initials = p.name.replace(/^Dr\.?\s+/, '').split(/\s+/)
      .map(w => w[0]).slice(0, 2).join('');
    const av = p.photo
      ? `<img class="mono-av" src="${esc(p.photo)}" alt="">`
      : `<div class="mono-av" aria-hidden="true">${esc(initials)}</div>`;
    const org = p.org
      ? `<div class="af">${esc(p.org)}</div>`
      : `<div class="af pending">${esc(p.pending || '')}</div>`;
    host.appendChild(el('div', 'person',
      `${av}<div><div class="nm">${esc(p.name)}</div>${org}</div>`));
  });
}

/* ---------------- gallery ---------------- */
let CARDS = [], filter = 'all';

/* Say it the way the surrounding prose says it. "East Asian named first" is the
   same fact as "European named second", but only the second phrasing lets the
   reader check the claim without doing the inference themselves. */
function ordering(c) {
  if (!c.order) return 'No race named';
  return c.order === 'O2'
    ? 'European named second · adversarial ordering'
    : 'European named first';
}

function renderLead() {
  const host = $('#lead'); if (!host) return;
  host.innerHTML = '';
  LEAD.map(id => CARDS.find(c => c.slot === id)).filter(Boolean).forEach(c => {
    const b = el('button', 'leadcard');
    b.type = 'button';
    b.innerHTML =
      `<img src="${c.full}" loading="lazy" decoding="async"
         alt="${esc(c.model)} output for the ${esc(c.scene)} scene. ${esc(c.outcome)}.">
       <div class="leadbody">
         <div class="leadscene">${esc(c.scene)}</div>
         <div class="leadmeta">${esc(c.model)} · ${esc(ordering(c))}</div>
         <div class="gout ${c.kind}">${esc(c.outcome)}</div>
       </div>`;
    b.onclick = () => openLightbox(c);
    host.appendChild(b);
  });
}

function renderStrip() {
  const strip = $('#strip'); if (!strip) return;
  strip.innerHTML = '';
  CARDS.filter(c => c.group === 'baseline').slice(0, 8).forEach(c => {
    const img = el('img');
    img.src = c.thumb; img.loading = 'lazy'; img.decoding = 'async';
    img.alt = `Model output for the ${c.scene} scene. No race was named in the prompt. `
      + `The person holding the status prop was rendered with a white skin tone.`;
    strip.appendChild(img);
  });
}

function renderFilters() {
  const host = $('#filters'); if (!host) return;
  host.innerHTML = '';   /* this runs on every filter click; without the reset it stacks */
  GROUPS.forEach(g => {
    const n = g.key === 'all' ? CARDS.length : CARDS.filter(c => c.group === g.key).length;
    if (!n) return;
    const b = el('button', 'chip' + (g.key === filter ? ' on' : ''), `${esc(g.label)}`);
    b.type = 'button'; b.setAttribute('aria-pressed', String(g.key === filter));
    b.onclick = () => { filter = g.key; renderFilters(); renderGrid(); };
    host.appendChild(b);
  });
}

function renderGrid() {
  const host = $('#grid'); if (!host) return;
  host.innerHTML = '';
  const shown = CARDS.filter(c => filter === 'all' || c.group === filter);
  $('#gcount').textContent =
    `Showing ${shown.length} of ${CARDS.length} images. Select one to see the prompt it came from.`;
  shown.forEach(c => {
    const b = el('button', 'gcard');
    b.type = 'button';
    b.innerHTML =
      `<img src="${c.thumb}" loading="lazy" decoding="async"
         alt="${esc(c.model)} output for the ${esc(c.scene)} scene. ${esc(c.outcome)}.">
       <div class="gbody">
         <div class="grow">
           <span class="pill b">${esc(c.model)}</span>
           <span class="pill">${esc(c.scene)}</span>
           <span class="pill ${c.kind === 'excluded' ? 'a' : ''}">${esc(c.condition)}</span>
         </div>
         <div class="gout ${c.kind}">${esc(c.outcome)}</div>
       </div>`;
    b.onclick = () => openLightbox(c);
    host.appendChild(b);
  });
}

function openLightbox(c) {
  const dlg = $('#lb');
  $('#lbimg').src = c.full;
  $('#lbimg').alt = `${c.model} output for the ${c.scene} scene. ${c.outcome}.`;
  $('#lbside').innerHTML =
    `<h4>Model</h4><p>${esc(c.model)}</p>
     <h4>Scene</h4><p>${esc(c.scene)} (scene ${c.sceneId})</p>
     <h4>Condition</h4><p>${esc(ordering(c))}${c.order ? ` (${esc(c.order)})` : ''}${
      c.racePair ? ` · ${esc(c.racePair.replace('_', ' and '))}` : ''}</p>
     <h4>How it was labelled</h4><p class="gout ${c.kind}">${esc(c.outcome)}</p>
     <h4>Prompt as sent</h4><div class="lbprompt">${esc(c.prompt)}</div>
     <h4>Image hash</h4><p style="font-family:var(--mono);font-size:.7rem">${esc(c.sha256)}…</p>`;
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
}

/* ---------------- chrome ---------------- */
function scrollSpy() {
  const links = [...document.querySelectorAll('.steps a')];
  const targets = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (!('IntersectionObserver' in window) || !targets.length) return;
  const seen = new Map();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => seen.set(e.target.id, e.intersectionRatio));
    let best = null, bestR = 0;
    seen.forEach((r, id) => { if (r > bestR) { bestR = r; best = id; } });
    if (best) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + best));
  }, { threshold: [0, .1, .3, .6], rootMargin: '-8% 0px -55% 0px' });
  targets.forEach(t => io.observe(t));
}

function theme() {
  const btn = $('#theme'); if (!btn) return;
  const saved = localStorage.getItem('bibo-theme');
  if (saved) document.documentElement.dataset.theme = saved;
  btn.onclick = () => {
    const cur = document.documentElement.dataset.theme
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('bibo-theme', next);
  };
}

function copyCite() {
  const btn = $('#copy'); if (!btn) return;
  btn.onclick = async () => {
    try {
      await navigator.clipboard.writeText($('#bibtex').textContent);
      btn.textContent = 'Copied';
    } catch { btn.textContent = 'Select the text above to copy'; }
    setTimeout(() => { btn.textContent = 'Copy BibTeX'; }, 2200);
  };
}

/* ---------------- boot ---------------- */
renderFigures();
renderTeam();
theme();
copyCite();
scrollSpy();
$('#lbclose').onclick = () => $('#lb').close();
$('#lb').addEventListener('click', e => { if (e.target.id === 'lb') $('#lb').close(); });

fetch('assets/gallery.json')
  .then(r => r.json())
  .then(cards => { CARDS = cards; renderStrip(); renderLead(); renderFilters(); renderGrid(); })
  .catch(() => {
    const g = $('#gcount');
    if (g) g.textContent = 'Gallery data could not be loaded. Serve this page over HTTP rather '
      + 'than opening the file directly.';
  });
