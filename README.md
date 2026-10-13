# Color Fun

An ad-free coloring app for kids 3 to 7, made for family and friends. It runs in Safari on iPad and iPhone and works offline once added to the home screen.

- Tap-to-fill, marker, crayon, paintbrush, glitter and eraser
- Brushes stay inside the lines by default (toggle with the brick button)
- Pictures save automatically on the device
- No ads, no accounts, no tracking, nothing locked

## Adding a picture pack

Packs live in `art/*.js`. Each picture is an SVG with `viewBox="0 0 1000 1000"`, white-filled shapes with an 8px black outline, and fully closed regions. Register new packs in `art/index.js` and add the file to the list in `sw.js` (bump the cache name so devices pick up the change).

## Preview locally

    npx http-server -p 8080 .
