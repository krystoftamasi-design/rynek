"""Prepare local design assets without altering the supplied originals."""
from pathlib import Path
import shutil
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'rynek' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)

for source, target in [('Gambetta-Variable.ttf', 'gambetta.ttf'),
                       ('Satoshi-Variable.ttf', 'satoshi.ttf')]:
    shutil.copy2(ROOT / source, OUT / target)

with Image.open(ROOT / '04817cd8-c713-4f0d-838d-18aa519b51d4.png') as image:
    # The supplied panorama has white export margins above and below the photograph.
    image.crop((0, 109, image.width, 571)).convert('RGB').save(
        OUT / 'interier.webp', 'WEBP', quality=90)

for source, target in [('5d68ec10399e84520633f6ba01bd5f92.jpg', 'specialita.webp'),
                       ('39f48z.jpg', 'kuchyne.webp')]:
    with Image.open(ROOT / source) as image:
        image.convert('RGB').save(OUT / target, 'WEBP', quality=90)

# Preserve the actual supplied wordmark, including its custom R, not a substitute font.
subprocess.run(['pdftoppm', '-f', '1', '-singlefile', '-r', '144',
                '-x', '350', '-y', '170', '-W', '1460', '-H', '470',
                '-png', str(ROOT / 'web.pdf'), str(OUT / 'logo')], check=True)

# Extract the original navigation cutlery as one complete, unaltered motif.
# Coordinates are in pixels at 216 dpi (PDF crop: x=375, y=405, w=335, h=140 pt).
subprocess.run(['pdftoppm', '-f', '1', '-singlefile', '-r', '216',
                '-x', '1125', '-y', '1215', '-W', '1005', '-H', '420',
                '-png', str(ROOT / 'web.pdf'), str(OUT / 'nav-cutlery')], check=True)

# The small fork beside the section headings is a separate mark in the PDF.
# Render the full page first so the crop uses the same top-left coordinate system
# as the visual PDF reference.
subprocess.run(['pdftoppm', '-f', '1', '-singlefile', '-r', '144',
                '-png', str(ROOT / 'web.pdf'), str(OUT / 'pdf-source')], check=True)
with Image.open(OUT / 'pdf-source.png') as image:
    image.crop((1300, 2850, 2110, 3300)).crop((120, 260, 720, 380)).save(OUT / 'about-fork.png')
    # Extract the original white fork and knife motifs beside the speciality
    # photo, keeping the marks transparent so they can overlay any slide.
    def extract_white_mark(box, target):
        crop = image.crop(box).convert('RGBA')
        pixels = []
        for r, g, b, _ in crop.getdata():
            white = min(r, g, b) > 225 and max(r, g, b) - min(r, g, b) < 24
            pixels.append((255, 255, 255, 255 if white else 0))
        crop.putdata(pixels)
        bbox = crop.getchannel('A').getbbox()
        if bbox:
            left, top, right, bottom = bbox
            crop = crop.crop((max(0, left - 12), max(0, top - 12),
                              min(crop.width, right + 12), min(crop.height, bottom + 12)))
        crop.save(OUT / target)

    extract_white_mark((150, 6690, 520, 6885), 'speciality-prev.png')
    extract_white_mark((1550, 6690, 1940, 6885), 'speciality-next.png')
(OUT / 'pdf-source.png').unlink()

with Image.open(OUT / 'logo.png') as image:
    monogram = image.crop((381, 20, 772, 303)).convert('RGBA')
    # Keep only the connected R, excluding tiny fragments of adjacent logo letters.
    pixels = list(monogram.getdata())
    width, height = monogram.size
    remaining = {i for i, (r, g, b, _) in enumerate(pixels) if min(r, g, b) < 245}
    largest = set()
    while remaining:
        seed = remaining.pop()
        component = {seed}
        stack = [seed]
        while stack:
            i = stack.pop()
            x, y = i % width, i // width
            neighbors = []
            if x > 0: neighbors.append(i - 1)
            if x + 1 < width: neighbors.append(i + 1)
            if y > 0: neighbors.append(i - width)
            if y + 1 < height: neighbors.append(i + width)
            for neighbor in neighbors:
                if neighbor in remaining:
                    remaining.remove(neighbor)
                    component.add(neighbor)
                    stack.append(neighbor)
        if len(component) > len(largest): largest = component
    monogram.putdata([(r, g, b, 255 if i in largest else 0)
                      for i, (r, g, b, a) in enumerate(pixels)])
    monogram.save(OUT / 'monogram.png')

print('Prepared assets:', ', '.join(p.name for p in OUT.iterdir()))
