# BIBO project page

The public-facing page for *Bias In, Bias Out*, an audit of race-to-role assignment for
high-status roles across four text-to-image models.

Static HTML. No build step, no framework, no external requests. Everything is served from this
repository, so it works on GitHub Pages as-is.

## Run it locally

```
python -m http.server 8000
```

Then open <http://127.0.0.1:8000>. It must be served over HTTP rather than opened as a file,
because the gallery loads `assets/gallery.json` with `fetch`.

## Layout

```
index.html              the page
assets/style.css        all styling, light and dark
assets/figures.js       the six figures and two tables, as inline SVG and HTML
assets/app.js           gallery, filters, lightbox, navigation, theme
assets/gallery.json     metadata for the 48 sample images
assets/img/gallery/     the 48 images, 900px and 340px WebP
tools/build_gallery.py  regenerates the two files above from the study corpus
.nojekyll              stops GitHub Pages running the files through Jekyll
```

## Where the numbers come from

Every figure and table is generated from the committed results files in the study repository at
<https://github.com/baqarjafri/BIBO_Research>. Each caption names its source file. The values are
transcribed into `assets/figures.js` and were verified against those files on 2026-08-04:

| Figure | Source |
|---|---|
| Figure 1, the design | `PROTOCOL.md` §1, `data/prompts.csv` |
| Figure 2, three probes | `baseline_default_race.csv`, `dsb_primary.csv`, `dsb_by_order.csv` |
| Figure 3, no race named | `baseline_default_race.csv`, `CALCULATIONS.md` B1 |
| Figure 4, mention order | `dsb_by_order.csv`, `CALCULATIONS.md` B2 and B3 |
| Figure 5, prompt fidelity | `fidelity_summary.csv` |
| Figure 6, scene by model | `dsb_by_scene.csv`, `OPEN_ANALYSES.md` A3 |
| Table 1, margin over chance | `glmm_primary.csv`, `glmm_robustness.csv`, `dsb_primary.csv` |
| Table 2, human validation | `human_audit_report.json`, `reliability.json` |

If a number changes in the study repository, update `assets/figures.js` to match. The figures are
plain data arrays at the top of each function, so this is a one-line edit per value.

## Regenerating the gallery

```
python tools/build_gallery.py
```

Requires the study repository checked out locally, with the image corpus present. Edit the `BIBO`
path at the top of the script if it lives somewhere else.

Selection is deterministic and rule-based, in this order:

1. **The slot is fixed by the label.** What each card must show is decided from the labelled
   outcome before any image is looked at. Selection never picks an outcome.
2. **Legibility screen.** Only images where both primary raters agreed without a tiebreaker
   (`consensus_label == high_confidence_AB`) are eligible. Images that needed a third rater are
   the ambiguous ones and stay out of the public gallery.
3. **Deterministic ordering.** Ties break on `image_id`, so the same 48 images come out every run.

The 48 break down as 8 with no race named, 16 as eight order-flip pairs, 12 covering one scene
each, 8 fidelity failures, and 4 counter-examples where the non-European holds the status prop.

## Deploying to GitHub Pages

Push to `main`, then in **Settings → Pages** set the source to `main` and the folder to `/ (root)`.
`.nojekyll` is already present, so `assets/` is served untouched.

## Still to fill in

- **Affiliation for Muhammad Muneeb Saad.** Two places: the `.bylist` in `index.html` and `TEAM`
  at the top of `assets/app.js`. Both currently read "affiliation to confirm".
- **BibTeX author field.** Still `AUTHOR LIST PENDING` in `index.html`, because the citation
  needs the confirmed order and the preprint identifier together.
- **Headshots.** Add `photo: 'assets/img/team/name.jpg'` to any `TEAM` entry to replace the
  monogram. The layout does not change.
- **Preprint link.** Two disabled links, in the rail and in the hero, plus the BibTeX note.
- **Permanent image archive.** The corpus link is a placeholder pending a decision on whether the
  raw images are public or gated, and pending a DOI-backed archive to replace the working link.

There are no partner institutions, so the page carries no logo row. The University of Stirling
is credited in the footer.

## Conventions used on this page

Body copy follows the manuscript review decisions on wording. It does not equate a white skin
tone in an output with European identity where no race was named, it says "adversarial ordering"
rather than "hard test", and it says "labelling" rather than "coding".

**The title is deliberately excepted.** It is reproduced verbatim from the paper, including
"Default-European", by author decision on 2026-08-04. The body copy avoids that framing, so the
h1 and the prose currently phrase the same idea two ways. This is parked, not an oversight.

## Pending the next paper draft

Re-sync is deferred until the next manuscript version is built. When it lands, check these
against it, in this order. Nothing else on the page depends on the paper's wording.

1. **Title** in `index.html` (the `h1`) and in the `<title>` / `og:title` meta tags.
2. **Terminology**, if the "default" framing is resolved in the manuscript: the body copy in
   `index.html` and the figure titles in `assets/figures.js` should end up saying it the same way.
3. **Figure and table numbers.** The page follows `FIGURE_MANIFEST.md` reading order: Figures 1-6,
   Table 1 = human validation, Table 2 = DSB. If the manuscript renumbers, update the `.fignum`
   spans in `index.html`. Note that a sample-image figure was planned as a new Figure 2, which
   would shift Figures 2-6 to 3-7.
4. **Any changed value.** Every figure's data lives in a plain array at the top of its function in
   `assets/figures.js`, and every caption names its source file. See the table above.
5. **Author list and order**, if it changes, in three places: the `.bylist` in `index.html`,
   `TEAM` in `assets/app.js`, and the BibTeX block.
