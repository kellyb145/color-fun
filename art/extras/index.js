// Per-picture data for the game modes, keyed by picture id:
//   colors: [[x, y, '#hex'], ...]  one point inside each region to color (art units, 0-1000)
//   dots:   [[x, y], ...]          connect-the-dots path around the main subject, clockwise
import animals from './animals.js';
import ocean from './ocean.js';
import vehicles from './vehicles.js';
import space from './space.js';
import fantasy from './fantasy.js';
import halloween from './halloween.js';

export default Object.assign({}, animals, ocean, vehicles, space, fantasy, halloween);
