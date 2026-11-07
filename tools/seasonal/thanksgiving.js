const D = require('./draw.js');
const { K, path, circle, ellipse, rect, line, g, poly, tube, union, star, ground, cloud, eye, eyes, smile, blush,
  leaf, maple, pumpkin, clipped, ghost, flake } = D;

const fallSky = K.sky;
const table = (y = 780, c = K.brown) => path(`M-20 ${y} L1020 ${y} L1020 1020 L-20 1020 Z`, c);
const falling = (list) => list.map(([x, y, s, r, c]) => maple(x, y, s, r, c)).join('');
const acorn = (cx, cy, s, rot, o = {}) => D.gs(cx, cy, s, rot,
  path('M-62 0 C-66 80 -22 128 0 150 C22 128 66 80 62 0 Z', K.tan, o) +
  rect(-8, -86, 16, 34, 6, K.dkbrown, o) +
  path('M-82 6 C-90 -70 90 -70 82 6 Q0 26 -82 6 Z', K.brown, o) +
  line('M-50 -30 L-20 0 M-10 -46 L30 2 M30 -42 L60 -8'));

const pictures = [
  {
    id: 'thanks-turkey', title: 'Turkey', bg: fallSky, body:
      ground(900, K.lime) +
      [-72, -48, -24, 0, 24, 48, 72].map((a, i) => ellipse(500, 300, 68, 215, [K.red, K.orange, K.yellow, K.red, K.yellow, K.orange, K.red][i], { s: 1, t: `rotate(${a} 500 560)` })).join('') +
      [-60, -30, 0, 30, 60].map(a => ellipse(500, 400, 40, 120, K.brown, { s: 1, t: `rotate(${a} 500 580)` })).join('') +
      line('M430 820 L420 880 M420 880 L390 900 M420 880 L425 905 M420 880 L455 898') +
      line('M570 820 L580 880 M580 880 L545 898 M580 880 L575 905 M580 880 L610 900') +
      ellipse(500, 640, 165, 190, K.brown, { s: 1 }) +
      ellipse(500, 690, 95, 110, K.tan) +
      ellipse(355, 650, 55, 105, K.dkbrown, { t: 'rotate(15 355 650)' }) +
      ellipse(645, 650, 55, 105, K.dkbrown, { t: 'rotate(-15 645 650)' }) +
      circle(500, 420, 100, K.tan, { s: 1 }) +
      eyes(462, 538, 400, 18) +
      path('M470 445 L530 445 L500 495 Z', K.orange) +
      path('M520 470 C560 480 560 560 525 560 C500 560 505 500 520 470 Z', K.red),
  },
  {
    id: 'thanks-pie', title: 'Pumpkin Pie', bg: K.cream, body:
      table(760, K.brown) +
      ellipse(500, 730, 420, 115, K.sky) +
      path('M170 560 L215 700 Q500 790 785 700 L830 560 Z', K.tan, { s: 1 }) +
      ellipse(500, 560, 330, 100, K.tan, { s: 1 }) +
      ellipse(500, 560, 280, 75, K.orange) +
      line('M260 590 Q240 640 260 690 M380 610 L370 740 M500 615 L500 750 M620 610 L630 740 M740 590 Q760 640 740 690') +
      cloud(500, 545, 95, 50, K.white, 8) +
      cloud(500, 500, 55, 35, K.white, 6) +
      line('M380 380 C350 330 410 300 380 250 M500 360 C470 310 530 280 500 230 M620 380 C590 330 650 300 620 250') +
      falling([[110, 160, 0.7, -20, K.red], [880, 170, 0.6, 25, K.orange], [120, 900, 0.55, 15, K.yellow], [880, 900, 0.6, -30, K.red]]),
  },
  {
    id: 'thanks-cornucopia', title: 'Harvest Horn', bg: K.cream, body:
      table(800, K.brown) +
      path('M640 380 C470 370 300 420 210 540 C160 610 180 700 250 690 C210 640 260 590 330 630 C450 700 560 740 640 740 Z', K.tan, { s: 1 }) +
      line('M520 382 C540 480 540 640 520 730 M400 410 C420 500 420 620 400 690 M300 470 C315 530 315 590 300 630') +
      ellipse(650, 560, 80, 180, K.dkbrown, { s: 1 }) +
      [[700, 700], [745, 745], [700, 790], [655, 745], [745, 650]].map(([x, y]) => circle(x, y, 38, K.purple, { s: 1 })).join('') +
      circle(800, 600, 80, K.red, { s: 1 }) + line('M800 520 Q805 495 820 480') + leaf(840, 495, 60, 22, 60, K.green, false) +
      path('M640 420 C700 360 760 400 740 460 C760 520 690 540 660 500 Z', K.yellow, { s: 1 }) +
      pumpkin(860, 760, 200, 140, K.orange, K.brown, { s: 1 }) +
      leaf(560, 800, 110, 40, 70, K.green) + leaf(900, 640, 90, 34, -30, K.lime) +
      falling([[150, 170, 0.6, -15, K.orange], [450, 140, 0.5, 20, K.red], [860, 180, 0.55, -10, K.yellow]]),
  },
  {
    id: 'thanks-hat', title: 'Pilgrim Hat', bg: fallSky, body:
      ground(880, K.lime) +
      ellipse(500, 720, 340, 85, K.black, { s: 1 }) +
      path('M330 710 L375 330 Q500 300 625 330 L670 710 Q500 760 330 710 Z', K.black, { s: 1 }) +
      path('M346 590 Q500 625 654 590 L664 680 Q500 720 336 680 Z', K.brown) +
      rect(445, 585, 110, 110, 10, K.gold) + rect(475, 615, 50, 50, 6, K.brown) +
      falling([[150, 200, 0.8, -20, K.red], [830, 220, 0.75, 20, K.orange], [180, 470, 0.6, 30, K.yellow], [850, 520, 0.65, -15, K.red], [500, 150, 0.55, 10, K.orange]]) +
      pumpkin(160, 860, 180, 130) + pumpkin(850, 870, 160, 110),
  },
  {
    id: 'thanks-acorns', title: 'Acorns', bg: fallSky, body:
      ground(870, K.lime) +
      leaf(250, 330, 260, 95, -50, K.orange) + leaf(760, 300, 240, 90, 45, K.red) + leaf(520, 230, 220, 80, 5, K.yellow) +
      acorn(390, 520, 2.1, -12, { s: 1 }) + acorn(650, 600, 1.6, 15) +
      falling([[120, 120, 0.5, 10, K.red], [880, 110, 0.5, -20, K.yellow], [140, 900, 0.5, 20, K.orange], [870, 900, 0.5, -25, K.red]]),
  },
  {
    id: 'thanks-leaf', title: 'Autumn Leaf', bg: fallSky, body:
      maple(500, 470, 3.4, 0, K.red, true, { s: 1 }) +
      falling([[140, 140, 0.9, -25, K.orange], [860, 150, 0.8, 20, K.yellow], [150, 820, 0.85, 30, K.yellow], [850, 830, 0.9, -15, K.orange], [500, 900, 0.5, 10, K.red]]),
  },
  {
    id: 'thanks-apple', title: 'Apple', bg: K.cream, body:
      table(820, K.brown) +
      path('M490 300 C478 240 470 200 500 150 L530 162 C506 200 512 240 520 300 Z', K.dkbrown) +
      leaf(600, 205, 150, 55, 60, K.green) +
      path('M500 330 C600 260 790 290 800 480 C810 660 690 810 585 800 C545 796 525 780 500 780 C475 780 455 796 415 800 C310 810 190 660 200 480 C210 290 400 260 500 330 Z', K.red, { s: 1 }) +
      eyes(420, 580, 520, 26) + smile(500, 600, 90, 30) + blush(355, 600) + blush(645, 600) +
      line('M260 400 C250 450 250 490 262 530') +
      circle(800, 560, 50, K.lime) + eye(790, 548, 10) + eye(818, 548, 10) +
      falling([[140, 200, 0.6, -20, K.orange], [860, 180, 0.6, 20, K.yellow]]),
  },
  {
    id: 'thanks-corn', title: 'Corn', bg: fallSky, body: (() => {
      const cob = 'M500 150 C595 150 615 290 615 450 C615 600 585 710 500 730 C415 710 385 600 385 450 C385 290 405 150 500 150 Z';
      let ls = '';
      for (let y = 220; y < 720; y += 55) ls += `M350 ${y} Q500 ${y + 22} 650 ${y} `;
      ls += 'M440 120 L440 760 M560 120 L560 760';
      return ground(900, K.lime) + path(cob, K.yellow, { s: 1 }) + clipped(cob, line(ls)) +
        path('M500 860 C360 800 280 620 315 380 C370 520 420 650 500 720 Z', K.green, { s: 1 }) +
        path('M500 860 C640 800 720 620 685 380 C630 520 580 650 500 720 Z', K.lime, { s: 1 }) +
        path('M480 860 C470 900 500 930 520 900 L520 860 Z', K.green) +
        falling([[160, 180, 0.7, -15, K.orange], [840, 200, 0.7, 20, K.red], [170, 520, 0.55, 25, K.yellow], [830, 560, 0.55, -20, K.orange]]);
    })(),
  },
  {
    id: 'thanks-sunflower', title: 'Sunflower', bg: fallSky, body:
      ground(890, K.lime) +
      tube('M500 520 C510 650 490 780 500 900', 34, K.green, { s: 1 }) +
      leaf(400, 720, 200, 70, -60, K.green) + leaf(600, 660, 200, 70, 60, K.green) +
      Array.from({ length: 14 }, (_, i) => ellipse(500, 215, 46, 100, K.yellow, { s: 1, t: `rotate(${i * 360 / 14} 500 360)` })).join('') +
      circle(500, 360, 115, K.brown, { s: 1 }) +
      eyes(460, 540, 340, 20) + smile(500, 395, 70, 22) + blush(430, 390, K.orange) + blush(570, 390, K.orange) +
      circle(150, 150, 75, K.yellow),
  },
  {
    id: 'thanks-scarecrow', title: 'Scarecrow', bg: fallSky, body:
      ground(890, K.lime) +
      rect(480, 700, 40, 200, 0, K.brown) +
      path('M235 440 L215 410 L240 425 L230 395 L255 420 L262 395 L270 430 Z', K.yellow, { s: 1 }) +
      path('M765 440 L785 410 L760 425 L770 395 L745 420 L738 395 L730 430 Z', K.yellow, { s: 1 }) +
      path('M250 430 L750 430 L750 520 L620 520 L620 720 L380 720 L380 520 L250 520 Z', K.red, { s: 1 }) +
      path('M235 525 L215 555 L240 540 L230 570 L255 545 L262 570 L270 535 Z', K.yellow, { s: 1 }) +
      path('M765 525 L785 555 L760 540 L770 570 L745 545 L738 570 L730 535 Z', K.yellow, { s: 1 }) +
      rect(420, 580, 70, 70, 6, K.blue) + line('M430 590 L440 600 M480 590 L470 600') +
      path('M385 720 L615 720 L610 840 L520 840 L500 760 L480 840 L390 840 Z', K.navy, { s: 1 }) +
      path('M390 840 L370 880 L400 860 L405 890 L425 860 L440 885 L445 840 Z M555 840 L560 885 L575 860 L595 890 L600 860 L630 880 L610 840 Z', K.yellow) +
      circle(500, 340, 95, K.tan, { s: 1 }) +
      eyes(465, 535, 325, 16) + line('M450 375 L465 385 L480 372 L500 386 L520 372 L535 385 L550 375') +
      path('M480 345 L520 345 L500 365 Z', K.orange) +
      ellipse(500, 250, 160, 40, K.gold, { s: 1 }) +
      path('M400 250 Q405 150 500 145 Q595 150 600 250 Q500 270 400 250 Z', K.gold, { s: 1 }) +
      path('M402 228 Q500 248 598 228 L600 250 Q500 270 400 250 Z', K.red) +
      g('translate(700 380)', ellipse(0, 0, 55, 35, K.black) + circle(45, -30, 25, K.black) + path('M68 -32 L95 -25 L68 -20 Z', K.orange) + path('M-45 -10 L-85 -30 L-60 10 Z', K.black)) +
      pumpkin(190, 840, 180, 120) + pumpkin(820, 850, 150, 100),
  },
  {
    id: 'thanks-pumpkins', title: 'Pumpkin Patch', bg: fallSky, body:
      rect(-20, 520, 1040, 30, 0, K.tan) + rect(-20, 600, 1040, 30, 0, K.tan) +
      [80, 300, 520, 740, 940].map(x => path(`M${x - 25} 680 L${x - 25} 470 L${x} 440 L${x + 25} 470 L${x + 25} 680 Z`, K.tan)).join('') +
      ground(700, K.dkbrown) +
      line('M150 760 C250 700 300 820 420 760 C520 710 600 800 700 750 C780 710 850 790 920 740') +
      leaf(300, 760, 110, 45, 70, K.green) + leaf(640, 740, 110, 45, -60, K.green) +
      pumpkin(500, 780, 360, 260, K.orange, K.brown, { s: 1 }) + pumpkin(200, 850, 230, 160, K.yellow) + pumpkin(800, 860, 220, 150, K.orange) +
      circle(840, 150, 85, K.yellow) + cloud(240, 160, 130, 55),
  },
  {
    id: 'thanks-squirrel', title: 'Squirrel', bg: fallSky, body:
      ground(880, K.lime) +
      path('M560 820 C780 830 900 640 820 460 C770 340 830 250 760 190 C690 140 610 200 640 270 C700 260 720 330 690 400 C640 500 560 560 560 820 Z', K.orange, { s: 1 }) +
      ellipse(470, 650, 140, 190, K.orange, { s: 1 }) +
      ellipse(460, 690, 85, 125, K.cream) +
      ellipse(400, 840, 70, 35, K.orange, { s: 1 }) + ellipse(560, 840, 70, 35, K.orange, { s: 1 }) +
      path('M370 300 L345 205 L420 260 Z', K.orange, { s: 1 }) + path('M530 290 L560 200 L590 285 Z', K.orange, { s: 1 }) +
      circle(460, 390, 115, K.orange, { s: 1 }) +
      ellipse(410, 445, 55, 42, K.cream) +
      eyes(405, 500, 370, 20) + ellipse(370, 425, 18, 13, '#000') + smile(400, 455, 40, 12) +
      acorn(470, 590, 0.9, 0) +
      ellipse(395, 600, 40, 28, K.orange) + ellipse(545, 600, 40, 28, K.orange) +
      falling([[160, 160, 0.7, -20, K.red], [880, 120, 0.55, 20, K.yellow], [180, 560, 0.5, 15, K.yellow]]),
  },
  {
    id: 'thanks-basket', title: 'Apple Basket', bg: fallSky, body: (() => {
      const bk = 'M210 520 L790 520 L730 830 L270 830 Z';
      let ls = ''; for (let y = 580; y < 830; y += 60) ls += `M150 ${y} L850 ${y} `;
      for (let x = 260; x < 800; x += 80) ls += `M${x} 520 L${x + (500 - x) * 0.1} 840 `;
      return ground(880, K.lime) +
        path('M250 530 C250 160 750 160 750 530 L705 530 C705 220 295 220 295 530 Z', K.brown, { s: 1 }) +
        [[310, 490, K.red], [420, 450, K.yellow], [540, 455, K.red], [660, 490, K.green], [370, 520, K.green], [600, 520, K.red]]
          .map(([x, y, c]) => circle(x, y, 75, c, { s: 1 }) + path(`M${x} ${y - 75} Q${x + 5} ${y - 100} ${x + 18} ${y - 108}`, null)).join('') +
        path(bk, K.tan, { s: 1 }) + clipped(bk, line(ls)) + rect(190, 505, 620, 50, 22, K.brown, { s: 1 }) +
        circle(860, 840, 60, K.red) + circle(140, 850, 55, K.yellow);
    })(),
  },
  {
    id: 'thanks-tractor', title: 'Tractor', bg: fallSky, body:
      ground(860, K.lime) +
      rect(540, 300, 34, 160, 6, K.gray, { s: 1 }) +
      rect(200, 260, 280, 30, 10, K.red, { s: 1 }) +
      rect(220, 280, 240, 360, 16, K.red, { s: 1 }) +
      rect(260, 320, 160, 140, 12, K.sky) +
      rect(440, 460, 380, 200, 20, K.red, { s: 1 }) +
      rect(780, 490, 50, 140, 10, K.gray) + line('M800 510 L800 610 M815 510 L815 610') +
      circle(330, 700, 160, K.black, { s: 1 }) + circle(330, 700, 75, K.yellow) + circle(330, 700, 25, K.gray) +
      circle(720, 750, 95, K.black, { s: 1 }) + circle(720, 750, 45, K.yellow) + circle(720, 750, 14, K.gray) +
      rect(840, 760, 150, 100, 10, K.gold) + line('M860 790 L970 790 M860 830 L970 830') +
      cloud(560, 210, 50, 30) + cloud(620, 140, 60, 35) + circle(150, 140, 70, K.yellow),
  },
  {
    id: 'thanks-dinner', title: 'Turkey Dinner', bg: K.cream, body:
      table(700, K.brown) +
      ellipse(500, 680, 420, 130, K.sky) + ellipse(500, 670, 340, 90, K.white) +
      path('M270 640 C250 420 400 340 520 345 C680 352 760 460 735 640 Q500 700 270 640 Z', K.ginger, { s: 1 }) +
      line('M420 400 C470 450 480 540 450 620 M560 380 C600 440 610 540 580 630') +
      g('rotate(-30 300 480)', ellipse(300, 480, 55, 95, K.ginger, { s: 1 }) + rect(285, 360, 30, 50, 8, K.white, { s: 1 }) + circle(285, 355, 18, K.white, { s: 1 }) + circle(315, 355, 18, K.white, { s: 1 })) +
      g('rotate(30 700 480)', ellipse(700, 480, 55, 95, K.ginger, { s: 1 }) + rect(685, 360, 30, 50, 8, K.white, { s: 1 }) + circle(685, 355, 18, K.white, { s: 1 }) + circle(715, 355, 18, K.white, { s: 1 })) +
      leaf(200, 650, 110, 40, 70, K.green) + leaf(800, 650, 110, 40, -70, K.green) +
      [[170, 690], [210, 710], [830, 690], [790, 712]].map(([x, y]) => circle(x, y, 22, K.red)).join('') +
      line('M380 260 C350 210 410 180 380 130 M500 250 C470 200 530 170 500 120 M620 260 C590 210 650 180 620 130'),
  },
  {
    id: 'thanks-owl', title: 'Owl', bg: K.navy, body:
      circle(820, 160, 90, K.yellow) + star(160, 140, 30) + star(320, 90, 22) + star(600, 120, 26) +
      tube('M-20 780 C200 760 600 790 1020 740', 50, K.brown) +
      leaf(150, 740, 110, 40, -60, K.orange) + leaf(860, 720, 110, 40, 60, K.red) + leaf(780, 800, 100, 36, 120, K.yellow) +
      path('M370 300 L340 190 L440 260 Z', K.brown, { s: 1 }) + path('M630 300 L660 190 L560 260 Z', K.brown, { s: 1 }) +
      path('M500 230 C680 230 700 420 690 560 C680 720 600 780 500 780 C400 780 320 720 310 560 C300 420 320 230 500 230 Z', K.brown, { s: 1 }) +
      path('M500 470 C600 470 630 560 620 640 C610 720 560 760 500 760 C440 760 390 720 380 640 C370 560 400 470 500 470 Z', K.tan) +
      line('M450 560 Q470 580 490 560 Q510 580 530 560 Q550 580 570 560 M440 630 Q460 650 480 630 Q500 650 520 630 Q540 650 560 630') +
      ellipse(320, 560, 50, 140, K.dkbrown, { t: 'rotate(12 320 560)' }) + ellipse(680, 560, 50, 140, K.dkbrown, { t: 'rotate(-12 680 560)' }) +
      circle(430, 370, 70, K.white) + circle(570, 370, 70, K.white) + eyes(440, 560, 375, 32) +
      path('M480 430 L520 430 L500 470 Z', K.orange) +
      line('M430 770 l-15 30 M450 775 l0 30 M470 770 l15 30 M530 770 l-15 30 M550 775 l0 30 M570 770 l15 30'),
  },
  {
    id: 'thanks-mushrooms', title: 'Mushrooms', bg: fallSky, body:
      ground(860, K.lime) +
      path('M420 520 L400 840 Q500 870 600 840 L580 520 Z', K.cream, { s: 1 }) +
      path('M180 540 C180 260 820 260 820 540 Q500 600 180 540 Z', K.red, { s: 1 }) +
      [[330, 420, 45], [500, 360, 55], [670, 430, 42], [420, 500, 30], [590, 510, 28], [250, 510, 25], [760, 515, 22]].map(([x, y, r]) => circle(x, y, r, K.white)).join('') +
      eyes(460, 540, 680, 18) + smile(500, 720, 50, 18) +
      path('M750 690 L740 860 Q800 875 860 860 L850 690 Z', K.cream) +
      path('M680 700 C680 560 920 560 920 700 Q800 730 680 700 Z', K.orange) +
      circle(760, 640, 20, K.white) + circle(840, 630, 22, K.white) +
      leaf(150, 820, 110, 40, -70, K.orange) + maple(250, 880, 0.5, 20, K.yellow) + maple(880, 900, 0.5, -15, K.red) +
      falling([[150, 160, 0.6, -20, K.orange], [850, 140, 0.6, 20, K.red]]),
  },
  {
    id: 'thanks-hedgehog', title: 'Hedgehog', bg: fallSky, body: (() => {
      let sp = 'M250 720';
      const n = 11;
      for (let i = 0; i <= n; i++) {
        const a = Math.PI + i / n * Math.PI * 0.82, ra = Math.PI + (i + 0.5) / n * Math.PI * 0.82;
        sp += ` L${(520 + 300 * Math.cos(a)).toFixed(0)} ${(700 + 280 * Math.sin(a)).toFixed(0)}`;
        if (i < n) sp += ` L${(520 + 380 * Math.cos(ra)).toFixed(0)} ${(700 + 360 * Math.sin(ra)).toFixed(0)}`;
      }
      sp += ' L820 720 Z';
      return ground(840, K.lime) +
        path(sp, K.brown, { s: 1 }) +
        path('M250 720 C260 560 380 520 470 560 C560 600 620 680 620 760 C620 820 560 840 480 840 L320 840 C260 840 245 790 250 720 Z', K.tan, { s: 1 }) +
        circle(180, 735, 22, '#000') + path('M200 720 C230 650 330 640 360 700 C380 760 300 790 200 760 Z', K.tan, { s: 1 }) +
        eye(300, 690, 18) + blush(330, 740) + smile(250, 750, 40, 10) +
        circle(600, 330, 70, K.red) + line('M600 260 Q605 235 620 225') + leaf(640, 235, 60, 22, 60, K.green, false) +
        maple(120, 900, 0.7, -20, K.orange) + maple(360, 910, 0.6, 15, K.red) + maple(700, 900, 0.7, -10, K.yellow) + maple(900, 880, 0.6, 30, K.orange) +
        falling([[160, 200, 0.6, -15, K.yellow], [850, 180, 0.6, 20, K.red]]);
    })(),
  },
  {
    id: 'thanks-barn', title: 'Barn', bg: fallSky, body:
      ground(860, K.lime) +
      rect(760, 360, 160, 500, 0, K.gray) + path('M760 362 C760 260 920 260 920 362 Z', K.dkgray) + line('M760 480 L920 480 M760 600 L920 600 M760 720 L920 720') +
      path('M180 470 L300 300 L500 230 L700 300 L820 470 L820 860 L180 860 Z', K.red, { s: 1 }) +
      path('M160 480 L290 290 L500 210 L710 290 L840 480 L800 490 L690 320 L500 250 L310 320 L200 490 Z', K.white, { s: 1 }) +
      rect(430, 330, 140, 110, 6, K.yellow) + line('M500 330 L500 440 M430 385 L570 385') +
      rect(360, 560, 280, 300, 0, K.dkbrown) + line('M360 560 L640 860 M640 560 L360 860 M500 560 L500 860') +
      rect(60, 780, 150, 90, 10, K.gold) + line('M80 810 L190 810 M80 840 L190 840') +
      circle(150, 140, 70, K.yellow) +
      falling([[880, 170, 0.6, 20, K.orange], [640, 120, 0.5, -20, K.red]]),
  },
  {
    id: 'thanks-tree', title: 'Fall Tree', bg: fallSky, body:
      ground(860, K.lime) +
      path('M440 860 L460 560 L380 450 L410 440 L480 520 L470 400 L530 400 L520 520 L600 430 L625 450 L540 560 L560 860 Z', K.brown, { s: 1 }) +
      [[330, 380, 140, K.orange], [670, 380, 140, K.red], [500, 260, 160, K.yellow], [400, 220, 110, K.red], [610, 220, 110, K.orange], [500, 420, 120, K.orange]]
        .map(([x, y, r, c]) => circle(x, y, r, c, { s: 1 })).join('') +
      circle(470, 650, 32, K.dkbrown) +
      maple(250, 850, 0.6, -20, K.red) + maple(350, 880, 0.5, 20, K.orange) + maple(650, 870, 0.55, -10, K.yellow) + maple(770, 850, 0.6, 30, K.red) +
      falling([[150, 600, 0.6, -25, K.orange], [860, 620, 0.55, 20, K.yellow], [820, 120, 0.5, 10, K.red]]),
  },
];

module.exports = { id: 'thanksgiving', title: 'Thanksgiving', icon: '🦃', season: { from: '11-01', to: '11-30' }, pictures };
