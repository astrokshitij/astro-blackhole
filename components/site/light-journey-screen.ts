/**
 * The detector screen as a 2D texture. Each dot is one detection sampled from
 * the calculated two-slit intensity (530 nm, 35 µm slits 180 µm apart, 1 m
 * away, 36 mm field of view). Dots are detection events, not trajectories.
 * The curve drawn last is the same intensity as an explanatory overlay.
 */
import {
  detectionCDF,
  sampleDetection,
  seededRandom,
  slitIntensity,
  OPTICS,
} from "@/lib/light-physics";

export const MAX_DETECTIONS = 6000;
const HALF_FIELD = 0.018; // metres: 36 mm across
const W = 1024;
const H = 512;

export type DetectorScreen = {
  canvas: HTMLCanvasElement;
  /** Returns true when the canvas changed. */
  update: (count: number, curve: number) => boolean;
};

export function createDetectorScreen(): DetectorScreen {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const dots = document.createElement("canvas");
  dots.width = W;
  dots.height = H;
  const ctx = canvas.getContext("2d")!;
  const dctx = dots.getContext("2d")!;

  const cdf = detectionCDF(OPTICS.separation, false, 4096, HALF_FIELD);
  const rand = seededRandom(530);
  const xs = new Float32Array(MAX_DETECTIONS);
  const ys = new Float32Array(MAX_DETECTIONS);
  const bs = new Float32Array(MAX_DETECTIONS);
  for (let i = 0; i < MAX_DETECTIONS; i++) {
    xs[i] = ((sampleDetection(cdf, rand(), HALF_FIELD) / HALF_FIELD) * 0.5 + 0.5) * W;
    // Tall slits: detections spread over a soft vertical band.
    const g = (rand() + rand() + rand() - 1.5) / 1.5;
    ys[i] = H * (0.47 + g * 0.36);
    bs[i] = 0.55 + rand() * 0.45;
  }

  let drawn = 0;
  let lastCurve = -1;
  dctx.fillStyle = "#000";
  dctx.fillRect(0, 0, W, H);

  const drawDots = (from: number, to: number) => {
    dctx.globalCompositeOperation = "lighter";
    for (let i = from; i < to; i++) {
      const b = bs[i];
      dctx.fillStyle = `rgba(70, 200, 90, ${0.32 * b})`;
      dctx.beginPath();
      dctx.arc(xs[i], ys[i], 3.2, 0, Math.PI * 2);
      dctx.fill();
      dctx.fillStyle = `rgba(200, 255, 205, ${0.75 * b})`;
      dctx.beginPath();
      dctx.arc(xs[i], ys[i], 1.3, 0, Math.PI * 2);
      dctx.fill();
    }
    dctx.globalCompositeOperation = "source-over";
  };

  const compose = (curve: number) => {
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(dots, 0, 0);
    if (curve > 0.001) {
      ctx.save();
      ctx.globalAlpha = curve;
      ctx.strokeStyle = "rgba(242, 239, 232, 0.92)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      const base = H * 0.93;
      for (let px = 0; px <= W; px += 2) {
        const x = (px / W - 0.5) * 2 * HALF_FIELD;
        const y = base - slitIntensity(x) * H * 0.34;
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
      ctx.restore();
    }
  };

  return {
    canvas,
    update(count, curve) {
      count = Math.max(0, Math.min(MAX_DETECTIONS, Math.round(count)));
      const c = Math.round(curve * 40) / 40;
      if (count === drawn && c === lastCurve) return false;
      if (count < drawn) {
        dctx.fillStyle = "#000";
        dctx.fillRect(0, 0, W, H);
        drawn = 0;
      }
      drawDots(drawn, count);
      drawn = count;
      lastCurve = c;
      compose(c);
      return true;
    },
  };
}
