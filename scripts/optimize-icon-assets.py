from pathlib import Path

from PIL import Image


ASSET_DIR = Path(__file__).resolve().parents[1] / "assets" / "images"
ASSETS = (
    "icon.png",
    "splash-icon.png",
    "favicon.png",
    "android-icon-foreground.png",
)


def optimize_icon(path: Path) -> None:
    with Image.open(path) as source:
        image = source.convert("RGBA")
        image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        optimized = image.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
        optimized.save(path, format="PNG", optimize=True, compress_level=9)


def main() -> None:
    for name in ASSETS:
        path = ASSET_DIR / name
        optimize_icon(path)
        print(f"{path.name}: {path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
