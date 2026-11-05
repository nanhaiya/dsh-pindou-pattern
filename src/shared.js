/* 共用：文案、样式、编号格式化、图片加载、画布与图纸绘制（DSH 插件与独立网页版共用） */

/* ------------------------------ i18n ------------------------------ */
const zh = {
  'entry.label': '拼豆图纸工坊',
  'app.title': '拼豆图纸工坊',
  'app.subtitle': '上传图片，生成 MARD 色号拼豆图纸',
  'upload.title': '图片',
  'upload.pick': '选择图片',
  'upload.drop': '拖入图片，或 Ctrl+V 粘贴',
  'upload.change': '点击更换',
  'upload.demo': '试用示例',
  'upload.remove': '移除',
  'size.title': '图纸尺寸',
  'size.width': '宽',
  'size.height': '高',
  'size.fit': '按原图比例',
  'size.note': '8–200 格 · 每格一颗豆',
  'size.adjusted': '已按原图比例调整为 {w} × {h}',
  'color.title': '颜色',
  'color.scope': '色号范围',
  'color.standard': '标准 {n} 色',
  'color.all': '全部 {n} 色',
  'color.max': '颜色上限',
  'color.dither': '抖动',
  'color.ditherHint': '用噪点换细节，颗粒感更强',
  'bg.title': '背景',
  'bg.remove': '去除纯色背景',
  'bg.tolerance': '容差 {n}',
  'bg.hint': '适合图标、贴纸、白底素材',
  'bg.notDetected': '没检测到纯色背景，已保留全部像素',
  'display.codes': '显示色号',
  'stats.beads': '{n} 颗',
  'stats.colors': '{n} 色',
  'stats.busy': '正在生成…',
  'action.export': '导出图纸',
  'action.csvShort': 'CSV',
  'action.exportCsv': '导出色号清单 CSV',
  'action.reset': '恢复默认设置',
  'action.retry': '重试',
  'action.close': '关闭',
  'action.download': '下载 PNG',
  'action.zoomIn': '放大',
  'action.zoomOut': '缩小',
  'action.zoomFit': '适应',
  'zoom.full': '全图',
  'empty.title': '上传一张图片，马上变成拼豆图纸',
  'empty.desc': '支持 PNG / JPG / WebP，也可以直接拖进这里或按 Ctrl+V 粘贴',
  'empty.cta': '选择图片',
  'empty.sample': '先看看示例',
  'error.title': '这张图片没能生成图纸',
  'error.empty': '整张图都被当成了背景，试试降低背景容差或关掉「去除纯色背景」。',
  'error.build': '图片读取或处理失败，换一张试试。',
  'error.load': '这个文件读不出来，换一张图片试试。',
  'error.type': '请选择图片文件（PNG / JPG / WebP）。',
  'preview.alt': '{w} × {h} 拼豆图纸，{colors} 色',
  'legend.title': '色号清单',
  'legend.total': '共 {n} 颗',
  'export.title': '拼豆图纸',
  'export.subtitle': '{w} × {h} · {colors} 色 · {beads} 颗',
  'export.legendTitle': '色号清单 · {n} 色',
  'export.footer': 'MARD 色号 · 拼豆图纸工坊',
  'export.previewTitle': '图纸预览',
  'toast.exported': '已导出 {name}',
  'toast.failed': '导出失败，请重试',
  'toast.csv': '已导出色号清单',
  'toast.reset': '已恢复默认设置',
};

const en = {
  'entry.label': 'Bead Pattern Studio',
  'app.title': 'Bead Pattern Studio',
  'app.subtitle': 'Turn an image into a MARD-coded bead pattern',
  'upload.title': 'Image',
  'upload.pick': 'Choose an image',
  'upload.drop': 'Drop an image, or press Ctrl+V',
  'upload.change': 'Click to replace',
  'upload.demo': 'Try a sample',
  'upload.remove': 'Remove',
  'size.title': 'Pattern size',
  'size.width': 'Width',
  'size.height': 'Height',
  'size.fit': 'Fit image ratio',
  'size.note': '8–200 cells · one bead per cell',
  'size.adjusted': 'Adjusted to {w} × {h} to match the image',
  'color.title': 'Colors',
  'color.scope': 'Palette',
  'color.standard': 'Standard {n}',
  'color.all': 'All {n}',
  'color.max': 'Max colors',
  'color.dither': 'Dither',
  'color.ditherHint': 'More detail, more grain',
  'bg.title': 'Background',
  'bg.remove': 'Remove flat background',
  'bg.tolerance': 'Tolerance {n}',
  'bg.hint': 'Best for icons, stickers and flat backgrounds',
  'bg.notDetected': 'No flat background found — kept every pixel',
  'display.codes': 'Show codes',
  'stats.beads': '{n} beads',
  'stats.colors': '{n} colors',
  'stats.busy': 'Generating…',
  'action.export': 'Export pattern',
  'action.csvShort': 'CSV',
  'action.exportCsv': 'Export code list (CSV)',
  'action.reset': 'Restore defaults',
  'action.retry': 'Retry',
  'action.close': 'Close',
  'action.download': 'Download PNG',
  'action.zoomIn': 'Zoom in',
  'action.zoomOut': 'Zoom out',
  'action.zoomFit': 'Fit',
  'zoom.full': 'Full',
  'empty.title': 'Drop an image and get a bead pattern',
  'empty.desc': 'PNG, JPG or WebP — drag it here or paste with Ctrl+V',
  'empty.cta': 'Choose an image',
  'empty.sample': 'Try a sample',
  'error.title': 'This image did not become a pattern',
  'error.empty': 'Everything was treated as background. Lower the tolerance or turn off background removal.',
  'error.build': 'The image could not be processed. Try another one.',
  'error.load': 'This file could not be read. Try another image.',
  'error.type': 'Please choose an image file (PNG, JPG, WebP).',
  'preview.alt': '{w} × {h} bead pattern, {colors} colors',
  'legend.title': 'Color list',
  'legend.total': '{n} beads total',
  'export.title': 'Bead pattern',
  'export.subtitle': '{w} × {h} · {colors} colors · {beads} beads',
  'export.legendTitle': 'Color list · {n}',
  'export.footer': 'MARD codes · Bead Pattern Studio',
  'export.previewTitle': 'Pattern preview',
  'toast.exported': 'Saved {name}',
  'toast.failed': 'Export failed — try again',
  'toast.csv': 'Color list exported',
  'toast.reset': 'Defaults restored',
};

const CSS = `
.pdp-root{height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family,"PingFang SC","Microsoft YaHei",system-ui,sans-serif);position:relative}
.pdp-root *{box-sizing:border-box}
.pdp-head{flex:none;display:flex;align-items:center;gap:16px;padding:14px 18px 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.pdp-brand{display:flex;align-items:center;gap:11px;min-width:0;flex:1}
.pdp-brandmark{flex:none;width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-state-business-primary)}
.pdp-brandtext{min-width:0}
.pdp-title{margin:0;font-size:15.5px;font-weight:700;letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pdp-sub{margin:2px 0 0;font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pdp-head-actions{display:flex;align-items:center;gap:8px;flex:none}
.pdp-stat{font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;font-variant-numeric:tabular-nums}
.pdp-body{flex:1;min-height:0;display:flex;gap:14px;padding:12px 16px 16px}
.pdp-side{flex:none;width:294px;min-height:0;display:flex;flex-direction:column;gap:10px;overflow-y:auto;padding-right:2px;padding-bottom:2px}
.pdp-main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px}
.pdp-card{flex:none;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:12px}
.pdp-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}
.pdp-card-head h2{margin:0;font-size:11.5px;font-weight:700;letter-spacing:.04em;color:var(--dsw-alias-label-secondary)}
.pdp-card-body{display:flex;flex-direction:column;gap:8px}
.pdp-upload{display:flex;align-items:center;gap:10px;min-height:66px;padding:10px;border:1.5px dashed var(--dsw-alias-border-l2);border-radius:10px;cursor:pointer;background:transparent;transition:border-color .15s,background .15s;text-align:left;color:inherit;font:inherit}
.pdp-upload:hover,.pdp-upload.pdp-drag{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-hover)}
.pdp-upload:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.pdp-upload-icon{flex:none;width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}
.pdp-upload-text{display:flex;flex-direction:column;gap:1px;min-width:0}
.pdp-upload-text b{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pdp-upload-text span{font-size:10.5px;color:var(--dsw-alias-label-tertiary)}
.pdp-upload-text em{font-style:normal;font-size:10.5px;color:var(--dsw-alias-state-business-primary)}
.pdp-upload>div>b{font-size:12.5px;font-weight:600;display:block}
.pdp-upload>div>span{font-size:10.5px;color:var(--dsw-alias-label-tertiary);display:block;margin-top:2px;line-height:1.45}
.pdp-thumb{flex:none;width:48px;height:48px;border-radius:8px;object-fit:cover;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}
.pdp-chips{display:flex;flex-wrap:wrap;gap:6px}
.pdp-chip{font:inherit;font-size:11.5px;line-height:1;padding:6px 9px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-variant-numeric:tabular-nums}
.pdp-chip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.pdp-chip[data-active="true"]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);font-weight:600}
.pdp-size-row{display:flex;align-items:flex-end;gap:7px}
.pdp-field{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}
.pdp-field>span{font-size:10.5px;color:var(--dsw-alias-label-tertiary)}
.pdp-times{color:var(--dsw-alias-label-tertiary);font-size:12px;padding-bottom:7px}
.pdp-input{width:100%;font:inherit;font-size:12.5px;color:var(--dsw-alias-label-primary);background:var(--dsw-specific-input-major);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:6px 8px;outline:none;font-variant-numeric:tabular-nums}
.pdp-input:focus{border-color:var(--dsw-alias-state-business-primary)}
.pdp-linkbtn{display:inline-flex;align-items:center;gap:5px;align-self:flex-start;border:none;background:none;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:11.5px;padding:0;cursor:pointer}
.pdp-linkbtn:hover{text-decoration:underline}
.pdp-linkbtn:disabled{opacity:.45;cursor:default;text-decoration:none}
.pdp-note{margin:0;font-size:10.5px;line-height:1.55;color:var(--dsw-alias-label-tertiary)}
.pdp-seg{display:flex;gap:4px;padding:3px;border-radius:9px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}
.pdp-seg button{flex:1;font:inherit;font-size:11px;padding:5px 6px;border-radius:6px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;white-space:nowrap}
.pdp-seg button[aria-checked="true"]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.10)}
.pdp-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.pdp-badge{font-size:10.5px;font-weight:600;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:1px 7px;font-variant-numeric:tabular-nums}
.pdp-range{width:100%;accent-color:var(--dsw-alias-state-business-primary);margin:0;height:18px;cursor:pointer}
.pdp-check{display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--dsw-alias-label-primary);cursor:pointer;line-height:1.4}
.pdp-check input{accent-color:var(--dsw-alias-state-business-primary);width:13px;height:13px;margin:0;flex:none;cursor:pointer}
.pdp-check em{font-style:normal;color:var(--dsw-alias-label-tertiary);font-size:10.5px}
.pdp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;font:inherit;font-size:12px;font-weight:600;border-radius:9px;padding:7px 12px;cursor:pointer;border:1px solid transparent;white-space:nowrap}
.pdp-btn:disabled{opacity:.45;cursor:default}
.pdp-btn-compact{padding:5px 9px;font-size:11.5px;font-weight:500;gap:5px;border-radius:8px}
.pdp-btn-primary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}
.pdp-btn-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.pdp-btn-ghost{background:transparent;border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}
.pdp-btn-ghost:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.pdp-full{width:100%}
.pdp-reset{position:sticky;bottom:0;align-self:center;margin-top:2px;padding:3px 8px;border:0;border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:1.4;cursor:pointer}
.pdp-reset:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
.pdp-iconbtn{width:30px;height:30px;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.pdp-iconbtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.pdp-stagebar{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:26px;padding:0 2px}
.pdp-stage-meta{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--dsw-alias-label-secondary);min-width:0;font-variant-numeric:tabular-nums;flex-wrap:wrap}
.pdp-stage-meta b{font-size:12px;color:var(--dsw-alias-label-primary);font-weight:600}
.pdp-stage-meta .pdp-busy{display:inline-flex;align-items:center;gap:5px;color:var(--dsw-alias-label-tertiary)}
.pdp-spinner{width:10px;height:10px;border-radius:50%;border:1.5px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-state-business-primary);display:inline-block;animation:pdp-spin .8s linear infinite}
@keyframes pdp-spin{to{transform:rotate(360deg)}}
.pdp-stage-tools{display:flex;align-items:center;gap:10px;flex:none}
.pdp-check-inline{font-size:11px;color:var(--dsw-alias-label-secondary);gap:5px}
.pdp-zoom{display:flex;align-items:center;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:hidden;height:26px;background:var(--dsw-alias-bg-layer-1)}
.pdp-zoom button{width:24px;height:100%;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0}
.pdp-zoom button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.pdp-zoom button:disabled{opacity:.35;cursor:default}
.pdp-zoom span{min-width:30px;text-align:center;font-size:10.5px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.pdp-zoomfit{width:auto!important;padding:0 8px!important;font:inherit;font-size:10.5px;border-left:1px solid var(--dsw-alias-border-l1)!important;color:var(--dsw-alias-label-secondary)}
.pdp-stage{position:relative;flex:1;min-height:0;display:flex;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}
.pdp-scroll{flex:1;min-height:0;overflow:auto;display:flex;align-items:flex-start;justify-content:flex-start;padding:16px}
.pdp-canvas{display:block;border-radius:8px;box-shadow:0 2px 14px rgba(0,0,0,.14),0 0 0 1px rgba(0,0,0,.05);flex:none;margin:0 auto}
.pdp-placeholder{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--dsw-alias-label-secondary);font-size:12px}
.pdp-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:28px;color:var(--dsw-alias-label-secondary)}
.pdp-empty-art{color:var(--dsw-alias-label-tertiary);opacity:.9;margin-bottom:2px}
.pdp-empty h2{margin:0;font-size:15px;font-weight:650;color:var(--dsw-alias-label-primary)}
.pdp-empty p{margin:0;font-size:11.5px;line-height:1.6;max-width:340px}
.pdp-empty-actions{display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;justify-content:center}
.pdp-legacy-empty{cursor:default}
.pdp-drop-overlay{position:absolute;inset:8px;border:2px dashed var(--dsw-alias-state-business-primary);border-radius:10px;background:var(--dsw-alias-bg-base);opacity:.94;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--dsw-alias-state-business-primary);font-size:12px;z-index:4;pointer-events:none}
.pdp-legend{flex:none;border-top:1px solid var(--dsw-alias-border-l1);padding:8px 2px 0;max-height:152px;overflow-y:auto}
.pdp-legend-head{display:flex;align-items:baseline;gap:8px;margin-bottom:6px}
.pdp-legend-head b{font-size:12.5px;font-weight:700;color:var(--dsw-alias-label-secondary)}
.pdp-legend-head span{font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
.pdp-legend-list{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:4px}
.pdp-legend-chip{display:inline-flex;align-items:center;gap:6px;padding:3px 9px 3px 4px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:var(--dsw-alias-bg-layer-1);font-size:12.5px;line-height:1.5}
.pdp-legend-chip i{width:15px;height:15px;border-radius:4px;border:1px solid rgba(0,0,0,.14);flex:none}
.pdp-legend-chip b{font-family:var(--ds-font-family-code,ui-monospace,Consolas,monospace);font-size:12.5px;font-weight:600}
.pdp-legend-chip em{font-style:normal;font-size:11.5px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.pdp-modal{position:fixed;inset:0;z-index:60;background:rgba(12,12,12,.46);display:flex;align-items:center;justify-content:center;padding:26px}
.pdp-modal-card{display:flex;flex-direction:column;max-width:min(94vw,1080px);max-height:92vh;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;box-shadow:0 24px 70px rgba(0,0,0,.35);overflow:hidden}
.pdp-modal-head{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 14px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.pdp-modal-head h2{margin:0;font-size:12.5px;font-weight:650}
.pdp-modal-body{flex:1;min-height:0;overflow:auto;padding:14px;background:var(--dsw-alias-bg-layer-2);display:flex;align-items:flex-start;justify-content:center}
.pdp-modal-img{display:block;max-width:100%;max-height:calc(88vh - 160px);object-fit:contain;background:#FBF9F4;border-radius:6px;box-shadow:0 4px 24px rgba(0,0,0,.18)}
.pdp-modal-foot{flex:none;display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid var(--dsw-alias-border-l1)}
.pdp-toast{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);z-index:70;display:flex;align-items:center;gap:6px;padding:7px 13px;border-radius:999px;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);box-shadow:0 6px 24px rgba(0,0,0,.22);font-size:11.5px;color:var(--dsw-alias-label-primary);max-width:80%;animation:pdp-toast-in .18s ease-out}
@keyframes pdp-toast-in{from{opacity:0;transform:translateX(-50%) translateY(4px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@media (max-width:980px){
  .pdp-body{flex-direction:column;padding:10px 12px 12px}
  .pdp-side{width:auto;max-height:43vh;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}
  .pdp-side>.pdp-card{min-width:0}
  .pdp-main{min-height:340px}
  .pdp-head{padding:10px 12px}
  .pdp-stat{display:none}
}
@media (max-width:620px){
  .pdp-side{grid-template-columns:minmax(0,1fr)}
  .pdp-sub{display:none}
}
`;
function formatNumber(value, lang) {
  try {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'zh-CN').format(value);
  } catch (error) {
    return String(value);
  }
}
function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
function loadSourceFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      try {
        const max = 1800;
        const scale = Math.min(1, max / Math.max(image.naturalWidth || 1, image.naturalHeight || 1));
        const width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
        const height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, 0, 0, width, height);
        resolve({ canvas, width, height, name: file.name || 'image', url, owned: true });
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    image.src = url;
  });
}

function makeDemoSource() {
  const size = 320;
  const canvas = createCanvas(size, size);
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, size, size);
  const heart = (scale, offsetY, fill) => {
    g.save();
    g.translate(size / 2, size / 2 + offsetY);
    g.scale(scale, scale);
    g.beginPath();
    g.moveTo(0, 84);
    g.bezierCurveTo(-76, 26, -92, -40, -43, -62);
    g.bezierCurveTo(-16, -74, -2, -52, 0, -32);
    g.bezierCurveTo(2, -52, 16, -74, 43, -62);
    g.bezierCurveTo(92, -40, 76, 26, 0, 84);
    g.closePath();
    g.fillStyle = fill;
    g.fill();
    g.restore();
  };
  heart(1, 4, '#E24A5B');
  heart(0.62, -14, '#F4939D');
  g.fillStyle = '#F4C24A';
  const sparkle = (cx, cy, r) => {
    g.beginPath();
    g.moveTo(cx, cy - r);
    g.quadraticCurveTo(cx, cy, cx + r, cy);
    g.quadraticCurveTo(cx, cy, cx, cy + r);
    g.quadraticCurveTo(cx, cy, cx - r, cy);
    g.quadraticCurveTo(cx, cy, cx, cy - r);
    g.fill();
  };
  sparkle(56, 70, 15);
  sparkle(262, 116, 10);
  sparkle(250, 48, 7);
  return {
    canvas,
    width: size,
    height: size,
    name: 'demo-heart',
    url: canvas.toDataURL('image/png'),
    owned: false,
  };
}

function fileNameFor(pat, source, extension) {
  const raw = (source && source.name ? source.name : 'pindou').replace(/\.[^.]+$/, '');
  const base = raw.replace(/[^\w\u4e00-\u9fa5-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'pindou';
  return 'pindou-' + base + '-' + pat.w + 'x' + pat.h + '-mard.' + extension;
}

function drawPattern(canvas, pattern, options) {
  const zoom = options.zoom === 0 ? 0 : options.zoom || 1;
  const stageWidth = options.stageWidth || 760;
  const stageHeight = options.stageHeight || 0;
  const showCodes = options.showCodes !== false;
  const digits = String(Math.max(pattern.w, pattern.h)).length;
  const band = clamp(12 + digits * 6, 18, 34);
  const pad = 14;
  const available = Math.max(120, stageWidth - pad * 2 - band - 2);
  const availableH = stageHeight > 0 ? Math.max(120, stageHeight - pad * 2 - band - 2) : 0;
  let cell;
  if (zoom === 0) {
    // 整图模式：宽高一起塞进舞台，太小的时候不画色号
    cell = Math.floor(available / pattern.w);
    if (availableH > 0) cell = Math.min(cell, Math.floor(availableH / pattern.h));
    cell = clamp(cell, 4, 44);
  } else {
    // 细节模式：保证色号放得下，宽图横向滚动
    const minCell = showCodes ? 20 : 4;
    cell = Math.floor(available / pattern.w);
    cell = clamp(cell, minCell, 44);
    if (zoom > 1) cell = Math.round(cell * zoom);
  }
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  const maxDevice = 8192;
  const cellLimit = Math.floor(maxDevice / (Math.max(pattern.w, pattern.h) * dpr));
  if (cellLimit >= 1) cell = Math.min(cell, cellLimit);
  const logicalW = band + pattern.w * cell + pad;
  const logicalH = band + pattern.h * cell + pad;
  canvas.width = Math.round(logicalW * dpr);
  canvas.height = Math.round(logicalH * dpr);
  canvas.style.width = logicalW + 'px';
  canvas.style.height = logicalH + 'px';
  const g = canvas.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, logicalW, logicalH);
  g.fillStyle = '#FBF9F4';
  g.fillRect(0, 0, logicalW, logicalH);

  const originX = band;
  const originY = band;
  for (let y = 0; y < pattern.h; y += 1) {
    for (let x = 0; x < pattern.w; x += 1) {
      const index = pattern.cells[y * pattern.w + x];
      if (index < 0) continue;
      g.fillStyle = pattern.colors[index].hex;
      g.fillRect(originX + x * cell, originY + y * cell, cell, cell);
    }
  }

  const steps = [1, 2, 5, 10, 20, 50];
  let step = steps[0];
  for (const candidate of steps) {
    step = candidate;
    if (candidate * cell >= 15) break;
  }
  const lineDark = 'rgba(104,96,84,0.20)';
  const lineSoft = 'rgba(104,96,84,0.13)';
  for (let x = 0; x <= pattern.w; x += 1) {
    g.strokeStyle = x % 5 === 0 ? lineDark : lineSoft;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(originX + x * cell + 0.5, originY);
    g.lineTo(originX + x * cell + 0.5, originY + pattern.h * cell);
    g.stroke();
  }
  for (let y = 0; y <= pattern.h; y += 1) {
    g.strokeStyle = y % 5 === 0 ? lineDark : lineSoft;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(originX, originY + y * cell + 0.5);
    g.lineTo(originX + pattern.w * cell, originY + y * cell + 0.5);
    g.stroke();
  }
  g.strokeStyle = 'rgba(74,66,55,0.42)';
  g.lineWidth = 1.4;
  g.strokeRect(originX + 0.5, originY + 0.5, pattern.w * cell - 1, pattern.h * cell - 1);

  const numberFont = clamp(cell * 0.52, 8, 11);
  g.fillStyle = '#6C655A';
  g.font = '500 ' + numberFont.toFixed(1) + 'px ui-monospace, "SFMono-Regular", Consolas, monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (let x = 0; x < pattern.w; x += 1) {
    if ((x + 1) % step !== 0) continue;
    g.fillText(String(x + 1), originX + x * cell + cell / 2, originY - band / 2);
  }
  for (let y = 0; y < pattern.h; y += 1) {
    if ((y + 1) % step !== 0) continue;
    g.fillText(String(y + 1), originX - band / 2, originY + y * cell + cell / 2);
  }

  if (showCodes) {
    let maxChars = 1;
    for (const color of pattern.colors) maxChars = Math.max(maxChars, color.code.length);
    let fontSize = Math.min(Math.round(cell * 0.52), 20);
    fontSize = Math.min(fontSize, Math.floor((cell - 2) / (maxChars * 0.56)));
    if (fontSize >= 4) {
      g.font = '600 ' + fontSize + 'px ui-monospace, "SFMono-Regular", Consolas, monospace';
      for (let y = 0; y < pattern.h; y += 1) {
        for (let x = 0; x < pattern.w; x += 1) {
          const index = pattern.cells[y * pattern.w + x];
          if (index < 0) continue;
          const color = pattern.colors[index];
          g.fillStyle = color.luminance > 0.58 ? 'rgba(32,28,23,0.78)' : 'rgba(255,255,255,0.9)';
          g.fillText(color.code, originX + x * cell + cell / 2, originY + y * cell + cell / 2 + 0.5);
        }
      }
    }
  }
}

function renderSheet(pattern, labels, lang) {
  const { w, h, cells, colors, total } = pattern;
  const maxDim = Math.max(w, h);
  let cell = Math.floor(3200 / maxDim);
  cell = clamp(cell, 16, 52);
  if (cell * maxDim > 4100) cell = Math.floor(4100 / maxDim);
  const numBand = Math.max(20, Math.round(cell * 0.82));
  const padX = 56;
  const padTop = 46;
  const titleH = 126;
  const gapAfterGrid = 34;
  const legendHeadH = 58;
  const chipH = 52;
  const footerH = 58;
  const gridW = w * cell;
  const gridH = h * cell;
  const contentW = gridW + numBand * 2;
  const sheetW = padX * 2 + contentW;
  // 色号清单一排最多 10 个，格子按可用宽度均分
  const chipW = clamp(Math.floor(contentW / 10), 124, 280);
  const perRow = Math.max(1, Math.min(10, Math.floor(contentW / chipW)));
  const rows = Math.ceil(colors.length / perRow);
  const legendH = legendHeadH + rows * chipH + 10;
  const sheetH = padTop + titleH + numBand + gridH + numBand + gapAfterGrid + legendH + footerH;
  const canvas = createCanvas(sheetW, sheetH);
  const g = canvas.getContext('2d');
  const SANS = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",system-ui,sans-serif';
  const MONO = 'ui-monospace,"SFMono-Regular",Consolas,"Liberation Mono",monospace';

  g.fillStyle = '#FBF9F4';
  g.fillRect(0, 0, sheetW, sheetH);
  g.fillStyle = '#E9D9B9';
  g.fillRect(0, 0, sheetW, 7);

  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.fillStyle = '#221F1B';
  g.font = '700 42px ' + SANS;
  g.fillText(labels.title, padX, padTop + 48);
  g.fillStyle = '#6F675C';
  g.font = '400 19px ' + SANS;
  g.fillText(labels.subtitle, padX, padTop + 86);
  g.textAlign = 'right';
  g.fillStyle = '#B6A78E';
  g.font = '700 24px ' + MONO;
  g.fillText('MARD', sheetW - padX, padTop + 44);

  const originX = padX + numBand;
  const originY = padTop + titleH + numBand;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const index = cells[y * w + x];
      if (index < 0) continue;
      g.fillStyle = colors[index].hex;
      g.fillRect(originX + x * cell, originY + y * cell, cell, cell);
    }
  }

  g.strokeStyle = '#DCD5C9';
  g.lineWidth = 1;
  for (let x = 0; x <= w; x += 1) {
    g.beginPath();
    g.moveTo(originX + x * cell + 0.5, originY);
    g.lineTo(originX + x * cell + 0.5, originY + gridH);
    g.stroke();
  }
  for (let y = 0; y <= h; y += 1) {
    g.beginPath();
    g.moveTo(originX, originY + y * cell + 0.5);
    g.lineTo(originX + gridW, originY + y * cell + 0.5);
    g.stroke();
  }
  g.strokeStyle = '#B5AA97';
  g.lineWidth = 1.5;
  g.strokeRect(originX + 0.5, originY + 0.5, gridW - 1, gridH - 1);

  const numberFont = Math.max(10, Math.round(cell * 0.42));
  g.fillStyle = '#6E665A';
  g.font = '600 ' + numberFont + 'px ' + MONO;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (let x = 0; x < w; x += 1) {
    const cx = originX + x * cell + cell / 2;
    g.fillText(String(x + 1), cx, originY - numBand / 2);
    g.fillText(String(x + 1), cx, originY + gridH + numBand / 2);
  }
  for (let y = 0; y < h; y += 1) {
    const cy = originY + y * cell + cell / 2;
    g.fillText(String(y + 1), originX - numBand / 2, cy);
    g.fillText(String(y + 1), originX + gridW + numBand / 2, cy);
  }

  let maxChars = 1;
  for (const color of colors) maxChars = Math.max(maxChars, color.code.length);
  let codeFont = Math.min(Math.round(cell * 0.54), 26);
  codeFont = Math.min(codeFont, Math.floor((cell - 3) / (maxChars * 0.6)));
  if (codeFont >= 5) {
    g.font = '600 ' + codeFont + 'px ' + MONO;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const index = cells[y * w + x];
        if (index < 0) continue;
        const color = colors[index];
        g.fillStyle = color.luminance > 0.58 ? 'rgba(30,26,21,0.8)' : 'rgba(255,255,255,0.92)';
        g.fillText(color.code, originX + x * cell + cell / 2, originY + y * cell + cell / 2 + 0.5);
      }
    }
  }

  const legendTop = originY + gridH + numBand + gapAfterGrid;
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.fillStyle = '#3B352D';
  g.font = '700 26px ' + SANS;
  g.fillText(labels.legend, padX, legendTop + 32);
  g.textAlign = 'right';
  g.fillStyle = '#8A8174';
  g.font = '400 18px ' + SANS;
  g.fillText(labels.total, sheetW - padX, legendTop + 32);

  const chipsTop = legendTop + legendHeadH;
  colors.forEach((color, index) => {
    const col = index % perRow;
    const row = Math.floor(index / perRow);
    const x = padX + col * chipW;
    const y = chipsTop + row * chipH;
    g.fillStyle = color.hex;
    g.fillRect(x, y + 8, 32, 32);
    g.strokeStyle = 'rgba(0,0,0,0.16)';
    g.lineWidth = 1;
    g.strokeRect(x + 0.5, y + 8.5, 31, 31);
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillStyle = '#2F2A24';
    g.font = '600 21px ' + MONO;
    g.fillText(color.code, x + 44, y + 24);
    const codeW = g.measureText(color.code).width;
    g.fillStyle = '#7A7266';
    g.font = '400 17.5px ' + SANS;
    g.fillText(formatNumber(color.count, lang), x + 44 + codeW + 11, y + 24);
  });

  g.strokeStyle = '#E2DACD';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(padX, sheetH - footerH + 6);
  g.lineTo(sheetW - padX, sheetH - footerH + 6);
  g.stroke();
  g.textAlign = 'left';
  g.fillStyle = '#8A8174';
  g.font = '400 15px ' + SANS;
  g.fillText(labels.footer, padX, sheetH - footerH + 34);
  g.textAlign = 'right';
  g.fillStyle = '#A39A8B';
  g.fillText('pindou-pattern', sheetW - padX, sheetH - footerH + 34);

  return canvas;
}
