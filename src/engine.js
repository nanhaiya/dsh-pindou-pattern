/* ------------------------------------------------------------------ *
 * Perler pattern engine — palette, colour science, k-means, dithering.
 * Pure: no DOM, no React. Inlined into client.js by build.mjs and
 * exercised directly by work/test-engine.mjs.
 * ------------------------------------------------------------------ */

const MARD = __MARD__;

const STANDARD_SERIES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M'];

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToLab(r, g, b) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  const x = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
  const y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  const z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883;
  const f = (t) => (t > 0.008856451679035631 ? Math.cbrt(t) : 7.787037037037035 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function labDistanceSq(lab, offset, L, A, B) {
  const dl = lab[offset] - L;
  const da = lab[offset + 1] - A;
  const db = lab[offset + 2] - B;
  return dl * dl + da * da + db * db;
}

function hexLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

for (const color of MARD) {
  const rgb = hexToRgb(color.hex);
  color.rgb = rgb;
  color.lab = rgbToLab(rgb[0], rgb[1], rgb[2]);
  color.standard = STANDARD_SERIES.indexOf(color.series) !== -1;
  color.luminance = hexLuminance(color.hex);
}

const MARD_STANDARD = MARD.filter((c) => c.standard);
const MARD_ALL = MARD;
const MARD_STANDARD_COUNT = MARD_STANDARD.length;
const MARD_TOTAL_COUNT = MARD_ALL.length;

function patternError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

/**
 * Guess a flat background from the image border. Returns null when the
 * border is not uniform enough (a photo) or is mostly transparent.
 */
function estimateBackground(rgba, w, h) {
  const points = [];
  const push = (x, y) => {
    const i = (y * w + x) * 4;
    if (rgba[i + 3] < 128) return;
    points.push([rgba[i], rgba[i + 1], rgba[i + 2]]);
  };
  for (let x = 0; x < w; x += 1) {
    push(x, 0);
    if (h > 1) push(x, h - 1);
  }
  for (let y = 1; y < h - 1; y += 1) {
    push(0, y);
    if (w > 1) push(w - 1, y);
  }
  if (points.length < 12) return null;
  const median = [0, 1, 2].map((channel) => {
    const values = points.map((p) => p[channel]).sort((a, b) => a - b);
    return values[values.length >> 1];
  });
  const bgLab = rgbToLab(median[0], median[1], median[2]);
  let close = 0;
  for (const p of points) {
    const lab = rgbToLab(p[0], p[1], p[2]);
    const d = labDistanceSq(lab, 0, bgLab[0], bgLab[1], bgLab[2]);
    if (d <= 100) close += 1;
  }
  if (close / points.length < 0.55) return null;
  return { lab: bgLab, coverage: close / points.length };
}

function buildTrainingSet(labs, valid, count) {
  const limit = 12000;
  const stride = count > limit ? Math.ceil(count / limit) : 1;
  const picked = [];
  for (let i = 0; i < count; i += stride) picked.push(valid[i]);
  const sub = new Float32Array(picked.length * 3);
  for (let i = 0; i < picked.length; i += 1) {
    const at = picked[i] * 3;
    sub[i * 3] = labs[at];
    sub[i * 3 + 1] = labs[at + 1];
    sub[i * 3 + 2] = labs[at + 2];
  }
  return sub;
}

/** Deterministic k-means (k-means++ seeding, 12 refinement rounds). */
function kmeans(sub, k) {
  const n = sub.length / 3;
  const centers = new Float32Array(k * 3);
  let seed = 0x9e3779b9;
  const random = () => {
    seed = (seed ^ (seed << 13)) >>> 0;
    seed = (seed ^ (seed >>> 17)) >>> 0;
    seed = (seed ^ (seed << 5)) >>> 0;
    return seed / 4294967296;
  };
  const first = Math.floor(random() * n);
  centers[0] = sub[first * 3];
  centers[1] = sub[first * 3 + 1];
  centers[2] = sub[first * 3 + 2];
  const nearestDist = new Float32Array(n).fill(Infinity);
  for (let c = 1; c < k; c += 1) {
    const prev = (c - 1) * 3;
    let sum = 0;
    for (let i = 0; i < n; i += 1) {
      const d = labDistanceSq(sub, i * 3, centers[prev], centers[prev + 1], centers[prev + 2]);
      if (d < nearestDist[i]) nearestDist[i] = d;
      sum += nearestDist[i];
    }
    let target = random() * sum;
    let pick = 0;
    for (let i = 0; i < n; i += 1) {
      target -= nearestDist[i];
      if (target <= 0) {
        pick = i;
        break;
      }
    }
    centers[c * 3] = sub[pick * 3];
    centers[c * 3 + 1] = sub[pick * 3 + 1];
    centers[c * 3 + 2] = sub[pick * 3 + 2];
  }
  const assign = new Uint16Array(n);
  for (let round = 0; round < 12; round += 1) {
    const sums = new Float64Array(k * 3);
    const counts = new Uint32Array(k);
    for (let i = 0; i < n; i += 1) {
      let best = 0;
      let bestDistance = Infinity;
      const at = i * 3;
      const L = sub[at];
      const A = sub[at + 1];
      const B = sub[at + 2];
      for (let c = 0; c < k; c += 1) {
        const d = labDistanceSq(centers, c * 3, L, A, B);
        if (d < bestDistance) {
          bestDistance = d;
          best = c;
        }
      }
      assign[i] = best;
      counts[best] += 1;
      sums[best * 3] += L;
      sums[best * 3 + 1] += A;
      sums[best * 3 + 2] += B;
    }
    let shift = 0;
    for (let c = 0; c < k; c += 1) {
      if (counts[c] === 0) {
        const pick = Math.floor(random() * n);
        centers[c * 3] = sub[pick * 3];
        centers[c * 3 + 1] = sub[pick * 3 + 1];
        centers[c * 3 + 2] = sub[pick * 3 + 2];
        continue;
      }
      const L = sums[c * 3] / counts[c];
      const A = sums[c * 3 + 1] / counts[c];
      const B = sums[c * 3 + 2] / counts[c];
      const d = labDistanceSq(centers, c * 3, L, A, B);
      if (d > shift) shift = d;
      centers[c * 3] = L;
      centers[c * 3 + 1] = A;
      centers[c * 3 + 2] = B;
    }
    if (shift < 0.02) break;
  }
  return centers;
}

function nearestIn(list, L, A, B) {
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < list.length; i += 1) {
    const lab = list[i];
    const dl = L - lab[0];
    const da = A - lab[1];
    const db = B - lab[2];
    const d = dl * dl + da * da + db * db;
    if (d < bestDistance) {
      bestDistance = d;
      best = i;
    }
  }
  return best;
}

function codeOrder(a, b) {
  if (a.count !== b.count) return b.count - a.count;
  return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
}

/**
 * Turn a W×H RGBA buffer into bead cells.
 *
 * @param rgba  Uint8ClampedArray / Uint8Array of length w*h*4
 * @param w     grid columns
 * @param h     grid rows
 * @param opts  { maxColors, scope: 'standard'|'all', dither, removeBg, tolerance }
 */
function buildPattern(rgba, w, h, opts) {
  const options = opts || {};
  const n = w * h;
  if (!n) throw patternError('empty');
  const scope = options.scope === 'all' ? MARD_ALL : MARD_STANDARD;
  const paletteLabs = scope.map((c) => c.lab);
  const tolerance = clamp(Number(options.tolerance) || 0, 0, 80);
  const toleranceSq = tolerance * tolerance;
  const bg = options.removeBg ? estimateBackground(rgba, w, h) : null;
  const bgLab = bg ? bg.lab : null;

  const empty = new Uint8Array(n);
  const labs = new Float32Array(n * 3);
  const valid = new Int32Array(n);
  let live = 0;
  for (let i = 0; i < n; i += 1) {
    const alpha = rgba[i * 4 + 3];
    if (alpha < 96) {
      empty[i] = 1;
      continue;
    }
    let r = rgba[i * 4];
    let g = rgba[i * 4 + 1];
    let b = rgba[i * 4 + 2];
    if (alpha < 250) {
      const f = alpha / 255;
      r = Math.round(r * f + 255 * (1 - f));
      g = Math.round(g * f + 255 * (1 - f));
      b = Math.round(b * f + 255 * (1 - f));
    }
    const lab = rgbToLab(r, g, b);
    if (bgLab && labDistanceSq(lab, 0, bgLab[0], bgLab[1], bgLab[2]) <= toleranceSq) {
      empty[i] = 1;
      continue;
    }
    labs[i * 3] = lab[0];
    labs[i * 3 + 1] = lab[1];
    labs[i * 3 + 2] = lab[2];
    valid[live] = i;
    live += 1;
  }
  if (live === 0) throw patternError('empty');

  const maxColors = Math.floor(Number(options.maxColors) || 24);
  const k = Math.max(1, Math.min(64, maxColors, live));
  const training = buildTrainingSet(labs, valid, live);
  const centers = kmeans(training, k);

  const chosenIndexes = [];
  const seen = new Set();
  for (let c = 0; c < k; c += 1) {
    const pick = nearestIn(paletteLabs, centers[c * 3], centers[c * 3 + 1], centers[c * 3 + 2]);
    if (!seen.has(pick)) {
      seen.add(pick);
      chosenIndexes.push(pick);
    }
  }
  const chosen = chosenIndexes.map((i) => scope[i]);
  const chosenLabs = chosen.map((c) => c.lab);
  const cells = new Int32Array(n).fill(-1);
  const counts = new Uint32Array(chosen.length);

  if (options.dither) {
    const error = new Float32Array(n * 3);
    for (let y = 0; y < h; y += 1) {
      const forward = y % 2 === 0;
      for (let step = 0; step < w; step += 1) {
        const x = forward ? step : w - 1 - step;
        const index = y * w + x;
        if (empty[index]) continue;
        const L = labs[index * 3] + error[index * 3];
        const A = labs[index * 3 + 1] + error[index * 3 + 1];
        const B = labs[index * 3 + 2] + error[index * 3 + 2];
        let best = 0;
        let bestDistance = Infinity;
        for (let c = 0; c < chosenLabs.length; c += 1) {
          const lab = chosenLabs[c];
          const dl = L - lab[0];
          const da = A - lab[1];
          const db = B - lab[2];
          const d = dl * dl + da * da + db * db;
          if (d < bestDistance) {
            bestDistance = d;
            best = c;
          }
        }
        cells[index] = best;
        counts[best] += 1;
        const eL = L - chosenLabs[best][0];
        const eA = A - chosenLabs[best][1];
        const eB = B - chosenLabs[best][2];
        const spread = (dx, dy, weight) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) return;
          const at = (ny * w + nx) * 3;
          if (empty[ny * w + nx]) return;
          error[at] += eL * weight;
          error[at + 1] += eA * weight;
          error[at + 2] += eB * weight;
        };
        const forwardDx = forward ? 1 : -1;
        spread(forwardDx, 0, 7 / 16);
        spread(-forwardDx, 1, 3 / 16);
        spread(0, 1, 5 / 16);
        spread(forwardDx, 1, 1 / 16);
      }
    }
  } else {
    for (let v = 0; v < live; v += 1) {
      const index = valid[v];
      const L = labs[index * 3];
      const A = labs[index * 3 + 1];
      const B = labs[index * 3 + 2];
      let best = 0;
      let bestDistance = Infinity;
      for (let c = 0; c < chosenLabs.length; c += 1) {
        const lab = chosenLabs[c];
        const dl = L - lab[0];
        const da = A - lab[1];
        const db = B - lab[2];
        const d = dl * dl + da * da + db * db;
        if (d < bestDistance) {
          bestDistance = d;
          best = c;
        }
      }
      cells[index] = best;
      counts[best] += 1;
    }
  }

  const order = Array.from(counts.keys()).sort((a, b) => counts[b] - counts[a]);
  const remap = new Int32Array(chosen.length);
  order.forEach((from, to) => {
    remap[from] = to;
  });
  for (let i = 0; i < n; i += 1) {
    if (cells[i] >= 0) cells[i] = remap[cells[i]];
  }
  const colors = order.map((from) => ({
    code: chosen[from].code,
    hex: chosen[from].hex,
    luminance: chosen[from].luminance,
    count: counts[from],
  }));
  colors.sort(codeOrder);
  let total = 0;
  for (const color of colors) total += color.count;

  return {
    w,
    h,
    cells,
    colors,
    total,
    empty: n - total,
    bgRemoved: !!bg,
    bgCoverage: bg ? bg.coverage : 0,
  };
}

/** Sample the source image down to the grid and read its pixels. */
function sampleGrid(source, w, h, createCanvas) {
  const srcW = source.width;
  const srcH = source.height;
  const targetAspect = w / h;
  const srcAspect = srcW / srcH;
  let sx = 0;
  let sy = 0;
  let sw = srcW;
  let sh = srcH;
  // 目标网格与图片比例不一致时居中裁切，绝不拉伸变形
  if (srcAspect > targetAspect) {
    sw = Math.max(1, Math.round(srcH * targetAspect));
    sx = Math.round((srcW - sw) / 2);
  } else if (srcAspect < targetAspect) {
    sh = Math.max(1, Math.round(srcW / targetAspect));
    sy = Math.round((srcH - sh) / 2);
  }
  let canvas = source;
  if (sx !== 0 || sy !== 0 || sw !== srcW || sh !== srcH) {
    canvas = createCanvas(sw, sh);
    const crop = canvas.getContext('2d', { willReadFrequently: true });
    crop.imageSmoothingEnabled = true;
    crop.imageSmoothingQuality = 'high';
    crop.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
  }
  while (sw > w * 2 && sh > h * 2) {
    const nw = Math.max(w, Math.round(sw / 2));
    const nh = Math.max(h, Math.round(sh / 2));
    const next = createCanvas(nw, nh);
    const context = next.getContext('2d', { willReadFrequently: true });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(canvas, 0, 0, nw, nh);
    canvas = next;
    sw = nw;
    sh = nh;
  }
  const out = createCanvas(w, h);
  const context = out.getContext('2d', { willReadFrequently: true });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.clearRect(0, 0, w, h);
  context.drawImage(canvas, 0, 0, w, h);
  return context.getImageData(0, 0, w, h).data;
}
