/* BIBO figures.
 *
 * Every value below is transcribed from the committed results files and was
 * verified against them on 2026-08-04. The source file for each figure is
 * named in its `src` field and printed in the caption on the page.
 *
 * Figure numbers follow the paper's reading order, which is NOT the order of
 * the original source filenames (see outputs/findings/figures/FIGURE_MANIFEST.md).
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
/* FIGURE 2 - three probes, per model.                                 */
/* ------------------------------------------------------------------ */
/* k = [count, labelled images] behind each share, for the tooltips. No race named:
   baseline_default_race.csv (European / n_codeable). Two races named: dsb_primary.csv
   (EUROPEAN_HS / n_valid). Adversarial ordering: dsb_by_order.csv, O2 row (P_European x n). */
const F2 = [
  { name: 'GPT Image 1.5', n: 230, v: [1.000, 0.817, 0.638], k: [[22, 22], [188, 230], [74, 116]] },
  { name: 'Grok Imagine', n: 200, v: [0.857, 0.830, 0.703], k: [[18, 21], [166, 200], [71, 101]] },
  { name: 'Imagen 4', n: 173, v: [0.857, 0.746, 0.571], k: [[18, 21], [129, 173], [52, 91]] },
  { name: 'SD 3.5 Large', n: 85, v: [0.667, 0.694, 0.351], k: [[12, 18], [59, 85], [13, 37]] }
];
const F2_LABELS = ['No race named', 'Two races named', 'Adversarial ordering'];
const F2_COLS = [OK.blue, OK.amber, OK.green];
const F2_TIP = [
  (k, n) => `No race named: ${k} of ${n} status holders had a white skin tone (${pct(k, n)})`,
  (k, n) => `Two races named: the European-presenting person held the role in ${k} of ${n} images (${pct(k, n)})`,
  (k, n) => `European named second: the European-presenting person held the role in ${k} of ${n} images (${pct(k, n)})`
];

function figure2() {
  const W = 900, H = 400, mL = 52, mR = 26, mT = 56, mB = 70;
  const pw = W - mL - mR, ph = H - mT - mB, y = v => mT + ph - v * ph;
  let s = '';
  F2_LABELS.forEach((l, i) => {
    s += legendItem(i, mL + i * 190, 25, 11, F2_COLS[i], l, 12, l.length * 6.6);
  });
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const em = t === 0.5;
    s += `<line x1="${mL}" y1="${y(t)}" x2="${mL + pw}" y2="${y(t)}"
          stroke="${em ? CHANCE : HAIR}"${em ? ' stroke-dasharray="5 4"' : ''}/>`;
    s += txt(mL - 9, y(t) + 4, t.toFixed(2), { size: 11, fill: SOFT, anchor: 'end' });
  });
  s += txt(mL + pw, y(0.5) - 8, 'chance', { size: 11, fill: CHANCE, anchor: 'end' });
  const gw = pw / F2.length;
  F2.forEach((d, gi) => {
    const bw = gw / 4.4;
    d.v.forEach((v, i) => {
      const x = mL + gi * gw + gw * 0.14 + i * bw;
      const [k, n] = d.k[i];
      s += `<rect class="gb" x="${x}" y="${y(v)}" width="${bw - 6}" height="${ph - y(v) + mT}"
              fill="${F2_COLS[i]}"${tipAttrs([d.name, F2_TIP[i](k, n)], i)}/>`;
      s += txt(x + (bw - 6) / 2, y(v) - 7, Math.round(v * 100), { size: 11.5, fill: SOFT, anchor: 'middle', cls: 'vl' });
    });
    s += txt(mL + gi * gw + gw / 2, mT + ph + 22, d.name, { size: 13, weight: '600', anchor: 'middle' });
    s += txt(mL + gi * gw + gw / 2, mT + ph + 39, `n = ${d.n} labelled images`,
      { size: 10.5, fill: SOFT, anchor: 'middle' });
  });
  s += txt(14, mT + ph / 2, 'Share holding the high-status role', { size: 11, fill: SOFT, anchor: 'middle' })
    .replace('<text', `<text transform="rotate(-90 14 ${mT + ph / 2})"`);
  return svg(W, H, s, 'Figure 2: three probes, four models. Bar chart.');
}

/* ------------------------------------------------------------------ */
/* FIGURE 3 - no race named, with 95% Wilson intervals.                */
/* ------------------------------------------------------------------ */
const F3 = [
  { name: 'GPT Image 1.5', p: 1.000, lo: 0.851, hi: 1.000, k: '22 of 22', sig: true },
  { name: 'Grok Imagine', p: 0.857, lo: 0.654, hi: 0.950, k: '18 of 21', sig: true },
  { name: 'Imagen 4', p: 0.857, lo: 0.654, hi: 0.950, k: '18 of 21', sig: true },
  { name: 'SD 3.5 Large', p: 0.667, lo: 0.437, hi: 0.837, k: '12 of 18', sig: false }
];

function figure3() {
  const W = 900, H = 380, mL = 52, mR = 26, mT = 34, mB = 74;
  const pw = W - mL - mR, ph = H - mT - mB, y = v => mT + ph - v * ph;
  let s = '';
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const em = t === 0.5;
    s += `<line x1="${mL}" y1="${y(t)}" x2="${mL + pw}" y2="${y(t)}"
          stroke="${em ? CHANCE : HAIR}"${em ? ' stroke-dasharray="5 4"' : ''}/>`;
    s += txt(mL - 9, y(t) + 4, t.toFixed(2), { size: 11, fill: SOFT, anchor: 'end' });
  });
  s += txt(mL + pw, y(0.5) - 8, 'chance', { size: 11, fill: CHANCE, anchor: 'end' });
  const slot = pw / F3.length, bw = slot * 0.4;
  F3.forEach((d, i) => {
    const cx = mL + slot * (i + 0.5);
    const lines = [d.name,
      `${d.k} status holders had a white skin tone (${Math.round(d.p * 100)}%)`,
      `95% Wilson interval: ${(d.lo * 100).toFixed(1)}% to ${(d.hi * 100).toFixed(1)}%`,
      d.sig ? 'Above chance' : 'Not significant: the interval crosses chance'];
    s += `<rect class="gb" x="${cx - bw / 2}" y="${y(d.p)}" width="${bw}" height="${ph - y(d.p) + mT}"
          fill="${OK.blue}"${d.sig ? '' : ' fill-opacity="0.45"'}${tipAttrs(lines)}/>`;
    s += `<g class="vl" pointer-events="none">`;
    s += `<line x1="${cx}" y1="${y(d.hi)}" x2="${cx}" y2="${y(d.lo)}" stroke="${INK}" stroke-width="1.5"/>`;
    s += `<line x1="${cx - 7}" y1="${y(d.hi)}" x2="${cx + 7}" y2="${y(d.hi)}" stroke="${INK}" stroke-width="1.5"/>`;
    s += `<line x1="${cx - 7}" y1="${y(d.lo)}" x2="${cx + 7}" y2="${y(d.lo)}" stroke="${INK}" stroke-width="1.5"/>`;
    s += `</g>`;
    s += txt(cx, y(d.hi) - 10, Math.round(d.p * 100) + '%', { size: 12.5, weight: '700', anchor: 'middle', cls: 'vl' });
    if (!d.sig) s += txt(cx, y(d.hi) - 26, 'not significant', { size: 10, fill: CHANCE, anchor: 'middle', cls: 'vl' });
    s += txt(cx, mT + ph + 22, d.name, { size: 13, weight: '600', anchor: 'middle' });
    s += txt(cx, mT + ph + 39, d.k + ' white skin tone', { size: 10.5, fill: SOFT, anchor: 'middle' });
  });
  s += txt(mL, H - 12, 'Bars show the share; whiskers are 95% Wilson intervals. SD 3.5 Large’s '
    + 'interval crosses the chance line, so its result is not significant.', { size: 10.5, fill: SOFT });
  return svg(W, H, s, 'Figure 3: share of status holders with a white skin tone when no race was named. Bar chart.');
}

/* ------------------------------------------------------------------ */
/* FIGURE 4 - mention order, and what survives it.                     */
/* ------------------------------------------------------------------ */
const F4 = [
  { name: 'GPT Image 1.5', o1: 1.000, o2: 0.638, n1: 114, n2: 116 },
  { name: 'Grok Imagine', o1: 0.960, o2: 0.703, n1: 99, n2: 101 },
  { name: 'Imagen 4', o1: 0.939, o2: 0.571, n1: 82, n2: 91 },
  { name: 'SD 3.5 Large', o1: 0.958, o2: 0.351, n1: 48, n2: 37 }
];

function figure4() {
  const W = 900, H = 360, mL = 148, mR = 40, mT = 66, mB = 76;
  const pw = W - mL - mR, ph = H - mT - mB, x = v => mL + v * pw;
  let s = '';
  const leg = (cx, col, label) => {
    s += `<circle cx="${cx}" cy="20" r="6" fill="${col}"/>`;
    s += txt(cx + 13, 24, label, { size: 11.5, fill: SOFT });
  };
  leg(mL, '#556677', 'European named first');
  leg(mL + 200, OK.green, 'European named second, preference holds');
  leg(mL + 520, OK.vermillion, 'European named second, reverses');

  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const em = t === 0.5;
    s += `<line x1="${x(t)}" y1="${mT}" x2="${x(t)}" y2="${mT + ph}"
          stroke="${em ? CHANCE : HAIR}"${em ? ' stroke-dasharray="5 4"' : ''}/>`;
    s += txt(x(t), mT + ph + 20, t.toFixed(2), { size: 11, fill: SOFT, anchor: 'middle' });
  });
  s += txt(x(0.5), mT + ph + 36, 'chance', { size: 10.5, fill: CHANCE, anchor: 'middle' });
  const step = ph / F4.length;
  F4.forEach((d, i) => {
    const y = mT + step * (i + 0.5), up = d.o2 >= 0.5;
    s += txt(mL - 16, y - 1, d.name, { size: 13, weight: '600', anchor: 'end' });
    s += txt(mL - 16, y + 15, `n = ${d.n1} / ${d.n2}`, { size: 10, fill: SOFT, anchor: 'end' });
    s += `<line x1="${x(d.o2)}" y1="${y}" x2="${x(d.o1)}" y2="${y}" stroke="${HAIR}" stroke-width="3"/>`;
    s += `<circle cx="${x(d.o1)}" cy="${y}" r="7" fill="#556677"/>`;
    s += `<circle cx="${x(d.o2)}" cy="${y}" r="7" fill="${up ? OK.green : OK.vermillion}"/>`;
    s += txt(x(d.o1), y - 14, Math.round(d.o1 * 100) + '%', { size: 11, fill: SOFT, anchor: 'middle' });
    s += txt(x(d.o2), y - 14, Math.round(d.o2 * 100) + '%',
      { size: 11.5, weight: '700', fill: up ? OK.green : OK.vermillion, anchor: 'middle' });
  });
  s += txt(mL, H - 12, 'The gap between the two dots is the mention-order effect. It is large in '
    + 'every model, and not statistically distinguishable across them.', { size: 10.5, fill: SOFT });
  return svg(W, H, s);
}

/* ------------------------------------------------------------------ */
/* FIGURE 5 - how each model rendered its 240 two-race prompts.        */
/* ------------------------------------------------------------------ */
const F5_MODES = [
  { k: 'valid', label: 'Rendered as instructed', color: OK.green },
  { k: 'numpeople', label: 'Wrong number of people', color: OK.amber },
  { k: 'collapse', label: 'Both races collapsed into one', color: OK.vermillion },
  { k: 'propmissing', label: 'Status prop missing', color: OK.sky },
  { k: 'outofset', label: 'A race outside the pair', color: OK.purple },
  { k: 'refusal', label: 'Refused', color: OK.grey },
  { k: 'unclear', label: 'Could not be labelled', color: OK.ink }
];
const F5 = [
  { name: 'GPT Image 1.5', valid: 230, numpeople: 8, collapse: 0, propmissing: 1, outofset: 0, refusal: 1, unclear: 0 },
  { name: 'Grok Imagine', valid: 200, numpeople: 32, collapse: 2, propmissing: 1, outofset: 1, refusal: 4, unclear: 0 },
  { name: 'Imagen 4', valid: 173, numpeople: 48, collapse: 2, propmissing: 6, outofset: 2, refusal: 8, unclear: 1 },
  { name: 'SD 3.5 Large', valid: 85, numpeople: 19, collapse: 82, propmissing: 38, outofset: 13, refusal: 0, unclear: 3 }
];

function figure5() {
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
        tipAttrs([d.name, `${m.label}: ${v} of ${N} prompts (${pct(v, N)})`], mi)}/>`;
      if ((x1 - x0) > 26) labels += txt((x0 + x1) / 2, y + barH / 2 + 4, v,
        { size: 11, fill: '#fff', weight: '600', anchor: 'middle', cls: 'vl' })
        .replace('<text', '<text pointer-events="none"');
      acc += v;
    });
    s += `<g class="gh" style="transform-origin:${mL}px 0px">${segs}</g>${labels}`;
    s += txt(mL + pw + 10, y + barH / 2 + 4, (d.valid / N * 100).toFixed(1) + '%',
      { size: 12.5, weight: '700', fill: OK.green });
  });
  s += txt(mL, H - 10, 'Each bar is that model’s 240 two-race prompts. The green share on the '
    + 'left is the denominator every bias number is measured over.', { size: 10.5, fill: SOFT });
  return svg(W, H, s, 'Figure 5: how each model rendered its 240 two-race prompts. Stacked bar chart.');
}

/* ------------------------------------------------------------------ */
/* FIGURE 6 - scene by model.                                          */
/* ------------------------------------------------------------------ */
const SCENE_NAMES = ['doctor', 'judge', 'pilot', 'professor', 'officer', 'chef',
  'king', 'CEO', 'architect', 'banker', 'captain', 'coach'];
const F6 = [
  { name: 'GPT Image 1.5', v: [0.75, 1.0, 0.737, 0.75, 1.0, 1.0, 0.75, 0.55, 0.647, 0.8, 0.85, 1.0] },
  { name: 'Grok Imagine', v: [0.8, 1.0, null, 0.643, 0.875, 0.875, 0.75, 1.0, 0.947, 0.632, 0.722, 0.85] },
  { name: 'Imagen 4', v: [0.533, 0.875, 0.75, 0.75, 1.0, 0.588, 0.875, 0.714, 0.588, 0.875, 0.923, 0.538] },
  { name: 'SD 3.5 Large', v: [1.0, 1.0, 0.583, 1.0, 1.0, 0.4, 1.0, 0.5, 0.545, 0.556, 0.5, 0.0] }
];

function figure6() {
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
  s += txt(mL, ly + 28, '0 · non-European holds it', { size: 10, fill: SOFT });
  s += txt(mL + 110, ly + 28, '0.5', { size: 10, fill: SOFT, anchor: 'middle' });
  s += txt(mL + 220, ly + 28, '1 · European holds it', { size: 10, fill: SOFT, anchor: 'end' });
  s += txt(mL + 260, ly + 9, 'Cells are percentages. Grok scene 3 had too few labelled images to estimate.',
    { size: 10.5, fill: SOFT });
  return svg(W, H, s);
}

/* ------------------------------------------------------------------ */
/* TABLES                                                              */
/* ------------------------------------------------------------------ */
function table1() {
  const rows = [
    ['Automated labelling vs the human coder, on the outcome', '0.986', '0.978', '280',
      'The share of images where the automated outcome and the blind human agree.'],
    ['Human vs human ceiling, on the outcome', '0.977', '0.970', '44',
      'Two humans agreeing with each other. The automated coding matches this.'],
    ['Pro-European over-calls by the automated labelling', '0 of 179', '≤ 1.5%', '179',
      'The error direction that would inflate the reported bias. None were found.'],
    ['Agreement between the two primary raters, prop-holder race', '0.925', '—', '925',
      'The field that determines the outcome.'],
    ['Human vs human, full label including exclusion category', '0.853', '0.835', '75',
      'Lower because the two humans applied exclusion conventions differently, not because they disagreed on race.']
  ];
  return `<table class="dtable">
    <thead><tr><th scope="col">Measure</th><th scope="col">Agreement</th>
      <th scope="col">Gwet’s AC1</th><th scope="col">n</th><th scope="col">What it means</th></tr></thead>
    <tbody>${rows.map(r => `<tr><th scope="row">${r[0]}</th><td class="num">${r[1]}</td>
      <td class="num">${r[2]}</td><td class="num">${r[3]}</td><td class="note">${r[4]}</td></tr>`).join('')}
    </tbody></table>`;
}

function table2() {
  const rows = [
    ['GPT Image 1.5', '230', '0.817', '+0.31', '&lt; 0.001', '+0.30', '0.027', 'ok', 'Confirmed'],
    ['Grok Imagine', '200', '0.830', '+0.33', '&lt; 0.001', '+0.29', '0.027', 'ok', 'Confirmed'],
    ['Imagen 4', '173', '0.746', '+0.24', '&lt; 0.001', '+0.23', '0.037', 'ok', 'Confirmed'],
    ['SD 3.5 Large', '85', '0.694', '+0.19', '0.0005', '+0.15', '0.139', 'part', 'Directional only']
  ];
  return `<table class="dtable">
    <thead><tr>
      <th scope="col">Model</th><th scope="col">Labelled images</th>
      <th scope="col">Share European-presenting</th>
      <th scope="col">Margin over chance</th><th scope="col">q</th>
      <th scope="col">Margin, robustness model</th><th scope="col">q</th>
      <th scope="col">Verdict</th></tr></thead>
    <tbody>${rows.map(r => `<tr><th scope="row">${r[0]}</th><td class="num">${r[1]}</td>
      <td class="num">${r[2]}</td><td class="num strong">${r[3]}</td><td class="num">${r[4]}</td>
      <td class="num">${r[5]}</td><td class="num">${r[6]}</td>
      <td><span class="verdict ${r[7]}">${r[8]}</span></td></tr>`).join('')}
    </tbody></table>`;
}

/* ------------------------------------------------------------------ */
window.BIBO_FIGURES = {
  /* interactive: tooltips, focus and legend highlighting; grow: bars draw in on first view */
  fig2: { render: figure2, src: 'baseline_default_race.csv, dsb_primary.csv, dsb_by_order.csv', interactive: true, grow: true },
  fig3: { render: figure3, src: 'baseline_default_race.csv, CALCULATIONS.md B1', interactive: true, grow: true },
  fig4: { render: figure4, src: 'dsb_by_order.csv, CALCULATIONS.md B2 and B3' },
  fig5: { render: figure5, src: 'fidelity_summary.csv', interactive: true, grow: true },
  fig6: { render: figure6, src: 'dsb_by_scene.csv, OPEN_ANALYSES.md A3' },
  tab1: { render: table1, src: 'human_audit_report.json, reliability.json' },
  tab2: { render: table2, src: 'glmm_primary.csv, glmm_robustness.csv, dsb_primary.csv' }
};
