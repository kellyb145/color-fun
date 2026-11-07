// Drawing helpers for the hand-made SVG packs (thanksgiving, christmas, winter).
// Pictures are authored with a few extra attributes that tools/build-seasonal.js reads and then strips:
//   data-c="#hex"   color for color by number (every region this shape shows gets that color)
//   data-s          part of the main subject (its outline becomes the connect-the-dots path)
//   data-ghost      invisible shape used only to give part of a region-split shape its own color
const r1 = n => Math.round(n * 10) / 10;
const attrs = o => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false)
  .map(([k, v]) => v === true ? ` ${k}` : ` ${k}="${v}"`).join('');
const A = (c, o = {}) => attrs({ 'data-c': c || undefined, 'data-s': o.s ? 1 : undefined, transform: o.t, ...(o.a || {}) });

const K = {   // kid palette
  red: '#e53935', orange: '#fb8c00', yellow: '#fdd835', gold: '#ffb300', green: '#43a047', lime: '#9ccc65',
  dkgreen: '#2e7d32', blue: '#1e88e5', sky: '#81d4fa', navy: '#3949ab', purple: '#8e24aa', pink: '#f48fb1',
  brown: '#8d6e63', dkbrown: '#5d4037', tan: '#d7a86e', ginger: '#c68642', gray: '#9e9e9e', dkgray: '#546e7a',
  white: '#ffffff', black: '#212121', skin: '#ffcc99', cream: '#fff3c4', ice: '#b3e5fc', snow: '#ffffff',
};

const path = (d, c, o) => `<path d="${d}"${A(c, o)}/>`;
const circle = (cx, cy, r, c, o) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}"${A(c, o)}/>`;
const ellipse = (cx, cy, rx, ry, c, o) => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}"${A(c, o)}/>`;
const rect = (x, y, w, h, rx, c, o) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"${rx ? ` rx="${rx}"` : ''}${A(c, o)}/>`;
const line = (d, o = {}) => `<path d="${d}" fill="none"${A(null, o)}/>`;
const g = (t, inner) => `<g transform="${t}">${inner}</g>`;
const poly = pts => 'M' + pts.map(p => `${r1(p[0])} ${r1(p[1])}`).join(' L') + ' Z';
const ghost = (d, c) => `<path d="${d}" opacity="0" data-ghost${A(c)}/>`;

// thick outlined stroke (antlers, branches, canes): black wide stroke under a white narrower one
const tube = (d, w, c, o = {}) => `<path d="${d}" fill="none" stroke-width="${w + 16}"${A(null, { s: o.s })}/>` +
  `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}"${A(c, o)}/>`;

// Several shapes drawn as one outlined shape (no lines where they overlap).
// parts: ['circle',cx,cy,r] ['ellipse',cx,cy,rx,ry,rot] ['rect',x,y,w,h,rx] ['path',d] ['tube',d,w]
function union(parts, c, o = {}) {
  const el = (p, outline) => {
    const st = outline ? ` stroke-width="16"` : ` stroke="none"`;
    const a = outline ? A(null, { s: o.s }) : A(c, o);
    switch (p[0]) {
      case 'circle': return `<circle cx="${p[1]}" cy="${p[2]}" r="${p[3]}"${st}${a}/>`;
      case 'ellipse': return `<ellipse cx="${p[1]}" cy="${p[2]}" rx="${p[3]}" ry="${p[4]}"${p[5] ? ` transform="rotate(${p[5]} ${p[1]} ${p[2]})"` : ''}${st}${a}/>`;
      case 'rect': return `<rect x="${p[1]}" y="${p[2]}" width="${p[3]}" height="${p[4]}" rx="${p[5] || 0}"${st}${a}/>`;
      case 'path': return `<path d="${p[1]}"${st}${a}/>`;
      case 'tube': return outline ? `<path d="${p[1]}" fill="none" stroke-width="${p[2] + 16}"${a}/>`
        : `<path d="${p[1]}" fill="none" stroke="#fff" stroke-width="${p[2]}"${a}/>`;
    }
  };
  const inner = parts.map(p => el(p, true)).join('') + parts.map(p => el(p, false)).join('');
  return o.t ? g(o.t, inner) : inner;
}

const starD = (cx, cy, R, r = R * 0.45, n = 5, rot = -90) => {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? r : R;
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return poly(pts);
};
const star = (cx, cy, R, c = K.yellow, o) => path(starD(cx, cy, R), c, o);
const ground = (y = 880, c = K.lime, bump = 40) => path(`M-20 ${y} Q500 ${y - bump} 1020 ${y} L1020 1020 L-20 1020 Z`, c);
const hills = (y, c = K.snow) => path(`M-20 ${y} Q250 ${y - 90} 520 ${y - 10} Q780 ${y + 50} 1020 ${y - 60} L1020 1020 L-20 1020 Z`, c);

// bumpy (scalloped) ellipse, bumps point outward
function scallopD(cx, cy, rx, ry, n, bump = 0.5) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 - Math.PI / 2; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 1; i <= n; i++) {
    const p = pts[i % n], q = pts[i - 1];
    const chord = Math.hypot(p[0] - q[0], p[1] - q[1]);
    d += ` A${r1(chord * bump)} ${r1(chord * bump)} 0 0 1 ${r1(p[0])} ${r1(p[1])}`;
  }
  return d + ' Z';
}
const cloud = (cx, cy, rx, ry, c = K.white, n = 9, o) => path(scallopD(cx, cy, rx, ry, n, 0.55), c, o);

// scalloped edge along a polyline (for snow caps / icing): bumps below the line from p0 to p1
function scallopLine(x0, y0, x1, y1, n) {
  let d = '';
  for (let i = 1; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
    const seg = Math.hypot(x1 - x0, y1 - y0) / n;
    d += ` A${r1(seg / 2)} ${r1(seg / 2)} 0 0 ${x1 > x0 ? 0 : 1} ${r1(x)} ${r1(y)}`;
  }
  return d;
}

// faces
const eye = (cx, cy, r = 20) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="#000"/><circle cx="${r1(cx + r * 0.3)}" cy="${r1(cy - r * 0.35)}" r="${r1(r * 0.36)}" fill="#fff" stroke="none"/>`;
const eyes = (x1, x2, y, r) => eye(x1, y, r) + eye(x2, y, r);
const smile = (cx, cy, w = 60, h = 30) => line(`M${cx - w / 2} ${cy} Q${cx} ${cy + h * 2} ${cx + w / 2} ${cy}`);
const sleepy = (cx, cy, w = 40) => line(`M${cx - w / 2} ${cy} Q${cx} ${cy + w * 0.6} ${cx + w / 2} ${cy}`);
const blush = (cx, cy, c = K.pink) => ellipse(cx, cy, 28, 16, c);

// nature
function leafD(len, w) { return `M0 ${-len / 2} Q${w} 0 0 ${len / 2} Q${-w} 0 0 ${-len / 2} Z`; }
const leaf = (cx, cy, len, w, rot, c = K.green, vein = true) =>
  g(`translate(${r1(cx)} ${r1(cy)}) rotate(${rot})`, path(leafD(len, w), c) + (vein ? line(`M0 ${-len / 2} L0 ${len / 2}`) : ''));
const MAPLE = (() => {
  const right = [[0, -100], [18, -62], [42, -72], [35, -28], [75, -48], [68, -14], [100, -10], [62, 22], [72, 48], [28, 38], [8, 62], [5, 100]];
  const left = right.slice().reverse().map(([x, y]) => [-x, y]);
  return poly(right.concat(left));
})();
// scaled groups keep an 8px outline
const gs = (cx, cy, s, rot, inner) => `<g transform="translate(${r1(cx)} ${r1(cy)}) rotate(${rot}) scale(${s})" stroke-width="${r1(8 / s)}">${inner}</g>`;
const maple = (cx, cy, s, rot, c = K.orange, veins = false, o) => gs(cx, cy, s, rot,
  path(MAPLE, c, o) + (veins ? line('M0 62 L0 -100') + line('M0 50 L75 -48') + line('M0 50 L-75 -48') + line('M0 58 L72 48') + line('M0 58 L-72 48') : ''));
function hollyD(len) {   // spiky holly leaf pointing up, centered
  const n = 4, w = len * 0.3, pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n, y = -len / 2 + t * len; pts.push([Math.sin(t * Math.PI) * w, y]); }
  let d = `M0 ${r1(-len / 2)}`;
  for (let i = 1; i <= n; i++) { const p = pts[i], q = pts[i - 1]; d += ` Q${r1((p[0] + q[0]) / 2 * 0.55)} ${r1((p[1] + q[1]) / 2)} ${r1(p[0])} ${r1(p[1])}`; }
  for (let i = n - 1; i >= 0; i--) { const p = pts[i], q = pts[i + 1]; d += ` Q${r1(-(p[0] + q[0]) / 2 * 0.55)} ${r1((p[1] + q[1]) / 2)} ${r1(-p[0])} ${r1(p[1])}`; }
  return d + ' Z';
}
const holly = (cx, cy, len, rot, c = K.green) => g(`translate(${r1(cx)} ${r1(cy)}) rotate(${rot})`, path(hollyD(len), c) + line(`M0 ${-len * 0.42} L0 ${len * 0.45}`));
const berries = (cx, cy, r = 22, c = K.red) => circle(cx - r * 0.9, cy, r, c) + circle(cx + r * 0.9, cy, r, c) + circle(cx, cy - r * 1.4, r, c);
const flake = (cx, cy, r) => {   // small snowflake made of lines
  let d = '';
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI / 3, dx = Math.cos(a) * r, dy = Math.sin(a) * r;
    d += `M${r1(cx - dx)} ${r1(cy - dy)} L${r1(cx + dx)} ${r1(cy + dy)} `;
  }
  return line(d.trim());
};
function pumpkin(cx, cy, w, h, c = K.orange, stem = K.brown, o = {}) {
  return path(`M${cx - 8} ${cy - h * 0.45} Q${cx - 4} ${cy - h * 0.62} ${cx - 18} ${cy - h * 0.72} L${cx + 14} ${cy - h * 0.78} Q${cx + 18} ${cy - h * 0.6} ${cx + 12} ${cy - h * 0.45} Z`, stem, o) +
    ellipse(cx - w * 0.22, cy, w * 0.3, h * 0.48, c, o) + ellipse(cx + w * 0.22, cy, w * 0.3, h * 0.48, c, o) + ellipse(cx, cy, w * 0.22, h * 0.5, c, o);
}
// pine tree made of 3 tiers, base of trunk at (cx, by)
function pine(cx, by, h, w, c = K.green, snowy = false, o = {}) {
  const th = h * 0.14, top = by - h;
  let s = rect(cx - w * 0.08, by - th - 4, w * 0.16, th + 4, 0, K.brown, o);
  const tiers = [[0.55, 1, 1], [0.3, 0.72, 0.78], [0, 0.45, 0.56]];
  for (const [t0, t1, ww] of tiers) {
    const yTop = top + (h - th) * t0, yBot = top + (h - th) * t1, half = w / 2 * ww;
    s += path(`M${r1(cx)} ${r1(yTop)} L${r1(cx + half)} ${r1(yBot)} Q${r1(cx)} ${r1(yBot + 18)} ${r1(cx - half)} ${r1(yBot)} Z`, c, o);
    if (snowy) {
      const sy = yTop + (yBot - yTop) * 0.35, sx = half * 0.35;
      s += path(`M${r1(cx)} ${r1(yTop)} L${r1(cx + sx)} ${r1(sy)}${scallopLine(cx + sx, sy, cx - sx, sy, 3)} Z`, K.snow);
    }
  }
  return s;
}
// gift box with ribbon and bow
function present(x, y, w, h, c = K.red, rib = K.yellow, o = {}) {
  const lidH = h * 0.22, cx = x + w / 2, rw = w * 0.14;
  return path(`M${cx} ${y} C${cx - w * 0.35} ${y - h * 0.4} ${cx - w * 0.45} ${y + 5} ${cx} ${y} Z`, rib, o) +
    path(`M${cx} ${y} C${cx + w * 0.35} ${y - h * 0.4} ${cx + w * 0.45} ${y + 5} ${cx} ${y} Z`, rib, o) +
    rect(x + w * 0.05, y + lidH, w * 0.9, h - lidH, 0, c, o) + rect(x, y, w, lidH, 6, c, o) +
    rect(cx - rw / 2, y, rw, lidH, 0, rib, o) + rect(cx - rw / 2, y + lidH, rw, h - lidH, 0, rib, o);
}
// ring of tube-outlined branches etc. need clip paths: unique ids per picture
let clipN = 0;
function clipped(shapeD, inner) {   // draw `inner` (lines) clipped to a shape; returns [defs+g]
  const id = `k${++clipN}`;
  return `<clipPath id="${id}"><path d="${shapeD}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`;
}

function wrap(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><g fill="#fff" stroke="#000" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;
}

module.exports = {
  K, r1, path, circle, ellipse, rect, line, g, poly, ghost, tube, union, starD, star, ground, hills, scallopD, cloud,
  scallopLine, eye, eyes, smile, sleepy, blush, leafD, leaf, maple, MAPLE, hollyD, holly, berries, flake, pumpkin,
  pine, present, clipped, wrap, gs,
};
