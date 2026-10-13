import PACKS from './art/index.js';
import EXTRAS from './art/extras/index.js';

// ---------- constants ----------
const SIZE = 1536;               // internal canvas resolution (square)
const WALL = 140;                // pixels darker than this are outline
const DILATE = 4;                // paint tucks this far under the outline
const MAX_UNDO = 25;
const MAX_UNDO_BYTES = 140e6;

const COLORS = [
  '#e53935', '#fb8c00', '#fdd835', '#9ccc65', '#43a047', '#26a69a', '#4fc3f7',
  '#1e88e5', '#3949ab', '#8e24aa', '#b39ddb', '#f48fb1', '#ec407a', '#ffccbc',
  '#d7a86e', '#8d6e63', '#5d4037', '#9e9e9e', '#212121', '#ffffff', 'rainbow',
];
const TOOLS = [
  { id: 'fill', icon: '🪣' },
  { id: 'marker', icon: '🖊️' },
  { id: 'crayon', icon: '🖍️' },
  { id: 'brush', icon: '🖌️' },
  { id: 'glitter', icon: '✨' },
  { id: 'eraser', icon: '🧽' },
];
const SIZES = [0.55, 1, 1.7];
const BASE_WIDTH = { marker: 30, crayon: 34, brush: 46, glitter: 34, eraser: 44 };

// ---------- tiny helpers ----------
const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const canvas = (w = SIZE, h = SIZE) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

// ---------- storage (IndexedDB, failures are non-fatal) ----------
const db = (() => {
  let p;
  const open = () => p || (p = new Promise((res, rej) => {
    const r = indexedDB.open('colorfun', 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('paint'); r.result.createObjectStore('thumbs'); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const tx = async (store, mode, fn) => {
    try {
      const d = await open();
      return await new Promise((res, rej) => {
        const t = d.transaction(store, mode);
        const req = fn(t.objectStore(store));
        t.oncomplete = () => res(req && req.result);
        t.onerror = () => rej(t.error);
      });
    } catch (e) { console.warn('storage', e); return undefined; }
  };
  return {
    get: (store, k) => tx(store, 'readonly', s => s.get(k)),
    put: (store, k, v) => tx(store, 'readwrite', s => s.put(v, k)),
    del: (store, k) => tx(store, 'readwrite', s => s.delete(k)),
  };
})();
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}

// ---------- sound (tiny synthesized pop, no files) ----------
let audio;
function pop(freq = 520) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
    o.type = 'sine'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 2.2, t + 0.08);
    g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g).connect(audio.destination); o.start(t); o.stop(t + 0.16);
  } catch (e) {}
}

// ---------- screens ----------
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  if (id === 'draw') layoutBoard();
}
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));

function inSeason(pack) {
  if (!pack.season) return false;
  const d = new Date(), md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const { from, to } = pack.season;
  return from <= to ? (md >= from && md <= to) : (md >= from || md <= to);
}

// ---------- modes ----------
const MODES = [
  { id: 'color', icon: '🎨', title: 'Color' },
  { id: 'number', icon: '🔢', title: 'Numbers' },
  { id: 'dots', icon: '⭐', title: 'Dots' },
];
let mode = 'color';
try { mode = localStorage.getItem('colorfun-mode') || 'color'; } catch (e) {}
if (!MODES.some(m => m.id === mode)) mode = 'color';

// Pictures a mode can use: numbers needs color hints or regions, dots needs a dot path.
function picturesFor(pack) {
  if (mode === 'color') return pack.pictures;
  if (pack.id === 'draw') return [];
  if (mode === 'dots') return pack.pictures.filter(p => EXTRAS[p.id] && EXTRAS[p.id].dots && EXTRAS[p.id].dots.length > 2);
  return pack.pictures;
}
const saveKey = id => mode === 'color' ? id : `${mode}:${id}`;

function renderModes() {
  const bar = $('#modes'); bar.innerHTML = '';
  for (const m of MODES) {
    const b = el('button', 'mode' + (m.id === mode ? ' sel' : ''), `<span class="emoji">${m.icon}</span><span>${m.title}</span>`);
    b.onclick = () => {
      mode = m.id;
      try { localStorage.setItem('colorfun-mode', mode); } catch (e) {}
      pop(620); renderHome();
    };
    bar.append(b);
  }
}

function renderHome() {
  renderModes();
  const grid = $('#packGrid'); grid.innerHTML = '';
  const packs = [...PACKS].sort((a, b) => inSeason(b) - inSeason(a)).filter(p => picturesFor(p).length);
  for (const pack of packs) {
    const t = el('button', 'tile' + (inSeason(pack) ? ' season' : ''));
    t.append(el('div', 'emoji', pack.icon), el('div', '', pack.title));
    t.onclick = () => openPack(pack);
    grid.append(t);
  }
}

let currentPack;
async function openPack(pack) {
  currentPack = pack;
  $('#packTitle').textContent = `${pack.icon} ${pack.title}`;
  const m = MODES.find(x => x.id === mode);
  $('#packMode').textContent = mode === 'color' ? '' : m.icon;
  const grid = $('#picGrid'); grid.innerHTML = '';
  for (const pic of picturesFor(pack)) {
    const t = el('button', 'tile');
    const th = el('div', 'thumb', pic.svg);
    t.append(th);
    t.onclick = () => openPicture(pic);
    grid.append(t);
    db.get('thumbs', saveKey(pic.id)).then(url => { if (url) th.innerHTML = `<img src="${url}" alt="">`; });
  }
  show('pack');
}

// ---------- drawing state ----------
const paint = $('#paint'), lines = $('#lines'), fx = $('#fx');
[paint, lines, fx].forEach(c => { c.width = SIZE; c.height = SIZE; });
const pctx = paint.getContext('2d', { willReadFrequently: true });
const lctx = lines.getContext('2d');
const fctx = fx.getContext('2d');
const scratch = canvas(), sctx = scratch.getContext('2d');
const backup = canvas(), bctx = backup.getContext('2d');

const state = {
  pic: null, tool: 'fill', color: COLORS[0], size: 1, stayInLines: true,
  labels: null, regions: [], maskCache: new Map(), undo: [], undoBytes: 0, saveTimer: 0,
};

// Rasterize the picture's line art, build the transparent outline overlay and region label map.
async function loadLineArt(svg) {
  const sized = svg.replace('<svg', `<svg width="${SIZE}" height="${SIZE}"`);
  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const src = canvas(), c = src.getContext('2d', { willReadFrequently: true });
  c.fillStyle = '#fff'; c.fillRect(0, 0, SIZE, SIZE);
  c.drawImage(img, 0, 0, SIZE, SIZE);
  URL.revokeObjectURL(url);
  const data = c.getImageData(0, 0, SIZE, SIZE).data;

  // outline overlay: darkness becomes alpha, so white areas are see-through
  const ov = lctx.createImageData(SIZE, SIZE), o = ov.data;
  const N = SIZE * SIZE, labels = new Int32Array(N);
  for (let i = 0, j = 0; i < N; i++, j += 4) {
    const lum = (data[j] * 0.3 + data[j + 1] * 0.59 + data[j + 2] * 0.11);
    o[j + 3] = 255 - lum;
    if (lum < WALL) labels[i] = -1;
  }
  lctx.clearRect(0, 0, SIZE, SIZE);
  lctx.putImageData(ov, 0, 0);

  // connected components of non-outline pixels (scanline flood fill)
  const regions = [null];
  const stack = new Int32Array(N);
  for (let start = 0; start < N; start++) {
    if (labels[start] !== 0) continue;
    const id = regions.length;
    let x0 = SIZE, y0 = SIZE, x1 = 0, y1 = 0, count = 0, sp = 0;
    stack[sp++] = start; labels[start] = id;
    while (sp) {
      const p = stack[--sp], x = p % SIZE, y = (p / SIZE) | 0;
      count++;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x > 0 && labels[p - 1] === 0) { labels[p - 1] = id; stack[sp++] = p - 1; }
      if (x < SIZE - 1 && labels[p + 1] === 0) { labels[p + 1] = id; stack[sp++] = p + 1; }
      if (y > 0 && labels[p - SIZE] === 0) { labels[p - SIZE] = id; stack[sp++] = p - SIZE; }
      if (y < SIZE - 1 && labels[p + SIZE] === 0) { labels[p + SIZE] = id; stack[sp++] = p + SIZE; }
    }
    regions.push({ x0, y0, x1, y1, count });
  }
  state.labels = labels; state.regions = regions; state.maskCache.clear();
}

// Region under a point; if the point is on an outline, use the nearest region.
function regionAt(x, y) {
  x = clamp(x | 0, 0, SIZE - 1); y = clamp(y | 0, 0, SIZE - 1);
  const L = state.labels;
  if (L[y * SIZE + x] > 0) return L[y * SIZE + x];
  for (let r = 1; r < 24; r++) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= SIZE || yy >= SIZE) continue;
      const v = L[yy * SIZE + xx];
      if (v > 0) return v;
    }
  }
  return 0;
}

// Mask canvas (full size, opaque where the region is, grown slightly under the outline).
function regionMask(id) {
  if (state.maskCache.has(id)) return state.maskCache.get(id);
  const r = state.regions[id];
  const x0 = Math.max(0, r.x0 - DILATE), y0 = Math.max(0, r.y0 - DILATE);
  const w = Math.min(SIZE, r.x1 + DILATE + 1) - x0, h = Math.min(SIZE, r.y1 + DILATE + 1) - y0;
  const raw = canvas(w, h), rc = raw.getContext('2d');
  const im = rc.createImageData(w, h), d = im.data, L = state.labels;
  for (let y = 0; y < h; y++) {
    let p = (y + y0) * SIZE + x0, q = y * w * 4 + 3;
    for (let x = 0; x < w; x++, p++, q += 4) if (L[p] === id) d[q] = 255;
  }
  rc.putImageData(im, 0, 0);
  const m = canvas(w, h), mc = m.getContext('2d');
  for (let dy = -DILATE; dy <= DILATE; dy += DILATE) for (let dx = -DILATE; dx <= DILATE; dx += DILATE) mc.drawImage(raw, dx, dy);
  const mask = { canvas: m, x: x0, y: y0, w, h };
  if (state.maskCache.size > 8) state.maskCache.delete(state.maskCache.keys().next().value);
  state.maskCache.set(id, mask);
  return mask;
}

// ---------- undo ----------
function pushUndo(x, y, w, h, fromCtx = pctx) {
  x = clamp(Math.floor(x), 0, SIZE); y = clamp(Math.floor(y), 0, SIZE);
  w = clamp(Math.ceil(w), 0, SIZE - x); h = clamp(Math.ceil(h), 0, SIZE - y);
  if (!w || !h) return;
  const img = fromCtx.getImageData(x, y, w, h);
  state.undo.push({ x, y, img });
  state.undoBytes += img.data.length;
  while (state.undo.length > MAX_UNDO || state.undoBytes > MAX_UNDO_BYTES) state.undoBytes -= state.undo.shift().img.data.length;
  updateUndoBtn();
}
function undo() {
  const u = state.undo.pop();
  if (!u) return;
  state.undoBytes -= u.img.data.length;
  pctx.putImageData(u.img, u.x, u.y);
  updateUndoBtn(); scheduleSave(); pop(330);
}
function updateUndoBtn() { $('#undoBtn').classList.toggle('off', !state.undo.length); }

// ---------- color styles ----------
function hsl(h) { return `hsl(${h % 360},90%,55%)`; }
function styleFor(ctx, box) {
  if (state.color !== 'rainbow') return state.color;
  const g = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
  for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, hsl(i * 60));
  return g;
}
function sparkles(ctx, x, y, w, h, n) {
  for (let i = 0; i < n; i++) {
    const px = x + Math.random() * w, py = y + Math.random() * h, s = rand(2, 6);
    ctx.fillStyle = Math.random() < 0.6 ? 'rgba(255,255,255,.95)' : 'rgba(255,240,150,.95)';
    if (Math.random() < 0.15) { // little star
      ctx.beginPath();
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, rr = k % 2 ? s * 0.6 : s * 2.4; ctx.lineTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr); }
      ctx.fill();
    } else ctx.fillRect(px, py, s * 0.7, s * 0.7);
  }
}

// ---------- fill ----------
let finishFill = null;   // completes a running fill animation immediately
function fillAt(x, y, regionId) {
  if (finishFill) finishFill();
  const id = regionId || regionAt(x, y);
  if (!id) return 0;
  const m = regionMask(id);
  pushUndo(m.x, m.y, m.w, m.h);
  const layer = canvas(m.w, m.h), c = layer.getContext('2d');
  c.drawImage(m.canvas, 0, 0);
  c.globalCompositeOperation = 'source-in';
  c.translate(-m.x, -m.y);
  c.fillStyle = styleFor(c, m);
  c.fillRect(m.x, m.y, m.w, m.h);

  // grow the color out from the finger
  const maxR = Math.hypot(Math.max(x - m.x, m.x + m.w - x), Math.max(y - m.y, m.y + m.h - y));
  const t0 = performance.now(), dur = 260;
  let done = false;
  const draw = r => {
    pctx.save(); pctx.beginPath(); pctx.arc(x, y, Math.max(1, r), 0, Math.PI * 2); pctx.clip();
    pctx.drawImage(layer, m.x, m.y);
    pctx.restore();
  };
  finishFill = () => { if (done) return; done = true; finishFill = null; draw(maxR + 2); scheduleSave(); };
  pop(440 + Math.random() * 200);
  const step = now => {
    if (done) return;
    const k = Math.min(1, (now - t0) / dur);
    if (k >= 1) return finishFill();
    draw(maxR * (1 - Math.pow(1 - k, 3)));
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  return id;
}

// ---------- brushes ----------
const stroke = { active: false, pointer: null, last: null, dist: 0, clip: null, box: null };

function beginStroke(x, y, pointerId) {
  stroke.active = true; stroke.pointer = pointerId; stroke.last = { x, y }; stroke.dist = 0;
  stroke.box = { x0: x, y0: y, x1: x, y1: y };
  stroke.clip = null;
  if (state.stayInLines) {
    const id = regionAt(x, y);
    if (id) stroke.clip = regionMask(id);
  }
  bctx.clearRect(0, 0, SIZE, SIZE);
  bctx.drawImage(paint, 0, 0);
  strokeTo(x, y, true);
}

function strokeColor() { return state.color === 'rainbow' ? hsl(stroke.dist * 0.35) : state.color; }
function clearOf(color) { return color.startsWith('hsl(') ? color.replace('hsl(', 'hsla(').replace(')', ',0)') : color + '00'; }

// Draw one segment with the current tool into ctx.
function drawSegment(ctx, a, b, w) {
  const tool = state.tool, color = strokeColor();
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (tool === 'marker' || tool === 'eraser' || tool === 'glitter') {
    ctx.strokeStyle = tool === 'eraser' ? '#000' : color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x + 0.01, b.y); ctx.stroke();
    if (tool === 'glitter') {
      const x = Math.min(a.x, b.x) - w / 2, y = Math.min(a.y, b.y) - w / 2;
      ctx.save(); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x + 0.01, b.y);
      ctx.lineWidth = w; ctx.globalCompositeOperation = 'source-atop';
      sparkles(ctx, x, y, Math.abs(b.x - a.x) + w, Math.abs(b.y - a.y) + w, 3 + len / 3);
      ctx.restore();
    }
  } else if (tool === 'crayon') {
    ctx.fillStyle = color;
    const steps = Math.max(1, len / 3);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, cx = a.x + (b.x - a.x) * t, cy = a.y + (b.y - a.y) * t;
      const dots = 10 + w * 0.9;
      for (let k = 0; k < dots; k++) {
        const ang = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * w / 2;
        ctx.globalAlpha = rand(0.45, 0.95);
        ctx.fillRect(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, rand(2, 5), rand(2, 5));
      }
    }
    ctx.globalAlpha = 1;
  } else if (tool === 'brush') {
    const steps = Math.max(1, len / 5);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, cx = a.x + (b.x - a.x) * t, cy = a.y + (b.y - a.y) * t;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w / 2);
      g.addColorStop(0, color); g.addColorStop(0.6, color); g.addColorStop(1, clearOf(color));
      ctx.globalAlpha = 0.35; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, w / 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function strokeTo(x, y, first = false) {
  const a = first ? { x: x - 0.01, y } : stroke.last, b = { x, y };
  const w = BASE_WIDTH[state.tool] * SIZES[state.size];
  const pad = w * 2.5 + 4;
  const bx = Math.floor(Math.min(a.x, b.x) - pad), by = Math.floor(Math.min(a.y, b.y) - pad);
  const bw = Math.ceil(Math.abs(b.x - a.x) + pad * 2), bh = Math.ceil(Math.abs(b.y - a.y) + pad * 2);
  stroke.dist += Math.hypot(b.x - a.x, b.y - a.y);
  const box = stroke.box;
  box.x0 = Math.min(box.x0, bx); box.y0 = Math.min(box.y0, by); box.x1 = Math.max(box.x1, bx + bw); box.y1 = Math.max(box.y1, by + bh);

  // draw the segment on scratch, clip it to the region, then composite onto the paint layer
  sctx.clearRect(bx, by, bw, bh);
  sctx.globalCompositeOperation = 'source-over';
  drawSegment(sctx, a, b, w);
  if (stroke.clip) {
    const c = stroke.clip;
    sctx.globalCompositeOperation = 'destination-in';
    // area of the box outside the mask must be cleared too
    sctx.save(); sctx.beginPath(); sctx.rect(bx, by, bw, bh); sctx.clip();
    sctx.drawImage(c.canvas, c.x, c.y);
    sctx.globalCompositeOperation = 'destination-out';
    sctx.beginPath();
    sctx.rect(bx, by, bw, bh); sctx.rect(c.x + c.w, c.y, -c.w, c.h); // box minus mask rect (even-odd)
    sctx.fill('evenodd');
    sctx.restore();
    sctx.globalCompositeOperation = 'source-over';
  }
  pctx.globalCompositeOperation = state.tool === 'eraser' ? 'destination-out' : 'source-over';
  pctx.drawImage(scratch, bx, by, bw, bh, bx, by, bw, bh);
  pctx.globalCompositeOperation = 'source-over';
  stroke.last = b;
}

function endStroke() {
  if (!stroke.active) return;
  stroke.active = false;
  const b = stroke.box;
  pushUndo(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, bctx);
  scheduleSave();
}

// ---------- pointer input ----------
const board = $('#board');
function toCanvas(e) {
  const r = board.getBoundingClientRect();
  return { x: (e.clientX - r.left) * SIZE / r.width, y: (e.clientY - r.top) * SIZE / r.height };
}
board.addEventListener('pointerdown', e => {
  if (stroke.active || !state.labels) return;   // ignore a second finger / palm
  e.preventDefault();
  const p = toCanvas(e);
  if (game.kind === 'number') { numberTap(p); return; }
  if (game.kind === 'dots') { dotsDown(p, e.pointerId); return; }
  if (state.tool === 'fill') { fillAt(p.x, p.y); return; }
  if (finishFill) finishFill();
  board.setPointerCapture(e.pointerId);
  beginStroke(p.x, p.y, e.pointerId);
});
board.addEventListener('pointermove', e => {
  if (game.kind === 'dots') { if (e.pointerId === game.pointer) dotsMove(toCanvas(e)); return; }
  if (!stroke.active || e.pointerId !== stroke.pointer) return;
  const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  for (const ev of (events.length ? events : [e])) { const p = toCanvas(ev); strokeTo(p.x, p.y); }
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => board.addEventListener(t, e => {
  if (e.pointerId === game.pointer) { game.pointer = null; game.trail = null; }
  if (e.pointerId === stroke.pointer) endStroke();
}));
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

// ---------- toolbar ----------
function buildToolbar() {
  const tools = $('#tools');
  for (const t of TOOLS) {
    const b = el('button', 'tool', t.icon);
    b.dataset.tool = t.id; b.setAttribute('aria-label', t.id);
    b.onclick = () => { state.tool = t.id; refreshToolbar(); pop(700); };
    tools.append(b);
  }
  const sizes = el('div', 'sizes');
  SIZES.forEach((s, i) => {
    const b = el('button', 'size', `<i style="width:${8 + i * 7}px;height:${8 + i * 7}px"></i>`);
    b.onclick = () => { state.size = i; refreshToolbar(); };
    sizes.append(b);
  });
  tools.append(sizes);

  buildPalette(COLORS);
  $('#undoBtn').onclick = undo;
  $('#linesBtn').onclick = () => { state.stayInLines = !state.stayInLines; refreshToolbar(); };
  $('#backBtn').onclick = () => { if (finishFill) finishFill(); cancelAnimationFrame(game.raf); game.kind = null; flushSave(); openPack(currentPack); };
  $('#trashBtn').onclick = () => $('#confirm').classList.add('show');
  $('#confirmNo').onclick = () => $('#confirm').classList.remove('show');
  $('#confirmYes').onclick = () => {
    $('#confirm').classList.remove('show');
    if (mode !== 'color') { pctx.clearRect(0, 0, SIZE, SIZE); scheduleSave(); flushSave(); db.del('paint', `${saveKey(state.pic.id)}:done`); startGame(); pop(250); return; }
    pushUndo(0, 0, SIZE, SIZE);
    pctx.clearRect(0, 0, SIZE, SIZE);
    scheduleSave(); pop(250);
  };
  setupHoldToSave();
  refreshToolbar();
}
// Fill the color bar. With numbered=true each swatch shows its number (color by number).
function buildPalette(list, numbered = false) {
  const colors = $('#colors'); colors.innerHTML = '';
  colors.classList.toggle('numbered', numbered);
  colors.style.setProperty('--n', list.length);
  list.forEach((c, i) => {
    const b = el('button', 'swatch' + (c === 'rainbow' ? ' rainbow' : '') + (c === '#ffffff' ? ' white' : ''), numbered ? `<b>${i + 1}</b>` : '');
    if (c !== 'rainbow') b.style.background = c;
    b.dataset.color = c; b.setAttribute('aria-label', numbered ? `color ${i + 1}` : c);
    b.onclick = () => {
      state.color = c; if (state.tool === 'eraser') state.tool = 'marker';
      refreshToolbar(); pop(600);
      if (game.kind === 'number') drawNumbers();
    };
    colors.append(b);
  });
}
// Which controls the drawing screen shows: 'color' (everything), 'number' (numbered colors only), 'none'.
function setControls(kind) {
  $('#tools').hidden = kind !== 'color';
  $('#colors').hidden = kind === 'none';
  $('#undoBtn').hidden = kind !== 'color';
  $('#linesBtn').hidden = kind !== 'color';
  if (kind === 'color' && $('#colors').classList.contains('numbered')) buildPalette(COLORS);
  refreshToolbar(); layoutBoard();
}
function refreshToolbar() {
  document.querySelectorAll('.tool').forEach(b => b.classList.toggle('sel', b.dataset.tool === state.tool));
  document.querySelectorAll('.swatch').forEach(b => b.classList.toggle('sel', b.dataset.color === state.color));
  document.querySelectorAll('.size').forEach((b, i) => b.classList.toggle('sel', i === state.size));
  $('#linesBtn').classList.toggle('off', !state.stayInLines);
}

// Saving to Photos opens a system sheet, so it needs a 1-second press-and-hold (a light grown-up gate).
function setupHoldToSave() {
  const btn = $('#saveBtn');
  let t0 = 0, raf = 0;
  const reset = () => { cancelAnimationFrame(raf); t0 = 0; btn.style.setProperty('--p', 0); };
  btn.addEventListener('pointerdown', e => {
    e.preventDefault(); t0 = performance.now();
    const tick = now => {
      const k = (now - t0) / 1000;
      btn.style.setProperty('--p', Math.min(1, k));
      if (k >= 1) { reset(); exportPicture(); } else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => btn.addEventListener(t, reset));
}

function composite(size = SIZE) {
  const c = canvas(size, size), x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, size, size);
  x.drawImage(paint, 0, 0, size, size);
  x.drawImage(lines, 0, 0, size, size);
  return c;
}
async function exportPicture() {
  const blob = await new Promise(r => composite().toBlob(r, 'image/png'));
  const file = new File([blob], `${state.pic.id}.png`, { type: 'image/png' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); return; }
  } catch (e) { if (e.name === 'AbortError') return; }
  const a = el('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// ---------- autosave ----------
function scheduleSave() { clearTimeout(state.saveTimer); state.saveTimer = setTimeout(flushSave, 800); }
function flushSave() {
  if (!state.saveTimer || !state.pic) return;
  clearTimeout(state.saveTimer); state.saveTimer = 0;
  const id = saveKey(state.pic.id);
  paint.toBlob(b => b && db.put('paint', id, b), 'image/png');
  db.put('thumbs', id, composite(320).toDataURL('image/jpeg', 0.8));
}
document.addEventListener('visibilitychange', () => { if (document.hidden) flushSave(); });

// ---------- open a picture ----------
async function openPicture(pic) {
  state.pic = pic; state.undo = []; state.undoBytes = 0; state.labels = null; updateUndoBtn();
  if (finishFill) finishFill();
  pctx.clearRect(0, 0, SIZE, SIZE); lctx.clearRect(0, 0, SIZE, SIZE);
  show('draw');
  game.kind = null; fctx.clearRect(0, 0, SIZE, SIZE); lines.style.opacity = 1;
  setControls(mode === 'color' ? 'color' : 'none');
  await loadLineArt(pic.svg);
  const saved = await db.get('paint', saveKey(pic.id));
  if (saved && state.pic === pic) {
    try { const bmp = await createImageBitmap(saved); pctx.drawImage(bmp, 0, 0, SIZE, SIZE); } catch (e) {}
  }
  if (state.pic === pic && mode !== 'color') await startGame();
}

// Keep the board square and as large as the stage allows.
function layoutBoard() {
  const st = $('#stage');
  const s = Math.floor(Math.min(st.clientWidth, st.clientHeight));
  if (s > 0) { board.style.width = board.style.height = s + 'px'; }
}
window.addEventListener('resize', () => requestAnimationFrame(layoutBoard));
new ResizeObserver(layoutBoard).observe($('#stage'));


// ---------- games: color by number and connect the dots ----------
const game = { kind: null, pointer: null, raf: 0 };
const U = SIZE / 1000;                         // art units -> canvas pixels
const cssK = () => SIZE / (board.clientWidth || SIZE);   // canvas pixels per CSS pixel
const BLANK = '#ffffff';

function startGame() {
  cancelAnimationFrame(game.raf);
  fctx.clearRect(0, 0, SIZE, SIZE);
  return mode === 'number' ? startNumbers() : startDots();
}

// Distance (in pixels) from each non-outline pixel to the nearest outline or edge (3-4 chamfer).
function distanceMap() {
  const N = SIZE * SIZE, L = state.labels, d = new Float32Array(N);
  for (let i = 0; i < N; i++) d[i] = L[i] > 0 ? 1e9 : 0;
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const i = y * SIZE + x; if (!d[i]) continue;
    let v = d[i];
    if (x === 0 || y === 0 || x === SIZE - 1 || y === SIZE - 1) v = 1;
    else v = Math.min(v, d[i - 1] + 1, d[i - SIZE] + 1, d[i - SIZE - 1] + 1.4, d[i - SIZE + 1] + 1.4);
    d[i] = v;
  }
  for (let y = SIZE - 2; y > 0; y--) for (let x = SIZE - 2; x > 0; x--) {
    const i = y * SIZE + x; if (!d[i]) continue;
    d[i] = Math.min(d[i], d[i + 1] + 1, d[i + SIZE] + 1, d[i + SIZE + 1] + 1.4, d[i + SIZE - 1] + 1.4);
  }
  return d;
}

// Regions to color and their target colors: from the picture's hints, or picked automatically.
function numberTargets() {
  const hints = (EXTRAS[state.pic.id] || {}).colors;
  const targets = new Map();
  if (hints && hints.length) {
    for (const [x, y, c] of hints) {
      const id = regionAt(x * U, y * U);
      if (id && !targets.has(id)) targets.set(id, c.toLowerCase());
    }
  } else {
    const auto = ['#4fc3f7', '#fdd835', '#9ccc65', '#f48fb1', '#fb8c00', '#b39ddb'];
    const big = state.regions.map((r, id) => [id, r ? r.count : 0]).filter(([, n]) => n > 2500).sort((a, b) => b[1] - a[1]);
    big.forEach(([id], i) => targets.set(id, auto[i % auto.length]));
  }
  return targets;
}

async function startNumbers() {
  game.kind = 'number';
  const targets = numberTargets();
  const dist = distanceMap();
  // the most inside point of each target region is where its number goes
  const best = new Map([...targets.keys()].map(id => [id, { d: 0, i: 0 }]));
  const L = state.labels;
  for (let i = 0; i < L.length; i++) { const b = best.get(L[i]); if (b && dist[i] > b.d) { b.d = dist[i]; b.i = i; } }
  const palette = [...new Set([...targets.values()].filter(c => c !== BLANK))];
  const paintData = pctx.getImageData(0, 0, SIZE, SIZE).data;
  game.items = [];
  for (const [id, color] of targets) {
    const b = best.get(id), x = b.i % SIZE, y = (b.i / SIZE) | 0;
    const item = { id, color, x, y, room: b.d, n: palette.indexOf(color) + 1, done: color === BLANK };
    if (!item.done && paintData[(y * SIZE + x) * 4 + 3] > 0) item.done = true;   // colored earlier
    game.items.push(item);
  }
  // regions too small to hold a readable number are colored for the child
  const minRoom = 12 * cssK();
  for (const it of game.items) if (!it.done && it.room < minRoom) { paintRegion(it.id, it.color); it.done = true; }
  game.palette = palette;
  buildPalette(palette, true);
  state.color = palette.find(c => game.items.some(it => !it.done && it.color === c)) || palette[0];
  setControls('number');
  drawNumbers();
  if (game.items.every(it => it.done)) scheduleSave();
}

function paintRegion(id, color) {
  const m = regionMask(id);
  const layer = canvas(m.w, m.h), c = layer.getContext('2d');
  c.drawImage(m.canvas, 0, 0); c.globalCompositeOperation = 'source-in';
  c.fillStyle = color; c.fillRect(0, 0, m.w, m.h);
  pctx.drawImage(layer, m.x, m.y);
}

function drawNumbers() {
  if (game.kind !== 'number') return;
  fctx.clearRect(0, 0, SIZE, SIZE);
  const k = cssK();
  // faint tint shows where the selected color goes
  for (const it of game.items) {
    if (it.done || it.color !== state.color) continue;
    const m = regionMask(it.id);
    const layer = canvas(m.w, m.h), c = layer.getContext('2d');
    c.drawImage(m.canvas, 0, 0); c.globalCompositeOperation = 'source-in';
    c.fillStyle = it.color; c.globalAlpha = 0.28; c.fillRect(0, 0, m.w, m.h);
    fctx.drawImage(layer, m.x, m.y);
  }
  fctx.textAlign = 'center'; fctx.textBaseline = 'middle';
  for (const it of game.items) {
    if (it.done) continue;
    const r = Math.min(it.room * 0.8, 22 * k), sel = it.color === state.color;
    fctx.beginPath(); fctx.arc(it.x, it.y, r, 0, Math.PI * 2);
    fctx.fillStyle = sel ? '#fff' : 'rgba(255,255,255,.85)'; fctx.fill();
    fctx.lineWidth = Math.max(2, r * 0.14); fctx.strokeStyle = it.color; fctx.stroke();
    fctx.fillStyle = '#333'; fctx.font = `800 ${Math.round(r * 1.15)}px ui-rounded, system-ui, sans-serif`;
    fctx.fillText(it.n, it.x, it.y + r * 0.05);
  }
}

function numberTap(p) {
  const id = regionAt(p.x, p.y);
  const it = game.items.find(x => x.id === id && !x.done);
  if (!it) return;
  if (it.color !== state.color) {
    const sw = document.querySelector(`.swatch[data-color="${state.color}"]`);
    if (sw) { sw.classList.remove('nope'); void sw.offsetWidth; sw.classList.add('nope'); }
    pop(200);
    return;
  }
  it.done = true;
  fillAt(p.x, p.y, id);
  drawNumbers();
  if (game.items.every(x => x.done)) { setTimeout(celebrate, 350); return; }
  // when one color is finished, move on to the next one
  if (!game.items.some(x => !x.done && x.color === state.color)) {
    const next = game.palette.find(c => game.items.some(x => !x.done && x.color === c));
    const finished = state.color;
    if (next) setTimeout(() => { if (state.color !== finished) return; state.color = next; refreshToolbar(); drawNumbers(); }, 400);
  }
}

// ----- connect the dots -----
async function startDots() {
  game.kind = 'dots';
  game.dots = ((EXTRAS[state.pic.id] || {}).dots || []).map(([x, y]) => ({ x: x * U, y: y * U }));
  const done = await db.get('paint', `${saveKey(state.pic.id)}:done`);
  if (done) return finishDots(false);
  game.next = 1; game.pointer = null; game.trail = null;
  lines.style.opacity = 0.12;
  setControls('none');
  const loop = t => { drawDots(t); game.raf = requestAnimationFrame(loop); };
  game.raf = requestAnimationFrame(loop);
}

function drawDots(t = 0) {
  const k = cssK(), d = game.dots;
  fctx.clearRect(0, 0, SIZE, SIZE);
  fctx.lineCap = 'round'; fctx.lineJoin = 'round';
  fctx.strokeStyle = '#222'; fctx.lineWidth = 5 * k;
  fctx.beginPath();
  for (let i = 0; i < game.next && i < d.length; i++) i ? fctx.lineTo(d[i].x, d[i].y) : fctx.moveTo(d[i].x, d[i].y);
  if (game.next > d.length) fctx.closePath();
  fctx.stroke();
  if (game.trail && game.next <= d.length) {   // finger dragging from the last dot
    const a = d[game.next - 1];
    fctx.save(); fctx.setLineDash([4 * k, 6 * k]); fctx.strokeStyle = '#999';
    fctx.beginPath(); fctx.moveTo(a.x, a.y); fctx.lineTo(game.trail.x, game.trail.y); fctx.stroke(); fctx.restore();
  }
  fctx.textAlign = 'center'; fctx.textBaseline = 'middle';
  d.forEach((p, i) => {
    const isNext = i === game.next;
    const r = (isNext ? 11 + Math.sin(t / 180) * 2.5 : 8) * k;
    if (isNext) { fctx.beginPath(); fctx.arc(p.x, p.y, r * 1.9, 0, Math.PI * 2); fctx.fillStyle = 'rgba(124,77,255,.18)'; fctx.fill(); }
    fctx.beginPath(); fctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    fctx.fillStyle = i < game.next ? '#7c4dff' : isNext ? '#ff9800' : '#fff'; fctx.fill();
    fctx.lineWidth = 2.5 * k; fctx.strokeStyle = '#222'; fctx.stroke();
    fctx.font = `800 ${Math.round(15 * k)}px ui-rounded, system-ui, sans-serif`;
    fctx.lineWidth = 4 * k; fctx.strokeStyle = '#fff';
    const lx = p.x + 17 * k, ly = p.y - 15 * k;
    fctx.strokeText(i + 1, lx, ly); fctx.fillStyle = '#222'; fctx.fillText(i + 1, lx, ly);
  });
}

function dotsHit(p) {
  if (game.next >= game.dots.length) return false;
  const q = game.dots[game.next], k = cssK();
  if (Math.hypot(p.x - q.x, p.y - q.y) > 30 * k) return false;
  game.next++;
  pop(400 + game.next * 30);
  if (game.next >= game.dots.length) { game.next = game.dots.length + 1; setTimeout(() => finishDots(true), 250); }
  return true;
}
function dotsDown(p, pointerId) {
  if (game.next > game.dots.length) return;
  game.pointer = pointerId; board.setPointerCapture(pointerId);
  // touching the first dot (or any dot already reached) just starts a drag
  dotsHit(p);
}
function dotsMove(p) {
  if (game.next > game.dots.length) { game.trail = null; return; }
  game.trail = p;
  dotsHit(p);
}

async function finishDots(animate) {
  game.trail = null;
  db.put('paint', `${saveKey(state.pic.id)}:done`, true);
  cancelAnimationFrame(game.raf);
  game.next = game.dots.length + 1;
  if (animate) {
    drawDots();
    const t0 = performance.now();
    await new Promise(res => {
      const step = now => {
        const k = Math.min(1, (now - t0) / 700);
        lines.style.opacity = 0.12 + 0.88 * k; fx.style.opacity = 1 - k;
        k < 1 ? requestAnimationFrame(step) : res();
      };
      requestAnimationFrame(step);
    });
    fctx.clearRect(0, 0, SIZE, SIZE); fx.style.opacity = 1;
    celebrate();
  } else { fctx.clearRect(0, 0, SIZE, SIZE); lines.style.opacity = 1; }
  // now it is a normal coloring page
  game.kind = null;
  state.tool = 'fill';
  setControls('color');
}

// ----- confetti -----
function celebrate() {
  const k = cssK(), parts = [];
  const cols = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#fb8c00', '#ec407a'];
  for (let i = 0; i < 140; i++) parts.push({
    x: SIZE / 2 + rand(-80, 80) * k, y: SIZE * 0.55, vx: rand(-9, 9) * k, vy: rand(-22, -8) * k,
    s: rand(5, 10) * k, c: cols[i % cols.length], r: rand(0, 6), vr: rand(-0.3, 0.3),
  });
  [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => pop(f), i * 110));
  const t0 = performance.now();
  const step = now => {
    fctx.clearRect(0, 0, SIZE, SIZE);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.5 * k; p.r += p.vr;
      fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.r); fctx.fillStyle = p.c;
      fctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); fctx.restore();
    }
    if (now - t0 < 2200) requestAnimationFrame(step);
    else { fctx.clearRect(0, 0, SIZE, SIZE); drawNumbers(); }
  };
  requestAnimationFrame(step);
}
window.addEventListener('resize', () => { if (game.kind === 'number') requestAnimationFrame(drawNumbers); });

// ---------- boot ----------
buildToolbar();
renderHome();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
window.__colorfun = { state, game, fillAt, openPicture, PACKS }; // for testing
