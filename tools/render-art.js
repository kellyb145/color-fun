// Usage: NODE_PATH=$(npm root -g) node render-art.js <pack.js> <outdir>
// Renders every picture in an art pack to PNG so it can be eyeballed.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [packFile, outDir] = process.argv.slice(2);
  const src = fs.readFileSync(packFile, 'utf8').replace(/export\s+default/, 'window.__pack =');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  await page.setContent('<html><body style="margin:0;background:#fff"></body></html>');
  await page.addScriptTag({ content: src });
  const pack = await page.evaluate(() => window.__pack);
  for (const pic of pack.pictures) {
    await page.setContent(`<html><body style="margin:0;background:#fff">${pic.svg}</body></html>`);
    await page.screenshot({ path: path.join(outDir, `${pic.id}.png`) });
  }
  // contact sheet
  const cells = pack.pictures.map(p => `<div style="display:inline-block;width:240px;margin:4px;border:1px solid #ccc;font:14px sans-serif;text-align:center">${p.svg.replace('<svg', '<svg width="240" height="240"')}<br>${p.id}</div>`).join('');
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.setContent(`<html><body style="margin:0">${cells}</body></html>`);
  await page.screenshot({ path: path.join(outDir, `_sheet.png`), fullPage: true });
  await browser.close();
  console.log(`rendered ${pack.pictures.length} pictures`);
})();
