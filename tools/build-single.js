// Bundles the app into one self-contained HTML file (dist/color-fun.html).
// Usage: node tools/build-single.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const packs = ['animals', 'ocean', 'vehicles', 'space', 'fantasy', 'halloween'];
let js = packs.map(p => read(`art/${p}.js`).replace(/export\s+default/, `const pack_${p} =`)).join('\n');
// raster packs: inline their PNGs as data URIs so the single file works on its own
js += '\n' + read('art/gemini.js').replace(/export\s+default/, 'const friends =')
  .replace('src: `art/gemini/${id}.png`', 'src: GEM[id]');
const gemDir = path.join(root, 'art/gemini');
js = 'const GEM = {' + fs.readdirSync(gemDir).filter(f => f.endsWith('.png')).map(f =>
  `'${f.slice(0, -4)}': 'data:image/png;base64,${fs.readFileSync(path.join(gemDir, f)).toString('base64')}'`).join(',\n') + '};\n' + js;
js += '\n' + read('art/index.js').replace(/^import .*$/gm, '').replace(/import (\w+) from '\.\/(\w+)\.js';/g, '')
  .replace(/export\s+default/, 'const PACKS =');
js = js.replace(/const PACKS = \[([^\]]*)\]/, (m, list) => `const PACKS = [${list.split(',').map(s => s.trim()).map(s => packs.includes(s) ? `pack_${s}` : s).join(', ')}]`);
js += '\n' + packs.map(p => read(`art/extras/${p}.js`).replace(/export\s+default/, `const extras_${p} =`)).join('\n');
js += `\nconst EXTRAS = Object.assign({}, ${packs.map(p => `extras_${p}`).join(', ')});`;
js += '\n' + read('app.js').replace(/^import .*$/gm, '');
let html = read('index.html')
  .replace('<link rel="stylesheet" href="style.css">', `<style>\n${read('style.css')}\n</style>`)
  .replace('<script type="module" src="app.js"></script>', `<script type="module">\n${js}\n</script>`)
  .replace(/<link rel="(apple-touch-icon|manifest)"[^>]*>\n/g, '');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/color-fun.html'), html);
console.log('wrote dist/color-fun.html', (html.length / 1024).toFixed(0), 'KB');
