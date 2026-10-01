"""Derive the card's fixed Archivo face and metrics from the site's own WOFF2.
Run from the repository root with fonttools and brotli installed.
The font is SIL OFL 1.1, like the source; do not substitute another font.
"""
from pathlib import Path
import json
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parents[2]
font = TTFont(root / "site/static/fonts/archivo-roman.woff2")
font = instantiateVariableFont(font, {"wght": 850, "wdth": 72}, inplace=True)
font.flavor = None
font.save(root / "site/static/fonts/archivo-card.ttf")
widths = {chr(c): font["hmtx"].metrics[g][0] for c, g in font.getBestCmap().items()}
(root / "site/lib/card-font-metrics.json").write_text(json.dumps({"units": font["head"].unitsPerEm, "widths": widths}, ensure_ascii=False, separators=(",", ":")) + "\n")
