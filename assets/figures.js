/* BIBO figures.
 *
 * Every value below is transcribed from the committed results files and was
 * verified against them on 2026-08-04. The source file for each figure is
 * named in its `src` field and printed in the caption on the page.
 *
 * Figure and table numbers are the page's own, in reading order. Figure 2 has the
 * same content as the paper's Fig. 2; the page has no separate baseline or order chart.
 *
 * All figures render as inline SVG using CSS custom properties, so they follow
 * the page's light and dark theme without re-rendering.
 */

const OK = {
  blue: '#0072B2', amber: '#E69F00', green: '#009E73',
  vermillion: '#D55E00', sky: '#56B4E9', purple: '#CC79A7',
  grey: '#8C8C8C', ink: '#3F3F3F'
};
const INK = 'var(--ink)', SOFT = 'var(--soft)', HAIR = 'var(--hair)', CHANCE = 'var(--chance)';
const FONT = "font-family=\"var(--fig-font)\"";

/* Named xesc, not esc: figures.js and app.js share one global scope, and app.js has its own esc. */
const xesc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* A static figure is one image to a screen reader. An interactive one is a group, so each bar
   can be reached and read on its own. */
const svg = (w, h, body, label) =>
  `<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="xMidYMid meet"
        ${label ? `role="group" aria-label="${xesc(label)}"` : 'role="img"'} ${FONT}>${body}</svg>`;

const txt = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.size || 12}" fill="${o.fill || INK}"
     text-anchor="${o.anchor || 'start'}"${o.weight ? ` font-weight="${o.weight}"` : ''}${
    o.style ? ` font-style="${o.style}"` : ''}${o.cls ? ` class="${o.cls}"` : ''}>${s}</text>`;

/* Interactive bars. `lines` is what the tooltip shows, first line in bold, and what a screen
   reader hears; `s` is the series the bar belongs to, which its legend entry highlights. */
const pct = (k, n) => (k / n * 100).toFixed(1) + '%';
const tipAttrs = (lines, s) =>
  ` data-tip="${xesc(lines.join('|'))}" aria-label="${xesc(lines.join('. '))}" tabindex="0"`
  + ` role="img"${s != null ? ` data-s="${s}"` : ''}`;

/* A clickable legend entry: swatch, label and a transparent hit area over both. */
const legendItem = (s, x, y, sw, color, label, size, textW) =>
  `<g class="lg" data-s="${s}" tabindex="0" role="button" aria-pressed="false"
      aria-label="Highlight ${xesc(label)}">
     <rect x="${x - 3}" y="${y - sw - 3}" width="${sw + textW + 12}" height="${sw + 8}" fill="transparent"/>
     <rect x="${x}" y="${y - sw}" width="${sw}" height="${sw}" fill="${color}"/>
     ${txt(x + sw + 7, y, label, { size, fill: SOFT })}
   </g>`;

/* ------------------------------------------------------------------ */
/* FIGURE 2 - who holds the high-status role, per system.            */
/* ------------------------------------------------------------------ */
/* k = [count, scorable images] behind each share, for the tooltips. No race named:
   baseline_default_race.csv (European / n_codeable). Both orders: dsb_primary.csv
   (EUROPEAN_HS / n_valid). Named first / second: dsb_by_order.csv, O1 / O2 rows (P_European x n). */
const F2 = [
  { name: 'GPT Image 1.5', n: 230, v: [1.000, 0.817, 1.000, 0.638], k: [[22, 22], [188, 230], [114, 114], [74, 116]] },
  { name: 'Grok Imagine', n: 200, v: [0.857, 0.830, 0.960, 0.703], k: [[18, 21], [166, 200], [95, 99], [71, 101]] },
  { name: 'Imagen 4', n: 173, v: [0.857, 0.746, 0.939, 0.571], k: [[18, 21], [129, 173], [77, 82], [52, 91]] },
  { name: 'SD 3.5 Large', n: 85, v: [0.733, 0.694, 0.958, 0.351], k: [[11, 15], [59, 85], [46, 48], [13, 37]] }
];
const F2_LABELS = ['No race named', 'Both orders', 'European named first', 'European named second'];
const F2_COLS = [OK.blue, OK.amber, OK.purple, OK.green];
const F2_TIP = [
  (k, n) => `No race named: ${k} of ${n} status holders were light-skinned (${pct(k, n)})`,
  (k, n) => `Both orders: the European-presenting person held the role in ${k} of ${n} images (${pct(k, n)})`,
  (k, n) => `European named first: the European-presenting person held the role in ${k} of ${n} images (${pct(k, n)})`,
  (k, n) => `European named second: the European-presenting person held the role in ${k} of ${n} images (${pct(k, n)})`
];

function figure2() {
  const W = 900, H = 400, mL = 52, mR = 26, mT = 56, mB = 70;
  const pw = W - mL - mR, ph = H - mT - mB, y = v => mT + ph - v * ph;
  let s = '';
  F2_LABELS.forEach((l, i) => {
    s += legendItem(i, mL + i * 200, 25, 11, F2_COLS[i], l, 12, l.length * 6.6);
  });
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const em = t === 0.5;
    s += `<line x1="${mL}" y1="${y(t)}" x2="${mL + pw}" y2="${y(t)}"
          stroke="${em ? CHANCE : HAIR}"${em ? ' stroke-dasharray="5 4"' : ''}/>`;
    s += txt(mL - 9, y(t) + 4, t.toFixed(2), { size: 11, fill: SOFT, anchor: 'end' });
  });
  s += txt(mL + pw, y(0.5) - 8, 'even split', { size: 11, fill: CHANCE, anchor: 'end' });
  const gw = pw / F2.length;
  F2.forEach((d, gi) => {
    const bw = gw / 5.2;
    d.v.forEach((v, i) => {
      const x = mL + gi * gw + gw * 0.12 + i * bw;
      const [k, n] = d.k[i];
      s += `<rect class="gb" x="${x}" y="${y(v)}" width="${bw - 6}" height="${ph - y(v) + mT}"
              fill="${F2_COLS[i]}"${tipAttrs([d.name, F2_TIP[i](k, n)], i)}/>`;
      s += txt(x + (bw - 6) / 2, y(v) - 7, Math.round(v * 100), { size: 11.5, fill: SOFT, anchor: 'middle', cls: 'vl' });
    });
    s += txt(mL + gi * gw + gw / 2, mT + ph + 22, d.name, { size: 13, weight: '600', anchor: 'middle' });
    s += txt(mL + gi * gw + gw / 2, mT + ph + 39, `${d.n} scorable two-race images`,
      { size: 10.5, fill: SOFT, anchor: 'middle' });
  });
  s += txt(14, mT + ph / 2, 'Share holding the high-status role', { size: 11, fill: SOFT, anchor: 'middle' })
    .replace('<text', `<text transform="rotate(-90 14 ${mT + ph / 2})"`);
  return svg(W, H, s, 'Figure 2: who holds the high-status role, per system. Bar chart.');
}

/* ------------------------------------------------------------------ */
/* FIGURE 3 - how each system rendered its 240 two-race images.       */
/* ------------------------------------------------------------------ */
const F5_MODES = [
  { k: 'valid', label: 'Scorable', color: OK.green },
  { k: 'numpeople', label: 'Wrong number of people', color: OK.amber },
  { k: 'collapse', label: 'Both people the same race', color: OK.vermillion },
  { k: 'propmissing', label: 'No one holding the prop', color: OK.sky },
  { k: 'outofset', label: 'A race outside the named pair', color: OK.purple },
  { k: 'refusal', label: 'Labeller declined', color: OK.grey },
  { k: 'unclear', label: 'Race unresolved', color: OK.ink }
];
const F5 = [
  { name: 'GPT Image 1.5', valid: 230, numpeople: 8, collapse: 0, propmissing: 1, outofset: 0, refusal: 1, unclear: 0 },
  { name: 'Grok Imagine', valid: 200, numpeople: 32, collapse: 2, propmissing: 1, outofset: 1, refusal: 4, unclear: 0 },
  { name: 'Imagen 4', valid: 173, numpeople: 48, collapse: 2, propmissing: 6, outofset: 2, refusal: 8, unclear: 1 },
  { name: 'SD 3.5 Large', valid: 85, numpeople: 19, collapse: 82, propmissing: 38, outofset: 13, refusal: 0, unclear: 3 }
];

function figureFidelity() {
  const N = 240, W = 900, H = 350, mL = 148, mR = 62, mT = 64, rowStep = 52, barH = 30;
  const pw = W - mL - mR, x = f => mL + f * pw;
  let s = '';
  F5_MODES.forEach((m, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const cx = mL + col * 190, cy = 16 + row * 18;
    s += legendItem(i, cx, cy + 2, 10, m.color, m.label, 10.5, m.label.length * 5.6);
  });
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    s += `<line x1="${x(t)}" y1="${mT - 8}" x2="${x(t)}" y2="${mT + 4 * rowStep - 14}" stroke="${HAIR}"/>`;
    s += txt(x(t), mT + 4 * rowStep + 4, Math.round(t * 100) + '%', { size: 10.5, fill: SOFT, anchor: 'middle' });
  });
  F5.forEach((d, i) => {
    const y = mT + i * rowStep;
    s += txt(mL - 16, y + barH / 2 + 4, d.name, { size: 13, weight: '600', anchor: 'end' });
    /* the whole row grows from the axis, so the stack reads as one bar while it draws */
    let acc = 0, segs = '', labels = '';
    F5_MODES.forEach((m, mi) => {
      const v = d[m.k]; if (!v) return;
      const x0 = x(acc / N), x1 = x((acc + v) / N);
      segs += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${barH}" fill="${m.color}"${
        tipAttrs([d.name, `${m.label}: ${v} of ${N} images (${pct(v, N)})`], mi)}/>`;
      if ((x1 - x0) > 26) labels += txt((x0 + x1) / 2, y + barH / 2 + 4, v,
        { size: 11, fill: '#fff', weight: '600', anchor: 'middle', cls: 'vl' })
        .replace('<text', '<text pointer-events="none"');
      acc += v;
    });
    s += `<g class="gh" style="transform-origin:${mL}px 0px">${segs}</g>${labels}`;
    s += txt(mL + pw + 10, y + barH / 2 + 4, (d.valid / N * 100).toFixed(1) + '%',
      { size: 12.5, weight: '700', fill: OK.green });
  });
  s += txt(mL, H - 10, 'Each bar is one system’s 240 two-race images. Only the scorable (green) '
    + 'images enter the bias estimates.', { size: 10.5, fill: SOFT });
  return svg(W, H, s, 'Figure 3: how each system rendered its 240 two-race images. Stacked bar chart.');
}

/* ------------------------------------------------------------------ */
/* FIGURE 4 - scene by system.                                         */
/* ------------------------------------------------------------------ */
const SCENE_NAMES = ['doctor', 'judge', 'pilot', 'professor', 'officer', 'chef',
  'king', 'CEO', 'architect', 'banker', 'captain', 'coach'];
const F6 = [
  { name: 'GPT Image 1.5', v: [0.75, 1.0, 0.737, 0.75, 1.0, 1.0, 0.75, 0.55, 0.647, 0.8, 0.85, 1.0] },
  { name: 'Grok Imagine', v: [0.8, 1.0, null, 0.643, 0.875, 0.875, 0.75, 1.0, 0.947, 0.632, 0.722, 0.85] },
  { name: 'Imagen 4', v: [0.533, 0.875, 0.75, 0.75, 1.0, 0.588, 0.875, 0.714, 0.588, 0.875, 0.923, 0.538] },
  { name: 'SD 3.5 Large', v: [1.0, 1.0, 0.583, 1.0, 1.0, 0.4, 1.0, 0.5, 0.545, 0.556, 0.5, 0.0] }
];

function figureScene() {
  const W = 900, mL = 140, mR = 26, top = 74, cellH = 46, gap = 2;
  const H = top + F6.length * cellH + 74;
  const pw = W - mL - mR, cw = pw / 12;
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
  const col = p => p >= 0.5
    ? mix([255, 255, 255], [15, 76, 129], (p - 0.5) * 2)
    : mix([255, 255, 255], [178, 34, 34], (0.5 - p) * 2);
  let s = '';
  s += txt(mL - 14, top - 30, 'Scene', { size: 10.5, fill: SOFT, anchor: 'end' });
  SCENE_NAMES.forEach((n, c) => {
    s += txt(mL + c * cw + cw / 2, top - 30, c + 1, { size: 11.5, fill: SOFT, anchor: 'middle' });
    s += txt(mL + c * cw + cw / 2, top - 14, n, { size: 9, fill: SOFT, anchor: 'middle' });
  });
  F6.forEach((r, ri) => {
    const y = top + ri * cellH;
    s += txt(mL - 14, y + cellH / 2 + 4, r.name, { size: 12.5, weight: '600', anchor: 'end' });
    r.v.forEach((p, c) => {
      const x = mL + c * cw;
      if (p === null) {
        s += `<rect x="${x + gap / 2}" y="${y + gap / 2}" width="${cw - gap}" height="${cellH - gap}"
              fill="var(--panel)"/>`;
        s += txt(x + cw / 2, y + cellH / 2 + 4, 'n/a', { size: 9.5, fill: SOFT, anchor: 'middle' });
        return;
      }
      const strong = Math.abs(p - 0.5) > 0.3;
      s += `<rect x="${x + gap / 2}" y="${y + gap / 2}" width="${cw - gap}" height="${cellH - gap}"
            fill="${col(p)}" stroke="${HAIR}" stroke-width="0.5"><title>${r.name}, ${SCENE_NAMES[c]}: ${Math.round(p * 100)}%</title></rect>`;
      s += txt(x + cw / 2, y + cellH / 2 + 4, Math.round(p * 100),
        { size: 11.5, fill: strong ? '#fff' : '#222', weight: '600', anchor: 'middle' });
    });
  });
  const ly = top + F6.length * cellH + 30;
  s += `<defs><linearGradient id="hm" x1="0" x2="1"><stop offset="0" stop-color="rgb(178,34,34)"/>
        <stop offset="0.5" stop-color="#fff"/><stop offset="1" stop-color="rgb(15,76,129)"/></linearGradient></defs>`;
  s += `<rect x="${mL}" y="${ly}" width="220" height="11" fill="url(#hm)" stroke="${HAIR}"/>`;
  s += txt(mL, ly + 28, '0 · other person holds it', { size: 10, fill: SOFT });
  s += txt(mL + 110, ly + 28, '0.5', { size: 10, fill: SOFT, anchor: 'middle' });
  s += txt(mL + 220, ly + 28, '1 · European holds it', { size: 10, fill: SOFT, anchor: 'end' });
  s += txt(mL + 260, ly + 9, 'Cells are percentages. n/a: no scorable image (Grok Imagine, scene 3).',
    { size: 10.5, fill: SOFT });
  return svg(W, H, s);
}

/* ------------------------------------------------------------------ */
/* TABLES                                                              */
/* ------------------------------------------------------------------ */
/* Table 2: agreement with people. The first three rows compare who holds the high-status role. */
function tableValid() {
  const rows = [
    ['Automated labels vs first annotator', '98.6%', '0.978', '280'],
    ['First vs second annotator', '97.7%', '0.970', '44'],
    ['Automated labels vs second annotator', '100%', '1.000', '45'],
    ['Claude vs Gemini labeller, race of the prop holder', '96.9%', '0.946', '925'],
    ['First vs second annotator, full code including exclusions', '85.3%', '0.835', '75']
  ];
  return `<table class="dtable">
    <thead><tr><th scope="col">Comparison</th><th scope="col">Agreement</th>
      <th scope="col">AC1</th><th scope="col">Images</th></tr></thead>
    <tbody>${rows.map(r => `<tr><th scope="row">${r[0]}</th><td class="num">${r[1]}</td>
      <td class="num">${r[2]}</td><td class="num">${r[3]}</td></tr>`).join('')}
    </tbody></table>
    <p class="tnote">In the two random samples, the automated labels never marked a non-European
      status holder as European: 0 of 179 images (at most 1.5%).</p>`;
}

/* Table 1: how strong the preference is. glmm_primary.csv and glmm_robustness.csv. */
function tableRate() {
  const rows = [
    ['GPT Image 1.5', '230', '81.7%', '+0.31', '&lt; 0.001', '+0.30', '0.027', 'ok', 'Both estimates'],
    ['Grok Imagine', '200', '83.0%', '+0.33', '&lt; 0.001', '+0.29', '0.027', 'ok', 'Both estimates'],
    ['Imagen 4', '173', '74.6%', '+0.24', '&lt; 0.001', '+0.23', '0.037', 'ok', 'Both estimates'],
    ['SD 3.5 Large', '85', '69.4%', '+0.19', '&lt; 0.001', '+0.15', '0.139', 'part', 'First only, directional']
  ];
  return `<table class="dtable">
    <thead><tr>
      <th scope="col">System</th><th scope="col">Scorable images</th>
      <th scope="col">Share</th>
      <th scope="col">Above even split</th><th scope="col">q</th>
      <th scope="col">Above even split, scenes allowed for</th><th scope="col">q</th>
      <th scope="col">Meets rule</th></tr></thead>
    <tbody>${rows.map(r => `<tr><th scope="row">${r[0]}</th><td class="num">${r[1]}</td>
      <td class="num">${r[2]}</td><td class="num strong">${r[3]}</td><td class="num">${r[4]}</td>
      <td class="num">${r[5]}</td><td class="num">${r[6]}</td>
      <td><span class="verdict ${r[7]}">${r[8]}</span></td></tr>`).join('')}
    </tbody></table>`;
}

/* ------------------------------------------------------------------ */
window.BIBO_FIGURES = {
  /* interactive: tooltips, focus and legend highlighting; grow: bars draw in on first view */
  figshare: { render: figure2, src: 'baseline_default_race.csv, dsb_primary.csv, dsb_by_order.csv', interactive: true, grow: true },
  figfidelity: { render: figureFidelity, src: 'fidelity_summary.csv', interactive: true, grow: true },
  figscene: { render: figureScene, src: 'dsb_by_scene.csv, OPEN_ANALYSES.md A3' },
  tabrate: { render: tableRate, src: 'glmm_primary.csv, glmm_robustness.csv, dsb_primary.csv' },
  tabvalid: { render: tableValid, src: 'human_audit_report.json, reliability.json' }
};
