"""Finish rendered clips for the web.

For each clip folder: fade the frame edges to black (the page shows through
with `mix-blend-mode: lighten`, so there is no visible frame), encode an
all-keyframe H.264 MP4 (Safari) and VP9 WebM (Chrome, Firefox) so scroll scrubbing can jump to any frame instantly,
and export first/last frames as JPEG posters.

Usage: python3 encode.py <clips_dir> <repo_root>
"""
import os, subprocess, sys, tempfile
from PIL import Image, ImageFilter

clips, repo = sys.argv[1], sys.argv[2]
video_dir = os.path.join(repo, "public", "videos", "journey")
poster_dir = os.path.join(repo, "public", "images", "light-journey")
os.makedirs(video_dir, exist_ok=True)
os.makedirs(poster_dir, exist_ok=True)

mask_cache = {}


def edge_mask(size):
    if size not in mask_cache:
        W, H = size
        inset = int(min(W, H) * 0.06)
        m = Image.new("L", size, 0)
        m.paste(255, (inset, inset, W - inset, H - inset))
        mask_cache[size] = m.filter(ImageFilter.GaussianBlur(inset * 0.75))
    return mask_cache[size]


for k in range(6):
    src = os.path.join(clips, f"clip{k}")
    if not os.path.isdir(src):
        continue
    frames = sorted(f for f in os.listdir(src) if f.endswith(".png"))
    if not frames:
        continue
    with tempfile.TemporaryDirectory() as tmp:
        for i, name in enumerate(frames):
            im = Image.open(os.path.join(src, name)).convert("RGB")
            black = Image.new("RGB", im.size, (0, 0, 0))
            out = Image.composite(im, black, edge_mask(im.size))
            out.save(os.path.join(tmp, f"g_{i:03d}.png"))
            if i == 0:
                out.save(os.path.join(poster_dir, f"clip-{k}-first.jpg"), quality=86)
            if i == len(frames) - 1:
                out.save(os.path.join(poster_dir, f"clip-{k}-last.jpg"), quality=86)
        dst = os.path.join(video_dir, f"clip-{k}.mp4")
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error", "-framerate", "24",
            "-i", os.path.join(tmp, "g_%03d.png"),
            "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-g", "1",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", dst,
        ], check=True)
        webm = os.path.join(video_dir, f"clip-{k}.webm")
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error", "-framerate", "24",
            "-i", os.path.join(tmp, "g_%03d.png"),
            "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "32", "-g", "1",
            "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
            "-pix_fmt", "yuv420p", "-an", webm,
        ], check=True)
        print(f"clip {k}: {len(frames)} frames, mp4 {os.path.getsize(dst) / 1e6:.2f} MB, webm {os.path.getsize(webm) / 1e6:.2f} MB")
