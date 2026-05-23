#!/usr/bin/env python3
"""
generate-icons.py — Regenerate placeholder icon assets for Bahamut OMS desktop.

Usage (from repo root):
    pip install Pillow
    python3 desktop/scripts/generate-icons.py

The script reads the brand SVG at assets/img/favicon.svg and renders it to
all required icon sizes for the NSIS installer, Win32 exe, and MSIX package.

Requirements:
    Pillow >= 9.0   (pip install Pillow)
"""
from __future__ import annotations

import os
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("ERROR: Pillow is required.  Install it with: pip install Pillow", file=sys.stderr)
    sys.exit(1)

REPO_ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets")

# Brand palette
BG_DARK = (15, 23, 42)       # #0f172a
BG_MID  = (30, 41, 59)       # #1e293b
RED_MID = (239, 68, 68)      # #ef4444


def draw_logo(img: Image.Image) -> None:
    """Render a simplified dragon-shield emblem onto *img* (in-place)."""
    w, h = img.size
    draw = ImageDraw.Draw(img)

    # Gradient background
    for y in range(h):
        t = y / h
        r = int(BG_DARK[0] + (BG_MID[0] - BG_DARK[0]) * t)
        g = int(BG_DARK[1] + (BG_MID[1] - BG_DARK[1]) * t)
        b = int(BG_DARK[2] + (BG_MID[2] - BG_DARK[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    cx, cy = w // 2, h // 2
    s = min(w, h)

    # Shield polygon
    shield = [
        (cx,                    int(cy - s * 0.42)),
        (int(cx + s * 0.34),    int(cy - s * 0.20)),
        (int(cx + s * 0.34),    int(cy + s * 0.05)),
        (cx,                    int(cy + s * 0.42)),
        (int(cx - s * 0.34),    int(cy + s * 0.05)),
        (int(cx - s * 0.34),    int(cy - s * 0.20)),
    ]
    draw.polygon(shield, fill=BG_MID, outline=(71, 85, 105))

    # Dragon flame (simplified)
    def fp(px: float, py: float) -> tuple[int, int]:
        return (int(cx + (px - 64) * s / 128), int(cy + (py - 64) * s / 128))

    dragon = [
        fp(77, 28), fp(56, 41), fp(70, 41), fp(48, 73),
        fp(64, 96), fp(62, 78), fp(80, 89), fp(73, 74),
        fp(88, 47), fp(85, 35),
    ]
    draw.polygon(dragon, fill=RED_MID)

    # Highlight dot (eye)
    ex, ey = fp(76, 43)
    r2 = max(2, s // 40)
    draw.ellipse([ex - r2, ey - r2, ex + r2, ey + r2], fill=(255, 241, 242))


def make_png(size: int, path: str) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_logo(img)
    img.save(path, "PNG")
    print(f"  {path}  ({size}×{size})")
    return img


def main() -> None:
    os.makedirs(ASSETS_DIR, exist_ok=True)
    msix_dir = os.path.join(ASSETS_DIR, "msix")
    os.makedirs(msix_dir, exist_ok=True)

    print("Generating PNG sizes…")
    sizes = [16, 32, 48, 64, 128, 256]
    imgs: dict[int, Image.Image] = {}
    for sz in sizes:
        imgs[sz] = make_png(sz, os.path.join(ASSETS_DIR, f"icon-{sz}.png"))

    # Master PNG
    imgs[256].save(os.path.join(ASSETS_DIR, "icon.png"), "PNG")
    print(f"  {os.path.join(ASSETS_DIR, 'icon.png')}  (256×256 master)")

    # Multi-resolution ICO
    ico_path = os.path.join(ASSETS_DIR, "icon.ico")
    imgs[256].save(ico_path, format="ICO", sizes=[(s, s) for s in sizes])
    print(f"  {ico_path}  (multi-res ICO: {sizes})")

    print("\nGenerating MSIX Store assets…")
    msix_sizes = {
        "Square44x44Logo.png":   (44,  44),
        "Square150x150Logo.png": (150, 150),
        "Wide310x150Logo.png":   (310, 150),
        "StoreLogo.png":         (50,  50),
        "SplashScreen.png":      (620, 300),
    }
    for name, (w, h) in msix_sizes.items():
        bg = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        bg_draw = ImageDraw.Draw(bg)
        for y in range(h):
            t = y / h
            r = int(BG_DARK[0] + (BG_MID[0] - BG_DARK[0]) * t)
            g = int(BG_DARK[1] + (BG_MID[1] - BG_DARK[1]) * t)
            b = int(BG_DARK[2] + (BG_MID[2] - BG_DARK[2]) * t)
            bg_draw.line([(0, y), (w, y)], fill=(r, g, b))

        side = min(w, h)
        closest = min((s for s in sizes if s >= side), default=256, key=lambda x: x)
        logo = imgs[closest].resize((side, side), Image.LANCZOS)
        offset_x = (w - side) // 2
        offset_y = (h - side) // 2
        bg.paste(logo, (offset_x, offset_y), logo)
        out = os.path.join(msix_dir, name)
        bg.save(out, "PNG")
        print(f"  {out}  ({w}×{h})")

    print("\nDone. All icon assets written to:", ASSETS_DIR)


if __name__ == "__main__":
    main()
