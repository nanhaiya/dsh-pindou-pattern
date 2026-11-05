/* ------------------------------------------------------------------ *
 * Perler pattern studio — standalone web app (no DSH runtime needed).
 * Built by build-web.mjs into a single index.html together with
 * src/palette.json, src/engine.js and src/shared.js.
 * ------------------------------------------------------------------ */

const WEB_STORE_KEY = 'pindou-web:v1';
const WEB_PRESETS = [25, 29, 48, 50, 64];
const WEB_DEFAULTS = {
  w: 50,
  h: 50,
  scope: 'standard',
  maxColors: 24,
  dither: false,
  removeBg: false,
  tolerance: 12,
  showCodes: true,
  lockRatio: true,
};

const WEB_CSS = `
:root{
  --ink:#2C2620;--ink-soft:#6F6759;--ink-faint:#9A9082;
  --paper:#FAF7F0;--card:#FFFDF8;--line:#E7DFD1;--line-strong:#D6CBBA;
  --accent:#C2553B;--accent-soft:#F6E3D8;--accent-ink:#7E3320;
  --shadow:0 1px 2px rgba(60,44,30,.05),0 8px 24px rgba(60,44,30,.06);
  --radius:14px;
  color-scheme:light;
}
@media (prefers-color-scheme:dark){
  :root{
    --ink:#F1EBE1;--ink-soft:#B9B0A2;--ink-faint:#8C8478;
    --paper:#171512;--card:#201D19;--line:#332E27;--line-strong:#453E34;
    --accent:#E0784F;--accent-soft:#3A241C;--accent-ink:#F3C4AE;
    --shadow:0 1px 2px rgba(0,0,0,.3),0 10px 30px rgba(0,0,0,.35);
    color-scheme:dark;
  }
}
*{box-sizing:border-box}
[hidden]{display:none!important}
html,body{height:100%}
body{margin:0;background:var(--paper);color:var(--ink);font-family:"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit}
h1,h2,h3,p{margin:0}

.shell{height:100%;display:flex;flex-direction:column;min-height:0}
.top{flex:none;display:flex;align-items:center;gap:16px;padding:14px 22px;border-bottom:1px solid var(--line);background:var(--card)}
.brand{display:flex;align-items:center;gap:12px;min-width:0;flex:1}
.mark{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent);flex:none}
.brand h1{font-size:16px;font-weight:700;letter-spacing:.01em;white-space:nowrap}
.brand p{font-size:12px;color:var(--ink-soft);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.top-actions{display:flex;align-items:center;gap:8px;flex:none}
.btn{border:1px solid var(--line-strong);background:var(--card);border-radius:10px;padding:8px 13px;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:.15s;color:var(--ink)}
.btn:hover{background:var(--accent-soft);border-color:var(--accent)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.btn.primary:hover{filter:brightness(1.05)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn.ghost{background:transparent}
.btn.small{padding:6px 10px;font-size:12px}

.body{flex:1;min-height:0;display:grid;grid-template-columns:298px minmax(0,1fr);gap:16px;padding:16px 18px 18px;overflow:hidden}
.rail{min-height:0;overflow:auto;display:flex;flex-direction:column;gap:12px;padding-right:4px}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:14px;box-shadow:var(--shadow)}
.card h2{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:10px}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.card-head h2{margin:0}
.link{border:0;background:none;padding:0;color:var(--accent);font-size:12.5px;font-weight:600;cursor:pointer}
.link:hover{text-decoration:underline}
.link.dim{color:var(--ink-faint);cursor:default;text-decoration:none}

.drop{position:relative;border:1.5px dashed var(--line-strong);border-radius:12px;padding:14px;background:transparent;cursor:pointer;transition:.15s}
.drop:hover,.drop.over{border-color:var(--accent);background:var(--accent-soft)}
.drop .ph{display:flex;align-items:center;gap:11px;color:var(--ink-soft);font-size:12.5px}
.drop .ph svg{flex:none;color:var(--accent)}
.drop .ph b{display:block;color:var(--ink);font-size:13px;margin-bottom:2px}
.thumb{display:flex;align-items:center;gap:11px;position:relative}
.thumb img{width:52px;height:52px;object-fit:cover;border-radius:10px;border:1px solid var(--line);background:#fff}
.thumb .meta{min-width:0;font-size:12px;color:var(--ink-soft);line-height:1.45}
.thumb .meta b{display:block;color:var(--ink);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px}
.demo-row{margin-top:10px}
.ratio-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:9px}
.ratio-row .lock{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--ink-soft);cursor:pointer}
.ratio-row .lock input{accent-color:var(--accent);width:13px;height:13px;margin:0;cursor:pointer}
.presets{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px}
.preset{border:1px solid var(--line-strong);background:var(--card);border-radius:9px;padding:7px 0;font-size:12.5px;font-weight:600;cursor:pointer;color:var(--ink-soft)}
.preset.on{border-color:var(--accent);color:var(--accent-ink);background:var(--accent-soft)}
.row{display:flex;align-items:flex-end;gap:8px}
.row label{flex:1;min-width:0;display:block}
.row label span{display:block;font-size:11.5px;color:var(--ink-faint);margin-bottom:4px}
.row .x{color:var(--ink-faint);padding-bottom:9px}
input[type=number]{width:100%;border:1px solid var(--line-strong);border-radius:9px;background:var(--paper);padding:8px 10px;font-size:13.5px;font-weight:600;color:var(--ink);outline:none}
input[type=number]:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.hint{font-size:11.5px;color:var(--ink-faint);line-height:1.5;margin-top:8px}
.seg{display:grid;grid-template-columns:1fr 1fr;background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:3px;gap:3px;margin-bottom:12px}
.seg button{border:0;background:none;border-radius:8px;padding:7px 0;font-size:12.5px;font-weight:600;color:var(--ink-soft);cursor:pointer}
.seg button.on{background:var(--card);color:var(--ink);box-shadow:0 1px 3px rgba(60,44,30,.12)}
.slider{display:flex;align-items:center;gap:10px}
.slider label{font-size:12.5px;color:var(--ink-soft);flex:none}
.slider input[type=range]{flex:1;accent-color:var(--accent)}
.slider output{min-width:30px;text-align:right;font-size:12.5px;font-weight:700}
.check{display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;user-select:none}
.check input{width:15px;height:15px;accent-color:var(--accent);margin:0}
.reset{align-self:center;margin:2px 0 10px}

.stage{min-height:0;display:flex;flex-direction:column;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden;position:relative}
.stage-head{flex:none;display:flex;align-items:center;gap:12px;padding:11px 14px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.stats{display:flex;align-items:baseline;gap:10px;font-size:12.5px;color:var(--ink-soft);min-width:0;flex:1}
.stats b{font-size:14px;color:var(--ink);font-weight:700}
.tools{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.zoom{display:flex;align-items:center;gap:2px;border:1px solid var(--line);border-radius:9px;overflow:hidden}
.zoom button{border:0;background:var(--card);color:var(--ink-soft);width:29px;height:28px;font-size:14px;cursor:pointer;display:grid;place-items:center}
.zoom button.wide{width:auto;padding:0 10px;font-size:12px;font-weight:600}
.zoom button:hover{background:var(--accent-soft);color:var(--accent-ink)}
.zoom span{font-size:12px;color:var(--ink-soft);min-width:34px;text-align:center}
.scroll{flex:1;min-height:0;overflow:auto;padding:16px;display:flex;justify-content:center;align-items:flex-start;background:
  radial-gradient(circle at 1px 1px,rgba(120,104,84,.11) 1px,transparent 0) 0 0/16px 16px,transparent}
.scroll canvas{display:block;border-radius:8px;box-shadow:0 2px 10px rgba(60,44,30,.12)}
.empty{position:absolute;inset:44px 0 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:24px;background:var(--card)}
.empty .beads{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;color:var(--accent);margin-bottom:6px}
.empty h3{font-size:16px;font-weight:700}
.empty p{font-size:12.5px;color:var(--ink-soft);max-width:340px;line-height:1.6}
.empty .row2{display:flex;gap:9px;margin-top:8px}
.legend{flex:none;border-top:1px solid var(--line);padding:10px 14px 12px;max-height:132px;overflow:auto;background:var(--card)}
.legend-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px;font-size:12px;color:var(--ink-soft)}
.legend-head b{font-size:12.5px;color:var(--ink)}
.legend-list{display:flex;flex-wrap:wrap;gap:6px}
.chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:8px;padding:4px 8px 4px 5px;font-size:12.5px;background:var(--paper)}
.chip i{width:15px;height:15px;border-radius:5px;border:1px solid rgba(0,0,0,.12);display:block}
.chip b{font-family:ui-monospace,"SFMono-Regular",Consolas,monospace;font-size:12px;letter-spacing:.02em}
.chip span{color:var(--ink-faint);font-size:11.5px}

.modal{position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(28,22,16,.55);backdrop-filter:blur(3px)}
.modal.on{display:flex}
.modal .panel{background:var(--card);border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.28);width:min(880px,100%);height:min(760px,calc(100vh - 48px));display:flex;flex-direction:column;overflow:hidden}
.modal .bar{display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid var(--line)}
.modal .bar h3{font-size:14px;font-weight:700;flex:1}
.modal .shot{position:relative;flex:1;min-height:240px;padding:16px;background:var(--paper)}
.modal .shot img{position:absolute;inset:16px;margin:auto;display:block;width:auto;height:auto;max-width:calc(100% - 32px);max-height:calc(100% - 32px);background:#FBF9F4;border-radius:8px;box-shadow:0 2px 12px rgba(60,44,30,.14)}
.modal .foot{display:flex;justify-content:flex-end;gap:9px;padding:12px 16px;border-top:1px solid var(--line)}

.toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,14px);z-index:60;background:#2C2620;color:#FBF6EE;font-size:13px;padding:10px 16px;border-radius:10px;opacity:0;pointer-events:none;transition:.2s;box-shadow:0 8px 24px rgba(0,0,0,.24)}
.toast.on{opacity:1;transform:translate(-50%,0)}
.spinner{width:15px;height:15px;border-radius:50%;border:2px solid var(--line-strong);border-top-color:var(--accent);animation:spin .8s linear infinite;display:none}
.busy .spinner{display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
@media (max-width:920px){
  .body{grid-template-columns:1fr;overflow:auto;padding:12px}
  .rail{overflow:visible;max-height:none}
  .stage{min-height:520px}
  .brand p{display:none}
}
`;

const WEB_URL_SVG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#F6E3D8"/>' +
  '<g fill="#C2553B"><path fill-rule="evenodd" d="M22 18a4 4 0 100 8 4 4 0 000-8zm0 2.2a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6z"/>' +
  '<path fill-rule="evenodd" d="M42 18a4 4 0 100 8 4 4 0 000-8zm0 2.2a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6z"/>' +
  '<path fill-rule="evenodd" d="M22 38a4 4 0 100 8 4 4 0 000-8zm0 2.2a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6z"/>' +
  '<path fill-rule="evenodd" d="M42 38a4 4 0 100 8 4 4 0 000-8zm0 2.2a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6z"/></g></svg>'
);

let webState = null;
const webViews = {};

function webT(key, values) {
  const dict = (webState && webState.lang === 'en') ? en : zh;
  let text = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
  if (values) {
    for (const name of Object.keys(values)) {
      text = text.split('{' + name + '}').join(String(values[name]));
    }
  }
  return text;
}

function webLoadSettings() {
  const merged = Object.assign({}, WEB_DEFAULTS);
  try {
    const raw = localStorage.getItem(WEB_STORE_KEY);
    if (raw) {
      const saved = JSON.parse(raw).settings || {};
      for (const key of Object.keys(WEB_DEFAULTS)) {
        if (saved[key] !== undefined && saved[key] !== null) merged[key] = saved[key];
      }
    }
  } catch (error) { /* ignore */ }
  merged.w = clamp(Math.round(Number(merged.w) || 50), 8, 200);
  merged.h = clamp(Math.round(Number(merged.h) || 50), 8, 200);
  merged.maxColors = clamp(Math.round(Number(merged.maxColors) || 24), 2, 96);
  merged.tolerance = clamp(Math.round(Number(merged.tolerance) || 12), 0, 60);
  merged.scope = merged.scope === 'all' ? 'all' : 'standard';
  merged.showCodes = merged.showCodes !== false;
  merged.dither = !!merged.dither;
  merged.removeBg = !!merged.removeBg;
  return merged;
}

function webSaveSettings() {
  try {
    localStorage.setItem(WEB_STORE_KEY, JSON.stringify({ settings: webState.settings }));
  } catch (error) { /* ignore */ }
}

function webEl(id) {
  return document.getElementById(id);
}

function webBuild() {
  document.getElementById('app').innerHTML = webTemplate();
  webState = {
    lang: (navigator.language || 'zh').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en',
    settings: webLoadSettings(),
    source: null,
    pattern: null,
    error: null,
    busy: false,
    zoom: 1,
    sheet: null,
    timer: 0,
  };
  webWire();
  webSyncLanguageChrome();
  webRender();
}

function webTemplate() {
  const beadIcon = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor" fill-rule="evenodd">' +
    '<path d="M7.5 3.5a3 3 0 100 6 3 3 0 000-6zm0 1.7a1.3 1.3 0 110 2.6 1.3 1.3 0 010-2.6z"/>' +
    '<path d="M16.5 3.5a3 3 0 100 6 3 3 0 000-6zm0 1.7a1.3 1.3 0 110 2.6 1.3 1.3 0 010-2.6z"/>' +
    '<path d="M7.5 14.5a3 3 0 100 6 3 3 0 000-6zm0 1.7a1.3 1.3 0 110 2.6 1.3 1.3 0 010-2.6z"/>' +
    '<path d="M16.5 14.5a3 3 0 100 6 3 3 0 000-6zm0 1.7a1.3 1.3 0 110 2.6 1.3 1.3 0 010-2.6z"/></g></svg>';
  const uploadIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>';
  const exportIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/></svg>';
  const gridIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.4"/></svg>';
  const emptyBeads = '<div class="beads">' + beadIcon + beadIcon + beadIcon + beadIcon + '</div>';
  return '' +
    '<div class="shell">' +
      '<header class="top">' +
        '<div class="brand"><span class="mark">' + beadIcon + '</span><div><h1 data-i18n="app.title">拼豆图纸工坊</h1><p data-i18n="app.subtitle">上传图片，生成 MARD 色号拼豆图纸</p></div></div>' +
        '<div class="top-actions">' +
          '<button class="btn ghost small" id="langBtn" type="button">EN</button>' +
          '<button class="btn ghost small" id="csvBtn" type="button" disabled>' + gridIcon + '<span data-i18n="action.csvShort">CSV</span></button>' +
          '<button class="btn primary" id="exportBtn" type="button" disabled>' + exportIcon + '<span data-i18n="action.export">导出图纸</span></button>' +
        '</div>' +
      '</header>' +
      '<main class="body">' +
        '<aside class="rail">' +
          '<section class="card">' +
            '<div class="card-head"><h2 data-i18n="upload.title">图片</h2><button class="link" id="removeBtn" type="button" data-i18n="upload.remove" hidden>移除</button></div>' +
            '<div class="drop" id="drop">' +
              '<div class="ph" id="dropPh">' + uploadIcon + '<div><b data-i18n="upload.pick">选择图片</b><span data-i18n="upload.drop">拖入图片，或 Ctrl+V 粘贴</span></div></div>' +
              '<div class="thumb" id="thumb" hidden><img id="thumbImg" alt=""><div class="meta"><b id="thumbName">—</b><span id="thumbSize">—</span><br><span data-i18n="upload.change">点击更换</span></div></div>' +
              '<input type="file" id="fileInput" accept="image/png,image/jpeg,image/webp,image/*" hidden>' +
            '</div>' +
            '<div class="demo-row"><button class="link" id="demoBtn" type="button" data-i18n="upload.demo">试用示例</button></div>' +
          '</section>' +
          '<section class="card">' +
            '<h2 data-i18n="size.title">图纸尺寸</h2>' +
            '<div class="presets" id="presets"></div>' +
            '<div class="row"><label><span data-i18n="size.width">宽</span><input id="wInput" type="number" min="8" max="200" step="1" value="50"></label>' +
            '<span class="x">×</span><label><span data-i18n="size.height">高</span><input id="hInput" type="number" min="8" max="200" step="1" value="50"></label></div>' +
            '<div class="ratio-row"><label class="lock"><input type="checkbox" id="lockRatio" checked><span data-i18n="size.lock">锁定原图比例</span></label>' +
            '<button class="link" id="fitBtn" type="button" data-i18n="size.fit">按原图比例</button></div>' +
            '<p class="hint" data-i18n="size.note">8–200 格 · 每格一颗豆</p>' +
          '</section>' +
          '<section class="card">' +
            '<h2 data-i18n="color.title">颜色</h2>' +
            '<div class="seg" id="scopeSeg"><button type="button" data-scope="standard" data-i18n="color.standardShort">标准</button><button type="button" data-scope="all" data-i18n="color.allShort">全部</button></div>' +
            '<div class="slider"><label data-i18n="color.max">颜色上限</label><input id="maxInput" type="range" min="2" max="64" step="1" value="24"><output id="maxOut">24</output></div>' +
            '<div style="margin-top:12px"><label class="check"><input type="checkbox" id="ditherInput"><span data-i18n="color.dither">抖动</span></label></div>' +
            '<p class="hint" data-i18n="color.ditherHint">用噪点换细节，颗粒感更强</p>' +
          '</section>' +
          '<section class="card">' +
            '<h2 data-i18n="bg.title">背景</h2>' +
            '<label class="check"><input type="checkbox" id="bgInput"><span data-i18n="bg.remove">去除纯色背景</span></label>' +
            '<div id="tolWrap" style="margin-top:10px" hidden><div class="slider"><label id="tolLabel">容差 12</label><input id="tolInput" type="range" min="0" max="60" step="1" value="12"><output id="tolOut">12</output></div></div>' +
            '<p class="hint" data-i18n="bg.hint">适合图标、贴纸、白底素材</p>' +
          '</section>' +
          '<button class="link reset" id="resetBtn" type="button" data-i18n="action.reset">恢复默认设置</button>' +
        '</aside>' +
        '<section class="stage" id="stage">' +
          '<div class="stage-head">' +
            '<div class="stats"><b id="statSize">—</b><span id="statColors"></span><span id="statBeads"></span><span class="spinner" id="spinner"></span></div>' +
            '<div class="tools">' +
              '<label class="check"><input type="checkbox" id="codesInput" checked><span data-i18n="display.codes">显示色号</span></label>' +
              '<div class="zoom"><button type="button" id="zoomOut" aria-label="zoom out">−</button><span id="zoomLabel">1×</span><button type="button" id="zoomIn" aria-label="zoom in">+</button><button type="button" class="wide" id="zoomFit">适应</button></div>' +
            '</div>' +
          '</div>' +
          '<div class="scroll" id="scroll"><canvas id="canvas" hidden></canvas></div>' +
          '<div class="empty" id="empty">' + emptyBeads +
            '<h3 data-i18n="empty.title">上传一张图片，马上变成拼豆图纸</h3>' +
            '<p data-i18n="empty.desc">支持 PNG / JPG / WebP，也可以直接拖进这里或按 Ctrl+V 粘贴</p>' +
            '<div class="row2"><button class="btn primary" id="emptyCta" type="button" data-i18n="empty.cta">选择图片</button>' +
            '<button class="btn ghost" id="emptyDemo" type="button" data-i18n="empty.sample">先看看示例</button></div>' +
          '</div>' +
          '<div class="legend" id="legend" hidden><div class="legend-head"><b data-i18n="legend.title">色号清单</b><span id="legendTotal"></span></div><div class="legend-list" id="legendList"></div></div>' +
        '</section>' +
      '</main>' +
    '</div>' +
    '<div class="modal" id="modal"><div class="panel">' +
      '<div class="bar"><h3 data-i18n="export.previewTitle">图纸预览</h3><button class="btn ghost small" id="modalClose" type="button" data-i18n="action.close">关闭</button></div>' +
      '<div class="shot"><img id="sheetImg" alt=""></div>' +
      '<div class="foot"><button class="btn ghost" id="modalClose2" type="button" data-i18n="action.close">关闭</button><button class="btn primary" id="downloadBtn" type="button" data-i18n="action.download">下载 PNG</button></div>' +
    '</div></div>' +
    '<div class="toast" id="toast"></div>';
}

function webWire() {
  webViews.drop = webEl('drop');
  webViews.fileInput = webEl('fileInput');
  webViews.thumb = webEl('thumb');
  webViews.thumbImg = webEl('thumbImg');
  webViews.thumbName = webEl('thumbName');
  webViews.thumbSize = webEl('thumbSize');
  webViews.dropPh = webEl('dropPh');
  webViews.removeBtn = webEl('removeBtn');
  webViews.presets = webEl('presets');
  webViews.wInput = webEl('wInput');
  webViews.hInput = webEl('hInput');
  webViews.fitBtn = webEl('fitBtn');
  webViews.scopeSeg = webEl('scopeSeg');
  webViews.maxInput = webEl('maxInput');
  webViews.maxOut = webEl('maxOut');
  webViews.ditherInput = webEl('ditherInput');
  webViews.bgInput = webEl('bgInput');
  webViews.tolWrap = webEl('tolWrap');
  webViews.tolInput = webEl('tolInput');
  webViews.tolOut = webEl('tolOut');
  webViews.tolLabel = webEl('tolLabel');
  webViews.codesInput = webEl('codesInput');
  webViews.canvas = webEl('canvas');
  webViews.scroll = webEl('scroll');
  webViews.empty = webEl('empty');
  webViews.legend = webEl('legend');
  webViews.legendList = webEl('legendList');
  webViews.legendTotal = webEl('legendTotal');
  webViews.statSize = webEl('statSize');
  webViews.statColors = webEl('statColors');
  webViews.statBeads = webEl('statBeads');
  webViews.stage = webEl('stage');
  webViews.spinner = webEl('spinner');
  webViews.exportBtn = webEl('exportBtn');
  webViews.csvBtn = webEl('csvBtn');
  webViews.langBtn = webEl('langBtn');
  webViews.resetBtn = webEl('resetBtn');
  webViews.zoomLabel = webEl('zoomLabel');
  webViews.modal = webEl('modal');
  webViews.sheetImg = webEl('sheetImg');
  webViews.toast = webEl('toast');

  for (const size of WEB_PRESETS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset';
    button.textContent = size + '×' + size;
    button.dataset.size = String(size);
    button.addEventListener('click', () => {
      if (webState.settings.lockRatio !== false && webState.source) {
        const ratio = webState.source.height / webState.source.width;
        webApplySize(size, clamp(Math.round(size * ratio), 8, 200));
      } else {
        webApplySize(size, size);
      }
    });
    webViews.presets.appendChild(button);
  }

  webViews.drop.addEventListener('click', () => webViews.fileInput.click());
  webViews.fileInput.addEventListener('change', () => {
    const file = webViews.fileInput.files && webViews.fileInput.files[0];
    if (file) webLoadFile(file);
    webViews.fileInput.value = '';
  });
  webViews.drop.addEventListener('dragover', (event) => {
    event.preventDefault();
    webViews.drop.classList.add('over');
  });
  webViews.drop.addEventListener('dragleave', () => webViews.drop.classList.remove('over'));
  webViews.drop.addEventListener('drop', (event) => {
    event.preventDefault();
    webViews.drop.classList.remove('over');
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) webLoadFile(file);
  });
  document.addEventListener('paste', (event) => {
    const data = event.clipboardData;
    if (!data) return;
    const file = data.files && data.files[0];
    if (!file || !/^image\//.test(file.type || '')) return;
    event.preventDefault();
    webLoadFile(file);
  });

  webEl('demoBtn').addEventListener('click', webLoadDemo);
  webEl('emptyDemo').addEventListener('click', webLoadDemo);
  const cta = webEl('emptyCta');
  if (cta) cta.addEventListener('click', () => webViews.fileInput.click());
  webViews.removeBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    webRemoveSource();
  });

  webViews.wInput.addEventListener('change', () => webSizeFromInput());
  webViews.hInput.addEventListener('change', () => webSizeFromInput());
  webViews.fitBtn.addEventListener('click', () => webFitToImage(true));
  webViews.lockRatio = webEl('lockRatio');
  webViews.lockRatio.addEventListener('change', () => {
    webPatch({ lockRatio: webViews.lockRatio.checked });
  });

  webViews.scopeSeg.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-scope]');
    if (!button) return;
    webPatch({ scope: button.dataset.scope });
  });
  webViews.maxInput.addEventListener('input', () => {
    const value = clamp(Number(webViews.maxInput.value) || 24, 2, 64);
    webViews.maxOut.textContent = String(value);
    webPatch({ maxColors: value }, true, 160);
  });
  webViews.ditherInput.addEventListener('change', () => webPatch({ dither: webViews.ditherInput.checked }));
  webViews.bgInput.addEventListener('change', () => {
    const on = webViews.bgInput.checked;
    webViews.tolWrap.hidden = !on;
    webPatch({ removeBg: on });
  });
  webViews.tolInput.addEventListener('input', () => {
    const value = clamp(Number(webViews.tolInput.value) || 12, 0, 60);
    webViews.tolOut.textContent = String(value);
    webViews.tolLabel.textContent = webT('bg.tolerance', { n: value });
    webPatch({ tolerance: value }, true, 200);
  });
  webViews.codesInput.addEventListener('change', () => {
    webState.settings.showCodes = webViews.codesInput.checked;
    webSaveSettings();
    webDraw();
  });

  webEl('zoomIn').addEventListener('click', () => webSetZoom(webState.zoom === 0 ? 1 : webState.zoom + 1));
  webEl('zoomOut').addEventListener('click', () => webSetZoom(webState.zoom - 1));
  webEl('zoomFit').addEventListener('click', () => webSetZoom(0));
  webViews.langBtn.addEventListener('click', () => {
    webState.lang = webState.lang === 'zh' ? 'en' : 'zh';
    document.documentElement.lang = webState.lang === 'en' ? 'en' : 'zh-CN';
    webSyncLanguageChrome();
    webRender();
  });
  webViews.resetBtn.addEventListener('click', webReset);

  webViews.exportBtn.addEventListener('click', webExportSheet);
  webViews.csvBtn.addEventListener('click', webExportCsv);
  webEl('modalClose').addEventListener('click', webCloseModal);
  webEl('modalClose2').addEventListener('click', webCloseModal);
  webViews.modal.addEventListener('click', (event) => {
    if (event.target === webViews.modal) webCloseModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && webViews.modal.classList.contains('on')) webCloseModal();
  });
  webEl('downloadBtn').addEventListener('click', () => {
    if (!webState.sheet) return;
    const link = document.createElement('a');
    link.href = webState.sheet.url;
    link.download = webState.sheet.name;
    link.click();
    webToast(webT('toast.exported', { name: webState.sheet.name }));
  });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (webState.pattern) webDraw(); }, 160);
  });

  // expose for debugging / automation
  window.__pindouWeb = {
    loadFile: webLoadFile,
    loadDemo: webLoadDemo,
    state: () => webState,
    exportSheet: webExportSheet,
  };
}

function webSyncLanguageChrome() {
  document.title = webT('app.title') + ' · ' + (webState.lang === 'en' ? '拼豆图纸工坊' : 'Bead Pattern Studio');
  webViews.langBtn.textContent = webState.lang === 'en' ? '中文' : 'EN';
  webEl('zoomOut').setAttribute('aria-label', webT('action.zoomOut'));
  webEl('zoomIn').setAttribute('aria-label', webT('action.zoomIn'));
  webEl('zoomFit').textContent = webState.lang === 'en' ? 'Fit' : '适应';
  webEl('zoomLabel').textContent = webState.zoom === 0 ? webT('zoom.full') : webState.zoom + '×';
  const dict = webState.lang === 'en' ? en : zh;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    if (key === 'color.standardShort') {
      node.textContent = webState.lang === 'en' ? 'Standard ' + MARD_STANDARD_COUNT : '标准 ' + MARD_STANDARD_COUNT;
      return;
    }
    if (key === 'color.allShort') {
      node.textContent = webState.lang === 'en' ? 'All ' + MARD_TOTAL_COUNT : '全部 ' + MARD_TOTAL_COUNT;
      return;
    }
    if (dict[key] !== undefined) node.textContent = dict[key];
  });
}

function webPatch(next, soft, delay) {
  Object.assign(webState.settings, next);
  webSaveSettings();
  webRenderControls();
  if (soft) {
    webSchedule(delay || 120);
  } else {
    webSchedule(140);
  }
}

function webSchedule(delay) {
  clearTimeout(webState.timer);
  webState.timer = setTimeout(() => { webRebuild(); }, delay || 120);
}

function webApplySize(w, h) {
  webState.settings.w = clamp(Math.round(w), 8, 200);
  webState.settings.h = clamp(Math.round(h), 8, 200);
  webSaveSettings();
  webRenderControls();
  webSchedule(90);
}

function webSizeFromInput() {
  const locked = webState.settings.lockRatio !== false && !!webState.source;
  const source = webState.source;
  const ratio = source ? source.height / source.width : 1;
  if (locked) {
    const changedW = document.activeElement === webViews.wInput;
    if (changedW) {
      webState.settings.w = clamp(Math.round(Number(webViews.wInput.value) || 50), 8, 200);
      const h = clamp(Math.round(webState.settings.w * ratio), 8, 200);
      webState.settings.h = h > 200 ? 200 : h;
    } else {
      webState.settings.h = clamp(Math.round(Number(webViews.hInput.value) || 50), 8, 200);
      webState.settings.w = clamp(Math.round(webState.settings.h / ratio), 8, 200);
    }
  } else {
    webState.settings.w = clamp(Math.round(Number(webViews.wInput.value) || 50), 8, 200);
    webState.settings.h = clamp(Math.round(Number(webViews.hInput.value) || 50), 8, 200);
  }
  webSaveSettings();
  webRenderControls();
  webSchedule(90);
}

function webFitToImage(announce) {
  const source = webState.source;
  if (!source) return;
  const span = Math.max(webState.settings.w, webState.settings.h);
  const ratio = source.height / source.width;
  const h = clamp(Math.round(span * ratio), 8, 200);
  webState.settings.h = h;
  webSaveSettings();
  webRenderControls();
  if (announce) webToast(webT('size.adjusted', { w: webState.settings.w, h }));
  webSchedule(90);
}

function webSetZoom(value) {
  const next = clamp(Math.round(value), 0, 3);
  if (next === webState.zoom) return;
  webState.zoom = next;
  webViews.zoomLabel.textContent = next === 0 ? webT('zoom.full') : next + '×';
  if (webState.pattern) webDraw();
}

function webReset() {
  webState.settings = Object.assign({}, WEB_DEFAULTS);
  webSaveSettings();
  webRenderControls();
  webToast(webT('toast.reset'));
  webSchedule(80);
}

function webRender() {
  webRenderControls();
  webRenderSource();
  webRenderStats();
  webRenderLegend();
  webDraw();
}

function webRenderControls() {
  const s = webState.settings;
  webViews.wInput.value = String(s.w);
  if (webViews.lockRatio) webViews.lockRatio.checked = s.lockRatio !== false;
  webViews.hInput.value = String(s.h);
  webViews.maxInput.value = String(s.maxColors);
  webViews.maxOut.textContent = String(s.maxColors);
  webViews.ditherInput.checked = !!s.dither;
  webViews.bgInput.checked = !!s.removeBg;
  webViews.tolWrap.hidden = !s.removeBg;
  webViews.tolInput.value = String(s.tolerance);
  webViews.tolOut.textContent = String(s.tolerance);
  webViews.tolLabel.textContent = webT('bg.tolerance', { n: s.tolerance });
  webViews.codesInput.checked = s.showCodes !== false;
  webViews.zoomLabel.textContent = webState.zoom + '×';
  for (const button of webViews.presets.querySelectorAll('button')) {
    const size = Number(button.dataset.size);
    button.classList.toggle('on', s.w === size && s.h === size);
  }
  for (const button of webViews.scopeSeg.querySelectorAll('button')) {
    button.classList.toggle('on', button.dataset.scope === s.scope);
  }
}

function webRenderSource() {
  const source = webState.source;
  webViews.dropPh.hidden = !!source;
  webViews.thumb.hidden = !source;
  webViews.removeBtn.hidden = !source;
  if (source) {
    webViews.thumbImg.src = source.url;
    webViews.thumbName.textContent = source.name;
    webViews.thumbSize.textContent = source.width + ' × ' + source.height + ' px';
  } else {
    webViews.thumbImg.removeAttribute('src');
  }
}

function webRenderStats() {
  const pattern = webState.pattern;
  const s = webState.settings;
  webViews.stage.classList.toggle('busy', webState.busy);
  if (!pattern) {
    webViews.statSize.textContent = s.w + ' × ' + s.h;
    webViews.statColors.textContent = '';
    webViews.statBeads.textContent = webState.busy ? webT('stats.busy') : '';
    return;
  }
  webViews.statSize.textContent = pattern.w + ' × ' + pattern.h;
  webViews.statColors.textContent = pattern.colors.length + ' ' + (webState.lang === 'en' ? 'colors' : '色');
  webViews.statBeads.textContent = formatNumber(pattern.total, webState.lang) + ' ' + (webState.lang === 'en' ? 'beads' : '颗');
}

function webRenderLegend() {
  const pattern = webState.pattern;
  if (!pattern || !pattern.colors.length) {
    webViews.legend.hidden = true;
    return;
  }
  webViews.legend.hidden = false;
  webViews.legendTotal.textContent = webT('legend.total', { n: formatNumber(pattern.total, webState.lang) });
  const parts = [];
  for (const color of pattern.colors) {
    parts.push('<span class="chip"><i style="background:' + color.hex + '"></i><b>' + color.code +
      '</b><span>' + formatNumber(color.count, webState.lang) + '</span></span>');
  }
  webViews.legendList.innerHTML = parts.join('');
}

function webDraw() {
  const pattern = webState.pattern;
  const canvas = webViews.canvas;
  if (!pattern) {
    canvas.hidden = true;
    webViews.empty.hidden = false;
    return;
  }
  canvas.hidden = false;
  webViews.empty.hidden = true;
  const stageWidth = Math.max(320, webViews.scroll.clientWidth - 32);
  const stageHeight = Math.max(280, webViews.scroll.clientHeight - 32);
  drawPattern(canvas, pattern, {
    stageWidth,
    stageHeight,
    zoom: webState.zoom,
    showCodes: webState.settings.showCodes !== false,
  });
  const scroller = webViews.scroll;
  if (scroller.scrollWidth > scroller.clientWidth + 1) {
    scroller.scrollLeft = Math.round((scroller.scrollWidth - scroller.clientWidth) / 2);
  }
}

function webLoadFile(file) {
  if (!file || !/^image\//.test(file.type || '')) {
    webToast(webT('error.type'));
    return;
  }
  loadSourceFile(file).then((source) => {
    webAdoptSource(source);
  }).catch((error) => {
    console.warn('[pindou] load failed', error);
    webToast(webT('error.load'));
  });
}


function webLoadDemo() {
  webAdoptSource(makeDemoSource());
}

function webAdoptSource(source) {
  if (webState.source && webState.source.owned && webState.source.url) {
    URL.revokeObjectURL(webState.source.url);
  }
  webState.source = source;
  webState.error = null;
  webState.zoom = 1;
  const ratio = source.height / source.width;
  let width = clamp(Math.round(webState.settings.w), 8, 200);
  let height = clamp(Math.round(width * ratio), 8, 200);
  if (height > 200) {
    height = 200;
    width = clamp(Math.round(height / ratio), 8, 200);
  }
  if (width !== webState.settings.w || height !== webState.settings.h) {
    webState.settings.w = width;
    webState.settings.h = height;
    webSaveSettings();
    webToast(webT('size.adjusted', { w: width, h: height }));
  }
  webRenderSource();
  webRenderControls();
  webSchedule(30);
}

function webRemoveSource() {
  if (webState.source && webState.source.owned && webState.source.url) {
    URL.revokeObjectURL(webState.source.url);
  }
  webState.source = null;
  webState.pattern = null;
  webState.error = null;
  webRenderSource();
  webRenderStats();
  webRenderLegend();
  webDraw();
}

function webRebuild() {
  if (!webState.source) return;
  const settings = webState.settings;
  webState.busy = true;
  webRenderStats();
  const run = () => {
    try {
      const rgba = sampleGrid(webState.source.canvas, settings.w, settings.h, createCanvas);
      const pattern = buildPattern(rgba, settings.w, settings.h, {
        maxColors: settings.maxColors,
        scope: settings.scope,
        dither: settings.dither,
        removeBg: settings.removeBg,
        tolerance: settings.tolerance,
      });
      webState.pattern = pattern;
      webState.error = null;
      if (pattern.bgRemoved === false && settings.removeBg) {
        webToast(webT('bg.notDetected'));
      }
    } catch (error) {
      webState.pattern = null;
      webState.error = error && error.code === 'empty' ? 'empty' : 'build';
      console.warn('[pindou] build failed', error);
    }
    webState.busy = false;
    webRenderStats();
    webRenderLegend();
    webDraw();
    webViews.exportBtn.disabled = !webState.pattern;
    webViews.csvBtn.disabled = !webState.pattern;
    if (webState.error) webToast(webT(webState.error === 'empty' ? 'error.empty' : 'error.build'));
  };
  requestAnimationFrame(run);
}

function webExportSheet() {
  const pattern = webState.pattern;
  if (!pattern) return;
  const lang = webState.lang;
  const labels = {
    title: webT('export.title'),
    subtitle: webT('export.subtitle', {
      w: pattern.w,
      h: pattern.h,
      colors: pattern.colors.length,
      beads: formatNumber(pattern.total, lang),
    }),
    legend: webT('export.legendTitle', { n: pattern.colors.length }),
    total: webT('legend.total', { n: formatNumber(pattern.total, lang) }),
    footer: webT('export.footer'),
  };
  try {
    const sheet = renderSheet(pattern, labels, lang);
    const url = sheet.toDataURL('image/png');
    webState.sheet = { url, name: fileNameFor({ w: pattern.w, h: pattern.h }, webState.source, 'png') };
    webViews.sheetImg.src = url;
    webViews.modal.classList.add('on');
  } catch (error) {
    console.warn('[pindou] export failed', error);
    webToast(webT('toast.failed'));
  }
}

function webCloseModal() {
  webViews.modal.classList.remove('on');
}

function webExportCsv() {
  const pattern = webState.pattern;
  if (!pattern) return;
  const lines = ['\ufeffcode,hex,count'];
  for (const color of pattern.colors) {
    lines.push(color.code + ',' + color.hex + ',' + color.count);
  }
  lines.push('TOTAL,,' + pattern.total);
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileNameFor({ w: pattern.w, h: pattern.h }, webState.source, 'csv');
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  webToast(webT('toast.csv'));
}

let webToastTimer = 0;
function webToast(message) {
  if (!message) return;
  webViews.toast.textContent = message;
  webViews.toast.classList.add('on');
  clearTimeout(webToastTimer);
  webToastTimer = setTimeout(() => webViews.toast.classList.remove('on'), 2400);
}

function webBoot() {
  const style = document.createElement('style');
  style.textContent = WEB_CSS;
  document.head.appendChild(style);
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.href = WEB_URL_SVG;
  document.head.appendChild(icon);
  webBuild();
  document.documentElement.lang = webState.lang === 'en' ? 'en' : 'zh-CN';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', webBoot);
} else {
  webBoot();
}

