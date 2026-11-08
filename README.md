# Color Fun

An ad-free coloring app for kids 3 to 7, made for family and friends. It runs in Safari on iPad and iPhone and works offline once added to the home screen.

- Six modes: free coloring, color by number (color each space in with a brush), connect the dots,
  scratch and reveal, mirror painting (blank pages), and puzzle (4, 6 or 9 pieces; uses the child's own coloring when there is one)
- Stickers in every mode except puzzle: tap to add, drag to move, tap to change size, drag off the picture to remove
- Tap-to-fill, marker, crayon, paintbrush, glitter and eraser
- Brushes stay inside the lines by default (toggle with the brick button)
- Pictures save automatically on the device
- No ads, no accounts, no tracking, nothing locked

## Adding a picture pack

Packs live in `art/*.js`. Each picture is an SVG with `viewBox="0 0 1000 1000"`, white-filled shapes with an 8px black outline, and fully closed regions. Register new packs in `art/index.js` and add the file to the list in `sw.js` (bump the cache name so devices pick up the change).

Color by number and connect the dots read `art/extras/<pack>.js`: per picture, `colors` is a list of `[x, y, '#hex']` points (one inside each region to color) and `dots` is the connect-the-dots path around the main subject. `tools/render-extras.js` draws both over the picture for checking. Pictures without `colors` get automatic colors; pictures without `dots` are hidden in Dots mode.

The Thanksgiving, Christmas and Winter packs are generated: edit `tools/seasonal/<pack>.js` (helpers in `tools/seasonal/draw.js`) and run `NODE_PATH=$(npm root -g) node tools/build-seasonal.js [previewDir]`. Each shape's `data-c` sets its color-by-number color and shapes marked `data-s` form the connect-the-dots outline, so both are worked out automatically.

Raster pictures: a picture can use `src` (a PNG path) instead of `svg`. `art/gemini.js` is an example; its PNGs in `art/gemini/` are cleaned-up Gemini line art (black lines on white, 1536 square). Add new PNG paths to the `FILES` list in `sw.js` so they work offline.

## Preview locally

    npx http-server -p 8080 .
