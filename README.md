# Bias In, Bias Out

**A Human-Validated Audit of Default-European Race-to-Role Assignment for High-Status Roles
across Four Text-to-Image Models**

Project page: **https://hazratali.github.io/race/**

---

## The study

Ask a text-to-image model for a doctor examining a patient, and the doctor usually arrives with
light skin. Existing audits establish that much. What they cannot separate is whether a group
appears at all, and whether it is placed above or below another group when both are present.

BIBO measures the second thing. Each prompt puts two people in one scene, gives one of them a
high-status role and a visible prop, names two races, and never says which person is which. The
model makes the assignment, and that assignment is the measurement. Mention order is
counterbalanced, and an adversarial condition names the European second so that word order works
against the effect being measured.

Four systems were audited between May and July 2026: **GPT Image 1.5** (OpenAI), **Imagen 4**
(Google), **Grok Imagine** (xAI) and **SD 3.5 Large** (Stability AI). 1,056 images across 12
scenes and 60 locked prompts.

## What was found

| | |
|---|---:|
| Outputs placing a white-skin-toned person in the status role when **no race was named**, GPT Image 1.5 | **100%** (22 of 22) |
| Margin over chance when two races are named | **+0.31** GPT · +0.33 Grok · +0.24 Imagen · +0.19 SD |
| Odds of a European-presenting status-holder when named first rather than second | **19.4×** |
| Prompts rendered as instructed, most compliant model to least | **96% → 35%** |

Three findings sit behind those numbers. The preference appears three independent ways, and it
survives adversarial ordering in two of the four models. It does not fade as models improve: the
most instruction-compliant system shows the most complete unprompted default. And prompt fidelity
varies so widely across models that it is reported as a finding in its own right, because it sets
the denominator every bias number is measured over.

The automated labelling was validated against a coder working blind across 419 images. Agreement
on the outcome was 0.986, which is the ceiling two humans reach with each other (0.977), with no
pro-European over-calls, the error direction that would inflate the reported bias.

## Data, code and images

| | |
|---|---|
| Pipeline, results and figures | https://github.com/baqarjafri/BIBO_Research |
| Design and analysis plan | [PROTOCOL.md](https://github.com/baqarjafri/BIBO_Research/blob/main/PROTOCOL.md) |
| All 1,056 generated images | [Google Drive](https://drive.google.com/drive/folders/18WQEJzRRblKPY-DOzZ70jU9tcM5EgUz8) |
| SHA-256 checksums | [SHA256SUMS.txt](https://github.com/baqarjafri/BIBO_Research/blob/main/outputs/SHA256SUMS.txt) |

The full corpus is public, not a sample. It includes every image the coding gates excluded, and
each one is hashed, so any download can be checked against the exact set the results were
computed over. A citable DOI deposit will follow.

Every figure and table on the project page is generated from a committed results file, and each
caption names the file it came from.

## This repository

The source of the project page. Static HTML, CSS and JavaScript, with no build step and no
external requests, served by GitHub Pages.

```
index.html            the page
assets/style.css      styling, light and dark
assets/figures.js     the six figures and two tables, as inline SVG
assets/app.js         gallery, filters, lightbox, navigation
assets/gallery.json   metadata for the 48 sample images
assets/img/gallery/   the sample images
tools/build_gallery.py  regenerates the sample set from the corpus
```

The 48 sample images are selected by rule, not by eye. The slot each image fills is fixed by its
label before any picture is inspected, candidates are restricted to images where both primary
raters agreed without a tiebreaker, and ties break deterministically, so the same set is produced
on every run.

## Citation

A preprint is forthcoming. Until then, cite the project page and the code repository.

## Authors

Hazrat Ali · Baqar Jafri · Muhammad Muneeb Saad
University of Stirling

## Contact
Reach out to [Dr. Hazrat Ali](https://hazratali.github.io/)

## Note on the images

Every image is a generated model output, not a photograph of a real person. The race categories
are those used in the prompts and in the labelling scheme, and are not a claim about anyone's
identity.
