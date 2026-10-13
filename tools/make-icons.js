const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const svg = fs.readFileSync(__dirname + '/icon.svg', 'utf8');
  const b = await chromium.launch(); const p = await b.newPage();
  for (const s of [180, 192, 512]) {
    await p.setViewportSize({ width: s, height: s });
    await p.setContent(`<body style="margin:0">${svg.replace('<svg', `<svg width="${s}" height="${s}"`)}</body>`);
    await p.screenshot({ path: `${__dirname}/../icon-${s}.png` });
  }
  await b.close();
})();
