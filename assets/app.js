/* BIBO project page behaviour. No dependencies, no external requests. */

/* The author names, photos and logos are in the byline at the top of index.html. */

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
    if (!host || !F[id]) return;
    host.innerHTML = F[id].render();
    if (F[id].interactive) {
      host.dataset.interactive = '';
      host.insertAdjacentHTML('afterend', '<p class="charthint">Hover over or tap a bar for its exact count.'
        + (host.querySelector('.lg') ? ' Select a legend entry to highlight that series.' : '') + '</p>');
    }
    if (F[id].grow) host.dataset.grow = '';
  });
}

/* ---------------- interactive bar charts ---------------- */
/* Hover, tap or keyboard focus on a bar shows its exact count and dims the other bars, so the one
   being read stands out. Selecting a legend entry holds that series highlighted until it is
   selected again. One shared tooltip, a few listeners per chart, no library. */
function chartInteractions() {
  const frames = [...document.querySelectorAll('.figframe[data-interactive]')];
  if (!frames.length) return;
  const tip = el('div', 'charttip'); tip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tip);

  const show = (bar, x, y) => {
    const [head, ...rest] = bar.dataset.tip.split('|');
    tip.innerHTML = `<b>${esc(head)}</b>${rest.map(l => esc(l)).join('<br>')}`;
    /* keep the tooltip inside the viewport, and flip it below the pointer near the top edge */
    const w = tip.offsetWidth, h = tip.offsetHeight, pad = 8;
    tip.style.left = Math.min(Math.max(x, w / 2 + pad), innerWidth - w / 2 - pad) + 'px';
    tip.style.top = y + 'px';
    tip.classList.toggle('below', y - h - 14 < 0);
    tip.classList.add('on');
    const f = bar.closest('.figframe');
    f.querySelectorAll('.hot').forEach(n => n.classList.remove('hot'));
    bar.classList.add('hot'); f.classList.add('hl');
  };
  const hide = () => {
    tip.classList.remove('on');
    frames.forEach(f => { f.classList.remove('hl'); f.querySelectorAll('.hot').forEach(n => n.classList.remove('hot')); });
  };
  const pin = (f, g) => {
    const s = g.dataset.s, on = f.dataset.pin !== s;
    if (on) f.dataset.pin = s; else delete f.dataset.pin;
    f.classList.toggle('pinned', on);
    f.querySelectorAll('[data-s]').forEach(n => n.classList.toggle('pin', on && n.dataset.s === s));
    f.querySelectorAll('.lg').forEach(n => n.setAttribute('aria-pressed', String(on && n.dataset.s === s)));
  };

  frames.forEach(f => {
    f.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const bar = e.target.closest('[data-tip]');
      if (bar) show(bar, e.clientX, e.clientY); else hide();
    });
    f.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hide(); });
    /* touch and pen: a tap shows the tooltip, a tap anywhere else clears it */
    f.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      const bar = e.target.closest('[data-tip]');
      if (bar) { const r = bar.getBoundingClientRect(); show(bar, r.left + r.width / 2, r.top); }
    });
    f.addEventListener('focusin', e => {
      const bar = e.target.closest('[data-tip]');
      if (bar) { const r = bar.getBoundingClientRect(); show(bar, r.left + r.width / 2, r.top); }
    });
    f.addEventListener('focusout', hide);
    f.addEventListener('click', e => { const g = e.target.closest('.lg'); if (g) pin(f, g); });
    f.addEventListener('keydown', e => {
      if (e.key === 'Escape') { hide(); return; }
      const g = e.target.closest('.lg');
      if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pin(f, g); }
    });
  });
  document.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' && !e.target.closest('.figframe [data-tip]')) hide();
  });
  addEventListener('scroll', hide, { passive: true });
}

/* Bars draw in once, when each chart first scrolls into view. Skipped entirely where the
   browser lacks IntersectionObserver or the reader prefers reduced motion, so the bars are
   never left hidden. */
function chartEntrance() {
  const frames = [...document.querySelectorAll('.figframe[data-grow]')];
  if (!frames.length || !('IntersectionObserver' in window)
    || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('anim');
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.25 });
  frames.forEach(f => io.observe(f));
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

/* The four opening images are in index.html, so they show even if the gallery data fails to
   load. Once it loads, each one opens the same lightbox as the gallery, with its prompt. */
function renderStrip() {
  document.querySelectorAll('#strip .stripcard').forEach(b => {
    const c = CARDS.find(card => card.slot === b.dataset.slot);
    if (c) b.onclick = () => openLightbox(c);
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
chartInteractions();
chartEntrance();
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
