"""

Regenera lapiceros-virtudes.png — frase por color:

negro Prudencia · rojo Fortaleza · azul Templanza · verde Justicia

"""

from pathlib import Path



from PIL import Image, ImageDraw, ImageFont



ROOT = Path(__file__).resolve().parents[1]

BASE = ROOT / "scripts/regalos-src/lapiceros-base.png"

OUT = ROOT / "public/img/regalos/lapiceros-virtudes.png"



TEXT_LEFT = 200

TEXT_RIGHT = 645

SAMPLE_X = 668

COVER_HEIGHT = 92



PENS = [

    {"word": "PRUDENCIA", "yCenter": 248, "size": 40},

    {"word": "FORTALEZA", "yCenter": 434, "size": 38},

    {"word": "TEMPLANZA", "yCenter": 622, "size": 40},

    {"word": "JUSTICIA", "yCenter": 806, "size": 44},

]



FONT_CANDIDATES = [

    Path(r"C:\Windows\Fonts\georgiab.ttf"),

    Path(r"C:\Windows\Fonts\timesbd.ttf"),

    Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"),

]





def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:

    for path in FONT_CANDIDATES:

        if path.exists():

            return ImageFont.truetype(str(path), size)

    return ImageFont.load_default()





def sample_barrel_color(img: Image.Image, x: int, y: int) -> tuple[int, int, int]:

    w, h = img.size

    xs = [max(0, min(w - 1, x + dx)) for dx in (-2, 0, 2)]

    ys = [max(0, min(h - 1, y + dy)) for dy in (-1, 0, 1)]

    rs = gs = bs = 0

    count = 0

    for sy in ys:

        for sx in xs:

            r, g, b = img.getpixel((sx, sy))

            rs += r

            gs += g

            bs += b

            count += 1

    return rs // count, gs // count, bs // count





def main() -> None:

    if not BASE.exists():

        raise SystemExit(f"Falta {BASE}")



    img = Image.open(BASE).convert("RGB")

    draw = ImageDraw.Draw(img)



    for pen in PENS:

        font = load_font(pen["size"])

        top = pen["yCenter"] - COVER_HEIGHT // 2

        bottom = top + COVER_HEIGHT



        for y in range(top, bottom):

            color = sample_barrel_color(img, SAMPLE_X, y)

            draw.line([(TEXT_LEFT - 4, y), (TEXT_RIGHT, y)], fill=color)



        bbox = draw.textbbox((0, 0), pen["word"], font=font)

        th = bbox[3] - bbox[1]

        tx = TEXT_LEFT

        ty = pen["yCenter"] - th // 2 - bbox[1]

        draw.text((tx, ty), pen["word"], fill=(242, 242, 242), font=font)



    OUT.parent.mkdir(parents=True, exist_ok=True)

    img.save(OUT, optimize=True)

    print(f"Lapiceros OK -> {OUT}")





if __name__ == "__main__":

    main()


