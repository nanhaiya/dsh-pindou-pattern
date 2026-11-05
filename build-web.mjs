/**
 * Build the standalone web app (single self-contained index.html).
 *
 *   src/palette.json  → const MARD = [...]
 *   src/engine.js     → pure palette / sampling / quantization logic
 *   src/shared.js     → i18n dictionaries, canvas rendering helpers
 *   src/webui.js      → vanilla DOM app (no framework, no bundler)
 *
 * Output: web/index.html — open it directly, host it anywhere, or embed it in
 * the desktop wrapper (win/). No build step required at run time.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const palette = JSON.parse(readFileSync(join(root, 'src', 'palette.json'), 'utf8'));
let engine = readFileSync(join(root, 'src', 'engine.js'), 'utf8');
const shared = readFileSync(join(root, 'src', 'shared.js'), 'utf8');
const webui = readFileSync(join(root, 'src', 'webui.js'), 'utf8');

if (!engine.includes('const MARD = __MARD__;')) {
  throw new Error('src/engine.js: MARD placeholder is missing');
}
if (!engine.includes('function buildPattern') || !engine.includes('function sampleGrid')) {
  throw new Error('src/engine.js: engine functions are missing');
}
if (!shared.includes('function renderSheet')) {
  throw new Error('src/shared.js: renderSheet is missing');
}
if (!webui.includes('function webBoot')) {
  throw new Error('src/webui.js: webBoot is missing');
}

engine = engine.replace('const MARD = __MARD__;', 'const MARD = ' + JSON.stringify(palette) + ';');

const html = [
  '<!doctype html>',
  '<html lang="zh-CN">',
  '<head>',
  '<meta charset="utf-8" />',
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />',
  '<title>拼豆图纸工坊 · Bead Pattern Studio</title>',
  '<meta name="description" content="上传任意图片，在线生成 MARD 色号拼豆图纸：尺寸 8–200 格可自定义，可调色数、抖动、去背景，导出高清图纸 PNG 与色号清单 CSV。纯本地处理，图片不会上传。" />',
  '<meta name="theme-color" content="#FAF7F0" />',
  '<meta property="og:title" content="拼豆图纸工坊 · Bead Pattern Studio" />',
  '<meta property="og:description" content="上传图片，生成 MARD 色号拼豆图纸，尺寸与颜色数可自定义，导出高清 PNG 与 CSV。" />',
  '<style>html,body{margin:0;height:100%;background:#FAF7F0}#app{height:100%}</style>',
  '</head>',
  '<body>',
  '<div id="app"></div>',
  '<noscript>这个工具需要启用 JavaScript。</noscript>',
  '<script>',
  '(function () {',
  '  "use strict";',
  engine.trim(),
  '',
  shared.trim(),
  '',
  webui.trim(),
  '})();',
  '</script>',
  '</body>',
  '</html>',
  '',
].join('\n');

mkdirSync(join(root, 'web'), { recursive: true });
writeFileSync(join(root, 'web', 'index.html'), html);
console.log(
  'web/index.html written: ' +
    (Buffer.byteLength(html) / 1024).toFixed(1) +
    ' KiB, palette ' +
    palette.length +
    ' colors, v' +
    pkg.version
);
