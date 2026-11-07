const D = require('./draw.js');
const { K, path, circle, ellipse, rect, line, g, gs, poly, tube, union, star, ground, hills, cloud, eye, eyes, smile,
  blush, flake, pine, clipped, ghost, scallopD, scallopLine, berries, leaf } = D;

const night = K.navy;
const flakes = list => list.map(([x, y, r]) => flake(x, y, r)).join('');
const stars = list => list.map(([x, y, r]) => star(x, y, r)).join('');
const HEART = 'M0 -20 C0 -60 -60 -70 -70 -20 C-80 30 0 70 0 100 C0 70 80 30 70 -20 C60 -70 0 -60 0 -20 Z';
const heart = (cx, cy, s, c) => gs(cx, cy, s, 0, path(HEART, c));
const dark = '#455a64', dkred = '#c62828';

const pictures = [
  {
    id: 'winter-snowman', title: 'Snowman', bg: K.sky, body:
      flakes([[120, 140, 30], [880, 160, 30], [150, 560, 26], [860, 560, 26]]) +
      hills(900, K.snow) +
      union([['tube', 'M385 470 L210 350 M265 388 L225 305', 18], ['tube', 'M615 470 L790 350 M735 388 L785 315', 18]], K.brown, { s: 1 }) +
      circle(500, 735, 190, K.white, { s: 1 }) + circle(500, 480, 145, K.white, { s: 1 }) + circle(500, 270, 110, K.white, { s: 1 }) +
      circle(500, 440, 17, '#000') + circle(500, 510, 17, '#000') + circle(500, 680, 19, '#000') + circle(500, 760, 19, '#000') +
      eyes(460, 540, 255, 16) + path('M500 285 L595 305 L500 318 Z', K.orange) +
      [440, 470, 500, 530, 560].map((x, i) => circle(x, 335 + (i === 0 || i === 4 ? -8 : i === 2 ? 8 : 4), 7, '#000')).join('') +
      path('M560 395 L600 520 L650 505 L610 390 Z', K.red) +
      rect(370, 365, 260, 55, 27, K.red, { s: 1 }) +
      rect(410, 50, 180, 130, 10, K.black, { s: 1 }) + rect(410, 140, 180, 30, 0, K.red) + rect(365, 170, 270, 38, 15, K.black, { s: 1 }),
  },
  {
    id: 'winter-snowflake', title: 'Snowflake', bg: night, body: (() => {
      let d = '';
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 - Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
        const P = t => [500 + ca * t, 500 + sa * t];
        const [ex, ey] = P(330); d += `M500 500 L${ex.toFixed(0)} ${ey.toFixed(0)} `;
        for (const [t, len] of [[170, 100], [265, 70]]) {
          const [bx, by] = P(t);
          for (const s of [-1, 1]) {
            const b = a + s * Math.PI / 4;
            d += `M${bx.toFixed(0)} ${by.toFixed(0)} L${(bx + Math.cos(b) * len).toFixed(0)} ${(by + Math.sin(b) * len).toFixed(0)} `;
          }
        }
      }
      return stars([[110, 120, 26], [880, 120, 26], [120, 880, 26], [880, 880, 26]]) +
        union([['tube', d.trim(), 40], ['path', D.starD(500, 500, 95, 70, 6)]], K.ice, { s: 1 }) +
        circle(500, 500, 45, K.blue) + flakes([[130, 470, 30], [870, 500, 30], [500, 940, 26]]);
    })(),
  },
  {
    id: 'winter-mittens', title: 'Mittens', bg: K.sky, body: (() => {
      const mitten = (cx, cy, rot, flip, c, c2) => {
        const body = 'M-115 150 L-115 -60 C-115 -210 115 -210 115 -60 L115 150 Z';
        const cuff = 'M-130 130 L130 130 L130 230 L-130 230 Z';
        let ribs = ''; for (let x = -100; x < 130; x += 40) ribs += `M${x} 120 L${x} 240 `;
        return g(`translate(${cx} ${cy}) rotate(${rot}) scale(${flip} 1)`,
          union([['path', body], ['ellipse', -130, 20, 48, 90, -25]], c, { s: 1 }) +
          gs(0, -40, 0.75, 0, path(HEART, c2)) +
          path(cuff, K.white, { s: 1 }) + clipped(cuff, line(ribs)));
      };
      return flakes([[130, 130, 30], [870, 130, 30], [500, 120, 26], [140, 880, 26], [870, 880, 26]]) +
        line('M330 740 C330 900 670 900 670 740') +
        mitten(330, 480, -12, 1, K.red, K.pink) + mitten(670, 480, 12, -1, K.red, K.pink);
    })(),
  },
  {
    id: 'winter-penguin', title: 'Penguin', bg: K.sky, body:
      flakes([[120, 140, 30], [880, 150, 30], [140, 600, 26], [860, 600, 26]]) +
      hills(900, K.snow) +
      ellipse(270, 560, 45, 130, dark, { s: 1, t: 'rotate(25 270 560)' }) + ellipse(730, 560, 45, 130, dark, { s: 1, t: 'rotate(-25 730 560)' }) +
      ellipse(420, 860, 70, 30, K.orange, { s: 1 }) + ellipse(580, 860, 70, 30, K.orange, { s: 1 }) +
      path('M500 200 C660 200 720 400 720 600 C720 780 620 860 500 860 C380 860 280 780 280 600 C280 400 340 200 500 200 Z', dark, { s: 1 }) +
      ellipse(500, 640, 150, 200, K.white) +
      union([['circle', 450, 370, 78], ['circle', 550, 370, 78]], K.white) +
      eyes(455, 545, 365, 18) + blush(420, 410) + blush(580, 410) +
      path('M470 410 L530 410 L500 452 Z', K.orange) +
      path('M560 470 L600 590 L650 575 L610 465 Z', K.red) + rect(330, 465, 340, 55, 27, K.red) +
      path('M365 280 C375 150 625 150 635 280 Z', K.blue, { s: 1 }) + rect(352, 262, 296, 46, 23, K.white, { s: 1 }) +
      circle(500, 155, 38, K.white, { s: 1 }),
  },
  {
    id: 'winter-polar-bear', title: 'Polar Bear', bg: K.sky, body:
      flakes([[120, 140, 30], [880, 140, 30], [130, 560, 26], [870, 560, 26]]) +
      ground(860, K.snow) +
      ellipse(500, 650, 230, 220, K.white, { s: 1 }) +
      ellipse(320, 640, 60, 125, K.white, { s: 1, t: 'rotate(15 320 640)' }) + ellipse(680, 640, 60, 125, K.white, { s: 1, t: 'rotate(-15 680 640)' }) +
      ellipse(380, 830, 95, 60, K.white, { s: 1 }) + ellipse(620, 830, 95, 60, K.white, { s: 1 }) +
      circle(380, 840, 30, K.pink) + circle(620, 840, 30, K.pink) +
      circle(380, 230, 48, K.white, { s: 1 }) + circle(620, 230, 48, K.white, { s: 1 }) + circle(380, 232, 24, K.pink) + circle(620, 232, 24, K.pink) +
      rect(360, 455, 280, 60, 30, K.red) + path('M560 495 L590 610 L640 600 L610 490 Z', K.red) +
      circle(500, 340, 150, K.white, { s: 1 }) +
      ellipse(500, 410, 78, 58, K.white) + ellipse(500, 385, 30, 20, '#000') + smile(500, 420, 50, 14) +
      eyes(440, 560, 320, 18) + blush(410, 380) + blush(590, 380),
  },
  {
    id: 'winter-igloo', title: 'Igloo', bg: night, body: (() => {
      const dome = 'M180 800 C180 380 820 380 820 800 Z';
      let br = 'M150 700 L850 700 M150 600 L850 600 M150 510 L850 510 ';
      [[300, 700, 800], [500, 700, 800], [700, 700, 800], [400, 600, 700], [600, 600, 700], [260, 600, 700], [740, 600, 700], [330, 510, 600], [500, 510, 600], [670, 510, 600], [420, 400, 510], [580, 400, 510]]
        .forEach(([x, y0, y1]) => br += `M${x} ${y0} L${x} ${y1} `);
      return circle(820, 150, 75, K.yellow) + stars([[120, 120, 28], [340, 90, 22], [580, 140, 24], [150, 360, 20], [880, 380, 22]]) +
        ground(800, K.snow) +
        path(dome, K.ice, { s: 1 }) + clipped(dome, line(br)) +
        path('M400 800 L400 690 C400 590 600 590 600 690 L600 800 Z', K.ice, { s: 1 }) +
        path('M450 800 L450 700 C450 640 550 640 550 700 L550 800 Z', K.navy) +
        g('translate(830 780)', ellipse(0, 0, 55, 75, dark) + ellipse(0, 15, 35, 55, K.white) + eye(-12, -35, 8) + eye(14, -35, 8) + path('M-10 -18 L10 -18 L0 -2 Z', K.orange) + ellipse(-18, 75, 20, 9, K.orange) + ellipse(18, 75, 20, 9, K.orange));
    })(),
  },
  {
    id: 'winter-sled', title: 'Sled', bg: K.sky, body:
      flakes([[130, 130, 30], [520, 110, 26], [870, 140, 30]]) +
      pine(150, 520, 300, 200, K.green, true) + pine(320, 470, 240, 160, K.dkgreen, true) +
      path('M-20 470 Q400 520 1020 760 L1020 1020 L-20 1020 Z', K.snow) +
      g('rotate(20 520 700)',
        union([['tube', 'M220 780 L760 780 Q850 780 850 700 Q850 650 805 660', 24], ['tube', 'M320 700 L320 780', 22], ['tube', 'M660 700 L660 780', 22]], K.red, { s: 1 }) +
        rect(230, 640, 560, 46, 16, K.tan, { s: 1 }) + rect(230, 595, 560, 46, 16, K.tan, { s: 1 }) +
        rect(280, 680, 60, 30, 6, K.brown) + rect(640, 680, 60, 30, 6, K.brown)) +
      line('M760 830 C860 860 900 780 960 820'),
  },
  {
    id: 'winter-cocoa', title: 'Hot Cocoa', bg: K.cream, body:
      path('M-20 800 L1020 800 L1020 1020 L-20 1020 Z', K.brown) +
      ellipse(480, 815, 330, 55, K.sky) +
      tube('M690 470 C840 470 840 700 690 700', 50, K.red, { s: 1 }) +
      rect(250, 400, 460, 410, 60, K.red, { s: 1 }) +
      ellipse(480, 410, 225, 42, K.dkbrown, { s: 1 }) +
      g('rotate(-15 400 395)', rect(360, 360, 80, 70, 14, K.white)) + g('rotate(10 520 380)', rect(480, 345, 80, 70, 14, K.white)) +
      D.tube('M600 410 L640 210 Q650 160 700 175 Q740 190 730 240', 30, K.white) +
      heart(480, 590, 0.9, K.pink) +
      line('M350 300 C320 250 380 220 350 170 M470 280 C440 230 500 200 470 150'),
  },
  {
    id: 'winter-hat', title: 'Winter Hat', bg: K.sky, body: (() => {
      const dome = 'M220 640 C220 250 780 250 780 640 Z';
      const cuff = 'M190 610 L810 610 L810 770 L190 770 Z';
      let ribs = ''; for (let x = 230; x < 800; x += 50) ribs += `M${x} 600 L${x} 780 `;
      return flakes([[120, 130, 30], [880, 130, 30], [130, 870, 30], [870, 870, 30]]) +
        path(dome, K.red, { s: 1 }) + clipped(dome, line('M150 470 L850 470 M150 540 L850 540')) + clipped(dome, ghost('M150 470 L850 470 L850 540 L150 540 Z', K.white)) +
        clipped(dome, line('M150 400 L850 400')) + clipped(dome, ghost('M150 300 L850 300 L850 400 L150 400 Z', K.white)) +
        path(cuff, K.blue, { s: 1 }) + clipped(cuff, line(ribs)) +
        cloud(500, 245, 105, 100, K.white, 11, { s: 1 });
    })(),
  },
  {
    id: 'winter-skate', title: 'Ice Skate', bg: K.sky, body:
      flakes([[130, 130, 30], [870, 150, 30], [140, 520, 26]]) +
      ellipse(520, 870, 460, 90, K.ice) +
      rect(270, 770, 580, 34, 17, K.gray, { s: 1 }) + rect(360, 715, 34, 70, 0, K.gray, { s: 1 }) + rect(720, 715, 34, 70, 0, K.gray, { s: 1 }) +
      path('M330 200 L570 200 L570 520 C660 530 780 570 800 650 L805 720 L320 720 L320 220 Z', K.pink, { s: 1 }) +
      rect(320, 690, 485, 40, 14, K.white, { s: 1 }) +
      line('M480 230 L570 280 M570 230 L480 280 M480 300 L570 350 M570 300 L480 350 M480 370 L570 420 M570 370 L480 420') +
      line('M480 200 L480 520') +
      cloud(445, 190, 145, 45, K.white, 9, { s: 1 }) + D.star(660, 620, 40, K.yellow),
  },
  {
    id: 'winter-globe', title: 'Snow Globe', bg: K.cream, body: (() => {
      const globe = 'M500 170 A300 300 0 1 1 499.9 170 Z';
      return path(globe, K.sky, { s: 1 }) +
        clipped(globe, path('M150 690 Q500 600 850 690 L850 900 L150 900 Z', K.snow) +
          pine(640, 680, 300, 200, K.green, true) +
          circle(400, 620, 75, K.white) + circle(400, 510, 55, K.white) + eyes(382, 418, 500, 8) + path('M400 515 L440 525 L400 532 Z', K.orange) +
          rect(355, 440, 90, 18, 6, K.black) + rect(370, 395, 60, 50, 6, K.black) +
          [[300, 320], [420, 260], [560, 300], [700, 380], [330, 420], [760, 520], [250, 560], [520, 420]].map(([x, y]) => circle(x, y, 12, K.white)).join('')) +
        line('M300 300 C260 350 240 420 245 480') +
        path('M240 760 L760 760 L810 900 L190 900 Z', K.brown, { s: 1 }) + rect(400, 800, 200, 60, 10, K.gold);
    })(),
  },
  {
    id: 'winter-cabin', title: 'Cabin', bg: night, body: (() => {
      const walls = 'M240 480 L760 480 L760 820 L240 820 Z';
      let logs = ''; for (let y = 525; y < 820; y += 45) logs += `M230 ${y} L770 ${y} `;
      return circle(830, 140, 70, K.yellow) + stars([[120, 120, 26], [330, 80, 22], [130, 380, 20]]) +
        cloud(680, 160, 45, 30) + cloud(740, 90, 55, 34) +
        ground(820, K.snow) +
        rect(620, 270, 75, 160, 0, K.red) + cloud(657, 265, 52, 22, K.snow, 7) +
        path(walls, K.brown, { s: 1 }) + clipped(walls, line(logs)) +
        path('M180 500 L500 250 L820 500 Z', K.dkbrown, { s: 1 }) +
        path('M500 230 L845 505 Q805 535 775 507 Q740 540 705 505 L500 340 L295 505 Q260 540 225 507 Q195 535 155 505 Z', K.snow, { s: 1 }) +
        rect(450, 640, 100, 180, 10, K.red) + circle(530, 735, 9, K.gold) +
        rect(290, 570, 110, 100, 8, K.yellow) + line('M345 570 L345 670 M290 620 L400 620') +
        rect(600, 570, 110, 100, 8, K.yellow) + line('M655 570 L655 670 M600 620 L710 620') +
        pine(110, 880, 330, 200, K.green, true) + pine(890, 880, 330, 200, K.dkgreen, true);
    })(),
  },
  {
    id: 'winter-pines', title: 'Snowy Trees', bg: night, body:
      circle(160, 150, 75, K.yellow) + stars([[420, 110, 24], [640, 80, 22], [860, 140, 28], [760, 300, 20]]) +
      hills(880, K.snow) +
      pine(230, 840, 430, 290, K.green, true) + pine(790, 830, 400, 270, K.green, true) +
      pine(510, 900, 640, 400, K.dkgreen, true, { s: 1 }) +
      flakes([[100, 450, 24], [900, 470, 24]]),
  },
  {
    id: 'winter-fox', title: 'Snow Fox', bg: K.sky, body:
      flakes([[120, 140, 30], [880, 140, 30], [140, 560, 26], [860, 420, 26]]) +
      ground(860, K.snow) +
      path('M600 830 C820 840 900 650 790 560 C730 515 690 600 735 640 C775 680 730 770 600 770 Z', K.orange, { s: 1 }) +
      path('M380 830 C330 660 400 520 500 505 C600 520 670 660 620 830 Z', K.orange, { s: 1 }) +
      ellipse(500, 650, 70, 115, K.white) +
      ellipse(450, 830, 52, 28, K.dkbrown, { s: 1 }) + ellipse(550, 830, 52, 28, K.dkbrown, { s: 1 }) +
      path('M340 330 L410 160 L475 290 L525 290 L590 160 L660 330 C690 420 570 480 500 510 C430 480 310 420 340 330 Z', K.orange, { s: 1 }) +
      path('M395 260 L414 205 L440 270 Z', K.dkbrown) + path('M605 260 L586 205 L560 270 Z', K.dkbrown) +
      path('M350 370 C380 380 440 400 500 420 C560 400 620 380 650 370 C630 430 560 480 500 510 C440 480 370 430 350 370 Z', K.white) +
      circle(500, 485, 18, '#000') + eyes(440, 560, 355, 18),
  },
  {
    id: 'winter-seal', title: 'Seal', bg: K.sky, body:
      flakes([[130, 140, 30], [870, 130, 30], [520, 160, 26]]) +
      path('M-20 800 Q250 770 500 800 Q750 830 1020 800 L1020 1020 L-20 1020 Z', K.blue) +
      path('M110 760 L890 760 L850 880 L150 880 Z', K.ice) +
      path('M850 650 L930 600 L940 660 L900 690 L950 720 L900 740 L840 710 Z', K.gray, { s: 1 }) +
      path('M220 720 C200 560 330 440 520 470 C660 490 760 590 860 640 C900 665 885 720 840 710 C760 690 700 710 640 750 L250 762 Q215 752 220 720 Z', K.gray, { s: 1 }) +
      ellipse(450, 740, 80, 30, dark, { s: 1, t: 'rotate(-10 450 740)' }) +
      circle(330, 510, 130, K.gray, { s: 1 }) +
      circle(305, 575, 36, K.white) + circle(358, 575, 36, K.white) + ellipse(330, 548, 22, 14, '#000') +
      line('M270 570 L200 555 M270 585 L205 595 M395 570 L460 555 M395 585 L455 595') +
      eyes(285, 375, 490, 22),
  },
  {
    id: 'winter-cardinal', title: 'Cardinal', bg: K.sky, body:
      flakes([[130, 140, 30], [860, 150, 30], [140, 860, 26], [870, 880, 26]]) +
      tube('M-20 720 C300 700 600 730 1020 650', 40, K.brown) +
      path('M60 700 Q80 670 140 675 Q200 668 230 700 Z M680 690 Q720 655 790 660 Q850 652 880 672 Z', K.snow) +
      berries(160, 760, 22) + berries(820, 720, 22) +
      path('M600 560 L780 650 L745 690 L575 610 Z', dkred, { s: 1 }) +
      ellipse(500, 540, 160, 120, K.red, { s: 1, t: 'rotate(-12 500 540)' }) +
      path('M390 330 L415 225 L465 340 Z', K.red, { s: 1 }) +
      circle(410, 410, 92, K.red, { s: 1 }) +
      path('M325 395 C340 445 380 470 420 460 L410 420 Z', K.black) +
      path('M330 420 L255 440 L332 462 Z', K.orange, { s: 1 }) +
      eye(410, 385, 16) +
      ellipse(545, 530, 105, 55, dkred, { t: 'rotate(-20 545 530)' }) +
      line('M470 655 L460 705 M520 655 L520 700'),
  },
  {
    id: 'winter-boots', title: 'Snow Boots', bg: K.sky, body: (() => {
      const boot = (x, y, c) => g(`translate(${x} ${y})`,
        path('M0 0 L190 0 L190 290 C270 300 340 330 340 400 L340 440 L0 440 Z', c, { s: 1 }) +
        rect(-10, 420, 360, 50, 20, K.gray, { s: 1 }) +
        rect(0, 260, 190, 40, 0, K.yellow) + D.star(95, 140, 45, K.white) +
        cloud(95, 0, 120, 42, K.white, 9, { s: 1 }));
      return flakes([[120, 130, 30], [870, 130, 30], [500, 110, 26], [880, 560, 26]]) +
        ground(860, K.snow) + boot(150, 330, K.blue) + boot(520, 360, K.purple);
    })(),
  },
  {
    id: 'winter-plow', title: 'Snowplow', bg: K.sky, body:
      flakes([[130, 130, 30], [450, 110, 26], [880, 120, 30]]) +
      ground(800, K.snow) +
      rect(230, 620, 120, 40, 6, K.gray, { s: 1 }) +
      rect(320, 500, 580, 200, 24, K.yellow, { s: 1 }) +
      rect(600, 290, 270, 230, 20, K.yellow, { s: 1 }) + rect(630, 320, 210, 130, 12, K.sky) +
      path('M700 292 A42 42 0 0 1 784 292 Z', K.red, { s: 1 }) +
      line('M380 560 L560 560 M380 620 L560 620') +
      circle(450, 730, 85, K.black, { s: 1 }) + circle(450, 730, 35, K.gray) + circle(780, 730, 85, K.black, { s: 1 }) + circle(780, 730, 35, K.gray) +
      path('M80 480 Q170 590 130 790 L250 790 L250 480 Z', K.orange, { s: 1 }) +
      cloud(90, 790, 110, 60, K.snow, 9),
  },
  {
    id: 'winter-bunny', title: 'Snow Bunny', bg: K.sky, body:
      flakes([[120, 140, 30], [880, 140, 30], [130, 600, 26], [870, 600, 26]]) +
      ground(880, K.snow) +
      ellipse(420, 220, 52, 150, K.white, { s: 1, t: 'rotate(-10 420 220)' }) + ellipse(580, 220, 52, 150, K.white, { s: 1, t: 'rotate(10 580 220)' }) +
      ellipse(420, 230, 24, 105, K.pink, { t: 'rotate(-10 420 230)' }) + ellipse(580, 230, 24, 105, K.pink, { t: 'rotate(10 580 230)' }) +
      ellipse(500, 710, 170, 175, K.white, { s: 1 }) +
      ellipse(400, 880, 75, 35, K.white, { s: 1 }) + ellipse(600, 880, 75, 35, K.white, { s: 1 }) +
      circle(500, 430, 145, K.white, { s: 1 }) +
      tube('M362 410 C370 250 630 250 638 410', 22, K.purple) +
      path(scallopD(362, 430, 58, 62, 9, 0.55), K.pink, { s: 1 }) + path(scallopD(638, 430, 58, 62, 9, 0.55), K.pink, { s: 1 }) +
      eyes(450, 550, 440, 18) + path('M485 475 L515 475 L500 492 Z', K.pink) + line('M500 492 L500 505 M470 515 Q485 530 500 505 Q515 530 530 515') +
      blush(425, 495) + blush(575, 495) +
      path('M445 640 L560 610 L520 760 Z', K.orange) + leaf(560, 590, 70, 22, 45, K.green, false) + leaf(585, 615, 70, 22, 80, K.green, false) +
      ellipse(450, 650, 38, 28, K.white) + ellipse(545, 640, 38, 28, K.white),
  },
  {
    id: 'winter-walrus', title: 'Walrus', bg: K.sky, body:
      flakes([[120, 140, 30], [880, 140, 30], [500, 120, 26]]) +
      path('M-20 860 Q500 820 1020 860 L1020 1020 L-20 1020 Z', K.ice) +
      ellipse(300, 840, 100, 42, K.dkbrown, { s: 1, t: 'rotate(-15 300 840)' }) + ellipse(700, 840, 100, 42, K.dkbrown, { s: 1, t: 'rotate(15 700 840)' }) +
      path('M210 860 C150 600 300 330 500 330 C700 330 850 600 790 860 Z', K.brown, { s: 1 }) +
      path('M440 600 L425 790 L470 610 Z', K.white) + path('M560 600 L575 790 L530 610 Z', K.white) +
      circle(440, 560, 78, K.tan) + circle(560, 560, 78, K.tan) +
      ellipse(500, 505, 42, 28, '#000') +
      [[410, 560], [440, 590], [470, 560], [530, 560], [560, 590], [590, 560]].map(([x, y]) => circle(x, y, 6, '#000')).join('') +
      eyes(430, 570, 440, 20),
  },
];

module.exports = { id: 'winter', title: 'Winter', icon: '⛄', season: { from: '12-01', to: '02-28' }, pictures };
