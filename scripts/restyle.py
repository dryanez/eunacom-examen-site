"""Map the components' inline styles onto the design bundle's visual system.

The components were written with a rounded, shadow-heavy, slate-grey look. The
approved design is flat and institutional: blue-grey neutrals, 3px controls,
4-5px cards, hairline borders, barely-there shadows. This rewrites the literal
values in place so the inline-style idiom of the components is preserved.

Colour that carries meaning (right/wrong answer feedback, success states) is
kept and only re-toned; see SEMANTIC_FILES.

Run: python3 scripts/restyle.py
"""

import glob
import re
from pathlib import Path

# Slate/neutral palette -> the design's blue-greys.
COLORS = {
    "#e2e8f0": "#dae8f4",  # hairline borders
    "#cbd5e1": "#cfdeeb",  # input borders
    "#f8fafc": "#f6fafd",  # section tint
    "#f1f5f9": "#eef5fb",  # panel tint
    "#64748b": "#5f6b76",  # muted text
    "#475569": "#41556b",  # body text
    "#334155": "#41556b",
    "#1e293b": "#2f3e4d",  # strong text
    "#94a3b8": "#8195a7",  # subtle text
    "#f4f8fc": "#f6fafd",
    "#cde0f3": "#cfdeeb",
    "#1275d3": "#0b5ea8",  # the design has one blue, not two
    "#05223c": "#08365f",
    "#02182d": "#08365f",
    "#25d366": "#08365f",  # WhatsApp green is off-palette
    "#20ba5a": "#0b5ea8",
}

# Decorative green/amber panels -> design neutrals. Not applied to files where
# these colours encode correctness.
DECORATIVE = {
    "#f0fdf4": "#f6fafd", "#86efac": "#cfdeeb", "#166534": "#41556b",
    "#dcfce7": "#eef5fb", "#15803d": "#41556b", "#22c55e": "#0b5ea8",
    "#ecfdf5": "#f6fafd", "#a7f3d0": "#cfdeeb", "#059669": "#41556b",
    "#10b981": "#0b5ea8",
    "#fffbeb": "#eef5fb", "#fde68a": "#cfdeeb", "#92400e": "#41556b",
    "#f59e0b": "#0b5ea8", "#d97706": "#41556b",
    "#fef2f2": "#f6fafd", "#fee2e2": "#eef5fb", "#ef4444": "#0b5ea8",
    "#b91c1c": "#41556b",
}

# Files where green/red mean correct/incorrect — re-tone instead of removing.
SEMANTIC_FILES = {"FreeMockExamsSection.jsx"}
SEMANTIC = {
    "#22c55e": "#1f7a4d", "#15803d": "#1f7a4d", "#f0fdf4": "#f1f8f4",
    "#dcfce7": "#e6f2ea", "#ef4444": "#b3352c", "#b91c1c": "#8f2a23",
    "#fef2f2": "#fbf4f3", "#fee2e2": "#f6e7e5",
}

# Rounded corners -> the design's square-ish geometry. 50% (avatars, radios)
# and values already at 3-5px are left alone.
RADII = {
    "24px": "5px", "20px": "5px", "18px": "4px", "16px": "4px",
    "14px": "4px", "12px": "4px", "10px": "3px", "8px": "3px",
    "6px": "3px", "9999px": "3px",
}

SHADOWS = {
    "0 25px 50px -12px rgba(0, 0, 0, 0.25)": "0 18px 44px rgba(8,54,95,.22)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.3)": "0 18px 44px rgba(8,54,95,.22)",
    "0 20px 40px rgba(0,0,0,0.5)": "0 18px 44px rgba(8,54,95,.22)",
    "0 12px 30px rgba(8, 54, 95, 0.05)": "0 3px 14px rgba(8,54,95,.06)",
    "0 4px 14px rgba(0,0,0,0.04)": "0 3px 14px rgba(8,54,95,.06)",
    "0 16px 36px rgba(11, 94, 168, 0.15)": "0 3px 14px rgba(8,54,95,.10)",
    "0 10px 25px rgba(0,0,0,0.1)": "0 6px 20px rgba(8,54,95,.10)",
    "0 8px 30px rgba(11, 94, 168, 0.6)": "0 6px 20px rgba(8,54,95,.10)",
    "0 4px 10px rgba(11, 94, 168, 0.3)": "0 2px 10px rgba(8,54,95,.06)",
    "0 4px 20px rgba(8, 54, 95, 0.2)": "0 3px 14px rgba(8,54,95,.06)",
    "0 4px 10px rgba(8, 54, 95, 0.2)": "0 2px 10px rgba(8,54,95,.06)",
    "0 2px 8px rgba(8, 54, 95, 0.06)": "0 2px 10px rgba(8,54,95,.06)",
    "0 8px 20px rgba(0, 0, 0, 0.2)": "0 6px 20px rgba(8,54,95,.10)",
    "0 4px 10px rgba(0, 0, 0, 0.2)": "0 2px 10px rgba(8,54,95,.06)",
    "0 6px 18px rgba(11, 94, 168, 0.25)": "none",
    "0 4px 10px rgba(8, 54, 95, 0.15)": "none",
}


def restyle(path):
    text = original = Path(path).read_text(encoding="utf-8")
    name = Path(path).name

    palette = dict(COLORS)
    palette.update(SEMANTIC if name in SEMANTIC_FILES else DECORATIVE)
    for old, new in palette.items():
        text = re.sub(old, new, text, flags=re.I)

    def radius(m):
        value = m.group(2)
        return f"{m.group(1)}'{RADII.get(value, value)}'"

    text = re.sub(r"(borderRadius: )'([^']+)'", radius, text)

    for old, new in SHADOWS.items():
        text = text.replace(old, new)

    # Gradients are not part of this design language.
    text = re.sub(r"linear-gradient\([^)]*\)", "#08365f", text)

    if text != original:
        Path(path).write_text(text, encoding="utf-8")
        return True
    return False


def main():
    changed = [p for p in sorted(glob.glob("src/**/*.jsx", recursive=True)) if restyle(p)]
    for p in changed:
        print(f"restyled {p}")
    print(f"\n{len(changed)} files restyled")


if __name__ == "__main__":
    main()
