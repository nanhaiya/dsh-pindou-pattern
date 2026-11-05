/* ------------------------------------------------------------------ *
 * Perler pattern studio — browser half (DSH client bundle UI).
 * Rendered as a sidebar.panellist row plus a keyed main page.
 * ------------------------------------------------------------------ */

const NS = 'pindou-pattern';
const PANEL_ID = 'pindou-workshop';
const PANEL_ORDER = 32;
const STORE_KEY = 'pindou-pattern:v1';
const PRESETS = [25, 29, 48, 50, 64];

function injectStyles() {
  if (typeof document === 'undefined') return;
  const id = 'dsh-pindou-pattern:styles';
  if (document.querySelector('style[data-plugin-css="' + id + '"]')) return;
  const tag = document.createElement('style');
  tag.dataset.plugin = 'dsh-pindou-pattern';
  tag.dataset.pluginCss = id;
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

function activeLang(ctx) {
  try {
    const snapshot = ctx.locale.getSnapshot();
    const code = String((snapshot && snapshot.active) || (typeof document !== 'undefined' ? document.documentElement.lang : 'zh') || 'zh').toLowerCase();
    return code.indexOf('en') === 0 ? 'en' : 'zh';
  } catch (error) {
    return 'zh';
  }
}

function interpolate(text, values) {
  if (!values) return text;
  return String(text).replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}

const boundTranslators = new WeakMap();

function translate(ctx, key, values) {
  try {
    let bound = boundTranslators.get(ctx);
    if (!bound) {
      bound = ctx.locale.bind(NS);
      boundTranslators.set(ctx, bound);
    }
    const text = bound(key, values);
    if (typeof text === 'string' && text !== key && text.indexOf(key) !== 0) return text;
  } catch (error) {
    /* fall through to the embedded dictionaries */
  }
  return interpolate((activeLang(ctx) === 'en' ? en : zh)[key] || key, values);
}


function normalizeSettings(raw) {
  const num = (value, fallback, min, max) => {
    const n = Math.round(Number(value));
    return Number.isFinite(n) ? clamp(n, min, max) : fallback;
  };
  return {
    w: num(raw.w, 50, 8, 200),
    h: num(raw.h, 50, 8, 200),
    maxColors: num(raw.maxColors, 24, 2, 64),
    scope: raw.scope === 'all' ? 'all' : 'standard',
    dither: raw.dither === true,
    removeBg: raw.removeBg === true,
    tolerance: num(raw.tolerance, 12, 0, 60),
    showCodes: raw.showCodes !== false,
    lockRatio: raw.lockRatio !== false,
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return normalizeSettings({});
    const parsed = JSON.parse(raw);
    return normalizeSettings(parsed && typeof parsed === 'object' ? parsed : {});
  } catch (error) {
    return normalizeSettings({});
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(settings));
  } catch (error) {
    /* storage unavailable: settings last for this mount only */
  }
}


function createStore() {
  let state = {
    source: null,
    settings: loadSettings(),
    pattern: null,
    busy: false,
    error: null,
    zoom: 1,
    sheet: null,
    toast: null,
  };
  let timer = 0;
  let toastSeq = 0;
  let toastTimer = 0;
  const listeners = new Set();

  const getSnapshot = () => state;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const emit = () => {
    for (const listener of Array.from(listeners)) {
      try {
        listener();
      } catch (error) {
        console.warn('[pindou-pattern] listener failed', error);
      }
    }
  };
  const patch = (next) => {
    state = Object.assign({}, state, next);
    emit();
  };

  function rebuild() {
    clearTimeout(timer);
    if (!state.source) {
      patch({ pattern: null, busy: false, error: null });
      return;
    }
    patch({ busy: true, error: null });
    timer = setTimeout(() => {
      const current = state;
      if (!current.source) return;
      const started = Date.now();
      try {
        const rgba = sampleGrid(current.source.canvas, current.settings.w, current.settings.h, createCanvas);
        const pattern = buildPattern(rgba, current.settings.w, current.settings.h, {
          maxColors: current.settings.maxColors,
          scope: current.settings.scope,
          dither: current.settings.dither,
          removeBg: current.settings.removeBg,
          tolerance: current.settings.tolerance,
        });
        pattern.ms = Date.now() - started;
        patch({ pattern, busy: false, error: null });
      } catch (error) {
        const code = error && error.code === 'empty' ? 'empty' : 'build';
        patch({ pattern: null, busy: false, error: code });
      }
    }, 80);
  }

  function fitSize(width, nextSource) {
    const source = nextSource || state.source;
    if (!source) return null;
    const ratio = source.height / source.width;
    let w = clamp(Math.round(width), 8, 200);
    let h = clamp(Math.round(w * ratio), 8, 200);
    if (h > 200) {
      h = 200;
      w = clamp(Math.round(h / ratio), 8, 200);
    }
    return { w, h };
  }

  function setSettings(partial) {
    const source = state.source;
    const locked = state.settings.lockRatio !== false && source;
    if (locked && (partial.w !== undefined || partial.h !== undefined)) {
      const ratio = source.height / source.width;
      if (partial.w !== undefined && partial.h === undefined) {
        const w = clamp(Math.round(Number(partial.w)), 8, 200);
        const h = clamp(Math.round(w * ratio), 8, 200);
        partial = Object.assign({}, partial, h > 200 ? { w: clamp(Math.round(200 / ratio), 8, 200), h: 200 } : { h });
      } else if (partial.h !== undefined && partial.w === undefined) {
        const h = clamp(Math.round(Number(partial.h)), 8, 200);
        partial = Object.assign({}, partial, { w: clamp(Math.round(h / ratio), 8, 200) });
      }
    }
    const next = normalizeSettings(Object.assign({}, state.settings, partial));
    const changed = JSON.stringify(next) !== JSON.stringify(state.settings);
    if (!changed) return;
    saveSettings(next);
    patch({ settings: next });
    rebuild();
  }

  function releaseSource(source) {
    if (source && source.owned && source.url) {
      try {
        URL.revokeObjectURL(source.url);
      } catch (error) {
        /* ignore */
      }
    }
  }

  function setSource(source, settings) {
    if (source === state.source) return;
    releaseSource(state.source);
    const next = settings ? normalizeSettings(settings) : state.settings;
    if (settings) saveSettings(next);
    patch({ source, settings: next, pattern: null, busy: !!source, error: null, zoom: 1, sheet: null });
    rebuild();
  }

  function clearImage() {
    releaseSource(state.source);
    patch({ source: null, pattern: null, busy: false, error: null, zoom: 1, sheet: null });
  }

  function setZoom(zoom) {
    patch({ zoom: clamp(Math.round(zoom), 0, 3) });
  }

  function resetSettings() {
    const next = normalizeSettings({});
    saveSettings(next);
    patch({ settings: next });
    rebuild();
  }

  function toast(message) {
    const id = (toastSeq += 1);
    patch({ toast: { id, message } });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (state.toast && state.toast.id === id) patch({ toast: null });
    }, 2800);
  }

  function setSheet(sheet) {
    patch({ sheet });
  }

  return {
    getSnapshot,
    subscribe,
    setSettings,
    setSource,
    clearImage,
    setZoom,
    resetSettings,
    toast,
    setSheet,
    rebuild,
  };
}

let singletonStore = null;
function getStore() {
  if (!singletonStore) singletonStore = createStore();
  return singletonStore;
}

function useStore(store) {
  return React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

function useLang(ctx) {
  const snapshot = React.useSyncExternalStore(
    (listener) => ctx.locale.subscribe(listener),
    () => ctx.locale.getSnapshot(),
    () => ctx.locale.getSnapshot(),
  );
  const code = String((snapshot && snapshot.active) || '').toLowerCase();
  return code.indexOf('en') === 0 ? 'en' : 'zh';
}

/* ------------------------------- icons ------------------------------- */

function SvgIcon({ size = 16, children }) {
  return React.createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.7,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    children,
  );
}

function IconUpload({ size = 16 }) {
  return React.createElement(SvgIcon, { size }, React.createElement('path', { d: 'M12 16V4m0 0 4 4m-4-4L8 8M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2' }));
}
function IconImage({ size = 16 }) {
  return React.createElement(
    SvgIcon,
    { size },
    React.createElement('rect', { x: 3, y: 4, width: 18, height: 16, rx: 2.5 }),
    React.createElement('circle', { cx: 8.5, cy: 9.5, r: 1.6 }),
    React.createElement('path', { d: 'm4 17 5-5 4 4 3-3 4 4' }),
  );
}
function IconDownload({ size = 16 }) {
  return React.createElement(SvgIcon, { size }, React.createElement('path', { d: 'M12 4v11m0 0 4-4m-4 4-4-4M4 20h16' }));
}
function IconClose({ size = 16 }) {
  return React.createElement(SvgIcon, { size }, React.createElement('path', { d: 'M6 6 18 18M18 6 6 18' }));
}
function IconPlus({ size = 14 }) {
  return React.createElement(SvgIcon, { size }, React.createElement('path', { d: 'M12 5v14M5 12h14' }));
}
function IconMinus({ size = 14 }) {
  return React.createElement(SvgIcon, { size }, React.createElement('path', { d: 'M5 12h14' }));
}
function IconSparkle({ size = 15 }) {
  return React.createElement(SvgIcon, { size }, React.createElement('path', { d: 'M12 3.5 13.8 7.7 18 9.5l-4.2 1.8L12 15.5l-1.8-4.2L6 9.5l4.2-1.8L12 3.5ZM18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z' }));
}
function IconRatio({ size = 14 }) {
  return React.createElement(
    SvgIcon,
    { size },
    React.createElement('rect', { x: 3.5, y: 5.5, width: 17, height: 13, rx: 2 }),
    React.createElement('path', { d: 'M8 12h8M8 12l2-2m-2 2 2 2M16 12l-2-2m2 2-2 2' }),
  );
}
function IconAlert({ size = 20 }) {
  return React.createElement(
    SvgIcon,
    { size },
    React.createElement('path', { d: 'M12 3.5 2.7 20h18.6L12 3.5Z' }),
    React.createElement('path', { d: 'M12 9.5v4.5M12 17.5h.01' }),
  );
}
function IconGrid({ size = 15 }) {
  return React.createElement(
    SvgIcon,
    { size },
    React.createElement('rect', { x: 3.5, y: 3.5, width: 7, height: 7, rx: 1 }),
    React.createElement('rect', { x: 13.5, y: 3.5, width: 7, height: 7, rx: 1 }),
    React.createElement('rect', { x: 3.5, y: 13.5, width: 7, height: 7, rx: 1 }),
    React.createElement('rect', { x: 13.5, y: 13.5, width: 7, height: 7, rx: 1 }),
  );
}

function beadPath(cx, cy, radius, hole) {
  return (
    'M' + cx + ' ' + (cy - radius) +
    'a' + radius + ' ' + radius + ' 0 1 0 0 ' + radius * 2 +
    'a' + radius + ' ' + radius + ' 0 1 0 0 ' + (-radius * 2) +
    'Z M' + cx + ' ' + (cy - hole) +
    'a' + hole + ' ' + hole + ' 0 1 0 0 ' + hole * 2 +
    'a' + hole + ' ' + hole + ' 0 1 0 0 ' + (-hole * 2) + 'Z'
  );
}

function BeadMark({ size = 18 }) {
  const radius = 2.7;
  const hole = 0.95;
  let d = '';
  for (const [cx, cy] of [[4, 4], [12, 4], [4, 12], [12, 12]]) {
    d += beadPath(cx, cy, radius, hole);
  }
  return React.createElement(
    'svg',
    { width: size, height: size, viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true', focusable: 'false' },
    React.createElement('path', { d, fillRule: 'evenodd' }),
  );
}

function PanelIcon({ size = 16 }) {
  return React.createElement(BeadMark, { size });
}

/* ------------------------------ widgets ------------------------------ */

function Section({ title, extra, children }) {
  return React.createElement(
    'section',
    { className: 'pdp-card' },
    React.createElement(
      'div',
      { className: 'pdp-card-head' },
      React.createElement('h2', null, title),
      extra || null,
    ),
    React.createElement('div', { className: 'pdp-card-body' }, children),
  );
}

function NumberField({ value, min, max, onCommit, label }) {
  const [text, setText] = React.useState(String(value));
  React.useEffect(() => {
    setText(String(value));
  }, [value]);
  const commit = () => {
    const parsed = Math.round(Number(text));
    if (Number.isFinite(parsed)) {
      const next = clamp(parsed, min, max);
      setText(String(next));
      if (next !== value) onCommit(next);
    } else {
      setText(String(value));
    }
  };
  return React.createElement('input', {
    className: 'pdp-input',
    type: 'number',
    inputMode: 'numeric',
    min,
    max,
    value: text,
    'aria-label': label,
    onChange: (event) => setText(event.target.value),
    onBlur: commit,
    onKeyDown: (event) => {
      if (event.key === 'Enter') event.currentTarget.blur();
    },
  });
}

function Toggle({ checked, onChange, label }) {
  return React.createElement(
    'label',
    { className: 'pdp-check' },
    React.createElement('input', { type: 'checkbox', checked, onChange: (event) => onChange(event.target.checked) }),
    React.createElement('span', null, label),
  );
}

/* ------------------------------ pattern ------------------------------ */

/* ------------------------------ drawing ------------------------------ */

/* ------------------------------ components ------------------------------ */

function Page({ ctx, store }) {
  const snap = useStore(store);
  const lang = useLang(ctx);
  const t = (key, values) => translate(ctx, key, values);
  const fmt = (value) => formatNumber(value, lang);
  const canvasRef = React.useRef(null);
  const scrollRef = React.useRef(null);
  const fileRef = React.useRef(null);
  const [stageWidth, setStageWidth] = React.useState(760);
  const [stageHeight, setStageHeight] = React.useState(620);
  const [dragOver, setDragOver] = React.useState(false);

  React.useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;
    const update = () => {
      setStageWidth(element.clientWidth || 760);
      setStageHeight(element.clientHeight || 620);
    };
    update();
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(update);
      observer.observe(element);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [Boolean(snap.pattern)]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !snap.pattern) return;
    drawPattern(canvas, snap.pattern, {
      stageWidth,
      stageHeight,
      zoom: snap.zoom,
      showCodes: snap.settings.showCodes,
    });
    const scroller = scrollRef.current;
    if (scroller && scroller.scrollWidth > scroller.clientWidth + 1) {
      scroller.scrollLeft = Math.round((scroller.scrollWidth - scroller.clientWidth) / 2);
    }
  }, [snap.pattern, snap.zoom, snap.settings.showCodes, stageWidth, stageHeight]);

  const handleFile = React.useCallback(
    async (file) => {
      if (!file) return;
      if (!/^image\//.test(file.type || '')) {
        store.toast(t('error.type'));
        return;
      }
      try {
        const source = await loadSourceFile(file);
        const current = store.getSnapshot().settings;
        let next = current;
        const ratio = source.height / source.width;
        let width = current.w;
        let height = clamp(Math.round(width * ratio), 8, 200);
        if (height > 200) {
          height = 200;
          width = clamp(Math.round(height / ratio), 8, 200);
        }
        next = Object.assign({}, current, { w: width, h: height });
        store.setSource(source, next);
        if (next.w !== current.w || next.h !== current.h) {
          store.toast(t('size.adjusted', { w: next.w, h: next.h }));
        }
      } catch (error) {
        console.warn('[pindou-pattern] image load failed', error);
        store.toast(t('error.load'));
      }
    },
    [store, lang],
  );

  React.useEffect(() => {
    const onPaste = (event) => {
      const data = event.clipboardData;
      if (!data) return;
      const files = data.files;
      const file = files && files.length ? files[0] : null;
      if (!file || !/^image\//.test(file.type || '')) return;
      event.preventDefault();
      handleFile(file);
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [handleFile]);

  React.useEffect(() => {
    if (!snap.sheet) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') store.setSheet(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [snap.sheet, store]);

  const openPicker = () => {
    if (fileRef.current) fileRef.current.click();
  };

  const loadDemo = () => {
    try {
      store.setSource(makeDemoSource(), store.getSnapshot().settings);
    } catch (error) {
      console.warn('[pindou-pattern] demo failed', error);
    }
  };

  const fitRatio = () => {
    const source = store.getSnapshot().source;
    if (!source) return;
    const current = store.getSnapshot().settings;
    const height = clamp(Math.round(current.w * (source.height / source.width)), 8, 200);
    store.setSettings({ h: height });
  };

  const openExport = () => {
    const pattern = store.getSnapshot().pattern;
    if (!pattern) return;
    const labels = {
      title: t('export.title'),
      subtitle: t('export.subtitle', {
        w: pattern.w,
        h: pattern.h,
        colors: fmt(pattern.colors.length),
        beads: fmt(pattern.total),
      }),
      legend: t('export.legendTitle', { n: fmt(pattern.colors.length) }),
      total: t('legend.total', { n: fmt(pattern.total) }),
      footer: t('export.footer'),
    };
    try {
      const canvas = renderSheet(pattern, labels, lang);
      const name = fileNameFor(pattern, store.getSnapshot().source, 'png');
      store.setSheet({ dataUrl: canvas.toDataURL('image/png'), name });
    } catch (error) {
      console.warn('[pindou-pattern] sheet render failed', error);
      store.toast(t('toast.failed'));
    }
  };

  const downloadSheet = () => {
    const sheet = store.getSnapshot().sheet;
    if (!sheet) return;
    const anchor = document.createElement('a');
    anchor.href = sheet.dataUrl;
    anchor.download = sheet.name;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    store.toast(t('toast.exported', { name: sheet.name }));
  };

  const exportCsv = () => {
    const pattern = store.getSnapshot().pattern;
    if (!pattern) return;
    const lines = ['code,hex,count'];
    for (const color of pattern.colors) lines.push([color.code, color.hex, color.count].join(','));
    lines.push(['TOTAL', '', pattern.total].join(','));
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const name = fileNameFor(pattern, store.getSnapshot().source, 'csv');
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    store.toast(t('toast.csv'));
  };

  const resetAll = () => {
    store.resetSettings();
    store.toast(t('toast.reset'));
  };

  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    const files = event.dataTransfer && event.dataTransfer.files;
    if (files && files.length) handleFile(files[0]);
  };
  const onDragOver = (event) => {
    const types = event.dataTransfer && event.dataTransfer.types;
    if (!types) return;
    let hasFiles = false;
    for (const type of types) if (type === 'Files') hasFiles = true;
    if (!hasFiles) return;
    event.preventDefault();
    event.stopPropagation();
    if (!dragOver) setDragOver(true);
  };
  const onDragLeave = (event) => {
    const next = event.relatedTarget;
    if (next && event.currentTarget.contains(next)) return;
    setDragOver(false);
  };

  const scopeButton = (value, label) =>
    React.createElement(
      'button',
      {
        type: 'button',
        role: 'radio',
        'aria-checked': snap.settings.scope === value,
        onClick: () => store.setSettings({ scope: value }),
      },
      label,
    );

  const showEmpty = !snap.source && !snap.pattern;
  const showError = !!snap.source && !!snap.error && !snap.pattern;

  const stage = React.createElement(
    'div',
    { className: 'pdp-stage' },
    snap.pattern
      ? React.createElement(
          'div',
          { className: 'pdp-scroll', ref: scrollRef },
          React.createElement('canvas', {
            ref: canvasRef,
            className: 'pdp-canvas',
            role: 'img',
            'aria-label': t('preview.alt', {
              w: snap.pattern.w,
              h: snap.pattern.h,
              colors: fmt(snap.pattern.colors.length),
            }),
          }),
        )
      : snap.source && snap.busy
        ? React.createElement(
            'div',
            { className: 'pdp-placeholder' },
            React.createElement('i', { className: 'pdp-spinner' }),
            React.createElement('span', null, t('stats.busy')),
          )
        : showError
          ? React.createElement(
              'div',
              { className: 'pdp-empty' },
              React.createElement('span', { className: 'pdp-empty-art', style: { color: 'var(--dsw-alias-state-error-primary)' } }, React.createElement(IconAlert, { size: 34 })),
              React.createElement('h2', null, t('error.title')),
              React.createElement('p', null, t(snap.error === 'empty' ? 'error.empty' : 'error.build')),
              React.createElement(
                'div',
                { className: 'pdp-empty-actions' },
                React.createElement('button', { type: 'button', className: 'pdp-btn pdp-btn-primary', onClick: () => store.rebuild() }, t('action.retry')),
                React.createElement('button', { type: 'button', className: 'pdp-btn pdp-btn-ghost', onClick: openPicker }, t('upload.pick')),
              ),
            )
          : React.createElement(
              'div',
              { className: 'pdp-empty' },
              React.createElement('span', { className: 'pdp-empty-art' }, React.createElement(BeadMark, { size: 68 })),
              React.createElement('h2', null, t('empty.title')),
              React.createElement('p', null, t('empty.desc')),
              React.createElement(
                'div',
                { className: 'pdp-empty-actions' },
                React.createElement('button', { type: 'button', className: 'pdp-btn pdp-btn-primary', onClick: openPicker }, React.createElement(IconImage, { size: 15 }), t('empty.cta')),
                React.createElement('button', { type: 'button', className: 'pdp-btn pdp-btn-ghost', onClick: loadDemo }, React.createElement(IconSparkle, { size: 15 }), t('empty.sample')),
              ),
            ),
    dragOver
      ? React.createElement(
          'div',
          { className: 'pdp-drop-overlay' },
          React.createElement(IconUpload, { size: 26 }),
          React.createElement('b', null, t('upload.drop')),
        )
      : null,
  );

  return React.createElement(
    'div',
    {
      className: 'pdp-root',
      'data-dsh-plugin': 'pindou-pattern',
      onDragOver,
      onDragLeave,
      onDrop,
    },
    React.createElement(
      'header',
      { className: 'pdp-head' },
      React.createElement(
        'div',
        { className: 'pdp-brand' },
        React.createElement('span', { className: 'pdp-brandmark' }, React.createElement(BeadMark, { size: 21 })),
        React.createElement(
          'div',
          { className: 'pdp-brandtext' },
          React.createElement('h1', { className: 'pdp-title' }, t('app.title')),
          React.createElement('p', { className: 'pdp-sub' }, t('app.subtitle')),
        ),
      ),
      React.createElement(
        'div',
        { className: 'pdp-head-actions' },
        snap.pattern
          ? React.createElement(
              'span',
              { className: 'pdp-stat' },
              fmt(snap.pattern.total) + ' · ' + fmt(snap.pattern.colors.length),
            )
          : null,
        snap.pattern
          ? React.createElement(
              'button',
              {
                type: 'button',
                className: 'pdp-btn pdp-btn-ghost pdp-btn-compact',
                title: t('action.exportCsv'),
                onClick: exportCsv,
              },
              React.createElement(IconGrid, { size: 13 }),
              'CSV',
            )
          : null,
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'pdp-btn pdp-btn-primary',
            onClick: snap.pattern ? openExport : openPicker,
          },
          snap.pattern ? React.createElement(IconDownload, { size: 15 }) : React.createElement(IconImage, { size: 15 }),
          snap.pattern ? t('action.export') : t('upload.pick'),
        ),
      ),
    ),
    React.createElement(
      'div',
      { className: 'pdp-body' },
      React.createElement(
        'aside',
        { className: 'pdp-side' },
        React.createElement(
          Section,
          {
            title: t('upload.title'),
            extra: snap.source
              ? React.createElement('button', { type: 'button', className: 'pdp-linkbtn', onClick: () => store.clearImage() }, t('upload.remove'))
              : null,
          },
          React.createElement(
            'div',
            {
              className: 'pdp-upload' + (dragOver ? ' pdp-drag' : ''),
              role: 'button',
              tabIndex: 0,
              onClick: openPicker,
              onKeyDown: (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openPicker();
                }
              },
            },
            snap.source
              ? [
                  React.createElement('img', {
                    key: 'thumb',
                    className: 'pdp-thumb',
                    src: snap.source.url,
                    alt: '',
                    draggable: false,
                  }),
                  React.createElement(
                    'div',
                    { key: 'text', className: 'pdp-upload-text' },
                    React.createElement('b', null, snap.source.name),
                    React.createElement('span', null, snap.source.canvas.width + '×' + snap.source.canvas.height + ' px'),
                    React.createElement('em', null, t('upload.change')),
                  ),
                ]
              : [
                  React.createElement('span', { key: 'icon', className: 'pdp-upload-icon' }, React.createElement(IconUpload, { size: 16 })),
                  React.createElement(
                    'div',
                    { key: 'text' },
                    React.createElement('b', null, t('upload.pick')),
                    React.createElement('span', null, t('upload.drop')),
                  ),
                ],
          ),
          React.createElement(
            'button',
            { type: 'button', className: 'pdp-linkbtn', onClick: loadDemo },
            React.createElement(IconSparkle, { size: 13 }),
            t('upload.demo'),
          ),
        ),
        React.createElement(
          Section,
          { title: t('size.title') },
          React.createElement(
            'div',
            { className: 'pdp-chips', role: 'group', 'aria-label': t('size.title') },
            PRESETS.map((size) =>
              React.createElement(
                'button',
                {
                  key: size,
                  type: 'button',
                  className: 'pdp-chip',
                  'data-active': String(
                    snap.settings.lockRatio !== false && snap.source
                      ? snap.settings.w === size
                      : snap.settings.w === size && snap.settings.h === size,
                  ),
                  'aria-pressed': snap.settings.w === size && snap.settings.h === size,
                  onClick: () =>
                    store.setSettings(
                      snap.settings.lockRatio !== false && snap.source
                        ? (() => {
                            const ratio = snap.source.height / snap.source.width;
                            const h = clamp(Math.round(size * ratio), 8, 200);
                            return h > 200 ? { w: clamp(Math.round(200 / ratio), 8, 200), h: 200 } : { w: size, h };
                          })()
                        : { w: size, h: size },
                    ),
                },
                size + '×' + size,
              ),
            ),
          ),
          React.createElement(
            'div',
            { className: 'pdp-size-row' },
            React.createElement(
              'label',
              { className: 'pdp-field' },
              React.createElement('span', null, t('size.width')),
              React.createElement(NumberField, {
                value: snap.settings.w,
                min: 8,
                max: 200,
                label: t('size.width'),
                onCommit: (value) => store.setSettings({ w: value }),
              }),
            ),
            React.createElement('span', { className: 'pdp-times' }, '×'),
            React.createElement(
              'label',
              { className: 'pdp-field' },
              React.createElement('span', null, t('size.height')),
              React.createElement(NumberField, {
                value: snap.settings.h,
                min: 8,
                max: 200,
                label: t('size.height'),
                onCommit: (value) => store.setSettings({ h: value }),
              }),
            ),
          ),
          React.createElement(
            'div',
            { className: 'pdp-ratio-row' },
            React.createElement(Toggle, {
              checked: snap.settings.lockRatio !== false,
              onChange: (value) => store.setSettings({ lockRatio: value }),
              label: t('size.lock'),
            }),
            React.createElement(
              'button',
              { type: 'button', className: 'pdp-linkbtn', onClick: fitRatio, disabled: !snap.source },
              React.createElement(IconRatio, { size: 13 }),
              t('size.fit'),
            ),
          ),
          React.createElement('p', { className: 'pdp-note' }, t('size.note')),
        ),
        React.createElement(
          Section,
          { title: t('color.title') },
          React.createElement(
            'div',
            { className: 'pdp-seg', role: 'radiogroup', 'aria-label': t('color.scope') },
            scopeButton('standard', t('color.standard', { n: MARD_STANDARD_COUNT })),
            scopeButton('all', t('color.all', { n: MARD_TOTAL_COUNT })),
          ),
          React.createElement(
            'div',
            { className: 'pdp-row' },
            React.createElement('span', null, t('color.max')),
            React.createElement('output', { className: 'pdp-badge' }, snap.settings.maxColors),
          ),
          React.createElement('input', {
            className: 'pdp-range',
            type: 'range',
            min: 2,
            max: 64,
            step: 1,
            value: snap.settings.maxColors,
            'aria-label': t('color.max'),
            onChange: (event) => store.setSettings({ maxColors: Number(event.target.value) }),
          }),
          React.createElement(Toggle, {
            checked: snap.settings.dither,
            onChange: (value) => store.setSettings({ dither: value }),
            label: t('color.dither'),
          }),
          React.createElement('p', { className: 'pdp-note' }, t('color.ditherHint')),
        ),
        React.createElement(
          Section,
          { title: t('bg.title') },
          React.createElement(Toggle, {
            checked: snap.settings.removeBg,
            onChange: (value) => store.setSettings({ removeBg: value }),
            label: t('bg.remove'),
          }),
          snap.settings.removeBg
            ? React.createElement(
                React.Fragment,
                null,
                React.createElement(
                  'div',
                  { className: 'pdp-row' },
                  React.createElement('span', null, t('bg.tolerance', { n: snap.settings.tolerance })),
                ),
                React.createElement('input', {
                  className: 'pdp-range',
                  type: 'range',
                  min: 0,
                  max: 60,
                  step: 1,
                  value: snap.settings.tolerance,
                  'aria-label': t('bg.tolerance', { n: snap.settings.tolerance }),
                  onChange: (event) => store.setSettings({ tolerance: Number(event.target.value) }),
                }),
              )
            : null,
          React.createElement(
            'p',
            { className: 'pdp-note' },
            snap.settings.removeBg && snap.pattern && !snap.pattern.bgRemoved ? t('bg.notDetected') : t('bg.hint'),
          ),
        ),
        React.createElement(
          'button',
          { type: 'button', className: 'pdp-reset', onClick: resetAll },
          t('action.reset'),
        ),
      ),
      React.createElement(
        'main',
        { className: 'pdp-main' },
        React.createElement(
          'div',
          { className: 'pdp-stagebar' },
          React.createElement(
            'div',
            { className: 'pdp-stage-meta' },
            snap.pattern
              ? [
                  React.createElement('b', { key: 'size' }, snap.pattern.w + ' × ' + snap.pattern.h),
                  React.createElement('span', { key: 'd1' }, '·'),
                  React.createElement('span', { key: 'colors' }, t('stats.colors', { n: fmt(snap.pattern.colors.length) })),
                  React.createElement('span', { key: 'd2' }, '·'),
                  React.createElement('span', { key: 'beads' }, t('stats.beads', { n: fmt(snap.pattern.total) })),
                ]
              : React.createElement('span', null, showEmpty ? t('empty.title') : t('stats.busy')),
            snap.busy
              ? React.createElement(
                  'span',
                  { className: 'pdp-busy' },
                  React.createElement('i', { className: 'pdp-spinner' }),
                  t('stats.busy'),
                )
              : null,
          ),
          React.createElement(
            'div',
            { className: 'pdp-stage-tools' },
            React.createElement(
              'label',
              { className: 'pdp-check pdp-check-inline' },
              React.createElement('input', {
                type: 'checkbox',
                checked: snap.settings.showCodes,
                onChange: (event) => store.setSettings({ showCodes: event.target.checked }),
              }),
              React.createElement('span', null, t('display.codes')),
            ),
            React.createElement(
              'div',
              { className: 'pdp-zoom', role: 'group', 'aria-label': 'zoom' },
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: () => store.setZoom(snap.zoom - 1),
                  disabled: snap.zoom <= 0,
                  'aria-label': t('action.zoomOut'),
                  title: t('action.zoomOut'),
                },
                React.createElement(IconMinus, { size: 13 }),
              ),
              React.createElement('span', null, snap.zoom === 0 ? t('zoom.full') : snap.zoom + '×'),
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: () => store.setZoom(snap.zoom + 1),
                  disabled: snap.zoom >= 3,
                  'aria-label': t('action.zoomIn'),
                  title: t('action.zoomIn'),
                },
                React.createElement(IconPlus, { size: 13 }),
              ),
              React.createElement(
                'button',
                { type: 'button', className: 'pdp-zoomfit', onClick: () => store.setZoom(0) },
                t('action.zoomFit'),
              ),
            ),
          ),
        ),
        stage,
        snap.pattern
          ? React.createElement(
              'div',
              { className: 'pdp-legend' },
              React.createElement(
                'div',
                { className: 'pdp-legend-head' },
                React.createElement('b', null, t('legend.title')),
                React.createElement('span', null, t('legend.total', { n: fmt(snap.pattern.total) })),
              ),
              React.createElement(
                'div',
                { className: 'pdp-legend-list' },
                snap.pattern.colors.map((color) =>
                  React.createElement(
                    'span',
                    { className: 'pdp-legend-chip', key: color.code, title: color.code + ' ' + color.hex },
                    React.createElement('i', { style: { background: color.hex } }),
                    React.createElement('b', null, color.code),
                    React.createElement('em', null, fmt(color.count)),
                  ),
                ),
              ),
            )
          : null,
      ),
    ),
    React.createElement('input', {
      ref: fileRef,
      type: 'file',
      accept: 'image/*',
      style: { display: 'none' },
      onChange: (event) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (file) handleFile(file);
      },
    }),
    snap.sheet
      ? React.createElement(
          'div',
          {
            className: 'pdp-modal',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': t('export.previewTitle'),
            onClick: (event) => {
              if (event.target === event.currentTarget) store.setSheet(null);
            },
          },
          React.createElement(
            'div',
            { className: 'pdp-modal-card', onClick: (event) => event.stopPropagation() },
            React.createElement(
              'div',
              { className: 'pdp-modal-head' },
              React.createElement('h2', null, t('export.previewTitle')),
              React.createElement(
                'button',
                { type: 'button', className: 'pdp-iconbtn', onClick: () => store.setSheet(null), 'aria-label': t('action.close') },
                React.createElement(IconClose, { size: 15 }),
              ),
            ),
            React.createElement(
              'div',
              { className: 'pdp-modal-body' },
              React.createElement('img', {
                className: 'pdp-modal-img',
                src: snap.sheet.dataUrl,
                alt: t('export.previewTitle'),
              }),
            ),
            React.createElement(
              'div',
              { className: 'pdp-modal-foot' },
              React.createElement(
                'button',
                { type: 'button', className: 'pdp-btn pdp-btn-ghost', onClick: () => store.setSheet(null) },
                t('action.close'),
              ),
              React.createElement(
                'button',
                { type: 'button', className: 'pdp-btn pdp-btn-primary', autoFocus: true, onClick: downloadSheet },
                React.createElement(IconDownload, { size: 15 }),
                t('action.download'),
              ),
            ),
          ),
        )
      : null,
    snap.toast
      ? React.createElement(
          'div',
          { className: 'pdp-toast', role: 'status' },
          React.createElement('span', null, snap.toast.message),
        )
      : null,
  );
}

function apply(ctx) {
  injectStyles();
  try {
    ctx.effect(
      () =>
        ctx.locale.register(NS, {
          zh,
          en,
        }),
      'pindou-pattern: dictionaries',
    );
  } catch (error) {
    console.warn('[pindou-pattern] locale registration failed', error);
  }
  const store = getStore();
  ctx.effect(() => {
    const disposers = [];
    try {
      disposers.push(
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: PANEL_ID,
              order: PANEL_ORDER,
              label: () => translate(ctx, 'entry.label'),
              locale: NS,
            },
            PanelIcon,
          ),
        ),
      );
      disposers.push(
        ctx.slots.inject('main', () =>
          ctx.slots.register(
            {
              name: 'main',
              key: PANEL_ID,
              inject: () => ({ ctx, store }),
            },
            Page,
          ),
        ),
      );
    } catch (error) {
      console.warn('[pindou-pattern] panel registration failed', error);
    }
    return () => {
      for (const dispose of disposers.splice(0)) {
        try {
          dispose();
        } catch (error) {
          /* ignore */
        }
      }
    };
  }, 'pindou-pattern: panels');
}
