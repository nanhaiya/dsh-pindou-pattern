/**
 * Engine checks. Builds a runnable copy of src/engine.js (the browser bundle
 * inlines it, so it has no exports on its own) and exercises the pipeline.
 *
 *   node test/engine.test.cjs
 */
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const root = path.resolve(__dirname, '..');
const palette = JSON.parse(fs.readFileSync(path.join(root, 'src', 'palette.json'), 'utf8'));
let source = fs.readFileSync(path.join(root, 'src', 'engine.js'), 'utf8');
source = source.replace('const MARD = __MARD__;', 'const MARD = ' + JSON.stringify(palette) + ';');
source +=
  '\nmodule.exports = { MARD, MARD_STANDARD, MARD_STANDARD_COUNT, MARD_TOTAL_COUNT, clamp, hexToRgb, rgbToLab, buildPattern };\n';
const temp = path.join(os.tmpdir(), 'dsh-pindou-engine-' + process.pid + '.cjs');
fs.writeFileSync(temp, source);
const engine = require(temp);
fs.unlinkSync(temp);

const { MARD, MARD_STANDARD_COUNT, MARD_TOTAL_COUNT, buildPattern, rgbToLab } = engine;

let passed = 0;
const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

function solid(w, h, rgba) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i += 1) {
    data[i * 4] = rgba[0];
    data[i * 4 + 1] = rgba[1];
    data[i * 4 + 2] = rgba[2];
    data[i * 4 + 3] = rgba[3] === undefined ? 255 : rgba[3];
  }
  return data;
}

function countCells(pattern) {
  let count = 0;
  for (const index of pattern.cells) if (index >= 0) count += 1;
  return count;
}

test('palette: 291 colors, 221 standard, unique codes and valid hex', () => {
  assert.strictEqual(MARD.length, 291);
  assert.strictEqual(MARD_TOTAL_COUNT, 291);
  assert.strictEqual(MARD_STANDARD_COUNT, 221);
  const codes = new Set();
  for (const color of MARD) {
    assert.match(color.code, /^[A-Z]+\d+$/);
    assert.match(color.hex, /^#[0-9A-F]{6}$/i);
    assert.ok(!codes.has(color.code), 'duplicate code ' + color.code);
    codes.add(color.code);
  }
  assert.strictEqual(codes.size, 291);
});

test('palette: Lab conversion is sane for black and white', () => {
  const black = rgbToLab(0, 0, 0);
  const white = rgbToLab(255, 255, 255);
  assert.ok(Math.abs(black[0]) < 0.01);
  assert.ok(Math.abs(white[0] - 100) < 0.01);
  assert.ok(Math.abs(white[1]) < 0.01);
});

test('solid color collapses to one MARD bead', () => {
  const pattern = buildPattern(solid(12, 12, [200, 30, 40, 255]), 12, 12, { maxColors: 8 });
  assert.strictEqual(pattern.colors.length, 1);
  assert.strictEqual(pattern.total, 144);
  assert.strictEqual(pattern.empty, 0);
  assert.strictEqual(pattern.bgRemoved, false);
  assert.strictEqual(countCells(pattern), 144);
});

test('fully transparent input reports an empty pattern', () => {
  assert.throws(
    () => buildPattern(new Uint8ClampedArray(10 * 10 * 4), 10, 10, { maxColors: 8 }),
    (error) => error && error.code === 'empty',
  );
});

test('two-tone image keeps both colors and the right total', () => {
  const w = 20;
  const h = 10;
  const data = solid(w, h, [255, 255, 255, 255]);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < 10; x += 1) {
      const i = (y * w + x) * 4;
      data[i] = 20;
      data[i + 1] = 60;
      data[i + 2] = 150;
    }
  }
  const pattern = buildPattern(data, w, h, { maxColors: 8 });
  assert.strictEqual(pattern.colors.length, 2);
  assert.strictEqual(pattern.total, w * h);
  assert.strictEqual(countCells(pattern), w * h);
});

test('removeBg detects a flat white border and drops it', () => {
  const w = 20;
  const h = 20;
  const data = solid(w, h, [255, 255, 255, 255]);
  for (let y = 6; y < 14; y += 1) {
    for (let x = 6; x < 14; x += 1) {
      const i = (y * w + x) * 4;
      data[i] = 220;
      data[i + 1] = 50;
      data[i + 2] = 60;
    }
  }
  const pattern = buildPattern(data, w, h, { maxColors: 8, removeBg: true, tolerance: 12 });
  assert.strictEqual(pattern.bgRemoved, true);
  assert.ok(pattern.bgCoverage > 0.5);
  assert.strictEqual(pattern.total, 64);
  assert.strictEqual(pattern.empty, w * h - 64);
});

test('a photo-like border is not treated as background', () => {
  const w = 30;
  const h = 30;
  const data = solid(w, h, [255, 255, 255, 255]);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      data[i] = (x * 37 + y * 11) % 255;
      data[i + 1] = (x * 19 + y * 53) % 255;
      data[i + 2] = (x * 7 + y * 29) % 255;
    }
  }
  const pattern = buildPattern(data, w, h, { maxColors: 12, removeBg: true, tolerance: 12 });
  assert.strictEqual(pattern.bgRemoved, false);
  assert.strictEqual(pattern.total, w * h);
});

test('maxColors is respected and every cell points at a color', () => {
  const w = 50;
  const h = 50;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      data[i] = Math.round((x / (w - 1)) * 255);
      data[i + 1] = Math.round((y / (h - 1)) * 255);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
  for (const maxColors of [3, 6, 12, 24]) {
    const pattern = buildPattern(data, w, h, { maxColors });
    assert.ok(pattern.colors.length >= 1 && pattern.colors.length <= maxColors, 'maxColors ' + maxColors);
    assert.strictEqual(pattern.total, w * h);
    for (const index of pattern.cells) assert.ok(index >= 0 && index < pattern.colors.length);
    const sum = pattern.colors.reduce((total, color) => total + color.count, 0);
    assert.strictEqual(sum, pattern.total);
  }
});

test('scope "standard" only uses the 221 standard codes', () => {
  const pattern = buildPattern(solid(8, 8, [40, 180, 120, 255]), 8, 8, { maxColors: 6, scope: 'standard' });
  const standard = new Set(
    MARD.filter((color) => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M'].includes(color.series)).map((color) => color.code),
  );
  for (const color of pattern.colors) assert.ok(standard.has(color.code), color.code + ' is not standard');
});

test('scope "all" can pick extended series', () => {
  const pattern = buildPattern(solid(8, 8, [171, 145, 192, 255]), 8, 8, { maxColors: 6, scope: 'all' });
  for (const color of pattern.colors) assert.ok(MARD.some((item) => item.code === color.code));
});

test('deterministic for identical input', () => {
  const w = 24;
  const h = 24;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i += 1) {
    data[i * 4] = (i * 13) % 255;
    data[i * 4 + 1] = (i * 29) % 255;
    data[i * 4 + 2] = (i * 47) % 255;
    data[i * 4 + 3] = 255;
  }
  const a = buildPattern(data, w, h, { maxColors: 10 });
  const b = buildPattern(data, w, h, { maxColors: 10 });
  assert.deepStrictEqual(Array.from(a.cells), Array.from(b.cells));
  assert.deepStrictEqual(a.colors.map((c) => c.code), b.colors.map((c) => c.code));
  assert.deepStrictEqual(a.colors.map((c) => c.count), b.colors.map((c) => c.count));
});

test('dither keeps totals and stays inside the palette subset', () => {
  const w = 40;
  const h = 40;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      data[i] = Math.round(((x + y) / (w + h)) * 255);
      data[i + 1] = Math.round((y / h) * 255);
      data[i + 2] = Math.round((x / w) * 255);
      data[i + 3] = 255;
    }
  }
  const plain = buildPattern(data, w, h, { maxColors: 6 });
  const dithered = buildPattern(data, w, h, { maxColors: 6, dither: true });
  assert.strictEqual(dithered.total, w * h);
  assert.ok(dithered.colors.length <= 6);
  assert.notDeepStrictEqual(Array.from(plain.cells), Array.from(dithered.cells));
});

test('200 × 200 worst case finishes fast enough for the UI', () => {
  const w = 200;
  const h = 200;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i += 1) {
    data[i * 4] = (i * 7) % 255;
    data[i * 4 + 1] = (i * 31) % 255;
    data[i * 4 + 2] = (i * 61) % 255;
    data[i * 4 + 3] = 255;
  }
  const started = Date.now();
  const pattern = buildPattern(data, w, h, { maxColors: 64, dither: true, scope: 'all' });
  const elapsed = Date.now() - started;
  assert.strictEqual(pattern.total, w * h);
  assert.ok(elapsed < 4000, 'took ' + elapsed + 'ms');
  console.log('      200×200 with 64 colors + dither: ' + elapsed + 'ms');
});

(async () => {
  console.log('engine tests (' + tests.length + ')');
  for (const entry of tests) {
    try {
      await entry.fn();
      passed += 1;
      console.log('  ok  ' + entry.name);
    } catch (error) {
      console.error('  FAIL ' + entry.name);
      console.error(error && error.stack ? error.stack : error);
      process.exitCode = 1;
    }
  }
  console.log(passed + '/' + tests.length + ' passed');
})();
