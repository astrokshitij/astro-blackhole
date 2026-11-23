import sys
from PIL import Image, ImageFilter, ImageChops
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
W, H = im.size
bg = Image.new("RGB", (W, H), (8, 9, 12))
# Soft rectangular fade so the clip dissolves into the page with no frame.
m = Image.new("L", (W, H), 0)
inset = int(min(W, H) * 0.07)
m.paste(255, (inset, inset, W - inset, H - inset))
m = m.filter(ImageFilter.GaussianBlur(inset * 0.7))
out = Image.composite(im, bg, m)
out = ImageChops.lighter(out, bg)
out.save(dst, quality=90)
