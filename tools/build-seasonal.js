// Builds the hand-drawn SVG packs from tools/seasonal/<pack>.js into art/<pack>.js and art/extras/<pack>.js.
// Color-by-number hints come from each shape's data-c color (one hint per visible region), and the
// connect-the-dots path is traced around the shapes marked data-s.
// Usage: NODE_PATH=$(npm root -g) node tools/build-seasonal.js [previewDir] [pack ...]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { wrap } = require('./seasonal/draw.js');
const root = path.join(__dirname, '..');

const strip = svg => svg.replace(/<[^<>]*data-ghost[^<>]*\/>/g, '').replace(/ data-c="[^"]*"/g, '').replace(/ data-s="1"/g, '');

async function analyze(full, final, bg) {
  const S = 1536, WALL = 140;
  const load = async (svg, size) => {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace(/ (width|height)="1000"/g, "").replace('<svg', `<svg width="${size}" height="${size}"`));
    await img.decode();
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, size, size); c.drawImage(img, 0, 0, size, size);
    return { cv, c, data: c.getImageData(0, 0, size, size).data };
  };
  // regions, as the app finds them
  const { cv, c, data } = await load(final, S);
  const N = S * S, L = new Int32Array(N);
  for (let i = 0; i < N; i++) { const j = i * 4; if (data[j] * 0.3 + data[j + 1] * 0.59 + data[j + 2] * 0.11 < WALL) L[i] = -1; }
  const regions = [null], stack = new Int32Array(N);
  for (let s = 0; s < N; s++) {
    if (L[s] !== 0) continue;
    const id = regions.length; let n = 0, sp = 0; stack[sp++] = s; L[s] = id;
    while (sp) {
      const p = stack[--sp], x = p % S; n++;
      if (x > 0 && L[p - 1] === 0) { L[p - 1] = id; stack[sp++] = p - 1; }
      if (x < S - 1 && L[p + 1] === 0) { L[p + 1] = id; stack[sp++] = p + 1; }
      if (p >= S && L[p - S] === 0) { L[p - S] = id; stack[sp++] = p - S; }
      if (p < N - S && L[p + S] === 0) { L[p + S] = id; stack[sp++] = p + S; }
    }
    regions.push({ n, best: 0, at: s });
  }
  const D = new Float32Array(N);
  for (let i = 0; i < N; i++) D[i] = L[i] > 0 ? 1e9 : 0;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x; if (!D[i]) continue;
    if (x === 0 || y === 0 || x === S - 1 || y === S - 1) { D[i] = 1; continue; }
    D[i] = Math.min(D[i], D[i - 1] + 1, D[i - S] + 1, D[i - S - 1] + 1.4, D[i - S + 1] + 1.4);
  }
  for (let y = S - 2; y > 0; y--) for (let x = S - 2; x > 0; x--) {
    const i = y * S + x; if (!D[i]) continue;
    D[i] = Math.min(D[i], D[i + 1] + 1, D[i + S] + 1, D[i + S + 1] + 1.4, D[i + S - 1] + 1.4);
    const r = regions[L[i]]; if (D[i] > r.best) { r.best = D[i]; r.at = i; }
  }
  // which shape each region belongs to
  const host = document.getElementById('host');
  host.innerHTML = full.replace('<svg', '<svg width="1000" height="1000"');
  const colors = [], k = 1000 / S, regionColor = [null];
  for (let id = 1; id < regions.length; id++) {
    const r = regions[id]; regionColor.push(null);
    if (r.n < 150) continue;
    const x = (r.at % S) * k, y = Math.floor(r.at / S) * k;
    const el = document.elementFromPoint(x + 0.5, y + 0.5);
    const owner = el && el.closest('[data-c]');
    const col = owner ? owner.getAttribute('data-c') : bg;
    if (!col) continue;
    colors.push([Math.round(x), Math.round(y), col]); regionColor[id] = col;
  }
  // colored preview
  const out = c.getImageData(0, 0, S, S), o = out.data;
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const cache = regionColor.map(h => h && rgb(h));
  for (let i = 0; i < N; i++) { const col = L[i] > 0 && cache[L[i]]; if (col) { o[i * 4] = col[0]; o[i * 4 + 1] = col[1]; o[i * 4 + 2] = col[2]; } }
  c.putImageData(out, 0, 0);
  const preview = cv.toDataURL('image/png');

  // connect-the-dots: outline of the shapes marked data-s
  const svgEl = host.querySelector('svg');
  for (const e of [...svgEl.querySelectorAll('path,circle,ellipse,rect')]) {
    if (e.closest('clipPath')) continue;
    if (!e.hasAttribute('data-s') || e.hasAttribute('data-ghost')) { e.remove(); continue; }
    if (e.getAttribute('fill') !== 'none') e.setAttribute('fill', '#000');
    e.setAttribute('stroke', '#000'); e.removeAttribute('opacity');
  }
  const M = 500, sil = await load(svgEl.outerHTML, M);
  let mask = new Uint8Array(M * M);
  for (let i = 0; i < M * M; i++) mask[i] = sil.data[i * 4] < 128 ? 1 : 0;
  for (let pass = 0; pass < 3; pass++) {   // dilate to join near-touching parts
    const m2 = mask.slice();
    for (let y = 1; y < M - 1; y++) for (let x = 1; x < M - 1; x++) { const i = y * M + x; if (mask[i - 1] || mask[i + 1] || mask[i - M] || mask[i + M]) m2[i] = 1; }
    mask = m2;
  }
  // largest component
  const comp = new Int32Array(M * M); let bestId = 0, bestN = 0, cid = 0;
  for (let s = 0; s < M * M; s++) {
    if (!mask[s] || comp[s]) continue;
    cid++; let n = 0, sp = 0; stack[sp++] = s; comp[s] = cid;
    while (sp) {
      const p = stack[--sp], x = p % M, y = (p / M) | 0; n++;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= M || yy >= M) continue;
        const q = yy * M + xx; if (mask[q] && !comp[q]) { comp[q] = cid; stack[sp++] = q; }
      }
    }
    if (n > bestN) { bestN = n; bestId = cid; }
  }
  let dots = [];
  if (bestN) {
    const on = (x, y) => x >= 0 && y >= 0 && x < M && y < M && comp[y * M + x] === bestId;
    let start = 0; while (comp[start] !== bestId) start++;
    const sx = start % M, sy = (start / M) | 0;
    const dirs = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
    const contour = [[sx, sy]]; let cx = sx, cy = sy, b = 0;
    for (let guard = 0; guard < M * 40; guard++) {
      let found = -1;
      for (let k2 = 1; k2 <= 8; k2++) { const d = (b + k2) % 8; if (on(cx + dirs[d][0], cy + dirs[d][1])) { found = d; break; } }
      if (found < 0) break;
      const px = cx + dirs[(found + 7) % 8][0], py = cy + dirs[(found + 7) % 8][1];
      const nx = cx + dirs[found][0], ny = cy + dirs[found][1];
      b = dirs.findIndex(([dx, dy]) => dx === px - nx && dy === py - ny);
      cx = nx; cy = ny;
      if (cx === sx && cy === sy) break;
      contour.push([cx, cy]);
    }
    const rdp = (pts, eps) => {
      if (pts.length < 3) return pts;
      const [a, z] = [pts[0], pts[pts.length - 1]];
      let idx = 0, dm = 0;
      for (let i = 1; i < pts.length - 1; i++) {
        const p = pts[i], len = Math.hypot(z[0] - a[0], z[1] - a[1]) || 1;
        const d = Math.abs((z[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (z[1] - a[1])) / len;
        if (d > dm) { dm = d; idx = i; }
      }
      if (dm <= eps) return [a, z];
      return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
    };
    let far = 0, fd = 0;
    contour.forEach((p, i) => { const d = Math.hypot(p[0] - sx, p[1] - sy); if (d > fd) { fd = d; far = i; } });
    const simp = eps => rdp(contour.slice(0, far + 1), eps).slice(0, -1).concat(rdp(contour.slice(far).concat([contour[0]]), eps).slice(0, -1));
    let lo = 0.5, hi = 80, pts = simp(6);
    if (pts.length > 26 || pts.length < 12) for (let it = 0; it < 30; it++) {
      const mid = (lo + hi) / 2; pts = simp(mid);
      if (pts.length > 26) lo = mid; else if (pts.length < 12) hi = mid; else break;
    }
    // drop points that sit too close together
    const kk = 1000 / M; const res = [];
    for (const p of pts.map(([x, y]) => [Math.round(x * kk), Math.round(y * kk)])) {
      const last = res[res.length - 1];
      if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= 35) res.push(p);
    }
    if (res.length > 2 && Math.hypot(res[0][0] - res[res.length - 1][0], res[0][1] - res[res.length - 1][1]) < 35) res.pop();
    // split long sides so there are enough dots to follow
    dots = [];
    res.forEach((p, i) => {
      const q = res[(i + 1) % res.length], n = Math.floor(Math.hypot(q[0] - p[0], q[1] - p[1]) / 190);
      dots.push(p);
      if (res.length < 16) for (let j = 1; j <= n; j++) dots.push([Math.round(p[0] + (q[0] - p[0]) * j / (n + 1)), Math.round(p[1] + (q[1] - p[1]) * j / (n + 1))]);
    });
  }
  return { colors, dots, preview };
}

(async () => {
  const args = process.argv.slice(2);
  const outDir = args[0] && !/^[a-z]+$/.test(args[0]) ? args.shift() : null;
  const packs = args.length ? args : ['thanksgiving', 'christmas', 'winter'];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  await page.setContent('<html><body style="margin:0"><div id="host" style="position:absolute;left:0;top:0"></div></body></html>');
  await page.evaluate(`window.analyze = ${analyze.toString()}`);
  for (const name of packs) {
    delete require.cache[require.resolve(`./seasonal/${name}.js`)];
    const pack = require(`./seasonal/${name}.js`);
    const pics = [], extras = {}, previews = [];
    for (const pic of pack.pictures) {
      const full = wrap(pic.body), final = strip(full);
      const r = await page.evaluate(([f, fi, bg]) => window.analyze(f, fi, bg), [full, final, pic.bg || null]);
      pics.push({ id: pic.id, title: pic.title, svg: final });
      extras[pic.id] = { colors: r.colors, dots: r.dots };
      previews.push({ id: pic.id, final, ...r });
      if (r.dots.length < 8) console.warn(`  ${pic.id}: only ${r.dots.length} dots`);
    }
    const head = `export default {\n  id: ${JSON.stringify(pack.id)}, title: ${JSON.stringify(pack.title)}, icon: ${JSON.stringify(pack.icon)}, season: ${JSON.stringify(pack.season).replace(/"(\w+)":/g, '$1: ')},\n  pictures: [\n`;
    fs.writeFileSync(path.join(root, `art/${name}.js`), `// Generated by tools/build-seasonal.js from tools/seasonal/${name}.js. Edit the source and rebuild.\n` + head +
      pics.map(p => `    { id: ${JSON.stringify(p.id)}, title: ${JSON.stringify(p.title)}, svg: \`${p.svg}\` },`).join('\n') + '\n  ],\n};\n');
    fs.writeFileSync(path.join(root, `art/extras/${name}.js`), `// Generated by tools/build-seasonal.js.\nexport default {\n` +
      Object.entries(extras).map(([id, e]) => `  '${id}': {\n    colors: ${JSON.stringify(e.colors).replace(/"/g, "'")},\n    dots: ${JSON.stringify(e.dots)},\n  },`).join('\n') + '\n};\n');
    console.log(`${name}: ${pics.length} pictures`);
    if (outDir) {
      fs.mkdirSync(outDir, { recursive: true });
      const cell = (img, label) => `<div style="display:inline-block;width:320px;margin:3px;font:14px sans-serif;text-align:center;border:1px solid #ccc">${img}<br>${label}</div>`;
      const dotsSvg = p => p.final.replace('<svg', '<svg width="320" height="320"').replace('</svg>',
        `<polyline points="${p.dots.map(q => q.join(',')).join(' ')} ${p.dots[0] ? p.dots[0].join(',') : ''}" fill="none" stroke="red" stroke-width="6"/>` +
        p.dots.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i ? 9 : 16}" fill="${i ? 'red' : 'blue'}"/>`).join('') + '</svg>');
      const sheets = { color: p => `<img src="${p.preview}" width="320">`, dots: dotsSvg };
      for (const [kind, f] of Object.entries(sheets)) {
        for (let part = 0; part < previews.length; part += 12) {
          await page.setViewportSize({ width: 1000, height: 1000 });
          await page.setContent(`<body style="margin:0;width:1000px">${previews.slice(part, part + 12).map(p => cell(f(p), p.id)).join('')}</body>`);
          await page.screenshot({ path: path.join(outDir, `${name}-${kind}-${part / 12 + 1}.png`), fullPage: true });
        }
      }
      await page.setContent('<html><body style="margin:0"><div id="host" style="position:absolute;left:0;top:0"></div></body></html>');
      await page.evaluate(`window.analyze = ${analyze.toString()}`);
    }
  }
  await browser.close();
})();
