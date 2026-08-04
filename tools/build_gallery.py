"""Select and export the 48 gallery images for the BIBO project page.

Selection protocol, applied in this order:

  1. Slot definition. What each card must show is fixed by the labelled outcome
     BEFORE any image is looked at. Selection never chooses an outcome.
  2. Legibility screen. Candidates are restricted to consensus_label ==
     'high_confidence_AB', meaning both independent primary raters agreed with
     no tiebreaker. Images that needed a third rater are the ambiguous ones and
     are kept out of the public gallery.
  3. Deterministic ordering. Ties are broken by sorting on image_id, so the
     same 48 images come out on every run.

A human visual pass over the generated contact sheet is step 4 and happens
outside this script.

Run:  python tools/build_gallery.py
"""
import json
import sys
from pathlib import Path

import pandas as pd
from PIL import Image

BIBO = Path(r"c:\Users\Ghulam\ClaudeCodeProjects\Dr Hazrat Ali Project\bibo")
SITE = Path(__file__).resolve().parent.parent
IMG = SITE / "assets" / "img" / "gallery"
IMG.mkdir(parents=True, exist_ok=True)

THUMB_PX, FULL_PX = 340, 900

MODEL_LABEL = {
    "gpt-image-1.5": "GPT Image 1.5",
    "grok-imagine-image": "Grok Imagine",
    "imagen-4.0-generate-001": "Imagen 4",
    "sd3.5-large": "SD 3.5 Large",
}
MODEL_KEY = {
    "gpt-image-1.5": "gpt", "grok-imagine-image": "grok",
    "imagen-4.0-generate-001": "imagen", "sd3.5-large": "sd",
}
GATE_LABEL = {
    "RACE_COLLAPSE": "Both people rendered as one race",
    "EXCLUDE_NUMPEOPLE": "Wrong number of people",
    "EXCLUDE_PROPMISSING": "Status prop missing",
    "OUT_OF_SET": "A race outside the prompted pair",
    "EXCLUDE_UNCLEAR": "Could not be labelled",
    "REFUSAL": "Model refused the prompt",
}


def load():
    coded = pd.read_parquet(BIBO / "outputs/coded_outcomes.parquet")
    man = pd.read_parquet(BIBO / "outputs/manifest.parquet")[[
        "image_id", "image_path", "prompt_text", "high_role", "low_role",
        "race_first_mentioned", "race_second_mentioned", "image_sha256", "iteration"]]
    d = coded.merge(man, on="image_id")
    d["is_baseline"] = d.prompt_id.str.contains("BASELINE")
    d["clear"] = d.consensus_label == "high_confidence_AB"
    return d.sort_values("image_id").reset_index(drop=True)


def export(row, slot, group):
    src = BIBO / row.image_path
    im = Image.open(src).convert("RGB")
    im.resize((FULL_PX, FULL_PX), Image.LANCZOS).save(
        IMG / f"{slot}.webp", "WEBP", quality=78, method=6)
    im.resize((THUMB_PX, THUMB_PX), Image.LANCZOS).save(
        IMG / f"{slot}_t.webp", "WEBP", quality=72, method=6)

    if row.is_baseline:
        condition, order = "No race named in the prompt", None
    else:
        condition = f"{row.race_first_mentioned} named first"
        order = row.mention_order

    if row.code == "EUROPEAN_HS":
        outcome, kind = "The European-presenting person holds the status prop", "euro"
    elif row.code == "NON_EUROPEAN_HS":
        outcome, kind = "The non-European person holds the status prop", "noneuro"
    else:
        outcome, kind = GATE_LABEL.get(row.code, row.code), "excluded"

    if row.is_baseline:
        outcome = (f"Status-prop holder rendered with a "
                   f"{'white' if row.holder_race == 'European' else 'non-white'} skin tone")
        kind = "baseline"

    return {
        "slot": slot, "group": group,
        "thumb": f"assets/img/gallery/{slot}_t.webp",
        "full": f"assets/img/gallery/{slot}.webp",
        "model": MODEL_LABEL[row.model], "modelKey": MODEL_KEY[row.model],
        "scene": f"{row.high_role} and {row.low_role}", "sceneId": int(row.scene_id),
        "condition": condition, "order": order,
        "racePair": None if row.is_baseline else row.race_pair,
        "code": row.code, "outcome": outcome, "kind": kind,
        "prompt": row.prompt_text, "sha256": row.image_sha256[:12],
    }


def main():
    d = load()
    picked, cards, log = set(), [], []

    def take(sub, slot, group):
        sub = sub[~sub.image_id.isin(picked)]
        if not len(sub):
            return False
        r = sub.iloc[0]
        picked.add(r.image_id)
        cards.append(export(r, slot, group))
        return True

    # GROUP 1 - no race named (8). Two per model.
    for mk, m in MODEL_KEY.items():
        sub = d[d.is_baseline & (d.model == mk) & d.clear
                & (d.holder_race == "European")]
        for i in range(2):
            take(sub, f"base_{m}_{i}", "baseline")
    log.append(("No race named", sum(c["group"] == "baseline" for c in cards)))

    # GROUP 2 - order-flip pairs (16). Same model and scene, O1 next to O2,
    # both valid and both unambiguous. Two pairs per model.
    n_flip = 0
    for mk, m in MODEL_KEY.items():
        found = 0
        for scene in sorted(d.scene_id.unique()):
            if found >= 2:
                break
            cand = d[(d.model == mk) & (d.scene_id == scene) & d.clear
                     & (~d.is_baseline)
                     & (d.code.isin(["EUROPEAN_HS", "NON_EUROPEAN_HS"]))]
            o1 = cand[cand.mention_order == "O1"]
            o2 = cand[cand.mention_order == "O2"]
            if len(o1) and len(o2):
                take(o1, f"flip_{m}_{scene}_O1", "flip")
                take(o2, f"flip_{m}_{scene}_O2", "flip")
                found += 1
                n_flip += 2
    log.append(("Order flip pairs", n_flip))

    # GROUP 3 - one valid two-race image per scene (12), rotating models so no
    # single model dominates the spread.
    models = list(MODEL_KEY)
    n_spread = 0
    for i, scene in enumerate(sorted(d.scene_id.unique())):
        for off in range(len(models)):
            mk = models[(i + off) % len(models)]
            sub = d[(d.model == mk) & (d.scene_id == scene) & d.clear
                    & (~d.is_baseline) & (d.code == "EUROPEAN_HS")]
            if take(sub, f"scene_{scene:02d}", "spread"):
                n_spread += 1
                break
    log.append(("Two-race spread", n_spread))

    # GROUP 4 - fidelity failures (8), spread across gate types and models.
    n_fail = 0
    for gate in ["RACE_COLLAPSE", "EXCLUDE_NUMPEOPLE", "EXCLUDE_PROPMISSING", "OUT_OF_SET"]:
        for mk, m in MODEL_KEY.items():
            if n_fail >= 8:
                break
            sub = d[(d.model == mk) & (d.code == gate) & (~d.is_baseline)]
            if take(sub, f"fail_{gate.lower()}_{m}", "failure"):
                n_fail += 1
    log.append(("Fidelity failures", n_fail))

    # GROUP 5 - counter-examples (4). The non-European holds the status prop.
    n_ctr = 0
    for mk, m in MODEL_KEY.items():
        sub = d[(d.model == mk) & (d.code == "NON_EUROPEAN_HS") & d.clear
                & (~d.is_baseline)]
        if take(sub, f"counter_{m}", "counter"):
            n_ctr += 1
    log.append(("Counter-examples", n_ctr))

    out = SITE / "assets" / "gallery.json"
    out.write_text(json.dumps(cards, indent=1), encoding="utf8")

    total = sum(f.stat().st_size for f in IMG.glob("*.webp"))
    print(f"{'GROUP':<22}{'N':>4}")
    for name, n in log:
        print(f"{name:<22}{n:>4}")
    print(f"{'TOTAL':<22}{len(cards):>4}")
    print(f"\nunique images: {len(picked)}  (no duplicates: {len(picked) == len(cards)})")
    print(f"assets: {total/1024/1024:.2f} MB in {IMG}")
    print(f"metadata: {out}")

    if len(cards) != 48:
        print(f"\nWARNING: expected 48 cards, produced {len(cards)}", file=sys.stderr)


if __name__ == "__main__":
    main()
