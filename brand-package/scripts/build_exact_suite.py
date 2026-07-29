from __future__ import annotations

import base64
import io
import json
import math
import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parent.parent
SOURCE_INPUT = Path(
    r"C:\Users\JOEPIN~1\AppData\Local\Temp\codex-clipboard-dee931c7-6e51-4d7f-b0c3-a94e5f03cd56.png"
)
SOURCE_DIR = ROOT / "source"
PNG_DIR = ROOT / "exports" / "png"
SVG_DIR = ROOT / "exports" / "svg"
EPS_DIR = ROOT / "exports" / "eps"
SOCIAL_DIR = ROOT / "social-media"
ICON_DIR = ROOT / "digital-icons"
PDF_DIR = ROOT / "output" / "pdf"

NAVY = (10, 24, 50)
GOLD = (190, 150, 65)
IVORY = (247, 244, 237)
WHITE = (255, 255, 255)
BLACK = (17, 17, 17)


def ensure_dirs() -> None:
    for folder in [SOURCE_DIR, PNG_DIR, SVG_DIR, EPS_DIR, SOCIAL_DIR, ICON_DIR, PDF_DIR]:
        folder.mkdir(parents=True, exist_ok=True)


def remove_retired_lockups() -> None:
    """Remove previously generated Compact and Wordmark files from the official suite."""
    for folder in [PNG_DIR, SVG_DIR, EPS_DIR]:
        for pattern in ["compact-logo-*", "wordmark-*"]:
            for path in folder.rglob(pattern):
                if path.is_file():
                    path.unlink()


def background_to_alpha(image: Image.Image) -> Image.Image:
    """Remove only the supplied near-white field while retaining original logo pixels."""
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32)
    distance = np.sqrt(np.sum((255.0 - rgb) ** 2, axis=2))

    # Fully colored source pixels stay untouched. Edge pixels are unmatted
    # against the nearest of the sampled logo colors so the supplied white
    # field does not become a fringe on transparency.
    interior = distance >= 110.0
    visible = distance > 4.0
    gold_mask = classify_gold(rgb)

    navy_target = np.array(NAVY, dtype=np.float32)
    gold_target = np.array(GOLD, dtype=np.float32)
    targets = np.where(gold_mask[..., None], gold_target, navy_target)
    white_rgb = np.full_like(rgb, 255.0)
    numerator = np.sum((white_rgb - rgb) * (white_rgb - targets), axis=2)
    denominator = np.sum((white_rgb - targets) ** 2, axis=2)
    alpha_float = np.clip(numerator / np.maximum(denominator, 1.0), 0.0, 1.0)
    alpha_float[interior] = 1.0
    alpha_float[~visible] = 0.0

    clean_rgb = rgb.copy()
    edge = visible & ~interior
    clean_rgb[edge] = targets[edge]
    alpha = (alpha_float * 255.0).astype(np.uint8)
    rgba = np.dstack([clean_rgb.astype(np.uint8), alpha])
    return Image.fromarray(rgba, "RGBA")


def crop_alpha(image: Image.Image, padding: int = 0) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
    if not bbox:
        return image.copy()
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    return image.crop((left, top, right, bottom))


def padded(image: Image.Image, padding: int, fill=(0, 0, 0, 0)) -> Image.Image:
    out = Image.new("RGBA", (image.width + padding * 2, image.height + padding * 2), fill)
    out.alpha_composite(image, (padding, padding))
    return out


def classify_gold(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return (r > b * 1.28) & (g > b * 1.12) & (r > g * 1.02)


def reverse_artwork(image: Image.Image) -> Image.Image:
    """Keep exact geometry and gold pixels; change the navy treatment to white."""
    arr = np.asarray(image.convert("RGBA")).copy()
    visible = arr[..., 3] > 0
    gold_mask = classify_gold(arr[..., :3].astype(np.float32)) & visible
    non_gold = visible & ~gold_mask
    arr[non_gold, 0] = 255
    arr[non_gold, 1] = 255
    arr[non_gold, 2] = 255
    return Image.fromarray(arr, "RGBA")


def monochrome(image: Image.Image, color: tuple[int, int, int]) -> Image.Image:
    alpha = image.getchannel("A")
    out = Image.new("RGBA", image.size, color + (0,))
    out.putalpha(alpha)
    return out


def composite(image: Image.Image, background: tuple[int, int, int], padding: int = 0) -> Image.Image:
    source = padded(image, padding) if padding else image
    out = Image.new("RGBA", source.size, background + (255,))
    out.alpha_composite(source)
    return out.convert("RGB")


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG", optimize=True)


def svg_wrapper(image: Image.Image, label: str) -> str:
    buffer = io.BytesIO()
    image.save(buffer, "PNG", optimize=True)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{image.width}" height="{image.height}" viewBox="0 0 {image.width} {image.height}"
     role="img" aria-label="{label}">
  <image width="{image.width}" height="{image.height}"
         href="data:image/png;base64,{encoded}"
         xlink:href="data:image/png;base64,{encoded}"/>
</svg>
"""


def save_svg(image: Image.Image, path: Path, label: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(svg_wrapper(image, label), encoding="utf-8")


def save_eps(image: Image.Image, path: Path, background: tuple[int, int, int]) -> None:
    """Write an EPS that preserves the exact source artwork as embedded RGB pixels."""
    rgb = composite(image, background)
    width, height = rgb.size
    raw_hex = rgb.tobytes().hex().upper()
    lines = [raw_hex[index : index + 120] for index in range(0, len(raw_hex), 120)]
    header = f"""%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 {width} {height}
%%HiResBoundingBox: 0 0 {width} {height}
%%Title: Three Doors Property Group exact-artwork logo
%%Creator: Three Doors Property Group Brand Package
%%LanguageLevel: 2
%%Pages: 1
%%EndComments
/picstr {width * 3} string def
{width} {height} 8
[{width} 0 0 -{height} 0 {height}]
{{ currentfile picstr readhexstring pop }}
false 3 colorimage
"""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(header + "\n".join(lines) + "\n>\nshowpage\n%%EOF\n", encoding="ascii")


def crop_component(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    return crop_alpha(image.crop(box), padding=0)


def stack_centered(parts: list[Image.Image], gaps: list[int], side_padding: int = 40) -> Image.Image:
    width = max(part.width for part in parts) + side_padding * 2
    height = sum(part.height for part in parts) + sum(gaps) + side_padding * 2
    out = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    y = side_padding
    for index, part in enumerate(parts):
        x = (width - part.width) // 2
        out.alpha_composite(part, (x, y))
        y += part.height
        if index < len(gaps):
            y += gaps[index]
    return out


def side_by_side(left: Image.Image, right_parts: list[Image.Image], gap: int = 34, padding: int = 30) -> Image.Image:
    right_width = max(part.width for part in right_parts)
    right_height = sum(part.height for part in right_parts) + 16 * (len(right_parts) - 1)
    height = max(left.height, right_height) + padding * 2
    width = left.width + gap + right_width + padding * 2
    out = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    out.alpha_composite(left, (padding, (height - left.height) // 2))
    x = padding + left.width + gap
    y = (height - right_height) // 2
    for part in right_parts:
        out.alpha_composite(part, (x + (right_width - part.width) // 2, y))
        y += part.height + 16
    return out


def add_asset(
    name: str,
    image: Image.Image,
    *,
    eps_background: tuple[int, int, int] = WHITE,
    png_subdir: str = "",
) -> None:
    png_path = PNG_DIR / png_subdir / f"{name}.png"
    save_png(image, png_path)
    save_svg(image, SVG_DIR / f"{name}.svg", f"Three Doors Property Group {name.replace('-', ' ')}")
    save_eps(image, EPS_DIR / f"{name}.eps", eps_background)


def make_square_avatar(art: Image.Image, background: tuple[int, int, int], size: int = 1080) -> Image.Image:
    out = Image.new("RGBA", (size, size), background + (255,))
    max_w = int(size * 0.62)
    max_h = int(size * 0.72)
    scale = min(max_w / art.width, max_h / art.height)
    resized = art.resize((round(art.width * scale), round(art.height * scale)), Image.Resampling.LANCZOS)
    out.alpha_composite(resized, ((size - resized.width) // 2, (size - resized.height) // 2))
    return out


def make_social_cover(lockup: Image.Image, size=(1500, 500)) -> Image.Image:
    out = Image.new("RGBA", size, NAVY + (255,))
    max_w = int(size[0] * 0.78)
    max_h = int(size[1] * 0.64)
    scale = min(max_w / lockup.width, max_h / lockup.height)
    resized = lockup.resize((round(lockup.width * scale), round(lockup.height * scale)), Image.Resampling.LANCZOS)
    out.alpha_composite(resized, ((size[0] - resized.width) // 2, (size[1] - resized.height) // 2))
    return out


def draw_brand_guide(assets: dict[str, Image.Image]) -> Path:
    output = PDF_DIR / "Three-Doors-Property-Group-Brand-Guidelines.pdf"
    page_w, page_h = landscape(letter)
    margin = 46

    pdfmetrics.registerFont(TTFont("Georgia", r"C:\Windows\Fonts\georgia.ttf"))
    pdfmetrics.registerFont(TTFont("Georgia-Bold", r"C:\Windows\Fonts\georgiab.ttf"))
    pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
    pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))

    c = canvas.Canvas(str(output), pagesize=(page_w, page_h))
    navy = HexColor("#0A1832")
    gold = HexColor("#BE9641")
    ivory = HexColor("#F7F4ED")
    slate = HexColor("#546174")

    def page(background=white, number=None):
        c.setFillColor(background)
        c.rect(0, 0, page_w, page_h, stroke=0, fill=1)
        if number:
            c.setFillColor(navy)
            c.setFont("Arial", 8)
            c.drawString(margin, 20, "THREE DOORS PROPERTY GROUP | BRAND IDENTITY")
            c.drawRightString(page_w - margin, 20, f"{number:02d}")

    def heading(text, sub=None, light=False):
        c.setFillColor(white if light else navy)
        c.setFont("Georgia-Bold", 25)
        c.drawString(margin, page_h - 62, text)
        if sub:
            c.setFillColor(gold if light else slate)
            c.setFont("Arial", 10)
            c.drawString(margin, page_h - 82, sub)

    def image_contain(img: Image.Image, x, y, w, h):
        scale = min(w / img.width, h / img.height)
        dw, dh = img.width * scale, img.height * scale
        c.drawImage(ImageReader(img), x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")

    def text_block(text, x, y, w, h, color=slate, size=9.5, leading=14, align=0):
        style = ParagraphStyle(
            "body",
            fontName="Arial",
            fontSize=size,
            leading=leading,
            textColor=color,
            alignment=align,
        )
        p = Paragraph(text, style)
        p.wrapOn(c, w, h)
        p.drawOn(c, x, y)

    def logo_card(label, img, x, y, w, h, dark=False):
        c.setFillColor(navy if dark else ivory)
        c.roundRect(x, y, w, h, 14, stroke=0, fill=1)
        image_contain(img, x + 18, y + 28, w - 36, h - 50)
        c.setFillColor(gold if dark else slate)
        c.setFont("Arial-Bold", 8)
        c.drawString(x + 14, y + 10, label.upper())

    # Cover
    page(navy)
    c.setFillColor(gold)
    c.rect(0, 0, 18, page_h, stroke=0, fill=1)
    image_contain(assets["full_reverse"], 74, 175, 640, 205)
    c.setFillColor(gold)
    c.setFont("Arial-Bold", 13)
    c.drawString(86, 116, "EXACT-ARTWORK LOGO SUITE + BRAND IDENTITY")
    c.setFillColor(white)
    c.setFont("Arial", 10)
    c.drawString(86, 92, "Prepared for Matt Brown | Original logo preserved")
    c.showPage()

    # Foundation
    page(number=2)
    heading("Brand foundation", "A consistent system built around the existing Three Doors artwork.")
    c.setFillColor(navy)
    c.roundRect(margin, 104, 302, 330, 16, stroke=0, fill=1)
    c.setFillColor(gold)
    c.setFont("Georgia-Bold", 27)
    c.drawString(72, 360, "Three options.")
    c.setFillColor(white)
    c.drawString(72, 318, "One trusted partner.")
    text_block(
        "The suite preserves the supplied logo's mark, wording, typography, proportions, gradients, and tagline. Only production treatments - background removal, exact cropping, approved color reversal, and layout packaging - have been applied.",
        72,
        154,
        250,
        132,
        color=white,
        size=10.5,
        leading=16,
    )
    principles = [
        ("TRUSTED", "Calm, dependable, and clear."),
        ("CHOICE-DRIVEN", "Three paths presented without pressure."),
        ("SOLUTIONS-FIRST", "Practical guidance for real property needs."),
        ("HUMAN", "Approachable, local, and partnership-oriented."),
    ]
    y = 374
    for label, body in principles:
        c.setFillColor(gold)
        c.circle(402, y + 3, 5, stroke=0, fill=1)
        c.setFillColor(navy)
        c.setFont("Arial-Bold", 10.5)
        c.drawString(420, y, label)
        c.setFillColor(slate)
        c.setFont("Arial", 10)
        c.drawString(420, y - 18, body)
        y -= 72
    c.showPage()

    # Lockups
    page(number=3)
    heading("Logo suite", "Three official logo families, all built directly from the supplied artwork.")
    logo_card("Primary logo", assets["full_color"], 46, 292, 698, 162)
    logo_card("Vertical logo", assets["vertical_color"], 46, 82, 330, 174)
    logo_card("Icon", assets["icon_color"], 414, 82, 330, 174)
    c.showPage()

    # Light/dark
    page(number=4)
    heading("Light and dark use", "The full-color source is used on light fields; geometry is unchanged in the reverse treatment.")
    logo_card("Original color on ivory", assets["full_on_ivory"], 46, 286, 698, 168)
    logo_card("White-and-gold reverse on navy", assets["full_on_navy"], 46, 80, 698, 168, dark=True)
    c.showPage()

    # Color
    page(number=5)
    heading("Brand colors", "Navy and gold values were sampled from the supplied artwork and standardized.")
    swatches = [
        ("THREE DOORS NAVY", navy, "#0A1832", "RGB 10 / 24 / 50", "CMYK approx. 80 / 52 / 0 / 80", white),
        ("THREE DOORS GOLD", gold, "#BE9641", "RGB 190 / 150 / 65", "CMYK approx. 0 / 21 / 66 / 25", navy),
        ("WARM IVORY", ivory, "#F7F4ED", "RGB 247 / 244 / 237", "CMYK approx. 0 / 1 / 4 / 3", navy),
    ]
    x = 46
    for name, fill, hex_value, rgb, cmyk, ink in swatches:
        c.setFillColor(fill)
        c.roundRect(x, 118, 220, 320, 16, stroke=0, fill=1)
        c.setFillColor(ink)
        c.setFont("Arial-Bold", 10.5)
        c.drawString(x + 19, 226, name)
        c.setFont("Georgia-Bold", 22)
        c.drawString(x + 19, 188, hex_value)
        c.setFont("Arial", 9.2)
        c.drawString(x + 19, 158, rgb)
        c.drawString(x + 19, 140, cmyk)
        x += 239
    c.showPage()

    # Usage
    page(number=6)
    heading("Usage standards", "Protect the supplied artwork and use the packaged files as delivered.")
    cards = [
        ("CLEAR SPACE", "Keep open space around the logo equal to the visible width of the gold door."),
        ("LIGHT SURFACES", "Use the original full-color file on white, ivory, or other pale backgrounds."),
        ("DARK SURFACES", "Use the packaged white-and-gold reverse file on navy or suitably dark photography."),
        ("SMALL SIZES", "Use the Primary logo while its tagline remains readable, then switch directly to the Icon."),
        ("ONE COLOR", "Use navy, black, white, or gold monochrome files for limited-color production."),
        ("DO NOT ALTER", "Do not redraw, retype, stretch, rotate, recolor, add effects, or change the proportions."),
    ]
    positions = [(46, 282), (292, 282), (538, 282), (46, 88), (292, 88), (538, 88)]
    for (label, body), (x, y) in zip(cards, positions):
        c.setFillColor(ivory)
        c.roundRect(x, y, 210, 156, 14, stroke=0, fill=1)
        c.setFillColor(gold)
        c.setFont("Arial-Bold", 10)
        c.drawString(x + 18, y + 118, label)
        text_block(body, x + 18, y + 28, 174, 76, color=navy, size=9.3, leading=13.5)
    c.showPage()

    # Formats
    page(number=7)
    heading("Package handoff", "Everyday files, vendor files, and reusable digital assets.")
    columns = [
        ("PNG", "Transparent full-color, reverse, and monochrome artwork for presentations, websites, email, and social media."),
        ("SVG", "Exact-artwork SVG wrappers that preserve the supplied logo pixel-for-pixel without introducing a new trace or redraw."),
        ("EPS", "Exact-artwork EPS files for print handoff, supplied on the intended light or dark background because EPS does not support modern alpha transparency."),
    ]
    x = 46
    for label, body in columns:
        c.setFillColor(navy)
        c.roundRect(x, 232, 220, 210, 14, stroke=0, fill=1)
        c.setFillColor(gold)
        c.setFont("Georgia-Bold", 26)
        c.drawString(x + 20, 382, label)
        text_block(body, x + 20, 262, 180, 94, color=white, size=9.5, leading=14)
        x += 239
    c.setFillColor(gold)
    c.setFont("Arial-Bold", 10)
    c.drawString(48, 170, "IMPORTANT PRODUCTION NOTE")
    text_block(
        "The supplied master is raster artwork. To honor the instruction not to recreate or reinterpret it, the SVG and EPS deliverables embed the exact original artwork rather than substituting an automatic vector trace. If a future vendor requires editable outlined paths, authorize a separate faithful tracing project and compare proofs against this package.",
        48,
        96,
        696,
        64,
        color=slate,
        size=9.5,
        leading=14,
    )
    c.showPage()

    c.save()
    return output


def main() -> None:
    ensure_dirs()
    remove_retired_lockups()
    if not SOURCE_INPUT.exists():
        raise FileNotFoundError(f"Supplied logo was not found: {SOURCE_INPUT}")

    original = Image.open(SOURCE_INPUT).convert("RGB")
    shutil.copy2(SOURCE_INPUT, SOURCE_DIR / "original-supplied-logo.png")

    transparent_full_canvas = background_to_alpha(original)
    full_color = padded(crop_alpha(transparent_full_canvas), 34)
    full_reverse = reverse_artwork(full_color)

    # Exact crops from the supplied 1536 x 1024 source. No artwork is retyped.
    icon_color = padded(crop_component(transparent_full_canvas, (132, 286, 540, 682)), 24)
    name_color = padded(crop_component(transparent_full_canvas, (535, 386, 1410, 510)), 8)
    property_color = padded(crop_component(transparent_full_canvas, (535, 500, 1410, 578)), 8)
    tagline_color = padded(crop_component(transparent_full_canvas, (590, 568, 1370, 644)), 8)

    vertical_color = stack_centered([icon_color, name_color, property_color, tagline_color], [24, 12, 18], side_padding=40)

    assets = {
        "full_color": full_color,
        "full_reverse": full_reverse,
        "vertical_color": vertical_color,
        "icon_color": icon_color,
        "full_on_ivory": composite(full_color, IVORY, padding=14).convert("RGBA"),
        "full_on_navy": composite(full_reverse, NAVY, padding=14).convert("RGBA"),
    }

    add_asset("full-logo-full-color-transparent", full_color)
    add_asset("full-logo-reverse-transparent", full_reverse, eps_background=NAVY)
    add_asset("full-logo-one-color-navy", monochrome(full_color, NAVY))
    add_asset("full-logo-one-color-black", monochrome(full_color, BLACK))
    add_asset("full-logo-one-color-white", monochrome(full_color, WHITE), eps_background=NAVY)
    add_asset("full-logo-one-color-gold", monochrome(full_color, GOLD))

    add_asset("vertical-logo-full-color-transparent", vertical_color)
    add_asset("vertical-logo-reverse-transparent", reverse_artwork(vertical_color), eps_background=NAVY)
    add_asset("vertical-logo-one-color-navy", monochrome(vertical_color, NAVY))
    add_asset("vertical-logo-one-color-white", monochrome(vertical_color, WHITE), eps_background=NAVY)

    add_asset("icon-full-color-transparent", icon_color)
    add_asset("icon-reverse-transparent", reverse_artwork(icon_color), eps_background=NAVY)
    add_asset("icon-one-color-navy", monochrome(icon_color, NAVY))
    add_asset("icon-one-color-white", monochrome(icon_color, WHITE), eps_background=NAVY)
    add_asset("icon-one-color-gold", monochrome(icon_color, GOLD))

    save_eps(full_color, EPS_DIR / "full-logo-full-color-on-white.eps", WHITE)
    save_eps(full_reverse, EPS_DIR / "full-logo-reverse-on-navy.eps", NAVY)
    save_eps(vertical_color, EPS_DIR / "vertical-logo-full-color-on-white.eps", WHITE)
    save_eps(reverse_artwork(vertical_color), EPS_DIR / "vertical-logo-reverse-on-navy.eps", NAVY)

    save_png(composite(full_color, WHITE, padding=14), PNG_DIR / "backgrounds" / "full-logo-on-white.png")
    save_png(composite(full_color, IVORY, padding=14), PNG_DIR / "backgrounds" / "full-logo-on-ivory.png")
    save_png(composite(full_reverse, NAVY, padding=14), PNG_DIR / "backgrounds" / "full-logo-reverse-on-navy.png")

    avatar_navy = make_square_avatar(reverse_artwork(icon_color), NAVY)
    avatar_gold = make_square_avatar(monochrome(icon_color, NAVY), GOLD)
    avatar_ivory = make_square_avatar(icon_color, IVORY)
    cover = make_social_cover(full_reverse)
    save_png(avatar_navy, SOCIAL_DIR / "social-avatar-navy-1080.png")
    save_png(avatar_gold, SOCIAL_DIR / "social-avatar-gold-1080.png")
    save_png(avatar_ivory, SOCIAL_DIR / "social-avatar-ivory-1080.png")
    save_png(cover, SOCIAL_DIR / "social-cover-navy-1500x500.png")

    icon_outputs = {}
    for size in [16, 32, 48, 64, 180, 192, 512]:
        scale = min(size * 0.82 / icon_color.width, size * 0.82 / icon_color.height)
        resized = icon_color.resize(
            (max(1, round(icon_color.width * scale)), max(1, round(icon_color.height * scale))),
            Image.Resampling.LANCZOS,
        )
        icon_canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        icon_canvas.alpha_composite(resized, ((size - resized.width) // 2, (size - resized.height) // 2))
        save_png(icon_canvas, ICON_DIR / f"three-doors-icon-{size}.png")
        icon_outputs[size] = icon_canvas

    icon_outputs[512].save(
        ICON_DIR / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    (ICON_DIR / "site.webmanifest").write_text(
        json.dumps(
            {
                "name": "Three Doors Property Group",
                "short_name": "Three Doors",
                "icons": [
                    {
                        "src": "three-doors-icon-192.png",
                        "sizes": "192x192",
                        "type": "image/png",
                    },
                    {
                        "src": "three-doors-icon-512.png",
                        "sizes": "512x512",
                        "type": "image/png",
                    },
                ],
                "theme_color": "#0A1832",
                "background_color": "#F7F4ED",
                "display": "standalone",
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    tokens = {
        "brand": "Three Doors Property Group",
        "tagline": "Three options. One trusted partner",
        "sourcePolicy": "Original supplied artwork preserved; no logo redraw or retyping.",
        "colors": {
            "threeDoorsNavy": {"hex": "#0A1832", "rgb": list(NAVY)},
            "threeDoorsGold": {"hex": "#BE9641", "rgb": list(GOLD)},
            "warmIvory": {"hex": "#F7F4ED", "rgb": list(IVORY)},
        },
    }
    (SOURCE_DIR / "brand-tokens.json").write_text(json.dumps(tokens, indent=2), encoding="utf-8")
    (SOURCE_DIR / "brand-colors.css").write_text(
        """:root {
  --three-doors-navy: #0a1832;
  --three-doors-gold: #be9641;
  --three-doors-ivory: #f7f4ed;
  --three-doors-white: #ffffff;
}
""",
        encoding="utf-8",
    )

    guide_assets = dict(assets)
    guide_assets["full_on_ivory"] = composite(full_color, IVORY, padding=14).convert("RGBA")
    guide_assets["full_on_navy"] = composite(full_reverse, NAVY, padding=14).convert("RGBA")
    guide = draw_brand_guide(guide_assets)
    print(f"Built exact-artwork suite at: {ROOT}")
    print(f"Brand guide: {guide}")


if __name__ == "__main__":
    main()
