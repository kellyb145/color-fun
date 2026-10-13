// Usage: NODE_PATH=$(npm root -g) node tools/render-extras.js <pack.js> <extras.js> <outdir>
// Draws each picture with its color-by-number hints (colored dots) and its connect-the-dots path
// (red numbered polyline) so the data can be checked by eye.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [packFile, extrasFile, outDir] = process.argv.slice(2);
  const pack = fs.readFileSync(packFile, 'utf8').replace(/export\s+default/, 'window.__pack =');
  const extras = fs.readFileSync(extrasFile, 'utf8').replace(/export\s+default/, 'window.__extras =');
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  await p.setContent('<body style="margin:0"></body>');
  await p.addScriptTag({ content: pack }); await p.addScriptTag({ content: extras });
  const ids = await p.evaluate(() => window.__pack.pictures.map(x => x.id));
  for (const id of ids) {
    await p.evaluate(id => {
      const pic = window.__pack.pictures.find(x => x.id === id), ex = window.__extras[id] || {};
      let o = '';
      for (const [x, y, c] of ex.colors || []) o += `<circle cx="${x}" cy="${y}" r="16" fill="${c}" stroke="#000" stroke-width="3"/>`;
      const d = ex.dots || [];
      if (d.length) {
        o += `<polyline points="${d.map(q => q.join(',')).join(' ')}" fill="none" stroke="red" stroke-width="5" opacity=".7"/>`;
        d.forEach(([x, y], i) => o += `<circle cx="${x}" cy="${y}" r="10" fill="red"/><text x="${x + 12}" y="${y - 12}" font-size="28" font-family="sans-serif" fill="red">${i + 1}</text>`);
      }
      document.body.innerHTML = pic.svg.replace('</svg>', o + '</svg>');
    }, id);
    await p.screenshot({ path: path.join(outDir, `${id}.png`) });
  }
  await b.close();
  console.log('rendered', ids.length);
})();
