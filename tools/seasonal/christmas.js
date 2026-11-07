const D = require('./draw.js');
const { K, path, circle, ellipse, rect, line, g, gs, poly, tube, union, star, starD, ground, hills, cloud, eye, eyes, smile,
  blush, leaf, holly, berries, flake, pine, present, clipped, ghost, scallopD, scallopLine } = D;

const night = K.navy;
const sky = list => list.map(([x, y, r]) => star(x, y, r)).join('');
const flakes = list => list.map(([x, y, r]) => D.flake(x, y, r)).join('');
const bow = (cx, cy, s = 1, c = K.red) => gs(cx, cy, s, 0,
  path('M0 0 L-40 90 L-15 80 L-5 105 L10 10 Z', c) + path('M0 0 L40 90 L15 80 L5 105 L-10 10 Z', c) +
  path('M0 0 C-60 -70 -130 -20 -100 20 C-80 45 -40 30 0 0 Z', c) + path('M0 0 C60 -70 130 -20 100 20 C80 45 40 30 0 0 Z', c) +
  circle(0, 0, 22, c));
const STOCK = 'M380 320 L640 320 L640 560 C640 600 660 620 700 640 C800 690 810 820 700 840 C640 850 560 830 480 780 C400 730 380 680 380 600 Z';
// candy-cane style stripes on a tube: thin black bars, and every other band gets color c2
const striped = (d, w, c1, c2, o = {}) => tube(d, w, c1, o) +
  `<path d="${d}" fill="none" stroke-width="${w}" stroke-linecap="butt" stroke-dasharray="8 47"/>` +
  `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w - 12}" stroke-linecap="butt" stroke-dasharray="0 18 27 65" opacity="0" data-ghost data-c="${c2}"/>`;
const zig = (y, amp = 30, x0 = 150, x1 = 850, step = 50) => {
  let d = `M${x0} ${y}`;
  for (let x = x0 + step, i = 1; x <= x1; x += step, i++) d += ` L${x} ${y + (i % 2 ? -amp : 0)}`;
  return d;
};

const pictures = [
  {
    id: 'xmas-tree', title: 'Christmas Tree', bg: night, body:
      sky([[120, 150, 28], [860, 130, 32], [200, 420, 20], [820, 380, 24]]) +
      ground(870, K.snow) +
      pine(500, 870, 690, 560, K.green, false, { s: 1 }) +
      [[400, 700, K.red], [565, 725, K.blue], [480, 630, K.yellow], [655, 760, K.purple], [330, 760, K.yellow],
        [440, 540, K.blue], [570, 525, K.red], [460, 380, K.red], [545, 410, K.yellow]].map(([x, y, c]) => circle(x, y, 26, c)).join('') +
      star(500, 175, 75, K.yellow, { s: 1 }) +
      present(110, 740, 180, 140, K.red, K.yellow) + present(700, 760, 170, 120, K.blue, K.red),
  },
  {
    id: 'xmas-santa', title: 'Santa', bg: K.sky, body:
      flakes([[120, 160, 30], [880, 180, 30], [140, 640, 26], [860, 660, 26]]) +
      path('M250 1020 L290 760 Q500 690 710 760 L750 1020 Z', K.red, { s: 1 }) +
      rect(270, 870, 460, 60, 0, K.black) + rect(450, 855, 100, 90, 10, K.gold) + rect(475, 878, 50, 44, 6, K.black) +
      path(scallopD(500, 570, 205, 210, 13, 0.55), K.white, { s: 1 }) +
      circle(500, 430, 140, K.skin, { s: 1 }) +
      path('M345 340 Q380 120 560 130 Q720 150 800 330 L745 345 Q690 240 610 230 Q650 290 660 340 Z', K.red, { s: 1 }) +
      rect(330, 300, 340, 80, 40, K.white, { s: 1 }) + circle(780, 345, 50, K.white, { s: 1 }) +
      eyes(445, 555, 425, 18) + blush(405, 475) + blush(595, 475) +
      path('M500 495 C460 470 395 480 380 525 C430 528 470 520 500 508 C530 520 570 528 620 525 C605 480 540 470 500 495 Z', K.white) +
      circle(500, 470, 27, K.pink) + ellipse(500, 550, 26, 14, K.red),
  },
  {
    id: 'xmas-reindeer', title: 'Reindeer', bg: K.sky, body:
      flakes([[120, 140, 28], [880, 120, 28], [130, 560, 24], [880, 560, 24]]) +
      hills(930, K.snow) +
      union([['tube', 'M425 300 L360 160 M388 220 L300 195 M372 190 L382 110', 30],
        ['tube', 'M575 300 L640 160 M612 220 L700 195 M628 190 L618 110', 30]], K.tan, { s: 1 }) +
      path('M340 1020 L375 640 Q500 570 625 640 L660 1020 Z', K.brown, { s: 1 }) +
      ellipse(330, 340, 75, 32, K.brown, { s: 1, t: 'rotate(-25 330 340)' }) + ellipse(670, 340, 75, 32, K.brown, { s: 1, t: 'rotate(25 670 340)' }) +
      ellipse(500, 430, 150, 170, K.brown, { s: 1 }) +
      ellipse(500, 535, 100, 72, K.tan) +
      eyes(445, 555, 405, 20) + smile(500, 560, 60, 18) +
      circle(500, 495, 40, K.red) +
      rect(355, 640, 290, 70, 35, K.green) + path('M560 690 L600 840 L660 830 L620 690 Z', K.green) +
      line('M590 750 L640 740 M600 790 L650 780'),
  },
  {
    id: 'xmas-stocking', title: 'Stocking', bg: K.cream, body:
      line('M510 60 L510 220') + circle(510, 60, 16, K.gold) +
      present(410, 150, 150, 150, K.blue, K.yellow) +
      striped('M600 330 L600 170 Q600 110 650 110 Q700 110 700 160', 40, K.white, K.red) +
      path(STOCK, K.red, { s: 1 }) +
      clipped(STOCK, circle(735, 790, 110, K.green) + circle(380, 630, 70, K.green)) +
      star(510, 500, 70, K.yellow) +
      rect(350, 220, 320, 120, 30, K.white, { s: 1 }) +
      holly(420, 280, 90, -60) + holly(470, 260, 90, -10) + berries(450, 300, 14),
  },
  {
    id: 'xmas-presents', title: 'Presents', bg: K.cream, body:
      path('M-20 840 L1020 840 L1020 1020 L-20 1020 Z', K.brown) +
      present(290, 360, 420, 480, K.red, K.gold, { s: 1 }) +
      present(70, 640, 230, 220, K.green, K.red) +
      present(700, 600, 230, 260, K.blue, K.yellow) +
      g('rotate(-10 590 520)', rect(560, 480, 110, 70, 10, K.white) + line('M560 495 L540 470')) +
      sky([[150, 150, 34], [850, 160, 34], [140, 450, 22], [870, 420, 22], [500, 120, 20]]),
  },
  {
    id: 'xmas-cane', title: 'Candy Cane', bg: K.sky, body:
      flakes([[150, 160, 32], [860, 200, 28], [160, 760, 30], [840, 800, 30]]) +
      striped('M570 860 L570 340 C570 160 330 160 330 340 L330 400', 110, K.white, K.red, { s: 1 }) +
      bow(570, 560, 1.1, K.green) +
      holly(480, 880, 110, -60) + holly(660, 880, 110, 60) + berries(570, 880, 20),
  },
  {
    id: 'xmas-ornament', title: 'Ornament', bg: K.sky, body: (() => {
      const ball = 'M500 290 A270 270 0 1 1 499.9 290 Z';
      const b1 = zig(470, 40), b2 = zig(650, 40);
      return flakes([[140, 160, 30], [860, 170, 30], [150, 860, 28], [860, 860, 28]]) +
        line('M500 0 L500 200') + line('M465 240 Q500 170 535 240') +
        path(ball, K.red, { s: 1 }) +
        clipped(ball, ghost(b1 + ' ' + b2.slice(1).split(' L').reverse().map(p => 'L' + p).join(' ') + ' Z', K.gold)) +
        clipped(ball, line(b1) + line(b2)) +
        [[380, 560], [500, 545], [620, 560]].map(([x, y]) => circle(x, y, 26, K.green)).join('') +
        [[420, 380], [580, 380], [500, 760]].map(([x, y]) => star(x, y, 32, K.white)).join('') +
        rect(430, 230, 140, 75, 12, K.gold, { s: 1 }) +
        bow(500, 230, 0.8, K.green);
    })(),
  },
  {
    id: 'xmas-gingerbread', title: 'Gingerbread Man', bg: K.sky, body:
      flakes([[130, 150, 30], [870, 150, 30], [140, 900, 26], [860, 900, 26]]) +
      union([['circle', 500, 300, 115], ['ellipse', 500, 590, 145, 175], ['tube', 'M270 480 L730 480', 115],
        ['tube', 'M445 680 L370 860', 120], ['tube', 'M555 680 L630 860', 120]], K.ginger, { s: 1 }) +
      line('M290 435 Q310 480 290 525 M710 435 Q690 480 710 525 M330 840 Q375 870 420 870 M580 870 Q625 870 670 840') +
      eyes(458, 542, 285, 18) + smile(500, 330, 80, 22) + blush(425, 335) + blush(575, 335) +
      path('M500 430 L440 400 L440 465 Z', K.green) + path('M500 430 L560 400 L560 465 Z', K.green) + circle(500, 432, 18, K.green) +
      circle(500, 525, 22, K.red) + circle(500, 600, 22, K.yellow) + circle(500, 675, 22, K.red),
  },
  {
    id: 'xmas-bells', title: 'Bells', bg: K.sky, body: (() => {
      const bell = (cx, cy, rot, c) => g(`translate(${cx} ${cy}) rotate(${rot})`,
        circle(0, 160, 34, c, { s: 1 }) +
        path('M-115 80 C-115 -40 -78 -130 0 -130 C78 -130 115 -40 115 80 L140 115 L-140 115 Z', c, { s: 1 }) +
        rect(-155, 100, 310, 44, 22, c, { s: 1 }) + line('M-80 -40 Q0 -70 80 -40'));
      return flakes([[130, 160, 30], [870, 160, 30], [140, 860, 28], [860, 860, 28]]) +
        tube('M500 330 L390 420', 22, K.red) + tube('M500 330 L610 420', 22, K.red) +
        bell(380, 560, -18, K.gold) + bell(620, 560, 18, K.yellow) +
        holly(410, 300, 130, -70) + holly(590, 300, 130, 70) + bow(500, 320, 1, K.red);
    })(),
  },
  {
    id: 'xmas-wreath', title: 'Wreath', bg: K.cream, body:
      path(scallopD(500, 470, 350, 350, 24, 0.6), K.green, { s: 1 }) +
      path(scallopD(500, 470, 170, 170, 14, 0.6), K.cream) +
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3, x = 500 + 262 * Math.cos(a), y = 470 + 262 * Math.sin(a);
        const b = a + Math.PI / 8, bx = 500 + 262 * Math.cos(b), by = 470 + 262 * Math.sin(b);
        return holly(x, y, 120, (a * 180 / Math.PI) + 90, K.dkgreen) + berries(bx, by, 16);
      }).join('') +
      bow(500, 790, 1.3, K.red) + line('M500 120 L500 20'),
  },
  {
    id: 'xmas-hat', title: 'Santa Hat', bg: K.sky, body:
      flakes([[140, 150, 30], [520, 110, 26], [150, 860, 28], [870, 860, 28], [880, 120, 24]]) +
      path('M220 700 Q250 300 520 220 Q770 170 830 430 L770 450 Q730 330 650 320 Q690 500 710 700 Z', K.red, { s: 1 }) +
      rect(170, 650, 590, 130, 65, K.white, { s: 1 }) +
      cloud(805, 450, 75, 75, K.white, 9, { s: 1 }) +
      holly(290, 650, 110, -70) + holly(360, 630, 110, -20) + berries(330, 670, 18),
  },
  {
    id: 'xmas-sleigh', title: 'Sleigh', bg: night, body:
      circle(840, 150, 80, K.yellow) + sky([[120, 130, 28], [330, 90, 22], [600, 140, 26], [140, 400, 20], [880, 380, 22]]) +
      hills(900, K.snow) +
      union([['tube', 'M170 770 L760 770 Q870 770 870 690 Q870 630 815 645', 26], ['tube', 'M300 640 L300 770', 26], ['tube', 'M640 640 L640 770', 26]], K.gold, { s: 1 }) +
      circle(380, 300, 55, K.tan) + circle(338, 255, 22, K.tan) + circle(422, 255, 22, K.tan) + eyes(362, 398, 295, 9) + ellipse(380, 320, 16, 11, '#000') +
      present(500, 240, 110, 100, K.blue, K.yellow) +
      path('M290 470 C240 330 330 300 400 340 C470 300 600 290 640 470 Z', K.brown, { s: 1 }) +
      path('M200 420 L620 420 Q690 420 730 360 Q780 290 840 330 Q880 380 820 410 Q780 430 765 490 L740 660 L260 660 Q200 660 200 600 Z', K.red, { s: 1 }) +
      star(480, 545, 60, K.gold),
  },
  {
    id: 'xmas-elf', title: 'Elf', bg: K.sky, body:
      flakes([[130, 160, 30], [880, 420, 26], [140, 600, 28], [860, 700, 26]]) +
      path('M320 1020 L355 690 Q500 630 645 690 L680 1020 Z', K.green, { s: 1 }) +
      rect(340, 850, 320, 55, 0, K.black) + rect(455, 840, 90, 75, 10, K.gold) +
      path(poly([[370, 650], [410, 710], [455, 665], [500, 720], [545, 665], [590, 710], [630, 650], [500, 600]]), K.red) +
      path('M385 430 L270 360 L370 500 Z', K.skin, { s: 1 }) + path('M615 430 L730 360 L630 500 Z', K.skin, { s: 1 }) +
      circle(500, 470, 135, K.skin, { s: 1 }) +
      path('M370 400 Q420 140 640 120 Q770 120 810 210 L765 235 Q700 180 630 215 Q645 310 640 400 Z', K.green, { s: 1 }) +
      rect(355, 365, 300, 65, 32, K.red, { s: 1 }) + circle(790, 230, 35, K.gold, { s: 1 }) +
      eyes(448, 552, 475, 18) + circle(500, 515, 14, K.pink) + smile(500, 540, 80, 24) + blush(410, 525) + blush(590, 525),
  },
  {
    id: 'xmas-cookies', title: 'Milk and Cookies', bg: K.cream, body: (() => {
      const glass = 'M140 330 L340 330 L318 790 L162 790 Z';
      return path('M-20 720 L1020 720 L1020 1020 L-20 1020 Z', K.brown) +
        ellipse(590, 770, 330, 95, K.sky) +
        circle(500, 700, 115, K.tan, { s: 1 }) + circle(690, 690, 105, K.tan, { s: 1 }) +
        [[460, 660], [540, 690], [480, 750], [560, 640], [650, 650], [720, 700], [680, 740], [730, 640]].map(([x, y]) => ellipse(x, y, 14, 10, K.dkbrown)).join('') +
        path(glass, K.white, { s: 1 }) + clipped(glass, line('M100 420 Q240 450 380 420')) + clipped(glass, ghost('M100 300 L380 300 L380 425 Q240 455 100 425 Z', K.sky)) +
        g('rotate(8 720 330)', rect(600, 250, 240, 160, 10, K.white) + line('M630 300 L800 300 M630 340 L780 340 M630 380 L740 380')) +
        star(150, 150, 34) + star(860, 120, 26) + star(470, 160, 22);
    })(),
  },
  {
    id: 'xmas-house', title: 'Gingerbread House', bg: night, body:
      circle(840, 140, 70, K.yellow) + sky([[120, 130, 28], [340, 90, 22], [150, 400, 20]]) +
      ground(880, K.snow) +
      rect(620, 240, 80, 150, 0, K.brown, { s: 1 }) +
      rect(250, 480, 500, 380, 0, K.ginger, { s: 1 }) +
      path('M200 500 L500 220 L800 500 Z', K.brown, { s: 1 }) +
      tube('M190 505 L500 212 L810 505', 34, K.white, { s: 1 }) +
      path('M250 500 L750 500 L750 530' + scallopLine(750, 530, 250, 530, 9) + ' Z', K.white) +
      [[380, 400, K.red], [500, 330, K.green], [620, 400, K.yellow], [450, 460, K.purple], [560, 460, K.blue]].map(([x, y, c]) => path(`M${x - 32} ${y} A32 32 0 0 1 ${x + 32} ${y} Z`, c)).join('') +
      path('M440 860 L440 720 Q500 630 560 720 L560 860 Z', K.red) + circle(540, 790, 9, K.gold) +
      rect(295, 590, 105, 95, 12, K.yellow) + line('M347 590 L347 685 M295 637 L400 637') +
      rect(600, 590, 105, 95, 12, K.yellow) + line('M652 590 L652 685 M600 637 L705 637') +
      [[290, 780, K.red], [350, 800, K.green], [650, 800, K.blue], [710, 780, K.red]].map(([x, y, c]) => circle(x, y, 22, c)).join('') +
      tube('M140 880 L140 720', 14, K.white) + circle(140, 690, 45, K.pink) + tube('M860 880 L860 720', 14, K.white) + circle(860, 690, 45, K.green),
  },
  {
    id: 'xmas-candles', title: 'Candles', bg: night, body: (() => {
      const candle = (x, top, w, c) => {
        const cx = x + w / 2;
        return rect(x, top, w, 820 - top, 0, c, { s: 1 }) +
          path(`M${x} ${top} L${x + w} ${top} L${x + w} ${top + 40} Q${x + w - 15} ${top + 90} ${x + w * 0.65} ${top + 40} Q${x + w * 0.5} ${top + 120} ${x + w * 0.35} ${top + 40} Q${x + 15} ${top + 70} ${x} ${top + 40} Z`, K.white) +
          line(`M${cx} ${top} L${cx} ${top - 25}`) +
          path(`M${cx} ${top - 150} C${cx + 50} ${top - 80} ${cx + 45} ${top - 25} ${cx} ${top - 25} C${cx - 45} ${top - 25} ${cx - 50} ${top - 80} ${cx} ${top - 150} Z`, K.yellow, { s: 1 }) +
          path(`M${cx} ${top - 95} C${cx + 22} ${top - 60} ${cx + 20} ${top - 40} ${cx} ${top - 40} C${cx - 20} ${top - 40} ${cx - 22} ${top - 60} ${cx} ${top - 95} Z`, K.orange);
      };
      return sky([[120, 130, 28], [870, 140, 30], [500, 90, 22], [150, 470, 20], [860, 470, 22]]) +
        candle(230, 500, 130, K.red) + candle(435, 380, 130, K.green) + candle(640, 500, 130, K.red) +
        ellipse(500, 840, 380, 55, K.gold, { s: 1 }) +
        holly(160, 830, 130, -70) + holly(840, 830, 130, 70) + holly(300, 880, 110, -100) + holly(700, 880, 110, 100) +
        berries(220, 860, 20) + berries(780, 860, 20);
    })(),
  },
  {
    id: 'xmas-holly', title: 'Holly', bg: K.cream, body:
      holly(370, 440, 380, -45, K.green) + holly(630, 440, 380, 45, K.dkgreen) + holly(500, 340, 340, 0, K.green) +
      circle(450, 590, 50, K.red, { s: 1 }) + circle(550, 590, 50, K.red, { s: 1 }) + circle(500, 520, 50, K.red, { s: 1 }) +
      bow(500, 760, 1.2, K.red) +
      star(140, 150, 34) + star(860, 150, 34) + star(150, 820, 26) + star(850, 820, 26),
  },
  {
    id: 'xmas-angel', title: 'Angel', bg: night, body:
      sky([[120, 150, 28], [860, 150, 30], [150, 760, 22], [860, 780, 24], [300, 80, 20], [700, 80, 20]]) +
      path('M450 520 C300 380 150 410 180 530 C200 620 330 660 460 610 Z', K.cream, { s: 1 }) +
      path('M550 520 C700 380 850 410 820 530 C800 620 670 660 540 610 Z', K.cream, { s: 1 }) +
      path('M420 470 L580 470 L690 870 Q500 910 310 870 Z', K.pink, { s: 1 }) +
      circle(500, 370, 112, K.yellow, { s: 1 }) + path('M390 380 L370 500 L440 470 Z M610 380 L630 500 L560 470 Z', K.yellow) +
      circle(500, 390, 92, K.skin, { s: 1 }) +
      path('M410 370 Q440 300 500 300 Q560 300 590 370 Q545 330 500 340 Q455 330 410 370 Z', K.yellow) +
      eyes(465, 535, 395, 15) + smile(500, 430, 50, 16) + blush(445, 430) + blush(555, 430) +
      ellipse(500, 235, 95, 26, K.gold, { s: 1 }) + ellipse(500, 235, 62, 11, null) +
      star(500, 630, 70, K.gold) + circle(430, 640, 28, K.skin) + circle(570, 640, 28, K.skin),
  },
  {
    id: 'xmas-soldier', title: 'Toy Soldier', bg: K.sky, body:
      flakes([[140, 160, 30], [860, 160, 30], [150, 600, 26], [860, 600, 26]]) +
      path('M-20 920 L1020 920 L1020 1020 L-20 1020 Z', K.brown) +
      rect(390, 850, 105, 70, 20, K.black, { s: 1 }) + rect(505, 850, 105, 70, 20, K.black, { s: 1 }) +
      rect(400, 680, 95, 185, 0, K.navy, { s: 1 }) + rect(505, 680, 95, 185, 0, K.navy, { s: 1 }) +
      rect(325, 480, 60, 220, 30, K.red, { s: 1 }) + rect(615, 480, 60, 220, 30, K.red, { s: 1 }) +
      circle(355, 715, 32, K.skin) + circle(645, 715, 32, K.skin) +
      rect(380, 465, 240, 235, 30, K.red, { s: 1 }) +
      line('M395 480 L605 650 M605 480 L395 650') +
      rect(380, 640, 240, 45, 0, K.white) + rect(470, 633, 60, 58, 8, K.gold) +
      circle(500, 520, 13, K.gold) + circle(500, 590, 13, K.gold) +
      rect(410, 310, 180, 165, 40, K.skin, { s: 1 }) +
      eyes(465, 535, 380, 15) + circle(445, 420, 22, K.red) + circle(555, 420, 22, K.red) + smile(500, 430, 40, 12) +
      rect(395, 110, 210, 220, 70, K.black, { s: 1 }) + rect(395, 290, 210, 40, 10, K.gold, { s: 1 }) +
      circle(500, 170, 22, K.gold),
  },
  {
    id: 'xmas-fireplace', title: 'Fireplace', bg: '#ffe0b2', body: (() => {
      const body = 'M140 340 L860 340 L860 880 L140 880 Z';
      let br = '';
      for (let y = 395, r = 0; y < 880; y += 55, r++) {
        br += `M140 ${y} L860 ${y} `;
        for (let x = 140 + (r % 2 ? 60 : 0); x < 860; x += 120) br += `M${x} ${y - 55} L${x} ${y} `;
      }
      return path('M-20 880 L1020 880 L1020 1020 L-20 1020 Z', K.brown) +
        path(body, K.red, { s: 1 }) + clipped(body, line(br)) +
        path('M290 880 L290 600 Q500 470 710 600 L710 880 Z', K.black, { s: 1 }) +
        tube('M360 850 L640 820', 40, K.brown) + tube('M380 815 L620 850', 40, K.dkbrown) +
        path('M380 800 C360 720 420 690 410 620 C470 660 470 700 500 700 C500 640 530 600 560 570 C570 640 640 670 620 800 Z', K.orange) +
        path('M440 800 C430 750 470 730 470 690 C500 720 510 740 520 740 C530 720 545 700 560 690 C575 740 580 770 560 800 Z', K.yellow) +
        rect(90, 270, 820, 70, 12, K.brown, { s: 1 }) +
        gs(70, 210, 0.42, 0, path(STOCK, K.green) + rect(350, 220, 320, 120, 30, K.white)) +
        gs(560, 210, 0.42, 0, path(STOCK, K.blue) + rect(350, 220, 320, 120, 30, K.white)) +
        rect(330, 170, 50, 100, 0, K.white) + path('M355 120 C375 140 375 160 355 160 C335 160 335 140 355 120 Z', K.yellow) +
        rect(620, 170, 50, 100, 0, K.white) + path('M645 120 C665 140 665 160 645 160 C625 160 625 140 645 120 Z', K.yellow) +
        present(440, 170, 120, 100, K.green, K.red);
    })(),
  },
];

module.exports = { id: 'christmas', title: 'Christmas', icon: '🎄', season: { from: '12-01', to: '12-26' }, pictures };
