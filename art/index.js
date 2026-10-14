import animals from './animals.js';
import ocean from './ocean.js';
import vehicles from './vehicles.js';
import space from './space.js';
import fantasy from './fantasy.js';
import halloween from './halloween.js';
import friends from './gemini.js';

const blank = {
  id: 'draw', title: 'Draw', icon: '✏️',
  pictures: [1, 2, 3, 4].map(n => ({
    id: `draw-${n}`, title: `Paper ${n}`,
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"></svg>',
  })),
};

// Order shown on the home screen (packs in season jump to the front).
export default [halloween, friends, animals, ocean, fantasy, vehicles, space, blank];
